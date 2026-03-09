import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Segment {
  id: string;
  corridor_id: string;
  km_start: number;
  km_end: number;
  ttc_days: number;
  risk_level: "CRITICO" | "ALTO" | "MEDIO" | "BAIXO";
  chm_current: number;
  dms: number;
  dominant_species: string;
  growth_rate: number;
  last_inspection_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  segment_id: string;
  alert_type: string;
  severity: string;
  message: string;
  ttc_value?: number;
  chm_value?: number;
  is_acknowledged: boolean;
  created_at: string;
}

export interface VegetationSpecies {
  id: string;
  scientific_name: string;
  common_name: string;
  growth_class: "FAST" | "MODERATE" | "SLOW";
  average_growth_rate: number;
  max_height: number;
  risk_category: "HIGH" | "MEDIUM" | "LOW";
  color_hex: string;
}

// Segments API
export function useSegments(riskLevel?: string) {
  return useQuery({
    queryKey: ["segments", riskLevel],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("segments-api", {
        method: "GET",
      });
      
      if (error) throw error;
      
      let segments = data as Segment[];
      
      // If no segments, try to generate them
      if (!segments || segments.length === 0) {
        await supabase.functions.invoke("segments-api", {
          body: { action: "generate" },
        });
        
        const { data: newData } = await supabase.functions.invoke("segments-api", {
          method: "GET",
        });
        segments = newData as Segment[];
      }
      
      if (riskLevel && riskLevel !== "all") {
        return segments.filter(s => s.risk_level === riskLevel);
      }
      
      return segments;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenerateSegments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("segments-api", {
        body: { action: "generate" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

// Alerts from Supabase directly
export function useAlerts(acknowledged = false) {
  return useQuery({
    queryKey: ["alerts", acknowledged],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("is_acknowledged", acknowledged)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Alert[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Vegetation Species
export function useVegetationSpecies() {
  return useQuery({
    queryKey: ["vegetation_species"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vegetation_species")
        .select("*")
        .order("average_growth_rate", { ascending: false });
      
      if (error) throw error;
      return data as VegetationSpecies[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Vegetation Analysis
export function useVegetationAnalysis(analysisType: "ndvi" | "species" | "growth" | "density" | "critical" | "full" = "full") {
  return useQuery({
    queryKey: ["vegetation_analysis", analysisType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("vegetation-analysis", {
        body: { analysisType },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// InSAR Processing
export function useInSARProcessing(segmentId?: string) {
  return useQuery({
    queryKey: ["insar_processing", segmentId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("insar-processing", {
        body: { segmentId },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Satellite Imagery
export function useSatelliteImagery(
  source: "sentinel_hub" | "nasa_earthdata" | "mapbox" | "esri",
  imageType: "SAR" | "OPTICAL" | "INFRARED" | "NDVI" | "CHM",
  bounds: { west: number; south: number; east: number; north: number }
) {
  return useQuery({
    queryKey: ["satellite_imagery", source, imageType, bounds],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("satellite-imagery", {
        body: { source, imageType, bounds },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!bounds,
  });
}

// Corridor Stats
export function useCorridorStats() {
  const { data: segments } = useSegments();
  
  if (!segments) return null;
  
  return {
    totalKm: 847,
    totalSegments: segments.length,
    criticos: segments.filter(s => s.risk_level === "CRITICO").length,
    altos: segments.filter(s => s.risk_level === "ALTO").length,
    medios: segments.filter(s => s.risk_level === "MEDIO").length,
    baixos: segments.filter(s => s.risk_level === "BAIXO").length,
    lastUpdate: new Date().toISOString(),
  };
}
