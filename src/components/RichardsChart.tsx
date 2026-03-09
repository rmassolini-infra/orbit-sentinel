import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';

interface RichardsChartProps {
  historico: { mes: number; chm: number }[];
  projecao: { mes: number; chm: number; ic_lower: number; ic_upper: number }[];
  dms: number;
  height?: number;
}

export function RichardsChart({ historico, projecao, dms, height = 200 }: RichardsChartProps) {
  // Combine data for the chart
  const chartData = [
    ...historico.map((d) => ({
      mes: d.mes,
      chm_historico: d.chm,
      chm_projecao: null,
      ic_lower: null,
      ic_upper: null,
    })),
    ...projecao.map((d) => ({
      mes: d.mes,
      chm_historico: d.mes === 0 ? d.chm : null,
      chm_projecao: d.chm,
      ic_lower: d.ic_lower,
      ic_upper: d.ic_upper,
    })),
  ];

  // Sort and deduplicate by mes
  const uniqueData = chartData.reduce((acc, curr) => {
    const existing = acc.find((d) => d.mes === curr.mes);
    if (existing) {
      return acc.map((d) =>
        d.mes === curr.mes
          ? {
              ...d,
              chm_historico: d.chm_historico ?? curr.chm_historico,
              chm_projecao: d.chm_projecao ?? curr.chm_projecao,
              ic_lower: d.ic_lower ?? curr.ic_lower,
              ic_upper: d.ic_upper ?? curr.ic_upper,
            }
          : d
      );
    }
    return [...acc, curr];
  }, [] as typeof chartData);

  uniqueData.sort((a, b) => a.mes - b.mes);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={uniqueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 14% 25%)" />
        <XAxis
          dataKey="mes"
          tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}m`}
          stroke="hsl(215 14% 25%)"
        />
        <YAxis
          tick={{ fill: 'hsl(214 14% 58%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v}m`}
          stroke="hsl(215 14% 25%)"
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(215 25% 11%)',
            border: '1px solid hsl(215 14% 25%)',
            borderRadius: '8px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
          }}
          labelFormatter={(v) => `Mês: ${v > 0 ? '+' : ''}${v}`}
        />
        
        {/* Confidence interval area */}
        <Area
          dataKey="ic_upper"
          stroke="none"
          fill="hsl(215 14% 25%)"
          fillOpacity={0.3}
        />
        <Area
          dataKey="ic_lower"
          stroke="none"
          fill="hsl(215 28% 7%)"
          fillOpacity={1}
        />
        
        {/* DMS threshold line */}
        <ReferenceLine
          y={dms}
          stroke="hsl(0 85% 65%)"
          strokeDasharray="5 5"
          label={{
            value: `DMS ${dms}m`,
            fill: 'hsl(0 85% 65%)',
            fontSize: 10,
            fontFamily: 'JetBrains Mono',
          }}
        />
        
        {/* Historical CHM */}
        <Line
          type="monotone"
          dataKey="chm_historico"
          stroke="hsl(166 100% 50%)"
          strokeWidth={2}
          dot={{ fill: 'hsl(166 100% 50%)', r: 3 }}
          connectNulls={false}
        />
        
        {/* Projected CHM */}
        <Line
          type="monotone"
          dataKey="chm_projecao"
          stroke="hsl(41 100% 47%)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: 'hsl(41 100% 47%)', r: 3 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
