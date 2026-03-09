import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { STATS, ALERTAS } from '@/lib/mockData';
import { TtcBadge } from '@/components/TtcBadge';
import { MetricCard } from '@/components/MetricCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TreeDeciduous, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Species distribution data
const speciesDistribution = [
  { name: 'Eucalyptus grandis', count: 187, percentage: 22.1, avgGrowth: 0.18, color: '#00BFFF' },
  { name: 'Cerrado sensu stricto', count: 234, percentage: 27.6, avgGrowth: 0.08, color: '#00FFD1' },
  { name: 'Mata de Galeria', count: 156, percentage: 18.4, avgGrowth: 0.12, color: '#F0A500' },
  { name: 'Bambu (Bambusa sp.)', count: 89, percentage: 10.5, avgGrowth: 0.25, color: '#FF4C4C' },
  { name: 'Pinus elliottii', count: 67, percentage: 7.9, avgGrowth: 0.15, color: '#8B949E' },
  { name: 'Floresta Estacional', count: 114, percentage: 13.5, avgGrowth: 0.10, color: '#39D353' },
];

// NDVI trend data (monthly)
const ndviTrend = [
  { mes: 'Set/25', ndvi: 0.62, ndviMin: 0.58, ndviMax: 0.66 },
  { mes: 'Out/25', ndvi: 0.65, ndviMin: 0.61, ndviMax: 0.69 },
  { mes: 'Nov/25', ndvi: 0.71, ndviMin: 0.67, ndviMax: 0.75 },
  { mes: 'Dez/25', ndvi: 0.74, ndviMin: 0.70, ndviMax: 0.78 },
  { mes: 'Jan/26', ndvi: 0.76, ndviMin: 0.72, ndviMax: 0.80 },
  { mes: 'Fev/26', ndvi: 0.73, ndviMin: 0.69, ndviMax: 0.77 },
  { mes: 'Mar/26', ndvi: 0.68, ndviMin: 0.64, ndviMax: 0.72 },
];

// Growth rate by species
const growthRateData = [
  { species: 'Bambu', rate: 0.25 },
  { species: 'Eucalyptus', rate: 0.18 },
  { species: 'Pinus', rate: 0.15 },
  { species: 'Mata Galeria', rate: 0.12 },
  { species: 'Fl. Estacional', rate: 0.10 },
  { species: 'Cerrado', rate: 0.08 },
];

// Vegetation density by km range
const densityByRange = [
  { range: '0-100', alta: 12, media: 45, baixa: 43 },
  { range: '100-200', alta: 8, media: 52, baixa: 40 },
  { range: '200-300', alta: 25, media: 38, baixa: 37 },
  { range: '300-400', alta: 15, media: 42, baixa: 43 },
  { range: '400-500', alta: 18, media: 48, baixa: 34 },
  { range: '500-600', alta: 22, media: 35, baixa: 43 },
  { range: '600-700', alta: 10, media: 55, baixa: 35 },
  { range: '700-847', alta: 14, media: 41, baixa: 45 },
];

// Critical vegetation segments
const criticalVegetation = [
  { km: '234-237', species: 'Eucalyptus grandis', ndvi: 0.82, growthRate: 0.18, chm: 9.3, risk: 'CRITICO' as const },
  { km: '412-415', species: 'Bambu (Bambusa sp.)', ndvi: 0.78, growthRate: 0.25, chm: 11.2, risk: 'CRITICO' as const },
  { km: '089-091', species: 'Cerrado s.s.', ndvi: 0.65, growthRate: 0.08, chm: 8.7, risk: 'CRITICO' as const },
  { km: '567-569', species: 'Mata de Galeria', ndvi: 0.74, growthRate: 0.12, chm: 12.1, risk: 'CRITICO' as const },
  { km: '701-704', species: 'Eucalyptus grandis', ndvi: 0.79, growthRate: 0.18, chm: 9.8, risk: 'CRITICO' as const },
];

