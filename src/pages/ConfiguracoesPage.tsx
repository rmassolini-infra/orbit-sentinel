import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Settings, Bell, Shield, Database, Satellite, Palette,
  Globe, Users, Save, RotateCcw, CheckCircle2,
} from 'lucide-react';

type Tab = 'geral' | 'limiares' | 'notificacoes' | 'sensores' | 'equipes' | 'sistema';

const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'limiares', label: 'Limiares & Alertas', icon: Shield },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'sensores', label: 'Sensores', icon: Satellite },
  { id: 'equipes', label: 'Equipes', icon: Users },
  { id: 'sistema', label: 'Sistema', icon: Database },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const [saved, setSaved] = useState(false);

  // Geral
  const [nomeCorrerdor, setNomeCorrerdor] = useState('LT Uberlândia – Montes Claros');
  const [extensao, setExtensao] = useState('847');
  const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
  const [idioma, setIdioma] = useState('pt-BR');

  // Limiares
  const [dms, setDms] = useState([15]);
  const [ttcCritico, setTtcCritico] = useState([30]);
  const [ttcAlto, setTtcAlto] = useState([45]);
  const [ttcMedio, setTtcMedio] = useState([90]);
  const [coerenciaMinima, setCoerenciaMinima] = useState([0.4]);
  const [maeMaximo, setMaeMaximo] = useState([3.0]);

  // Notificações
  const [emailAtivo, setEmailAtivo] = useState(true);
  const [smsAtivo, setSmsAtivo] = useState(false);
  const [whatsappAtivo, setWhatsappAtivo] = useState(true);
  const [notifCritico, setNotifCritico] = useState(true);
  const [notifAlto, setNotifAlto] = useState(true);
  const [notifMedio, setNotifMedio] = useState(false);
  const [emailDestino, setEmailDestino] = useState('operacoes@grafter.com.br');

  // Sensores
  const [sentinel2Ativo, setSentinel2Ativo] = useState(true);
  const [sentinel1Ativo, setSentinel1Ativo] = useState(true);
  const [modisAtivo, setModisAtivo] = useState(true);
  const [srganAtivo, setSrganAtivo] = useState(true);
  const [insarAtivo, setInsarAtivo] = useState(true);
  const [intervaloProcessamento, setIntervaloProcessamento] = useState('12h');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Configurações</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar Padrões
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Salvo!' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar tabs */}
        <div className="col-span-12 lg:col-span-3">
          <div className="rounded-lg border border-border bg-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                )}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">

            {/* GERAL */}
            {activeTab === 'geral' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Informações do Corredor</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Nome do Corredor</Label>
                      <Input value={nomeCorrerdor} onChange={(e) => setNomeCorrerdor(e.target.value)} className="bg-muted border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Extensão (km)</Label>
                      <Input value={extensao} onChange={(e) => setExtensao(e.target.value)} className="bg-muted border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Fuso Horário</Label>
                      <Select value={fusoHorario} onValueChange={setFusoHorario}>
                        <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</SelectItem>
                          <SelectItem value="America/Manaus">America/Manaus (UTC-4)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Idioma</Label>
                      <Select value={idioma} onValueChange={setIdioma}>
                        <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="pt-BR">Português (BR)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Projeção Cartográfica</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Sistema de Referência</Label>
                      <Input value="SIRGAS 2000" disabled className="bg-muted border-border opacity-70" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Zona UTM</Label>
                      <Input value="23S" disabled className="bg-muted border-border opacity-70" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* LIMIARES */}
            {activeTab === 'limiares' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Limiares de Segurança</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">DMS — Distância Mínima de Segurança (m)</Label>
                        <span className="font-mono text-sm text-primary">{dms[0]}m</span>
                      </div>
                      <Slider value={dms} onValueChange={setDms} min={5} max={30} step={0.5} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">TTC Crítico — limiar (dias)</Label>
                        <span className="font-mono text-sm text-critical">&lt; {ttcCritico[0]}d</span>
                      </div>
                      <Slider value={ttcCritico} onValueChange={setTtcCritico} min={7} max={60} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">TTC Alto — limiar (dias)</Label>
                        <span className="font-mono text-sm text-accent">&lt; {ttcAlto[0]}d</span>
                      </div>
                      <Slider value={ttcAlto} onValueChange={setTtcAlto} min={30} max={90} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">TTC Médio — limiar (dias)</Label>
                        <span className="font-mono text-sm text-primary">&lt; {ttcMedio[0]}d</span>
                      </div>
                      <Slider value={ttcMedio} onValueChange={setTtcMedio} min={45} max={180} step={5} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Qualidade de Dados</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">Coerência Mínima InSAR (γ)</Label>
                        <span className="font-mono text-sm">{coerenciaMinima[0]}</span>
                      </div>
                      <Slider value={coerenciaMinima} onValueChange={setCoerenciaMinima} min={0.1} max={0.8} step={0.05} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">MAE Máximo Aceitável CHM (m)</Label>
                        <span className="font-mono text-sm">{maeMaximo[0]}m</span>
                      </div>
                      <Slider value={maeMaximo} onValueChange={setMaeMaximo} min={0.5} max={5} step={0.1} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* NOTIFICAÇÕES */}
            {activeTab === 'notificacoes' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Canais de Notificação</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="text-sm font-medium">E-mail</p>
                        <p className="text-xs text-muted-foreground">Alertas enviados por e-mail</p>
                      </div>
                      <Switch checked={emailAtivo} onCheckedChange={setEmailAtivo} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="text-sm font-medium">SMS</p>
                        <p className="text-xs text-muted-foreground">Alertas críticos por SMS</p>
                      </div>
                      <Switch checked={smsAtivo} onCheckedChange={setSmsAtivo} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div>
                        <p className="text-sm font-medium">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Grupo operacional WhatsApp</p>
                      </div>
                      <Switch checked={whatsappAtivo} onCheckedChange={setWhatsappAtivo} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Níveis de Alerta</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-critical" />
                        <span className="text-sm">Crítico (TTC &lt; {ttcCritico[0]}d)</span>
                      </div>
                      <Switch checked={notifCritico} onCheckedChange={setNotifCritico} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-sm">Alto (TTC &lt; {ttcAlto[0]}d)</span>
                      </div>
                      <Switch checked={notifAlto} onCheckedChange={setNotifAlto} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">Médio (TTC &lt; {ttcMedio[0]}d)</span>
                      </div>
                      <Switch checked={notifMedio} onCheckedChange={setNotifMedio} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">E-mail de destino</Label>
                  <Input value={emailDestino} onChange={(e) => setEmailDestino(e.target.value)} className="bg-muted border-border" />
                </div>
              </>
            )}

            {/* SENSORES */}
            {activeTab === 'sensores' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Fontes de Dados Ativas</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Sentinel-2 MSI', sub: 'Óptico multiespectral — 10m', active: sentinel2Ativo, toggle: setSentinel2Ativo },
                      { label: 'Sentinel-1 SAR', sub: 'Radar banda C — InSAR', active: sentinel1Ativo, toggle: setSentinel1Ativo },
                      { label: 'MODIS Terra/Aqua', sub: 'Termal e infravermelho — 1km', active: modisAtivo, toggle: setModisAtivo },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.sub}</p>
                        </div>
                        <Switch checked={s.active} onCheckedChange={s.toggle} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Pipelines de IA</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'SR-GAN Super-Resolução', sub: 'Upscale ×5 de imagens Sentinel-2', active: srganAtivo, toggle: setSrganAtivo },
                      { label: 'Pipeline InSAR → CHM', sub: 'Interferometria para Canopy Height Model', active: insarAtivo, toggle: setInsarAtivo },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="text-sm font-medium">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.sub}</p>
                        </div>
                        <Switch checked={p.active} onCheckedChange={p.toggle} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Intervalo de Processamento</Label>
                  <Select value={intervaloProcessamento} onValueChange={setIntervaloProcessamento}>
                    <SelectTrigger className="bg-muted border-border w-48"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="6h">A cada 6 horas</SelectItem>
                      <SelectItem value="12h">A cada 12 horas</SelectItem>
                      <SelectItem value="24h">A cada 24 horas</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* EQUIPES */}
            {activeTab === 'equipes' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Equipes de Campo</h3>
                  <div className="space-y-3">
                    {[
                      { nome: 'Equipe A1', regiao: 'KM 0–200', membros: 4, lider: 'Carlos Silva', status: 'ativa' },
                      { nome: 'Equipe A2', regiao: 'KM 200–400', membros: 3, lider: 'Ana Oliveira', status: 'ativa' },
                      { nome: 'Equipe A3', regiao: 'KM 400–600', membros: 4, lider: 'Roberto Santos', status: 'campo' },
                      { nome: 'Equipe B1', regiao: 'KM 600–847', membros: 3, lider: 'Maria Souza', status: 'ativa' },
                    ].map((eq) => (
                      <div key={eq.nome} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{eq.nome}</p>
                            <p className="text-xs text-muted-foreground">{eq.regiao} • {eq.membros} membros • Líder: {eq.lider}</p>
                          </div>
                        </div>
                        <span className={cn(
                          'text-xs px-2 py-1 rounded font-mono',
                          eq.status === 'campo' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                        )}>
                          {eq.status === 'campo' ? 'Em campo' : 'Ativa'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SISTEMA */}
            {activeTab === 'sistema' && (
              <>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Informações do Sistema</h3>
                  <div className="space-y-3">
                    {[
                      ['Versão', 'Grafter Orbit v2.4.1'],
                      ['Build', '2026.03.09-a7e7'],
                      ['Banco de Dados', 'PostgreSQL 15.4'],
                      ['Storage', '847 GB utilizados / 2 TB'],
                      ['Último backup', '2026-03-09 03:00 UTC'],
                      ['Uptime', '99.97% (últimos 30 dias)'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center p-3 rounded-lg bg-muted">
                        <span className="text-sm text-muted-foreground">{k}</span>
                        <span className="font-mono text-sm">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Integrações</h3>
                  <div className="space-y-3">
                    {[
                      { nome: 'ESA Copernicus Hub', status: 'conectado' },
                      { nome: 'NASA Earthdata', status: 'conectado' },
                      { nome: 'INPE CBERS', status: 'conectado' },
                      { nome: 'API LiDAR ICESat-2', status: 'conectado' },
                    ].map((int) => (
                      <div key={int.nome} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{int.nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-xs text-success capitalize">{int.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold mb-4">Manutenção</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Limpar Cache</Button>
                    <Button variant="outline" size="sm">Reprocessar Último Ciclo</Button>
                    <Button variant="outline" size="sm" className="text-critical border-critical/30 hover:bg-critical/10">Reset Factory</Button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
