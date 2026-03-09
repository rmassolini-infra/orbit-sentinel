import { Bell, ChevronDown, Satellite } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { STATS, ALERTAS } from '@/lib/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TtcBadge } from './TtcBadge';

const routeTitles: Record<string, string> = {
  '/': 'Mapa TTC',
  '/alertas': 'Painel de Alertas',
  '/vegetacao': 'Análise de Vegetação',
  '/series-temporais': 'Séries Temporais CHM',
  '/sr-gan': 'Módulo SR-GAN',
  '/insar': 'Pipeline InSAR',
  '/ordens-servico': 'Ordens de Serviço',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
};

export function AppHeader() {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Dashboard';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Satellite className="h-4 w-4 text-primary" />
        <span className="font-display font-semibold text-foreground">Grafter Orbit</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{currentTitle}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Alerts dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="relative">
              <span className="font-mono">{STATS.criticos}</span>
              <span className="ml-1">alertas críticos</span>
              <span className="absolute -right-2 -top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-critical" />
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-card border-border"
          >
            <div className="p-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Alertas Críticos (TTC &lt; 30d)
              </p>
              {ALERTAS.slice(0, 5).map((alerta) => (
                <DropdownMenuItem
                  key={alerta.id}
                  className="flex items-center justify-between py-2 cursor-pointer hover:bg-surface-hover"
                >
                  <div>
                    <p className="font-mono text-sm">
                      KM {alerta.km_ini}–{alerta.km_fim}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {alerta.especie}
                    </p>
                  </div>
                  <TtcBadge value={alerta.ttc} size="sm" showLabel={false} />
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              RM
            </div>
            <span className="hidden md:inline">Ricardo Massolini</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem className="hover:bg-surface-hover cursor-pointer">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-surface-hover cursor-pointer">
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-surface-hover cursor-pointer text-critical">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