export default function VegetacaoPage() {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('todas');
  const [selectedMetric, setSelectedMetric] = useState<'ndvi' | 'chm' | 'growth'>('ndvi');

  const filteredSpecies = selectedSpecies === 'todas'
    ? speciesDistribution
    : speciesDistribution.filter(s => s.name === selectedSpecies);

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Análise de Vegetação</h1>
        <div className="flex gap-4">
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger className="w-[200px] bg-muted border-border">
              <SelectValue placeholder="Filtrar por espécie" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="todas">Todas as espécies</SelectItem>
              {speciesDistribution.map(s => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Espécies Identificadas"
          value="6"
          subtext="Classificação por SR-GAN + ML"
          status="ok"
        />
        <MetricCard
          label="NDVI Médio Corredor"
          value="0.68"
          trend="down"
          subtext="↓ 3% vs. mês anterior (estação seca)"
          status="ok"
        />
        <MetricCard
          label="Taxa Crescimento Média"
          value="0.14"
          unit="m/mês"
          subtext="Ponderada por área de cobertura"
          status="warning"
        />
        <MetricCard
          label="Segmentos Alta Densidade"
          value="124"
          subtext="14.6% do corredor total"
          status="warning"
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Species Distribution - Pie Chart */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border border-border bg-card p-4 h-full">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              DISTRIBUIÇÃO DE ESPÉCIES
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speciesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {speciesDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(215 25% 11%)',
                      border: '1px solid hsl(215 14% 25%)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [`${value} seg.`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {speciesDistribution.map(species => (
                <div key={species.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: species.color }}
                    />
                    <span className="text-muted-foreground truncate max-w-[120px]">
                      {species.name}
                    </span>
                  </div>
                  <span className="font-mono">{species.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NDVI Trend Chart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                TENDÊNCIA NDVI — CORREDOR COMPLETO
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-teal rounded" />
                  <span className="text-muted-foreground">NDVI médio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted/30 rounded" />
                  <span className="text-muted-foreground">Intervalo min-max</span>
                </div>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ndviTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 14% 25%)" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    stroke="hsl(215 14% 25%)"
                  />
                  <YAxis
                    domain={[0.5, 0.9]}
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    stroke="hsl(215 14% 25%)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(215 25% 11%)',
                      border: '1px solid hsl(215 14% 25%)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ndviMax"
                    stackId="1"
                    stroke="none"
                    fill="hsl(166 100% 50%)"
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="ndviMin"
                    stackId="2"
                    stroke="none"
                    fill="hsl(215 28% 7%)"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="ndvi"
                    stroke="hsl(166 100% 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(166 100% 50%)', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Growth Rate by Species */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              TAXA DE CRESCIMENTO POR ESPÉCIE
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthRateData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 14% 25%)" />
                  <XAxis
                    type="number"
                    domain={[0, 0.3]}
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `${v} m/mês`}
                    stroke="hsl(215 14% 25%)"
                  />
                  <YAxis
                    type="category"
                    dataKey="species"
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    stroke="hsl(215 14% 25%)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(215 25% 11%)',
                      border: '1px solid hsl(215 14% 25%)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} m/mês`, 'Taxa']}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                    {growthRateData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate > 0.15 ? 'hsl(0 85% 65%)' : entry.rate > 0.10 ? 'hsl(41 100% 47%)' : 'hsl(166 100% 50%)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <AlertTriangle className="inline h-3 w-3 mr-1 text-critical" />
              Bambu e Eucalyptus apresentam maior risco devido à alta taxa de crescimento
            </p>
          </div>
        </div>

        {/* Vegetation Density by Range */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              DENSIDADE VEGETACIONAL POR TRECHO (km)
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={densityByRange} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 14% 25%)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    stroke="hsl(215 14% 25%)"
                  />
                  <YAxis
                    tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v) => `${v}%`}
                    stroke="hsl(215 14% 25%)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(215 25% 11%)',
                      border: '1px solid hsl(215 14% 25%)',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Bar dataKey="alta" stackId="a" fill="hsl(0 85% 65%)" name="Alta" />
                  <Bar dataKey="media" stackId="a" fill="hsl(41 100% 47%)" name="Média" />
                  <Bar dataKey="baixa" stackId="a" fill="hsl(166 100% 50%)" name="Baixa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Critical Vegetation Table */}
        <div className="col-span-12">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              SEGMENTOS COM VEGETAÇÃO CRÍTICA — PRIORIDADE DE INTERVENÇÃO
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">SEGMENTO</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">ESPÉCIE</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">NDVI</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">TAXA CRESC.</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">CHM (m)</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">RISCO</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">VIGOR</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalVegetation.map((veg, index) => (
                    <tr
                      key={index}
                      className="border-b border-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm">KM {veg.km}</td>
                      <td className="px-4 py-3 text-sm">{veg.species}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 h-2 rounded bg-muted overflow-hidden"
                          >
                            <div
                              className="h-full rounded"
                              style={{
                                width: `${veg.ndvi * 100}%`,
                                backgroundColor: veg.ndvi > 0.75 ? 'hsl(127 73% 52%)' : veg.ndvi > 0.6 ? 'hsl(41 100% 47%)' : 'hsl(0 85% 65%)',
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm">{veg.ndvi}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        <span className={cn(
                          veg.growthRate > 0.15 && 'text-critical',
                          veg.growthRate > 0.10 && veg.growthRate <= 0.15 && 'text-accent',
                          veg.growthRate <= 0.10 && 'text-teal'
                        )}>
                          {veg.growthRate} m/mês
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{veg.chm}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-mono rounded bg-critical/20 text-critical">
                          {veg.risk}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Leaf className={cn(
                            'h-4 w-4',
                            veg.ndvi > 0.75 ? 'text-success' : veg.ndvi > 0.6 ? 'text-accent' : 'text-critical'
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {veg.ndvi > 0.75 ? 'Alto' : veg.ndvi > 0.6 ? 'Médio' : 'Baixo'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Species Detail Cards */}
        <div className="col-span-12">
          <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            PERFIL DAS ESPÉCIES MONITORADAS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {speciesDistribution.map(species => (
              <div
                key={species.name}
                className="rounded-lg border border-border bg-card p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: species.color }}
                    />
                    <h4 className="font-semibold text-sm">{species.name}</h4>
                  </div>
                  <TreeDeciduous className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Segmentos</p>
                    <p className="font-mono font-semibold">{species.count}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Cobertura</p>
                    <p className="font-mono font-semibold">{species.percentage}%</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Crescimento</p>
                    <p className={cn(
                      'font-mono font-semibold',
                      species.avgGrowth > 0.15 ? 'text-critical' : species.avgGrowth > 0.10 ? 'text-accent' : 'text-teal'
                    )}>
                      {species.avgGrowth} m/m
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
