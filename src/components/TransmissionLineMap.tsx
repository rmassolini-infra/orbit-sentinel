import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap, ImageOverlay } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SEGMENTOS_MAPA, ALERTAS, type Segmento, type Alerta } from '@/lib/mockData';
import { TtcBadge } from './TtcBadge';
import { cn } from '@/lib/utils';
import { useSatelliteTiles, type SatelliteLayer } from '@/hooks/useSatelliteTiles';
import { Loader2, Satellite, AlertTriangle } from 'lucide-react';

interface TransmissionLineMapProps {
  selectedSegment: Alerta | null;
  onSelectSegment: (alerta: Alerta | null) => void;
}

const riskColors = {
  CRITICO: '#FF4C4C',
  ALTO: '#F0A500',
  MEDIO: '#00BFFF',
  BAIXO: '#00FFD1',
};

// Corridor bounds (Uberlândia → Montes Claros, MG)
const CORRIDOR_BOUNDS = {
  west: -48.28,
  south: -18.92,
  east: -43.86,
  north: -16.73,
};

const start: [number, number] = [-18.9186, -48.2772];
const end: [number, number] = [-16.7350, -43.8617];

const getSegmentCoordinates = (km_ini: number, km_fim: number): LatLngExpression[] => {
  const totalKm = 847;
  const latDiff = end[0] - start[0];
  const lngDiff = end[1] - start[1];

  const startLat = start[0] + (km_ini / totalKm) * latDiff;
  const startLng = start[1] + (km_ini / totalKm) * lngDiff;
  const endLat = start[0] + (km_fim / totalKm) * latDiff;
  const endLng = start[1] + (km_fim / totalKm) * lngDiff;

  const midLat = (startLat + endLat) / 2 + Math.sin(km_ini * 0.1) * 0.05;
  const midLng = (startLng + endLng) / 2 + Math.cos(km_ini * 0.1) * 0.05;

  return [
    [startLat, startLng],
    [midLat, midLng],
    [endLat, endLng],
  ];
};

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

// Dynamic satellite tile layer component
function SatelliteTileOverlay({ layer }: { layer: SatelliteLayer }) {
  const { tileData, loading, error } = useSatelliteTiles(layer, CORRIDOR_BOUNDS);
  const map = useMap();

  if (layer === 'TTC' || loading || error || !tileData) return null;

  // For tile-based sources (ESRI, NASA GIBS), use TileLayer with constructed URL template
  if (tileData.source === 'esri') {
    return (
      <TileLayer
        url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={0.7}
        attribution="&copy; Esri World Imagery"
      />
    );
  }

  if (tileData.source === 'nasa_earthdata') {
    const layer_name = tileData.metadata?.layer || 'MODIS_Terra_CorrectedReflectance_TrueColor';
    const date = tileData.date || new Date().toISOString().split('T')[0];
    return (
      <TileLayer
        url={`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer_name}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`}
        opacity={0.75}
        attribution="&copy; NASA GIBS"
        maxZoom={9}
      />
    );
  }

  if (tileData.source === 'mapbox' && tileData.metadata?.center) {
    // Mapbox returns a static image URL - show as image overlay
    const overlayBounds: LatLngBoundsExpression = [
      [CORRIDOR_BOUNDS.south, CORRIDOR_BOUNDS.west],
      [CORRIDOR_BOUNDS.north, CORRIDOR_BOUNDS.east],
    ];
    return (
      <ImageOverlay
        url={tileData.tileUrl}
        bounds={overlayBounds}
        opacity={0.7}
      />
    );
  }

  // Sentinel Hub base64 image
  if (tileData.source === 'sentinel_hub' && tileData.image) {
    const overlayBounds: LatLngBoundsExpression = [
      [CORRIDOR_BOUNDS.south, CORRIDOR_BOUNDS.west],
      [CORRIDOR_BOUNDS.north, CORRIDOR_BOUNDS.east],
    ];
    return (
      <ImageOverlay
        url={tileData.image}
        bounds={overlayBounds}
        opacity={0.75}
      />
    );
  }

  return null;
}

