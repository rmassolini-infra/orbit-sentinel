import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'ok' | 'warning' | 'critical';
  subtext?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  status,
  subtext,
  className,
}: MetricCardProps) {
  const statusColors = {
    ok: 'bg-success',
    warning: 'bg-accent',
    critical: 'bg-critical',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-critical',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      {status && (
        <span
          className={cn(
            'absolute right-3 top-3 h-2 w-2 rounded-full',
            statusColors[status]
          )}
        />
      )}
      <p className="text-sm text-muted-foreground font-body">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold font-mono text-foreground">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground font-mono">{unit}</span>
        )}
        {trend && (
          <TrendIcon
            className={cn('ml-2 h-4 w-4', trendColors[trend])}
          />
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
