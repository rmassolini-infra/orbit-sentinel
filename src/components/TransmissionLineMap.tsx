import { useState, useMemo } from 'react';
import { SEGMENTOS_MAPA, type Segmento, type Alerta, ALERTAS } from '@/lib/mockData';
import { TtcBadge } from './TtcBadge';
import { cn } from '@/lib/utils';

interface TransmissionLineMapProps {
  selectedSegment: Alerta | null;
  onSelectSegment: (alerta: Alerta | null) => void;
}

const riskColors = {
  CRITICO: 'hsl(0 85% 65%)',
  ALTO: 'hsl(41 100% 47%)',
  MEDIO: 'hsl(195 100% 50%)',
  BAIXO: 'hsl(166 100% 50%)',
};

export function TransmissionLineMap({ selectedSegment, onSelectSegment }: TransmissionLineMapProps) {
  const [hoveredSegment, setHoveredSegment] = useState<Segmento | null>(null);
  const [activeLayer, setActiveLayer] = useState<'TTC' | 'CHM' | 'SAR' | 'Óptico'>('TTC');

  const totalKm = 847;
  const mapWidth = 100; // percentage
  
  const getSegmentX = (km: number) => (km / totalKm) * mapWidth;

  const findAlertaForSegment = (seg: Segmento): Alerta | null => {
    return ALERTAS.find(a => a.km_ini === seg.km_ini && a.km_fim === seg.km_fim) || null;
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

      {/* SVG Map */}
      <div className="flex-1 relative bg-background rounded-lg overflow-hidden min-h-[300px]">
        {/* Dark background with grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          {/* Grid lines */}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 7.5}
              x2="100"
              y2={i * 7.5}
              stroke="hsl(215 14% 20%)"
              strokeWidth="0.1"
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 11.11}
              y1="0"
              x2={i * 11.11}
              y2="60"
              stroke="hsl(215 14% 20%)"
              strokeWidth="0.1"
            />
          ))}
        </svg>

        {/* Transmission Line SVG */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 100 60"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main line background */}
          <line
            x1="5"
            y1="30"
            x2="95"
            y2="30"
            stroke="hsl(215 14% 30%)"
            strokeWidth="1"
          />

          {/* Segments */}
          {SEGMENTOS_MAPA.map((seg) => {
            const x1 = 5 + getSegmentX(seg.km_ini) * 0.9;
            const x2 = 5 + getSegmentX(seg.km_fim) * 0.9;
            const isSelected = selectedSegment?.km_ini === seg.km_ini;
            const isHovered = hoveredSegment?.id === seg.id;

            return (
              <g key={seg.id}>
                <line
                  x1={x1}
                  y1="30"
                  x2={x2}
                  y2="30"
                  stroke={riskColors[seg.risco]}
                  strokeWidth={isSelected || isHovered ? 3 : 2}
                  className={cn(
                    'cursor-pointer transition-all',
                    seg.risco === 'CRITICO' && 'animate-pulse-critical'
                  )}
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => {
                    const alerta = findAlertaForSegment(seg);
                    if (alerta) {
                      onSelectSegment(alerta);
                    }
                  }}
                />
                {/* Selection indicator */}
                {isSelected && (
                  <circle
                    cx={(x1 + x2) / 2}
                    cy="30"
                    r="2"
                    fill="white"
                  />
                )}
              </g>
            );
          })}

          {/* KM markers */}
          {[0, 100, 200, 300, 400, 500, 600, 700, 847].map((km) => (
            <g key={km}>
              <line
                x1={5 + getSegmentX(km) * 0.9}
                y1="35"
                x2={5 + getSegmentX(km) * 0.9}
                y2="38"
                stroke="hsl(214 14% 58%)"
                strokeWidth="0.3"
              />
              <text
                x={5 + getSegmentX(km) * 0.9}
                y="42"
                textAnchor="middle"
                fill="hsl(214 14% 58%)"
                fontSize="2.5"
                fontFamily="JetBrains Mono"
              >
                {km}
              </text>
            </g>
          ))}

          {/* Legend */}
          <text x="5" y="55" fill="hsl(214 14% 58%)" fontSize="2" fontFamily="JetBrains Mono">
            KM
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredSegment && (
          <div
            className="absolute bg-card border border-border rounded-lg p-3 shadow-lg pointer-events-none z-10"
            style={{
              left: `${5 + getSegmentX((hoveredSegment.km_ini + hoveredSegment.km_fim) / 2) * 0.9}%`,
              top: '15%',
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-mono text-sm font-semibold">
              KM {hoveredSegment.km_ini}–{hoveredSegment.km_fim}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">TTC:</span>
              <TtcBadge value={hoveredSegment.ttc} size="sm" />
            </div>
          </div>
        )}
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
