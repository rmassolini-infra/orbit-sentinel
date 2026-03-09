import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { MetricCard } from '@/components/MetricCard';
import { INSAR_METRICS } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Activity, Layers, CheckCircle, AlertTriangle, Radio, Satellite, Eye, Radar } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Pipeline stages
const pipelineStages = [
  { id: 1, name: 'Aquisição SAR', status: 'concluido' as const, time: '22:18 UTC', detail: 'Sentinel-1 IW SLC', icon: Radio },
  { id: 2, name: 'Co-registro', status: 'concluido' as const, time: '22:34 UTC', detail: 'Precisão sub-pixel: 0.12 px', icon: Layers },
  { id: 3, name: 'Interferograma', status: 'concluido' as const, time: '22:51 UTC', detail: 'Baseline perpendicular: 87 m', icon: Activity },
  { id: 4, name: 'Filtragem Phase', status: 'concluido' as const, time: '23:08 UTC', detail: 'Goldstein α=0.7', icon: Activity },
  { id: 5, name: 'Unwrapping', status: 'concluido' as const, time: '23:22 UTC', detail: 'SNAPHU MCF', icon: Activity },
  { id: 6, name: 'Geocodificação', status: 'concluido' as const, time: '23:35 UTC', detail: 'SRTM 30m DEM ref.', icon: Layers },
  { id: 7, name: 'Geração CHM', status: 'concluido' as const, time: '23:48 UTC', detail: 'DSM - DTM = CHM', icon: Layers },
  { id: 8, name: 'Calibração', status: 'concluido' as const, time: '00:02 UTC', detail: 'LiDAR ground truth', icon: CheckCircle },
];

// Coherence histogram data
const coherenceHistogram = Array.from({ length: 20 }, (_, i) => {
  const coh = i * 0.05;
  const count = coh < 0.3
    ? Math.random() * 200 + 50
    : coh < 0.6
      ? Math.random() * 800 + 400
      : Math.random() * 1500 + 800;
  return { coherence: coh.toFixed(2), count: Math.round(count) };
});

// Baseline history
const baselineHistory = [
  { par: 'Jan/25', perpendicular: 45, temporal: 12 },
  { par: 'Feb/25', perpendicular: 78, temporal: 12 },
  { par: 'Mar/25', perpendicular: 112, temporal: 12 },
  { par: 'Apr/25', perpendicular: 65, temporal: 12 },
  { par: 'May/25', perpendicular: 92, temporal: 12 },
  { par: 'Jun/25', perpendicular: 34, temporal: 12 },
  { par: 'Jul/25', perpendicular: 56, temporal: 12 },
  { par: 'Aug/25', perpendicular: 88, temporal: 12 },
  { par: 'Sep/25', perpendicular: 101, temporal: 12 },
  { par: 'Oct/25', perpendicular: 73, temporal: 12 },
  { par: 'Nov/25', perpendicular: 95, temporal: 12 },
  { par: 'Dec/25', perpendicular: 60, temporal: 12 },
  { par: 'Jan/26', perpendicular: 82, temporal: 12 },
  { par: 'Feb/26', perpendicular: 67, temporal: 12 },
  { par: 'Mar/26', perpendicular: 87, temporal: 12 },
];

// CHM validation scatter
const chmValidation = Array.from({ length: 40 }, (_, i) => {
  const lidar = Math.random() * 20 + 2;
  const insar = lidar + (Math.random() - 0.5) * 4 + INSAR_METRICS.vies;
  return { lidar: Math.round(lidar * 10) / 10, insar: Math.round(insar * 10) / 10 };
});

// CHM error distribution
const chmErrorDist = Array.from({ length: 15 }, (_, i) => {
  const error = (i - 7) * 0.5;
  const count = Math.round(Math.exp(-error * error / 3) * 500 + Math.random() * 30);
  return { error: error.toFixed(1), count };
});

// Phase residual time series
const phaseResiduals = Array.from({ length: 30 }, (_, i) => ({
  pixel: i * 100,
  residual: (Math.random() - 0.5) * 0.8,
}));

const tooltipStyle = {
  backgroundColor: 'hsl(215 25% 11%)',
  border: '1px solid hsl(215 14% 25%)',
  borderRadius: '8px',
  fontFamily: 'JetBrains Mono',
  fontSize: '12px',
};

