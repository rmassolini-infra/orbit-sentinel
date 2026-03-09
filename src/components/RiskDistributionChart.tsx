import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { STATS } from '@/lib/mockData';

const data = [
  { name: 'CRÍTICO', value: STATS.criticos, color: 'hsl(0 85% 65%)', label: '< 30d' },
  { name: 'ALTO', value: STATS.altos, color: 'hsl(41 100% 47%)', label: '30–45d' },
  { name: 'MÉDIO', value: STATS.medios, color: 'hsl(195 100% 50%)', label: '45–90d' },
  { name: 'BAIXO', value: STATS.baixos, color: 'hsl(166 100% 50%)', label: '> 90d' },
];

export function RiskDistributionChart() {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <div className="w-16 text-xs font-mono text-muted-foreground">
            {item.name}
          </div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${(item.value / STATS.segmentos_total) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
          <div className="w-20 text-right">
            <span className="font-mono text-sm text-foreground">{item.value}</span>
            <span className="text-xs text-muted-foreground ml-1">seg.</span>
          </div>
        </div>
      ))}
    </div>
  );
}
