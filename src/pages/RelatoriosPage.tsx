import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { MetricCard } from '@/components/MetricCard';
import { STATS, ALERTAS } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  FileText, Download, Calendar, Filter, Printer,
  TrendingDown, Shield, Clock, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Monthly report data
const monthlyData = [
  { mes: 'Out/25', criticos: 31, altos: 52, medios: 95, baixos: 669, os_concluidas: 18 },
  { mes: 'Nov/25', criticos: 28, altos: 48, medios: 91, baixos: 680, os_concluidas: 22 },
  { mes: 'Dez/25', criticos: 25, altos: 45, medios: 88, baixos: 689, os_concluidas: 15 },
  { mes: 'Jan/26', criticos: 27, altos: 43, medios: 86, baixos: 691, os_concluidas: 20 },
  { mes: 'Fev/26', criticos: 24, altos: 42, medios: 90, baixos: 691, os_concluidas: 25 },
  { mes: 'Mar/26', criticos: STATS.criticos, altos: STATS.altos, medios: STATS.medios, baixos: STATS.baixos, os_concluidas: 12 },
];

// OS performance
const osPerformance = [
  { mes: 'Out/25', abertas: 31, concluidas: 18, sla: 78 },
  { mes: 'Nov/25', abertas: 28, concluidas: 22, sla: 82 },
  { mes: 'Dez/25', abertas: 25, concluidas: 15, sla: 75 },
  { mes: 'Jan/26', abertas: 27, concluidas: 20, sla: 80 },
  { mes: 'Fev/26', abertas: 24, concluidas: 25, sla: 88 },
  { mes: 'Mar/26', abertas: 23, concluidas: 12, sla: 85 },
];

// Risk distribution for pie
const riskDistribution = [
  { name: 'Crítico', value: STATS.criticos, color: 'hsl(0 85% 65%)' },
  { name: 'Alto', value: STATS.altos, color: 'hsl(41 100% 47%)' },
  { name: 'Médio', value: STATS.medios, color: 'hsl(195 100% 50%)' },
  { name: 'Baixo', value: STATS.baixos, color: 'hsl(166 100% 50%)' },
];

// Species risk table
const speciesRisk = [
  { especie: 'Eucalyptus grandis', segmentos: 145, criticos: 8, taxa_crescimento: 0.18, ttc_medio: 42 },
  { especie: 'Bambu (Bambusa sp.)', segmentos: 67, criticos: 6, taxa_crescimento: 0.32, ttc_medio: 28 },
  { especie: 'Cerrado sensu stricto', segmentos: 312, criticos: 4, taxa_crescimento: 0.05, ttc_medio: 180 },
  { especie: 'Mata de Galeria', segmentos: 198, criticos: 3, taxa_crescimento: 0.09, ttc_medio: 95 },
  { especie: 'Pinus elliottii', segmentos: 45, criticos: 2, taxa_crescimento: 0.15, ttc_medio: 55 },
  { especie: 'Floresta Estacional', segmentos: 80, criticos: 0, taxa_crescimento: 0.04, ttc_medio: 220 },
];

// Recent generated reports
const recentReports = [
  { id: 'RPT-2026-012', title: 'Relatório Mensal — Fevereiro 2026', date: '01/03/2026', type: 'mensal', pages: 24 },
  { id: 'RPT-2026-011', title: 'Análise de Risco — Corredor Norte', date: '25/02/2026', type: 'risco', pages: 18 },
  { id: 'RPT-2026-010', title: 'Validação InSAR vs LiDAR Q1', date: '15/02/2026', type: 'tecnico', pages: 32 },
  { id: 'RPT-2026-009', title: 'Performance OS — Janeiro 2026', date: '01/02/2026', type: 'operacional', pages: 12 },
  { id: 'RPT-2026-008', title: 'Relatório Mensal — Janeiro 2026', date: '01/02/2026', type: 'mensal', pages: 22 },
];

