import { useState } from 'react';
import { format } from 'date-fns';
import { STATS, ALERTAS, SR_METRICS, INSAR_METRICS, type Alerta } from '@/lib/mockData';
import { RiskDistributionChart } from '@/components/RiskDistributionChart';
import { SegmentRow } from '@/components/SegmentRow';
import { MetricCard } from '@/components/MetricCard';
import { TransmissionLineMap } from '@/components/TransmissionLineMap';
import { SegmentDetailPanel } from '@/components/SegmentDetailPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

export default function MapaTTC() {
  const [selectedSegment, setSelectedSegment] = useState<Alerta | null>(null);
  const [osDialogOpen, setOsDialogOpen] = useState(false);
  const [osForm, setOsForm] = useState({
    dataPrevista: '',
    equipe: '',
    observacoes: '',
  });

  const handleSelectSegment = (alerta: Alerta | null) => {
    setSelectedSegment(alerta);
  };

  const handleOpenOS = () => {
    setOsDialogOpen(true);
  };

  const handleConfirmOS = () => {
    // In a real app, this would create the OS in the backend
    console.log('Creating OS for segment:', selectedSegment, 'with form:', osForm);
    setOsDialogOpen(false);
    setOsForm({ dataPrevista: '', equipe: '', observacoes: '' });
  };

  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Column - Alerts and Metrics */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4 overflow-y-auto">
          {/* Operational Summary */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              RESUMO — LT 500 kV CORREDOR CERRADO MG
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extensão monitorada:</span>
                <span className="font-mono">{STATS.extensao_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última aquisição:</span>
                <div className="text-right">
                  <p className="font-mono text-xs">
                    Sentinel-2 {format(new Date(STATS.ultima_aquisicao_s2), 'dd/MM/yyyy HH:mm')} UTC
                  </p>
                  <p className="font-mono text-xs">
                    Sentinel-1 {format(new Date(STATS.ultima_aquisicao_s1), 'dd/MM/yyyy HH:mm')} UTC
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cobertura de nuvens:</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono">{STATS.cobertura_nuvens_pct}%</span>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success text-xs">Imagem válida</span>
                </span>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              DISTRIBUIÇÃO DE RISCO TTC
            </h3>
            <RiskDistributionChart />
          </div>

          {/* Top 5 Critical Alerts */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              TOP 5 ALERTAS CRÍTICOS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Segmento</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">TTC</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Espécie</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {ALERTAS.map((alerta, index) => (
                    <SegmentRow
                      key={alerta.id}
                      alerta={alerta}
                      index={index}
                      isSelected={selectedSegment?.id === alerta.id}
                      onSelect={handleSelectSegment}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline Metrics */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              MÉTRICAS DO PIPELINE
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SR-GAN</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono">SSIM {SR_METRICS.ssim}</span>
                  <span className="font-mono">ERGAS {SR_METRICS.ergas}</span>
                  <span className="text-success text-xs">↑ Acima benchmark</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">InSAR CHM</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono">MAE {INSAR_METRICS.mae} m</span>
                  <span className="font-mono">RMSE {INSAR_METRICS.rmse} m</span>
                  <span className="text-success text-xs">✓ Dentro do esperado</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">TTC Confiança</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono">87.3%</span>
                  <span className="font-mono text-muted-foreground">FP est. 9.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Map */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-6">
          <TransmissionLineMap
            selectedSegment={selectedSegment}
            onSelectSegment={handleSelectSegment}
          />
        </div>

        {/* Right Column - Segment Detail */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-3">
          <SegmentDetailPanel
            alerta={selectedSegment}
            onOpenOS={handleOpenOS}
          />
        </div>
      </div>

      {/* OS Dialog */}
      <Dialog open={osDialogOpen} onOpenChange={setOsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">
              Abrir Ordem de Serviço
            </DialogTitle>
            <DialogDescription>
              Segmento KM {selectedSegment?.km_ini}–{selectedSegment?.km_fim}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataPrevista">Data prevista</Label>
              <Input
                id="dataPrevista"
                type="date"
                value={osForm.dataPrevista}
                onChange={(e) => setOsForm({ ...osForm, dataPrevista: e.target.value })}
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label htmlFor="equipe">Equipe responsável</Label>
              <Input
                id="equipe"
                placeholder="Ex: Equipe A3"
                value={osForm.equipe}
                onChange={(e) => setOsForm({ ...osForm, equipe: e.target.value })}
                className="bg-muted border-border"
              />
            </div>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Observações adicionais..."
                value={osForm.observacoes}
                onChange={(e) => setOsForm({ ...osForm, observacoes: e.target.value })}
                className="bg-muted border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmOS} className="bg-primary hover:bg-primary/90">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
