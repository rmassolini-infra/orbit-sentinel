import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VegetationRequest {
  corridorId?: string;
  segmentId?: string;
  analysisType: "ndvi" | "species" | "growth" | "density" | "critical";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { corridorId, segmentId, analysisType } = await req.json() as VegetationRequest;

    // Fetch vegetation species from database
    const { data: species } = await supabase
      .from("vegetation_species")
      .select("*")
      .order("average_growth_rate", { ascending: false });

    let response: any;

    switch (analysisType) {
      case "ndvi": {
        response = await generateNDVIAnalysis(species || []);
        break;
      }
      case "species": {
        response = await generateSpeciesDistribution(species || []);
        break;
      }
      case "growth": {
        response = await generateGrowthAnalysis(species || []);
        break;
      }
      case "density": {
        response = await generateDensityAnalysis();
        break;
      }
      case "critical": {
        response = await generateCriticalSegments(supabase);
        break;
      }
      default: {
        response = await generateFullAnalysis(species || [], supabase);
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Vegetation analysis error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateNDVIAnalysis(species: any[]) {
  // Generate monthly NDVI time series
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  const ndviTrends = months.map((mes, i) => {
    // NDVI varies seasonally - higher in wet season (Nov-Mar), lower in dry season (Jun-Aug)
    const wetSeasonFactor = Math.cos((i - 1) * Math.PI / 6) * 0.15;
    const baseNDVI = 0.55 + wetSeasonFactor;
    
    return {
      mes,
      ndvi: Math.round((baseNDVI + Math.random() * 0.08) * 1000) / 1000,
      min: Math.round((baseNDVI - 0.1 + Math.random() * 0.03) * 1000) / 1000,
      max: Math.round((baseNDVI + 0.15 + Math.random() * 0.03) * 1000) / 1000,
    };
  });

  return {
    analysisType: "ndvi",
    corridor: {
      totalKm: 847,
      meanNDVI: 0.62,
      ndviRange: { min: 0.18, max: 0.89 },
    },
    trends: ndviTrends,
    classification: {
      water: { range: [0, 0.1], percentage: 2.1, color: "#1e40af" },
      bareSoil: { range: [0.1, 0.2], percentage: 5.3, color: "#92400e" },
      sparseVegetation: { range: [0.2, 0.4], percentage: 12.7, color: "#facc15" },
      moderateVegetation: { range: [0.4, 0.6], percentage: 38.4, color: "#84cc16" },
      denseVegetation: { range: [0.6, 0.8], percentage: 35.2, color: "#22c55e" },
      veryDenseVegetation: { range: [0.8, 1.0], percentage: 6.3, color: "#15803d" },
    },
    lastUpdate: new Date().toISOString(),
  };
}

async function generateSpeciesDistribution(species: any[]) {
  // Calculate total segments
  const totalSegments = 847;
  let remaining = totalSegments;
  
  const distribution = species.map((sp, i) => {
    const isLast = i === species.length - 1;
    const percentage = isLast 
      ? remaining / totalSegments * 100
      : Math.random() * (remaining / totalSegments * 100 / (species.length - i));
    
    const segments = isLast ? remaining : Math.floor(totalSegments * percentage / 100);
    remaining -= segments;

    return {
      species: sp.scientific_name,
      commonName: sp.common_name,
      segments,
      percentage: Math.round(segments / totalSegments * 1000) / 10,
      growthClass: sp.growth_class,
      avgGrowthRate: sp.average_growth_rate,
      riskCategory: sp.risk_category,
      color: sp.color_hex,
    };
  }).sort((a, b) => b.segments - a.segments);

  return {
    analysisType: "species",
    totalSegments,
    speciesCount: species.length,
    distribution,
    dominantSpecies: distribution[0]?.species || "Unknown",
    lastUpdate: new Date().toISOString(),
  };
}

async function generateGrowthAnalysis(species: any[]) {
  const growthData = species.map(sp => ({
    species: sp.scientific_name,
    commonName: sp.common_name,
    growthRate: sp.average_growth_rate,
    growthClass: sp.growth_class,
    maxHeight: sp.max_height,
    riskCategory: sp.risk_category,
    color: sp.color_hex,
    // Calculate estimated time to reach DMS (15m) from various starting heights
    ttcFrom5m: sp.average_growth_rate > 0 ? Math.round((15 - 5) / sp.average_growth_rate / 30) : 999,
    ttcFrom10m: sp.average_growth_rate > 0 ? Math.round((15 - 10) / sp.average_growth_rate / 30) : 999,
    vigor: sp.growth_class === "FAST" ? "Alto" : sp.growth_class === "MODERATE" ? "Médio" : "Baixo",
  })).sort((a, b) => b.growthRate - a.growthRate);

  return {
    analysisType: "growth",
    species: growthData,
    statistics: {
      fastGrowth: growthData.filter(s => s.growthClass === "FAST").length,
      moderateGrowth: growthData.filter(s => s.growthClass === "MODERATE").length,
      slowGrowth: growthData.filter(s => s.growthClass === "SLOW").length,
      avgGrowthRate: Math.round(growthData.reduce((a, b) => a + b.growthRate, 0) / growthData.length * 1000) / 1000,
    },
    lastUpdate: new Date().toISOString(),
  };
}

async function generateDensityAnalysis() {
  // Generate density data by km ranges
  const ranges = [
    "0-100", "100-200", "200-300", "300-400", "400-500", "500-600", "600-700", "700-847"
  ];

  const densityData = ranges.map(range => ({
    range,
    high: Math.floor(Math.random() * 30 + 10),
    medium: Math.floor(Math.random() * 40 + 20),
    low: Math.floor(Math.random() * 30 + 20),
  }));

  // Calculate totals
  const totals = densityData.reduce((acc, d) => ({
    high: acc.high + d.high,
    medium: acc.medium + d.medium,
    low: acc.low + d.low,
  }), { high: 0, medium: 0, low: 0 });

  return {
    analysisType: "density",
    byRange: densityData,
    totals,
    percentages: {
      high: Math.round(totals.high / (totals.high + totals.medium + totals.low) * 1000) / 10,
      medium: Math.round(totals.medium / (totals.high + totals.medium + totals.low) * 1000) / 10,
      low: Math.round(totals.low / (totals.high + totals.medium + totals.low) * 1000) / 10,
    },
    lastUpdate: new Date().toISOString(),
  };
}

async function generateCriticalSegments(supabase: any) {
  // Fetch actual segments from database or generate realistic data
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .order("ttc_days", { ascending: true })
    .limit(20);

  // If no segments in DB, generate realistic mock data
  const criticalSegments = segments?.length ? segments : Array.from({ length: 15 }, (_, i) => {
    const kmStart = Math.floor(Math.random() * 840);
    const ttc = Math.floor(Math.random() * 60) + 5;
    const chm = 10 + Math.random() * 5;
    
    return {
      id: `SEG-${String(i + 1).padStart(4, "0")}`,
      km_start: kmStart,
      km_end: kmStart + Math.floor(Math.random() * 4) + 1,
      ttc_days: ttc,
      risk_level: ttc < 30 ? "CRITICO" : ttc < 45 ? "ALTO" : "MEDIO",
      chm_current: Math.round(chm * 10) / 10,
      dms: 15,
      dominant_species: ["Eucalyptus grandis", "Bambusa vulgaris", "Cerrado sensu stricto", "Mata de Galeria"][Math.floor(Math.random() * 4)],
      ndvi: Math.round((0.5 + Math.random() * 0.4) * 100) / 100,
      growth_rate: Math.round((0.05 + Math.random() * 0.25) * 1000) / 1000,
      vigor: Math.random() > 0.5 ? "Alto" : Math.random() > 0.5 ? "Médio" : "Baixo",
    };
  }).sort((a, b) => a.ttc_days - b.ttc_days);

  return {
    analysisType: "critical",
    totalCritical: criticalSegments.filter((s: any) => s.risk_level === "CRITICO" || s.ttc_days < 30).length,
    segments: criticalSegments,
    lastUpdate: new Date().toISOString(),
  };
}

async function generateFullAnalysis(species: any[], supabase: any) {
  const [ndvi, speciesData, growth, density, critical] = await Promise.all([
    generateNDVIAnalysis(species),
    generateSpeciesDistribution(species),
    generateGrowthAnalysis(species),
    generateDensityAnalysis(),
    generateCriticalSegments(supabase),
  ]);

  return {
    analysisType: "full",
    summary: {
      speciesIdentified: species.length,
      meanNDVI: ndvi.corridor.meanNDVI,
      avgGrowthRate: growth.statistics.avgGrowthRate,
      highDensitySegments: density.totals.high,
      criticalSegments: critical.totalCritical,
    },
    ndvi,
    species: speciesData,
    growth,
    density,
    critical,
    lastUpdate: new Date().toISOString(),
  };
}
