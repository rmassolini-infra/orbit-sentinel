import { useState } from 'react';
import { ORDENS_SERVICO } from '@/lib/mockData';
import { TtcBadge } from '@/components/TtcBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, Users, FileText } from 'lucide-react';

type OSStatus = 'pendente' | 'agendada' | 'execucao' | 'concluida';

interface OrdemServico {
  id: string;
  km_ini: number;
  km_fim: number;
  ttc: number;
  especie: string;
  status: string;
  risco: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
  data?: string;
  equipe?: string;
  dataConclusao?: string;
}

const columns: { key: OSStatus; label: string; color: string }[] = [
  { key: 'pendente', label: 'PENDENTE', color: 'border-critical' },
  { key: 'agendada', label: 'AGENDADA', color: 'border-accent' },
  { key: 'execucao', label: 'EM EXECUÇÃO', color: 'border-primary' },
  { key: 'concluida', label: 'CONCLUÍDA', color: 'border-success' },
];

export default function OrdensServicoPage() {
  const [orders, setOrders] = useState<OrdemServico[]>(ORDENS_SERVICO as OrdemServico[]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: OSStatus) => {
    e.preventDefault();
    if (draggedItem) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === draggedItem ? { ...order, status: newStatus } : order
        )
      );
    }
    setDraggedItem(null);
  };

  const getOrdersByStatus = (status: OSStatus) =>
    orders.filter((o) => o.status === status);

  return (
    <div className="h-full p-4 space-y-4 overflow-x-auto">
      <h1 className="font-display text-xl font-semibold">Ordens de Serviço</h1>

      <div className="flex gap-4 min-w-max">
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'w-72 rounded-lg border bg-card flex flex-col',
              column.color
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold">{column.label}</h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {getOrdersByStatus(column.key).length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
              {getOrdersByStatus(column.key).map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={cn(
                    'rounded-lg border border-border bg-muted p-3 cursor-grab active:cursor-grabbing transition-all',
                    draggedItem === order.id && 'opacity-50'
                  )}
                >
                  {/* OS ID */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">{order.id}</span>
                    <TtcBadge value={order.ttc} size="sm" showLabel={false} />
                  </div>

                  {/* Segment */}
                  <p className="text-sm mb-1">
                    KM {order.km_ini}–{order.km_fim}
                  </p>

                  {/* Species */}
                  <p className="text-xs text-muted-foreground mb-2">{order.especie}</p>

                  {/* Status-specific info */}
                  {column.key === 'agendada' && order.data && (
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <Calendar className="h-3 w-3" />
                      <span>{order.data}</span>
                    </div>
                  )}

                  {column.key === 'execucao' && order.equipe && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Users className="h-3 w-3" />
                      <span>{order.equipe}</span>
                    </div>
                  )}

                  {column.key === 'concluida' && order.dataConclusao && (
                    <div className="flex items-center gap-1 text-xs text-success">
                      <FileText className="h-3 w-3" />
                      <span>Concluída em {order.dataConclusao}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-border">
                    {column.key === 'pendente' && (
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                        Agendar
                      </Button>
                    )}
                    {(column.key === 'execucao' || column.key === 'concluida') && (
                      <Button size="sm" variant="ghost" className="w-full h-7 text-xs">
                        Ver relatório
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {getOrdersByStatus(column.key).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma OS nesta coluna
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
