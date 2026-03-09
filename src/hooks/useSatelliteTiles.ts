import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SatelliteLayer = "TTC" | "CHM" | "SAR" | "NDVI" | "Óptico";

export interface TileData {
  tileUrl: string;
  tiles?: string[];
  source: string;
  imageType: string;
  date?: string;
  layer?: string;
  metadata: Record<string, any>;
  image?: string; // base64 for Sentinel Hub
}

interface UseSatelliteTilesResult {
  tileData: TileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const layerToSourceConfig: Record<string, { source: string; imageType: string }> = {
  SAR: { source: "sentinel_hub", imageType: "SAR" },
  CHM: { source: "nasa_earthdata", imageType: "CHM" },
  NDVI: { source: "nasa_earthdata", imageType: "NDVI" },
  Óptico: { source: "mapbox", imageType: "OPTICAL" },
};

export function useSatelliteTiles(
  layer: SatelliteLayer,
  bounds: { west: number; south: number; east: number; north: number }
): UseSatelliteTilesResult {
  const [tileData, setTileData] = useState<TileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiles = useCallback(async () => {
    // TTC layer doesn't need satellite imagery - it uses the risk-colored polylines
    if (layer === "TTC") {
      setTileData(null);
      setLoading(false);
      return;
    }

    const config = layerToSourceConfig[layer];
    if (!config) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "satellite-imagery",
        {
          body: { source: config.source, imageType: config.imageType, bounds },
        }
      );

      if (fnError) throw fnError;
      setTileData(data as TileData);
    } catch (err: any) {
      console.error("Satellite tile fetch error:", err);
      setError(err.message || "Erro ao carregar imagem de satélite");
    } finally {
      setLoading(false);
    }
  }, [layer, bounds.west, bounds.south, bounds.east, bounds.north]);

  useEffect(() => {
    fetchTiles();
  }, [fetchTiles]);

  return { tileData, loading, error, refetch: fetchTiles };
}
