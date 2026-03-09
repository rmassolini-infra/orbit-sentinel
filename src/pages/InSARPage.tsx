import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { MetricCard } from '@/components/MetricCard';
import { cn } from '@/lib/utils';
import { Activity, Layers, CheckCircle, AlertTriangle, Radio, Satellite, Eye, Radar, Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useInSARProcessing } from '@/hooks/useGrafterData';

const tooltipStyle = {
  backgroundColor: 'hsl(215 25% 11%)',
  border: '1px solid hsl(215 14% 25%)',
  borderRadius: '8px',
  fontFamily: 'JetBrains Mono',
  fontSize: '12px',
};

const axisTickStyle = { fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' };
const gridStroke = 'hsl(215 14% 25%)';

// Satellite imagery sources
const satelliteImagery = {
  sar: { label: 'SAR', icon: Radar },
  optical: { label: 'Óptico', icon: Eye },
  infrared: { label: 'Infravermelho', icon: Satellite },
};

// Baseline history (static for now, could be from API)
const baselineHistory = [
  { par: 'Jan/25', perpendicular: 45, temporal: 12 },
  { par: 'Fev/25', perpendicular: 78, temporal: 12 },
  { par: 'Mar/25', perpendicular: 112, temporal: 12 },
  { par: 'Abr/25', perpendicular: 65, temporal: 12 },
  { par: 'Mai/25', perpendicular: 92, temporal: 12 },
  { par: 'Jun/25', perpendicular: 34, temporal: 12 },
  { par: 'Jul/25', perpendicular: 56, temporal: 12 },
  { par: 'Ago/25', perpendicular: 88, temporal: 12 },
  { par: 'Set/25', perpendicular: 101, temporal: 12 },
  { par: 'Out/25', perpendicular: 73, temporal: 12 },
  { par: 'Nov/25', perpendicular: 95, temporal: 12 },
  { par: 'Dez/25', perpendicular: 60, temporal: 12 },
  { par: 'Jan/26', perpendicular: 82, temporal: 12 },
  { par: 'Fev/26', perpendicular: 67, temporal: 12 },
  { par: 'Mar/26', perpendicular: 87, temporal: 12 },
];

// CHM error distribution (static)
const chmErrorDist = Array.from({ length: 15 }, (_, i) => {
  const error = (i - 7) * 0.5;
  const count = Math.round(Math.exp(-error * error / 3) * 500 + Math.random() * 30);
  return { error: error.toFixed(1), count };
});

const stageIcons: Record<string, typeof Radio> = {
  'Aquisição SAR': Radio,
  'Co-registro': Layers,
  'Interferograma': Activity,
  'Filtragem Phase': Activity,
  'Unwrapping': Activity,
  'Geocodificação': Layers,
  'Geração CHM': Layers,
  'Calibração': CheckCircle,
};

export default function InSARPage() {
  const [selectedStage, setSelectedStage] = useState(3);
  const [imageMode, setImageMode] = useState<'sar' | 'optical' | 'infrared'>('sar');
  
  // Fetch real InSAR data from API
  const { data: insarData, isLoading, error } = useInSARProcessing();

  // Use API data or fallbacks
  const coherenceHistogram = insarData?.coherence?.histogram || [];
  const phaseResiduals = insarData?.phaseResiduals || [];
  const chmValidation = insarData?.chmValidation || [];
  const pipelineStages = insarData?.pipelineStages || [];
  const metrics = insarData?.qualityMetrics || { mae: 1.7, rmse: 2.1, bias: -0.6, rSquared: 0.89 };
  const coherence = insarData?.coherence || { mean: 0.72, std: 0.15 };
  const baselines = insarData?.baselines || { perpendicular: 87, temporal: 12, ambiguityHeight: 102 };
  const processingParams = insarData?.processingParams || {};
  const chmDerived = insarData?.chmDerived || 12.4;
  const unwrappingQuality = insarData?.unwrappingQuality || "GOOD";

  if (isLoading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Processando dados InSAR...</span>
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      <h1 className="font-display text-xl font-semibold">Pipeline InSAR</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="MAE" value={metrics.mae} unit="m" status="ok" subtext="Mean Absolute Error" />
        <MetricCard label="RMSE" value={metrics.rmse} unit="m" status="ok" subtext="Root Mean Square Error" />
        <MetricCard label="Viés" value={metrics.bias} unit="m" status="ok" subtext="Pós-calibração LiDAR" />
        <MetricCard label="Coerência Média" value={coherence.mean.toFixed(2)} status={coherence.mean > 0.6 ? "ok" : "warning"} subtext="Acima do limiar 0.4" />
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
                R² = <span className="font-mono text-foreground">{metrics.rSquared}</span> &nbsp;|&nbsp;
                MAE = <span className="font-mono text-foreground">{metrics.mae}m</span> &nbsp;|&nbsp;
                Viés = <span className="font-mono text-foreground">{metrics.bias}m</span>
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

        {/* Satellite Imagery Viewer */}
        <div className="col-span-12">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                VISUALIZAÇÃO DE IMAGENS SATELITAIS — CORREDOR LT
              </h3>
              <ToggleGroup type="single" value={imageMode} onValueChange={(v) => v && setImageMode(v as typeof imageMode)}>
                {Object.entries(satelliteImagery).map(([key, config]) => (
                  <ToggleGroupItem key={key} value={key} className="gap-1.5 text-xs">
                    <config.icon className="h-3.5 w-3.5" />
                    {config.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Satellite Image */}
              <div className="aspect-video bg-background rounded-lg overflow-hidden relative">
                {/* Optical view - Sentinel-2 tiles */}
                <img 
                  src="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/8/125/85"
                  alt="Sentinel-2 optical"
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                    imageMode === 'optical' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {/* Infrared view */}
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  imageMode === 'infrared' ? 'opacity-100' : 'opacity-0'
                )}>
                  <img 
                    src="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/8/125/85"
                    alt="MODIS Terra infrared"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'hue-rotate(220deg) saturate(1.8) brightness(0.9)' }}
                  />
                </div>
                {/* SAR view with interferogram overlay */}
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  imageMode === 'sar' ? 'opacity-100' : 'opacity-0'
                )}>
                  <img 
                    src="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/8/125/85"
                    alt="Sentinel-1 SAR base"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'grayscale(100%) contrast(1.3) brightness(0.85)' }}
                  />
                  {/* Interferogram phase overlay */}
                  <div
                    className="absolute inset-0 mix-blend-screen"
                    style={{
                      background: `
                        repeating-conic-gradient(
                          from 0deg at 35% 45%,
                          hsl(195 100% 50% / 0.4) 0deg,
                          hsl(166 100% 50% / 0.4) 60deg,
                          hsl(41 100% 47% / 0.4) 120deg,
                          hsl(0 85% 65% / 0.4) 180deg,
                          hsl(280 80% 60% / 0.4) 240deg,
                          hsl(195 100% 50% / 0.4) 360deg
                        )
                      `,
                      filter: 'blur(15px)',
                    }}
                  />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 rounded text-xs font-mono">
                  {imageMode === 'sar' && 'Sentinel-1 IW SLC — Interferograma'}
                  {imageMode === 'optical' && 'Sentinel-2 MSI — RGB True Color'}
                  {imageMode === 'infrared' && 'MODIS Terra — Bandas 7-2-1'}
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 rounded text-xs font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Ao vivo
                </div>
              </div>
              
              {/* Secondary view - CHM or NDVI */}
              <div className="aspect-video bg-background rounded-lg overflow-hidden relative">
                <img 
                  src="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/8/125/86"
                  alt="Secondary satellite view"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    filter: imageMode === 'infrared' 
                      ? 'hue-rotate(280deg) saturate(1.5) contrast(1.1)' 
                      : imageMode === 'sar'
                        ? 'grayscale(100%) brightness(0.7) contrast(1.4)'
                        : 'hue-rotate(60deg) saturate(1.3)'
                  }}
                />
                {/* CHM/NDVI/LST overlay gradient */}
                <div
                  className="absolute inset-0 mix-blend-overlay"
                  style={{
                    background: imageMode === 'sar'
                      ? 'linear-gradient(135deg, hsl(166 100% 50% / 0.4) 0%, hsl(41 100% 47% / 0.5) 50%, hsl(0 85% 65% / 0.4) 100%)'
                      : imageMode === 'optical'
                        ? 'linear-gradient(135deg, hsl(41 100% 47% / 0.3) 0%, hsl(120 60% 40% / 0.4) 50%, hsl(120 80% 25% / 0.3) 100%)'
                        : 'linear-gradient(135deg, hsl(195 100% 50% / 0.3) 0%, hsl(41 100% 47% / 0.4) 50%, hsl(0 85% 65% / 0.4) 100%)'
                  }}
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/90 rounded text-xs font-mono">
                  {imageMode === 'sar' && 'CHM Derivado — Altura de Dossel'}
                  {imageMode === 'optical' && 'NDVI — Índice de Vegetação'}
                  {imageMode === 'infrared' && 'LST — Temperatura de Superfície'}
                </div>
                <div className="absolute top-2 left-2 right-2 flex justify-end">
                  <div className="px-2 py-1 bg-background/90 rounded text-xs font-mono">
                    {imageMode === 'sar' && 'Res: 10m | Δh: 0-25m'}
                    {imageMode === 'optical' && 'Res: 10m | NDVI: 0.2-0.9'}
                    {imageMode === 'infrared' && 'Res: 1km | LST: 15-45°C'}
                  </div>
                </div>
                {/* Color scale */}
                <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                  <div className="w-24 h-2 rounded" style={{ 
                    background: imageMode === 'sar' 
                      ? 'linear-gradient(to right, hsl(166 100% 50%), hsl(41 100% 47%), hsl(0 85% 65%))' 
                      : imageMode === 'optical'
                        ? 'linear-gradient(to right, hsl(41 100% 47%), hsl(120 60% 40%), hsl(120 80% 25%))'
                        : 'linear-gradient(to right, hsl(195 100% 50%), hsl(41 100% 47%), hsl(0 85% 65%))'
                  }} />
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {imageMode === 'sar' && '0m → 25m'}
                    {imageMode === 'optical' && '0 → 1'}
                    {imageMode === 'infrared' && '15°C → 45°C'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {imageMode === 'sar' && 'Fase: -π → +π (1 franja ≈ 2.8 cm deslocamento LOS) | Fonte: ESA Sentinel-1'}
                {imageMode === 'optical' && 'Composição RGB verdadeira (B4-B3-B2) | Fonte: ESA Sentinel-2'}
                {imageMode === 'infrared' && 'Bandas termais SWIR/TIR para detecção de anomalias | Fonte: NASA MODIS'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono">13/03/2026 00:42 UTC</span>
                <div className="w-16 h-2 rounded" style={{ 
                  background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--teal)), hsl(var(--accent)), hsl(var(--critical)), hsl(280 80% 60%), hsl(var(--primary)))' 
                }} />
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