const axisTickStyle = { fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' };
const gridStroke = 'hsl(215 14% 25%)';

// Satellite imagery sources - real tiles from ESA/NASA
const satelliteImagery = {
  sar: {
    label: 'SAR',
    icon: Radar,
    // Sentinel-1 SAR imagery (simulated with real satellite base)
    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
    overlay: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands367/default/2024-01-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
  },
  optical: {
    label: 'Óptico',
    icon: Eye,
    // Sentinel-2 optical imagery
    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
  },
  infrared: {
    label: 'Infravermelho',
    icon: Satellite,
    // MODIS infrared bands
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_Bands721/default/2024-01-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
  },
};

export default function InSARPage() {
  const [selectedStage, setSelectedStage] = useState(3);
  const [imageMode, setImageMode] = useState<'sar' | 'optical' | 'infrared'>('sar');

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      <h1 className="font-display text-xl font-semibold">Pipeline InSAR</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="MAE" value={INSAR_METRICS.mae} unit="m" status="ok" subtext="Mean Absolute Error" />
        <MetricCard label="RMSE" value={INSAR_METRICS.rmse} unit="m" status="ok" subtext="Root Mean Square Error" />
        <MetricCard label="Viés" value={INSAR_METRICS.vies} unit="m" status="ok" subtext="Pós-calibração LiDAR" />
        <MetricCard label="Coerência Média" value="0.72" status="ok" subtext="Acima do limiar 0.4" />
        <MetricCard label="Pixels Processados" value="84.7k" status="ok" subtext="Corredor completo" />
      </div>

      {/* Pipeline Stages */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          PIPELINE DE PROCESSAMENTO — PAR 13/03/2026
        </h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => setSelectedStage(stage.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border px-3 py-2 min-w-[110px] transition-all',
                  selectedStage === stage.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-surface-hover'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  stage.status === 'concluido' ? 'bg-success/20' : 'bg-muted'
                )}>
                  <stage.icon className={cn('h-4 w-4', stage.status === 'concluido' ? 'text-success' : 'text-muted-foreground')} />
                </div>
                <span className="text-xs font-semibold text-center leading-tight">{stage.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{stage.time}</span>
              </button>
              {idx < pipelineStages.length - 1 && (
                <div className="w-4 h-px bg-success mx-0.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
        {/* Stage Detail */}
        <div className="mt-3 p-3 bg-muted rounded-lg flex items-center gap-3 text-sm">
          <CheckCircle className="h-4 w-4 text-success shrink-0" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{pipelineStages[selectedStage - 1].name}</span>
            {' — '}{pipelineStages[selectedStage - 1].detail}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Coherence Histogram */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              HISTOGRAMA DE COERÊNCIA INTERFEROMÉTRICA
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coherenceHistogram} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="coherence" tick={axisTickStyle} stroke={gridStroke} interval={3} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Pixels']} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {coherenceHistogram.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={parseFloat(entry.coherence) < 0.3 ? 'hsl(0 85% 65%)' : parseFloat(entry.coherence) < 0.6 ? 'hsl(41 100% 47%)' : 'hsl(166 100% 50%)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-critical">■</span> γ &lt; 0.3 (descartado) &nbsp;
              <span className="text-accent">■</span> 0.3–0.6 (marginal) &nbsp;
              <span className="text-teal">■</span> γ &gt; 0.6 (válido)
            </p>
          </div>
        </div>

        {/* Baseline History */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              HISTÓRICO DE BASELINES PERPENDICULARES
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={baselineHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="par" tick={axisTickStyle} stroke={gridStroke} interval={2} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} tickFormatter={(v) => `${v}m`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} m`, 'B⊥']} />
                  <Bar dataKey="perpendicular" radius={[2, 2, 0, 0]}>
                    {baselineHistory.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.perpendicular > 100 ? 'hsl(41 100% 47%)' : 'hsl(195 100% 50%)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <AlertTriangle className="inline h-3 w-3 mr-1 text-accent" />
              B⊥ &gt; 100m pode degradar coerência temporal
            </p>
          </div>
        </div>

        {/* CHM Validation Scatter */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              VALIDAÇÃO CHM — InSAR vs LiDAR
            </h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    type="number" dataKey="lidar" name="LiDAR" unit=" m"
                    tick={axisTickStyle} stroke={gridStroke} domain={[0, 25]}
                    label={{ value: 'CHM LiDAR (m)', position: 'insideBottom', offset: -5, fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    type="number" dataKey="insar" name="InSAR" unit=" m"
                    tick={axisTickStyle} stroke={gridStroke} domain={[0, 25]}
                    label={{ value: 'CHM InSAR (m)', angle: -90, position: 'insideLeft', fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <ZAxis range={[30, 30]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Scatter data={chmValidation} fill="hsl(195 100% 50%)" fillOpacity={0.7} />
                  {/* 1:1 line approximation via reference */}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">
                R² = <span className="font-mono text-foreground">0.89</span> &nbsp;|&nbsp;
                MAE = <span className="font-mono text-foreground">{INSAR_METRICS.mae}m</span> &nbsp;|&nbsp;
                Viés = <span className="font-mono text-foreground">{INSAR_METRICS.vies}m</span>
              </span>
              <span className="text-success">✓ Dentro do esperado</span>
            </div>
          </div>
        </div>

        {/* CHM Error Distribution */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              DISTRIBUIÇÃO DE ERROS CHM (InSAR − LiDAR)
            </h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chmErrorDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="error" tick={axisTickStyle} stroke={gridStroke}
                    label={{ value: 'Erro (m)', position: 'insideBottom', offset: -5, fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Pixels']} />
                  <Area
                    type="monotone" dataKey="count"
                    stroke="hsl(195 100% 50%)" fill="hsl(195 100% 50%)" fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Distribuição aproximadamente normal com viés de <span className="font-mono">{INSAR_METRICS.vies}m</span> pós-calibração
            </p>
          </div>
        </div>

        {/* Interferogram Visualization (simulated) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              INTERFEROGRAMA — FASE DIFERENCIAL
            </h3>
            <div className="aspect-video bg-background rounded-lg overflow-hidden relative">
              {/* Simulated interferogram with CSS gradients */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    repeating-conic-gradient(
                      from 0deg at 30% 40%,
                      hsl(195 100% 50% / 0.6) 0deg,
                      hsl(166 100% 50% / 0.6) 60deg,
                      hsl(41 100% 47% / 0.6) 120deg,
                      hsl(0 85% 65% / 0.6) 180deg,
                      hsl(280 80% 60% / 0.6) 240deg,
                      hsl(195 100% 50% / 0.6) 360deg
                    ),
                    repeating-conic-gradient(
                      from 45deg at 70% 60%,
                      hsl(195 100% 50% / 0.4) 0deg,
                      hsl(166 100% 50% / 0.4) 90deg,
                      hsl(41 100% 47% / 0.4) 180deg,
                      hsl(195 100% 50% / 0.4) 360deg
                    )
                  `,
                  filter: 'blur(8px)',
                }}
              />
              <div className="absolute inset-0 bg-background/30" />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
                Sentinel-1 IW — Par 01/03 ↔ 13/03/2026
              </div>
              <div className="absolute top-2 right-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
                B⊥ = 87 m | Δt = 12 d
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Fase: -π → +π (1 franja ≈ 2.8 cm deslocamento LOS)</span>
              <div className="flex gap-1">
                <div className="w-12 h-2 rounded" style={{ background: 'linear-gradient(to right, hsl(195 100% 50%), hsl(166 100% 50%), hsl(41 100% 47%), hsl(0 85% 65%), hsl(280 80% 60%), hsl(195 100% 50%))' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Phase Residuals */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              RESÍDUOS DE FASE PÓS-UNWRAPPING
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={phaseResiduals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="pixel" tick={axisTickStyle} stroke={gridStroke} tickFormatter={(v) => `${v}`} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} domain={[-1, 1]} tickFormatter={(v) => `${v} rad`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${Number(v).toFixed(3)} rad`, 'Resíduo']} />
                  <Line
                    type="monotone" dataKey="residual"
                    stroke="hsl(41 100% 47%)" strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              σ residual = <span className="font-mono">0.23 rad</span> — qualidade de unwrapping aceitável (&lt; 0.5 rad)
            </p>
          </div>
        </div>

        {/* Processing Parameters Table */}
        <div className="col-span-12">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              PARÂMETROS DE PROCESSAMENTO
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">AQUISIÇÃO</p>
                {[
                  ['Sensor', 'Sentinel-1A IW'],
                  ['Polarização', 'VV'],
                  ['Órbita', 'Ascendente #82'],
                  ['Ângulo incidência', '38.7°'],
                  ['Resolução azimute', '20 m'],
                  ['Resolução range', '5 m'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">INTERFEROMETRIA</p>
                {[
                  ['Baseline perp.', '87 m'],
                  ['Baseline temporal', '12 dias'],
                  ['Altura de ambiguidade', '102 m'],
                  ['Filtro Goldstein α', '0.7'],
                  ['Multilook (Az × Rg)', '4 × 1'],
                  ['Método unwrapping', 'SNAPHU MCF'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">GEOCODIFICAÇÃO & CHM</p>
                {[
                  ['DEM referência', 'SRTM 1" (30m)'],
                  ['Pixel spacing', '10 m'],
                  ['Projeção', 'UTM 23S / SIRGAS2000'],
                  ['Calibração', 'LiDAR ICESat-2'],
                  ['Pontos de controle', '847'],
                  ['Tempo total proc.', '1h 44min'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