// Layer status indicator
function LayerStatusIndicator({ layer }: { layer: SatelliteLayer }) {
  const { loading, error, tileData } = useSatelliteTiles(layer, CORRIDOR_BOUNDS);

  if (layer === 'TTC') return null;

  return (
    <div className="absolute top-2 right-2 z-[1000]">
      {loading && (
        <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando {layer}...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/30 rounded-md px-2 py-1 text-xs">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Erro na camada</span>
        </div>
      )}
      {!loading && !error && tileData && (
        <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs">
          <Satellite className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground capitalize">{tileData.source}</span>
        </div>
      )}
    </div>
  );
}

export function TransmissionLineMap({ selectedSegment, onSelectSegment }: TransmissionLineMapProps) {
  const [activeLayer, setActiveLayer] = useState<SatelliteLayer>('TTC');

  const center: LatLngExpression = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
  ];

  const bounds: LatLngBoundsExpression = [start, end];

  const findAlertaForSegment = (seg: Segmento): Alerta | null => {
    return ALERTAS.find((a) => a.km_ini === seg.km_ini && a.km_fim === seg.km_fim) || null;
  };

  // Show polylines with less opacity when satellite layer is active
  const polylineOpacityBase = activeLayer === 'TTC' ? 0.8 : 0.5;

  const layers: SatelliteLayer[] = ['TTC', 'CHM', 'SAR', 'NDVI', 'Óptico'];

  const layerDescriptions: Record<SatelliteLayer, string> = {
    TTC: 'Risco por tempo de contato',
    CHM: 'Altura do dossel (GEDI/MODIS)',
    SAR: 'Radar de abertura sintética',
    NDVI: 'Índice de vegetação (MODIS)',
    Óptico: 'Imagem de satélite óptica',
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground">
          CORREDOR LT 500 kV — CERRADO MG
        </h3>
        <div className="flex gap-1">
          {layers.map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              title={layerDescriptions[layer]}
              className={cn(
                'px-2 py-1 text-xs font-mono rounded transition-colors',
                activeLayer === layer
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 relative rounded-lg overflow-hidden min-h-[300px]">
        <LayerStatusIndicator layer={activeLayer} />

        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%', background: '#0D1117' }}
          zoomControl={true}
        >
          {/* Base dark tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <FitBounds bounds={bounds} />

          {/* Satellite overlay layer */}
          <SatelliteTileOverlay layer={activeLayer} />

          {/* Segment polylines */}
          {SEGMENTOS_MAPA.map((seg) => {
            const coordinates = getSegmentCoordinates(seg.km_ini, seg.km_fim);
            const isSelected = selectedSegment?.km_ini === seg.km_ini;
            const alerta = findAlertaForSegment(seg);

            return (
              <Polyline
                key={seg.id}
                positions={coordinates}
                pathOptions={{
                  color: riskColors[seg.risco],
                  weight: isSelected ? 6 : 4,
                  opacity: isSelected ? 1 : polylineOpacityBase,
                  className: seg.risco === 'CRITICO' ? 'animate-pulse-critical' : '',
                }}
                eventHandlers={{
                  click: () => {
                    if (alerta) onSelectSegment(alerta);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div className="bg-card p-3 rounded-lg border border-border min-w-[200px]">
                    <p className="font-mono text-sm font-semibold text-foreground mb-2">
                      KM {seg.km_ini}–{seg.km_fim}
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TTC:</span>
                        <TtcBadge value={seg.ttc} size="sm" />
                      </div>
                      {alerta && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CHM:</span>
                            <span className="font-mono">{alerta.chm} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Espécie:</span>
                            <span className="text-xs truncate max-w-[100px]">{alerta.especie}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Main transmission line background */}
          <Polyline
            positions={[start, end]}
            pathOptions={{
              color: '#30363D',
              weight: 2,
              opacity: 0.5,
              dashArray: '10, 10',
            }}
          />
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          {Object.entries(riskColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-4 h-1 rounded" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">
                {level === 'CRITICO' ? '< 30d' : level === 'ALTO' ? '30–45d' : level === 'MEDIO' ? '45–90d' : '> 90d'}
              </span>
            </div>
          ))}
        </div>
        {activeLayer !== 'TTC' && (
          <span className="text-muted-foreground italic">
            Camada: {layerDescriptions[activeLayer]}
          </span>
        )}
      </div>
    </div>
  );
}
