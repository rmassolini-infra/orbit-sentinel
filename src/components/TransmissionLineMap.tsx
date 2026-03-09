import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SEGMENTOS_MAPA, ALERTAS, type Segmento, type Alerta } from '@/lib/mockData';
import { TtcBadge } from './TtcBadge';
import { cn } from '@/lib/utils';

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

// Simulated transmission line coordinates (Minas Gerais region - Cerrado corridor)
// Creating a realistic path from south to north in MG
const generateLineCoordinates = (): { start: [number, number]; end: [number, number] } => {
  // Starting point near Uberlândia, MG
  const start: [number, number] = [-18.9186, -48.2772];
  // Ending point near Montes Claros, MG
  const end: [number, number] = [-16.7350, -43.8617];
  return { start, end };
};

const { start, end } = generateLineCoordinates();

// Interpolate coordinates for each segment based on km
const getSegmentCoordinates = (km_ini: number, km_fim: number): LatLngExpression[] => {
  const totalKm = 847;
  const latDiff = end[0] - start[0];
  const lngDiff = end[1] - start[1];
  
  const startLat = start[0] + (km_ini / totalKm) * latDiff;
  const startLng = start[1] + (km_ini / totalKm) * lngDiff;
  const endLat = start[0] + (km_fim / totalKm) * latDiff;
  const endLng = start[1] + (km_fim / totalKm) * lngDiff;
  
  // Add some natural curve variation
  const midLat = (startLat + endLat) / 2 + (Math.sin(km_ini * 0.1) * 0.05);
  const midLng = (startLng + endLng) / 2 + (Math.cos(km_ini * 0.1) * 0.05);
  
  return [
    [startLat, startLng],
    [midLat, midLng],
    [endLat, endLng],
  ];
};

// Component to fit bounds when needed
function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

export function TransmissionLineMap({ selectedSegment, onSelectSegment }: TransmissionLineMapProps) {
  const [activeLayer, setActiveLayer] = useState<'TTC' | 'CHM' | 'SAR' | 'Óptico'>('TTC');
  
  const center: LatLngExpression = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
  ];

  const bounds: LatLngBoundsExpression = [start, end];

  const findAlertaForSegment = (seg: Segmento): Alerta | null => {
    return ALERTAS.find(a => a.km_ini === seg.km_ini && a.km_fim === seg.km_fim) || null;
  };

  const getSegmentWeight = (seg: Segmento) => {
    const alerta = findAlertaForSegment(seg);
    return selectedSegment?.km_ini === seg.km_ini ? 6 : 4;
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground">
          CORREDOR LT 500 kV — CERRADO MG
        </h3>
        <div className="flex gap-1">
          {(['TTC', 'CHM', 'SAR', 'Óptico'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={cn(
                'px-2 py-1 text-xs font-mono rounded transition-colors',
                activeLayer === layer
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-surface-hover'
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 relative rounded-lg overflow-hidden min-h-[300px]">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%', background: '#0D1117' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <FitBounds bounds={bounds} />

          {/* Render each segment as a polyline */}
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
                  opacity: isSelected ? 1 : 0.8,
                  className: seg.risco === 'CRITICO' ? 'animate-pulse-critical' : '',
                }}
                eventHandlers={{
                  click: () => {
                    if (alerta) {
                      onSelectSegment(alerta);
                    }
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
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: riskColors.CRITICO }} />
          <span className="text-muted-foreground">&lt; 30d</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: riskColors.ALTO }} />
          <span className="text-muted-foreground">30–45d</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: riskColors.MEDIO }} />
          <span className="text-muted-foreground">45–90d</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: riskColors.BAIXO }} />
          <span className="text-muted-foreground">&gt; 90d</span>
        </div>
      </div>
    </div>
  );
}
