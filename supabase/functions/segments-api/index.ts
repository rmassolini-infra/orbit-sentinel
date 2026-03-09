import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SegmentsRequest {
  corridorId?: string;
  riskLevel?: string;
  limit?: number;
  includeGeometry?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const method = req.method;

    if (method === "GET") {
      // Fetch segments
      const corridorId = url.searchParams.get("corridorId");
      const riskLevel = url.searchParams.get("riskLevel");
      const limit = parseInt(url.searchParams.get("limit") || "100");

      let query = supabase
        .from("segments")
        .select("*")
        .order("ttc_days", { ascending: true })
        .limit(limit);

      if (corridorId) {
        query = query.eq("corridor_id", corridorId);
      }
      if (riskLevel && riskLevel !== "all") {
        query = query.eq("risk_level", riskLevel);
      }

      const { data: segments, error } = await query;

      if (error) throw error;

      // If no segments exist, generate them
      if (!segments || segments.length === 0) {
        const generatedSegments = await generateInitialSegments(supabase);
        return new Response(JSON.stringify(generatedSegments), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(segments), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      // Generate or update segments
      const { action, corridorId } = await req.json();

      if (action === "generate") {
        const segments = await generateInitialSegments(supabase, corridorId);
        return new Response(JSON.stringify({ success: true, count: segments.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "recalculate") {
        await recalculateTTC(supabase);
        return new Response(JSON.stringify({ success: true, message: "TTC recalculated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Segments API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateInitialSegments(supabase: any, corridorId?: string) {
  // Fetch corridor
  const { data: corridors } = await supabase
    .from("corridors")
    .select("id, total_km")
    .limit(1);

  const corridor = corridors?.[0];
  if (!corridor) {
    throw new Error("No corridor found");
  }

  const targetCorridorId = corridorId || corridor.id;
  const totalKm = corridor.total_km || 847;

  // Fetch species for random assignment
  const { data: species } = await supabase
    .from("vegetation_species")
    .select("scientific_name, average_growth_rate");

  // Generate segments covering the entire corridor
  const segmentLength = 3; // 3km segments
  const segments = [];

  // Transmission line coordinates (Uberlândia to Montes Claros approximation)
  const startLat = -18.9186;
  const startLon = -48.2772;
  const endLat = -16.7200;
  const endLon = -43.8619;

  for (let km = 0; km < totalKm; km += segmentLength) {
    const kmEnd = Math.min(km + segmentLength, totalKm);
    const progress = km / totalKm;
    const progressEnd = kmEnd / totalKm;

    // Interpolate coordinates
    const lat1 = startLat + (endLat - startLat) * progress;
    const lon1 = startLon + (endLon - startLon) * progress;
    const lat2 = startLat + (endLat - startLat) * progressEnd;
    const lon2 = startLon + (endLon - startLon) * progressEnd;

    // Random vegetation parameters
    const speciesIndex = Math.floor(Math.random() * (species?.length || 1));
    const selectedSpecies = species?.[speciesIndex];
    const growthRate = selectedSpecies?.average_growth_rate || (0.05 + Math.random() * 0.25);
    
    // Generate CHM with some variance
    const chm = 5 + Math.random() * 10;
    const dms = 15;
    
    // Calculate TTC
    const ttc = growthRate > 0 ? Math.round((dms - chm) / growthRate / 30) : 999;
    
    // Determine risk level
    let riskLevel: string;
    if (ttc < 30) riskLevel = "CRITICO";
    else if (ttc < 45) riskLevel = "ALTO";
    else if (ttc < 90) riskLevel = "MEDIO";
    else riskLevel = "BAIXO";

    segments.push({
      corridor_id: targetCorridorId,
      km_start: km,
      km_end: kmEnd,
      ttc_days: ttc,
      risk_level: riskLevel,
      chm_current: Math.round(chm * 10) / 10,
      dms,
      dominant_species: selectedSpecies?.scientific_name || "Unknown",
      growth_rate: Math.round(growthRate * 1000) / 1000,
    });
  }

  // Insert segments
  const { data: inserted, error } = await supabase
    .from("segments")
    .upsert(segments, { onConflict: "id" })
    .select();

  if (error) throw error;

  // Generate alerts for critical segments
  const criticalSegments = segments.filter(s => s.risk_level === "CRITICO");
  if (criticalSegments.length > 0) {
    const alerts = criticalSegments.slice(0, 20).map(seg => ({
      segment_id: inserted?.find((s: any) => s.km_start === seg.km_start)?.id,
      alert_type: "TTC_CRITICO",
      severity: "CRITICO",
      message: `Segmento KM ${seg.km_start}-${seg.km_end} com TTC de ${seg.ttc_days} dias requer atenção imediata.`,
      ttc_value: seg.ttc_days,
      chm_value: seg.chm_current,
    })).filter(a => a.segment_id);

    if (alerts.length > 0) {
      await supabase.from("alerts").insert(alerts);
    }
  }

  return inserted || segments;
}

async function recalculateTTC(supabase: any) {
  const { data: segments } = await supabase
    .from("segments")
    .select("id, chm_current, dms, growth_rate");

  if (!segments) return;

  for (const seg of segments) {
    if (seg.growth_rate > 0 && seg.chm_current < seg.dms) {
      const ttc = Math.round((seg.dms - seg.chm_current) / seg.growth_rate / 30);
      
      let riskLevel: string;
      if (ttc < 30) riskLevel = "CRITICO";
      else if (ttc < 45) riskLevel = "ALTO";
      else if (ttc < 90) riskLevel = "MEDIO";
      else riskLevel = "BAIXO";

      await supabase
        .from("segments")
        .update({ ttc_days: ttc, risk_level: riskLevel })
        .eq("id", seg.id);
    }
  }
}
