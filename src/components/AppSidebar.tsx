import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Satellite,
  Map,
  AlertTriangle,
  TreeDeciduous,
  TrendingUp,
  Microscope,
  Globe,
  Wrench,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StatusDot } from './StatusDot';
import { cn } from '@/lib/utils';

const navItems = [
  {
    section: 'MONITORAMENTO',
    items: [
      { to: '/', icon: Map, label: 'Mapa TTC em Tempo Real' },
      { to: '/alertas', icon: AlertTriangle, label: 'Painel de Alertas' },
      { to: '/vegetacao', icon: TreeDeciduous, label: 'Análise de Vegetação' },
    ],
  },
  {
    section: 'ANÁLISE',
    items: [
      { to: '/series-temporais', icon: TrendingUp, label: 'Séries Temporais CHM' },
      { to: '/sr-gan', icon: Microscope, label: 'Módulo SR-GAN' },
      { to: '/insar', icon: Globe, label: 'Pipeline InSAR' },
    ],
  },
  {
    section: 'OPERAÇÕES',
    items: [
      { to: '/ordens-servico', icon: Wrench, label: 'Ordens de Serviço' },
      { to: '/relatorios', icon: FileText, label: 'Relatórios' },
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Satellite className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-display font-semibold text-foreground">
            Grafter Orbit
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.section}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* System Status */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            STATUS DO SISTEMA
          </p>
        )}
        <div className={cn('space-y-2', collapsed && 'space-y-3')}>
          {collapsed ? (
            <>
              <div className="flex justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              </div>
              <div className="flex justify-center">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              </div>
            </>
          ) : (
            <>
              <StatusDot status="online" label="Sentinel-2" />
              <StatusDot status="online" label="Sentinel-1" />
              <StatusDot status="online" label="Pipeline IA" />
              <p className="mt-2 text-xs text-muted-foreground">
                Última atualização: 2h atrás
              </p>
            </>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
