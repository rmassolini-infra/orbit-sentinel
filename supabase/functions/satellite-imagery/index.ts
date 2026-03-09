import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SatelliteRequest {
  source: "sentinel_hub" | "nasa_earthdata" | "mapbox" | "esri";
  imageType: "SAR" | "OPTICAL" | "INFRARED" | "NDVI" | "CHM";
  bounds: { west: number; south: number; east: number; north: number };
  date?: string;
  resolution?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source, imageType, bounds, date, resolution = 10 } = await req.json() as SatelliteRequest;

    // Check cache first
    const cacheKey = `${source}_${imageType}_${JSON.stringify(bounds)}_${date}`;
    const { data: cached } = await supabase
      .from("api_cache")
      .select("response_data")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (cached) {
      return new Response(JSON.stringify(cached.response_data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let imageData: any;

    switch (source) {
      case "sentinel_hub": {
        imageData = await fetchSentinelHub(imageType, bounds, date, resolution);
        break;
      }
      case "nasa_earthdata": {
        imageData = await fetchNasaEarthdata(imageType, bounds, date);
        break;
      }
      case "mapbox": {
        imageData = await fetchMapbox(bounds, resolution);
        break;
      }
      case "esri": {
        imageData = await fetchEsriWorldImagery(bounds, resolution);
        break;
      }
      default:
        throw new Error(`Unsupported source: ${source}`);
    }

    // Cache the response for 1 hour
    await supabase.from("api_cache").upsert({
      cache_key: cacheKey,
      response_data: imageData,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    });

    return new Response(JSON.stringify(imageData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Satellite imagery error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fetchSentinelHub(
  imageType: string,
  bounds: { west: number; south: number; east: number; north: number },
  date?: string,
  resolution = 10
) {
  const sentinelHubKey = Deno.env.get("SENTINEL_HUB_API_KEY");
  
  if (!sentinelHubKey) {
    // Fallback to ESRI World Imagery
    return fetchEsriWorldImagery(bounds, resolution);
  }

  const targetDate = date || new Date().toISOString().split("T")[0];
  const fromDate = new Date(new Date(targetDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Determine layer based on image type
  let evalscript = "";
  let dataCollection = "sentinel-2-l2a";

  switch (imageType) {
    case "OPTICAL":
      evalscript = `
        //VERSION=3
        function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
        function evaluatePixel(s) { return [2.5 * s.B04, 2.5 * s.B03, 2.5 * s.B02]; }
      `;
      break;
    case "NDVI":
      evalscript = `
        //VERSION=3
        function setup() { return { input: ["B04", "B08"], output: { bands: 1 } }; }
        function evaluatePixel(s) { 
          let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
          return [ndvi];
        }
      `;
      break;
    case "SAR":
      dataCollection = "sentinel-1-grd";
      evalscript = `
        //VERSION=3
        function setup() { return { input: ["VV", "VH"], output: { bands: 2 } }; }
        function evaluatePixel(s) { return [s.VV, s.VH]; }
      `;
      break;
    case "INFRARED":
      evalscript = `
        //VERSION=3
        function setup() { return { input: ["B12", "B11", "B04"], output: { bands: 3 } }; }
        function evaluatePixel(s) { return [2.5 * s.B12, 2.5 * s.B11, 2.5 * s.B04]; }
      `;
      break;
    default:
      evalscript = `
        //VERSION=3
        function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
        function evaluatePixel(s) { return [2.5 * s.B04, 2.5 * s.B03, 2.5 * s.B02]; }
      `;
  }

  const requestBody = {
    input: {
      bounds: {
        bbox: [bounds.west, bounds.south, bounds.east, bounds.north],
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [{
        dataFilter: { timeRange: { from: `${fromDate}T00:00:00Z`, to: `${targetDate}T23:59:59Z` } },
        type: dataCollection,
      }],
    },
    output: {
      width: 512,
      height: 512,
      responses: [{ identifier: "default", format: { type: "image/png" } }],
    },
    evalscript,
  };

  try {
    const response = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sentinelHubKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Sentinel Hub API error: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    return {
      source: "sentinel_hub",
      imageType,
      dataCollection,
      date: targetDate,
      bounds,
      resolution,
      image: `data:image/png;base64,${base64Image}`,
      metadata: {
        fromDate,
        toDate: targetDate,
        crs: "EPSG:4326",
      },
    };
  } catch (error) {
    console.error("Sentinel Hub error:", error);
    // Fallback to ESRI
    return fetchEsriWorldImagery(bounds, resolution);
  }
}

async function fetchNasaEarthdata(
  imageType: string,
  bounds: { west: number; south: number; east: number; north: number },
  date?: string
) {
  const nasaToken = Deno.env.get("NASA_EARTHDATA_TOKEN");
  const targetDate = date || new Date().toISOString().split("T")[0];

  // NASA GIBS WMTS for MODIS imagery
  let layer = "MODIS_Terra_CorrectedReflectance_TrueColor";
  
  switch (imageType) {
    case "INFRARED":
      layer = "MODIS_Terra_CorrectedReflectance_Bands721";
      break;
    case "NDVI":
      layer = "MODIS_Terra_NDVI_8Day";
      break;
    case "CHM":
      layer = "GEDI_L3_Land_Surface_Metrics_Canopy_Height";
      break;
  }

  // Calculate tile coordinates
  const centerLon = (bounds.west + bounds.east) / 2;
  const centerLat = (bounds.south + bounds.north) / 2;
  const zoom = 8;
  const tileX = Math.floor((centerLon + 180) / 360 * Math.pow(2, zoom));
  const tileY = Math.floor((1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${targetDate}/GoogleMapsCompatible_Level9/${zoom}/${tileY}/${tileX}.jpg`;

  return {
    source: "nasa_earthdata",
    imageType,
    layer,
    date: targetDate,
    bounds,
    tileUrl,
    metadata: {
      provider: "NASA GIBS",
      crs: "EPSG:3857",
      zoom,
      tileX,
      tileY,
    },
  };
}

async function fetchMapbox(
  bounds: { west: number; south: number; east: number; north: number },
  resolution = 10
) {
  const mapboxToken = Deno.env.get("MAPBOX_ACCESS_TOKEN");
  
  if (!mapboxToken) {
    return fetchEsriWorldImagery(bounds, resolution);
  }

  const centerLon = (bounds.west + bounds.east) / 2;
  const centerLat = (bounds.south + bounds.north) / 2;
  const zoom = 14;

  const staticImageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${centerLon},${centerLat},${zoom}/512x512@2x?access_token=${mapboxToken}`;

  return {
    source: "mapbox",
    imageType: "OPTICAL",
    bounds,
    tileUrl: staticImageUrl,
    metadata: {
      provider: "Mapbox Satellite",
      crs: "EPSG:3857",
      zoom,
      center: { lon: centerLon, lat: centerLat },
    },
  };
}

async function fetchEsriWorldImagery(
  bounds: { west: number; south: number; east: number; north: number },
  resolution = 10
) {
  const centerLon = (bounds.west + bounds.east) / 2;
  const centerLat = (bounds.south + bounds.north) / 2;
  const zoom = 14;

  // Calculate tile coordinates
  const tileX = Math.floor((centerLon + 180) / 360 * Math.pow(2, zoom));
  const tileY = Math.floor((1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

  const tileUrl = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`;

  return {
    source: "esri",
    imageType: "OPTICAL",
    bounds,
    tileUrl,
    tiles: [
      tileUrl,
      `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX + 1}`,
      `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY + 1}/${tileX}`,
      `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY + 1}/${tileX + 1}`,
    ],
    metadata: {
      provider: "ESRI World Imagery",
      crs: "EPSG:3857",
      zoom,
      tileX,
      tileY,
      center: { lon: centerLon, lat: centerLat },
    },
  };
}
