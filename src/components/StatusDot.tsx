import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: 'online' | 'offline' | 'degraded';
  label: string;
  className?: string;
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  const statusConfig = {
    online: {
      colorClass: 'bg-success',
      pulse: true,
      labelText: 'ONLINE',
    },
    offline: {
      colorClass: 'bg-critical',
      pulse: false,
      labelText: 'OFFLINE',
    },
    degraded: {
      colorClass: 'bg-accent',
      pulse: false,
      labelText: 'DEGRADED',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.colorClass
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            config.colorClass
          )}
        />
      </span>
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xs',
          status === 'online' && 'text-success',
          status === 'offline' && 'text-critical',
          status === 'degraded' && 'text-accent'
        )}
      >
        {config.labelText}
      </span>
    </div>
  );
}
