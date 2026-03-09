import { useState } from 'react';
import { RICHARDS_KM234, ALERTAS } from '@/lib/mockData';
import { RichardsChart } from '@/components/RichardsChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SeriesTemporaisPage() {
  const [selectedSegment, setSelectedSegment] = useState('KM 234-237');

  return (
    <div className="h-full p-4">
      <h1 className="font-display text-xl font-semibold mb-4">Séries Temporais CHM</h1>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-3rem)]">
        {/* Left Column - Segment Selector & Parameters */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Segment Selector */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              SELECIONAR SEGMENTO
            </h3>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {ALERTAS.map((a) => (
                  <SelectItem key={a.id} value={`KM ${a.km_ini}-${a.km_fim}`}>
                    KM {a.km_ini}–{a.km_fim}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Richards Parameters */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              PARÂMETROS DO MODELO — {selectedSegment}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">K (altura assintótica)</span>
                <span className="font-mono">{RICHARDS_KM234.K} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">h₀ (altura inicial)</span>
                <span className="font-mono">{RICHARDS_KM234.h0} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">r (taxa de crescimento)</span>
                <span className="font-mono">{RICHARDS_KM234.r} m/mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">m (parâmetro de forma)</span>
                <span className="font-mono">{RICHARDS_KM234.m}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">R² do ajuste</span>
                  <span className="font-mono text-success">{RICHARDS_KM234.r_squared}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nº observações</span>
                  <span className="font-mono">{RICHARDS_KM234.n_obs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período de ajuste</span>
                  <span className="font-mono">Mar/24–Mar/26</span>
                </div>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IC 95% TTC</span>
                  <span className="font-mono text-accent">[6, 11] dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              LEGENDA
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-teal rounded" />
                <span className="text-muted-foreground">CHM histórico (InSAR)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent rounded border-dashed border border-accent" />
                <span className="text-muted-foreground">Projeção Richards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-critical rounded border-dashed border border-critical" />
                <span className="text-muted-foreground">Limiar DMS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-muted/50 rounded" />
                <span className="text-muted-foreground">IC 95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chart */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border border-border bg-card p-4 h-full">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              EVOLUÇÃO CHM — {selectedSegment}
            </h3>
            <div className="h-[calc(100%-2rem)]">
              <RichardsChart
                historico={RICHARDS_KM234.historico}
                projecao={RICHARDS_KM234.projecao}
                dms={RICHARDS_KM234.dms}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
