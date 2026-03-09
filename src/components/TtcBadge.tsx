import { cn } from "@/lib/utils";

interface TtcBadgeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TtcBadge({ value, size = 'md', showLabel = true }: TtcBadgeProps) {
  const getRiskInfo = (ttc: number) => {
    if (ttc < 30) return { label: 'CRÍTICO', colorClass: 'bg-critical text-white' };
    if (ttc < 45) return { label: 'ALTO', colorClass: 'bg-accent text-accent-foreground' };
    if (ttc < 90) return { label: 'MÉDIO', colorClass: 'bg-primary text-primary-foreground' };
    return { label: 'BAIXO', colorClass: 'bg-secondary text-secondary-foreground' };
  };

  const { label, colorClass } = getRiskInfo(value);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-mono font-semibold',
        colorClass,
        sizeClasses[size],
        value < 30 && 'animate-pulse-critical'
      )}
    >
      <span>{value}d</span>
      {showLabel && <span className="text-[0.7em] opacity-80">{label}</span>}
    </span>
  );
}
