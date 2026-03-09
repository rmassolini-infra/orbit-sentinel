import { TtcBadge } from './TtcBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Alerta } from '@/lib/mockData';

interface SegmentRowProps {
  alerta: Alerta;
  index: number;
  isSelected?: boolean;
  onSelect: (alerta: Alerta) => void;
}

export function SegmentRow({ alerta, index, isSelected, onSelect }: SegmentRowProps) {
  return (
    <tr
      className={cn(
        'cursor-pointer border-b border-border transition-colors',
        isSelected ? 'bg-surface-hover' : 'hover:bg-surface-hover/50'
      )}
      onClick={() => onSelect(alerta)}
    >
      <td className="px-3 py-2 text-sm font-mono text-muted-foreground">{index + 1}</td>
      <td className="px-3 py-2 text-sm font-mono">
        KM {alerta.km_ini}–{alerta.km_fim}
      </td>
      <td className="px-3 py-2">
        <TtcBadge value={alerta.ttc} size="sm" showLabel={false} />
      </td>
      <td className="px-3 py-2 text-sm text-muted-foreground truncate max-w-[120px]">
        {alerta.especie}
      </td>
      <td className="px-3 py-2">
        {alerta.os === 'aberta' ? (
          <Button
            size="sm"
            variant="default"
            className="h-6 text-xs px-2 bg-primary hover:bg-primary/90"
          >
            OS ABERTA
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            AGENDAR
          </Button>
        )}
      </td>
    </tr>
  );
}
