import { Button } from '@/components/ui/button';
import { TtcBadge } from './TtcBadge';
import { RichardsChart } from './RichardsChart';
import { RICHARDS_KM234, type Alerta } from '@/lib/mockData';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SegmentDetailPanelProps {
  alerta: Alerta | null;
  onOpenOS: () => void;
}

export function SegmentDetailPanel({ alerta, onOpenOS }: SegmentDetailPanelProps) {
  if (!alerta) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          Selecione um segmento no mapa ou na tabela de alertas para ver detalhes
        </p>
      </div>
    );
  }

  const margem = alerta.dms - alerta.chm;
  const percentUsed = (alerta.chm / alerta.dms) * 100;

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border pb-3 mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground">
          SEGMENTO KM {alerta.km_ini}–{alerta.km_fim}
        </h3>
      </div>

      {/* TTC Section */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          TTC CALCULADO
        </p>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-mono font-bold text-critical">
            {alerta.ttc}
          </span>
          <span className="text-lg text-muted-foreground">dias</span>
        </div>
        <Progress 
          value={100 - (alerta.ttc / 90) * 100} 
          className="mt-2 h-2"
        />
      </div>

      {/* CHM vs DMS */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">CHM ATUAL</p>
          <p className="text-xl font-mono font-semibold">{alerta.chm} m</p>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">DMS (500 kV)</p>
          <p className="text-xl font-mono font-semibold">{alerta.dms} m</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 p-2 bg-accent/10 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-accent" />
        <p className="text-sm">
          Margem restante: <span className="font-mono font-semibold">{margem.toFixed(1)} m</span>
        </p>
      </div>

      {/* Species Info */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          ESPÉCIE DOMINANTE
        </p>
        <p className="font-semibold text-foreground">{alerta.especie}</p>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Taxa de crescimento: <span className="font-mono">0.18 m/mês</span></p>
          <p>Parâmetro K (Richards): <span className="font-mono">25 m</span></p>
        </div>
      </div>

      {/* Richards Chart */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          MODELO RICHARDS — PROJEÇÃO
        </p>
        <RichardsChart
          historico={RICHARDS_KM234.historico}
          projecao={RICHARDS_KM234.projecao}
          dms={RICHARDS_KM234.dms}
          height={150}
        />
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>Hoje: <span className="font-mono text-teal">{alerta.chm} m</span></p>
          <p>+30d: <span className="font-mono text-critical">14.8 m</span> ← CONTATO PROJETADO</p>
        </div>
      </div>

      {/* Last Acquisition */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          ÚLTIMA AQUISIÇÃO
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">Sentinel-2:</span>
            <span className="font-mono">14/03/2026</span>
            <span className="text-success text-xs">✓ Sem nuvens</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">Sentinel-1:</span>
            <span className="font-mono">13/03/2026</span>
            <span className="text-success text-xs">✓ Par InSAR OK</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">CHM atualizado:</span>
            <span className="font-mono">12/03/2026</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={onOpenOS}
        >
          ABRIR ORDEM DE SERVIÇO
        </Button>
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          EXPORTAR RELATÓRIO PDF
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground">
          <CheckCircle className="mr-2 h-4 w-4" />
          MARCAR COMO INSPECIONADO
        </Button>
      </div>
    </div>
  );
}