const tooltipStyle = {
  backgroundColor: 'hsl(215 25% 11%)',
  border: '1px solid hsl(215 14% 25%)',
  borderRadius: '8px',
  fontFamily: 'JetBrains Mono',
  fontSize: '12px',
};
const axisTickStyle = { fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' };
const gridStroke = 'hsl(215 14% 25%)';

const reportTypeColors: Record<string, string> = {
  mensal: 'bg-primary/20 text-primary',
  risco: 'bg-critical/20 text-critical',
  tecnico: 'bg-teal/20 text-teal',
  operacional: 'bg-accent/20 text-accent',
};

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('6m');
  const [tipoRelatorio, setTipoRelatorio] = useState('mensal');

  const totalOS = osPerformance.reduce((a, b) => a + b.concluidas, 0);
  const slaMedia = Math.round(osPerformance.reduce((a, b) => a + b.sla, 0) / osPerformance.length);
  const tendenciaCriticos = monthlyData[monthlyData.length - 1].criticos - monthlyData[0].criticos;

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-32 bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
          <Button size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Tendência Críticos"
          value={`${tendenciaCriticos > 0 ? '+' : ''}${tendenciaCriticos}`}
          status={tendenciaCriticos < 0 ? 'ok' : 'critical'}
          subtext="vs 6 meses atrás"
        />
        <MetricCard label="OS Concluídas" value={totalOS} status="ok" subtext="Últimos 6 meses" />
        <MetricCard label="SLA Médio" value={`${slaMedia}%`} status={slaMedia >= 80 ? 'ok' : 'warning'} subtext="Meta: 80%" />
        <MetricCard label="Cobertura Nuvens" value={`${STATS.cobertura_nuvens_pct}%`} status="ok" subtext="Média do período" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Risk Evolution */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              EVOLUÇÃO DE SEGMENTOS POR RISCO
            </h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="mes" tick={axisTickStyle} stroke={gridStroke} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="criticos" name="Crítico" stackId="a" fill="hsl(0 85% 65%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="altos" name="Alto" stackId="a" fill="hsl(41 100% 47%)" />
                  <Bar dataKey="medios" name="Médio" stackId="a" fill="hsl(195 100% 50%)" />
                  <Bar dataKey="baixos" name="Baixo" stackId="a" fill="hsl(166 100% 50%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Pie */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              DISTRIBUIÇÃO ATUAL DE RISCO
            </h3>
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={2}
                  >
                    {riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-muted-foreground">{r.name}: <span className="font-mono text-foreground">{r.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OS Performance */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              PERFORMANCE DE ORDENS DE SERVIÇO
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={osPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="mes" tick={axisTickStyle} stroke={gridStroke} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="abertas" name="Abertas" stroke="hsl(0 85% 65%)" fill="hsl(0 85% 65%)" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="concluidas" name="Concluídas" stroke="hsl(166 100% 50%)" fill="hsl(166 100% 50%)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              COMPLIANCE SLA (%)
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={osPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="mes" tick={axisTickStyle} stroke={gridStroke} />
                  <YAxis tick={axisTickStyle} stroke={gridStroke} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'SLA']} />
                  <Line type="monotone" dataKey="sla" stroke="hsl(195 100% 50%)" strokeWidth={2} dot={{ fill: 'hsl(195 100% 50%)', r: 3 }} />
                  {/* Meta line at 80% */}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-primary">—</span> SLA atual &nbsp;|&nbsp; Meta: 80%
            </p>
          </div>
        </div>

        {/* Species Risk Table */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              ANÁLISE DE RISCO POR ESPÉCIE
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Espécie', 'Segmentos', 'Críticos', 'Taxa Cresc.', 'TTC Médio'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {speciesRisk.map((sp) => (
                    <tr key={sp.especie} className="border-b border-border hover:bg-surface-hover transition-colors">
                      <td className="px-3 py-2.5 text-sm">{sp.especie}</td>
                      <td className="px-3 py-2.5 font-mono text-sm">{sp.segmentos}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn('font-mono text-sm', sp.criticos > 5 ? 'text-critical' : sp.criticos > 0 ? 'text-accent' : 'text-success')}>
                          {sp.criticos}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sm">{sp.taxa_crescimento} m/mês</td>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          'font-mono text-sm',
                          sp.ttc_medio < 30 ? 'text-critical' : sp.ttc_medio < 60 ? 'text-accent' : 'text-muted-foreground'
                        )}>
                          {sp.ttc_medio}d
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              RELATÓRIOS RECENTES
            </h3>
            <div className="space-y-3">
              {recentReports.map((rpt) => (
                <div key={rpt.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted hover:bg-surface-hover transition-colors cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rpt.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase', reportTypeColors[rpt.type])}>
                        {rpt.type}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{rpt.date}</span>
                      <span className="text-xs text-muted-foreground">{rpt.pages}p</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Generate New Report */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Gerar novo relatório</p>
              <div className="flex gap-2">
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger className="flex-1 bg-muted border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="risco">Análise de Risco</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Gerar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
