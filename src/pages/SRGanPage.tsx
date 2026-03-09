import { useState } from 'react';
import { SR_METRICS } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

const bands = ['RGB', 'NIR', 'NDVI', 'SWIR'] as const;

// Mock NDVI histogram data
const generateHistogram = (offset: number) =>
  Array.from({ length: 20 }, (_, i) => ({
    bin: i * 0.05,
    count: Math.exp(-Math.pow((i * 0.05 - 0.5 - offset * 0.1), 2) / 0.05) * 100 + Math.random() * 10,
  }));

export default function SRGanPage() {
  const [activeBand, setActiveBand] = useState<typeof bands[number]>('RGB');

  return (
    <div className="h-full p-4 space-y-4">
      <h1 className="font-display text-xl font-semibold">Módulo SR-GAN</h1>

      {/* Band Selector */}
      <div className="flex gap-2">
        {bands.map((band) => (
          <button
            key={band}
            onClick={() => setActiveBand(band)}
            className={cn(
              'px-4 py-2 text-sm font-mono rounded-lg transition-colors',
              activeBand === band
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-surface-hover'
            )}
          >
            {band}
          </button>
        ))}
      </div>

      {/* Image Comparison */}
      <div className="grid grid-cols-3 gap-4">
        {/* Sentinel-2 Original */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="aspect-square bg-muted relative">
            {/* Simulated low-res grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(215 14% 30%) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(215 14% 30%) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-2xl text-muted-foreground">10×10</p>
                <p className="text-sm text-muted-foreground">pixels visíveis</p>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
              10 m / pixel
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">Sentinel-2 Original</p>
            <p className="text-xs text-muted-foreground">Resolução nativa L2A</p>
          </div>
          {/* NDVI Histogram */}
          <div className="px-3 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Histograma NDVI</p>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={generateHistogram(0)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(166 100% 50%)"
                  fill="hsl(166 100% 50%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SR-GAN Output */}
        <div className="rounded-lg border-2 border-primary bg-card overflow-hidden">
          <div className="aspect-square bg-muted relative">
            {/* Simulated high-res grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(215 14% 25%) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(215 14% 25%) 1px, transparent 1px)
                `,
                backgroundSize: '4px 4px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-2xl text-primary">50×50</p>
                <p className="text-sm text-primary">pixels gerados</p>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
              2 m / pixel
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-mono">
              ×5 SR
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">SR-GAN Output</p>
            <p className="text-xs text-muted-foreground">Super-resolução ×5</p>
          </div>
          {/* NDVI Histogram */}
          <div className="px-3 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Histograma NDVI</p>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={generateHistogram(0.05)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(195 100% 50%)"
                  fill="hsl(195 100% 50%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WorldView-3 Reference */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="aspect-square bg-muted relative">
            {/* Simulated very high-res grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(215 14% 22%) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(215 14% 22%) 1px, transparent 1px)
                `,
                backgroundSize: '2px 2px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-mono text-2xl text-muted-foreground">200×200</p>
                <p className="text-sm text-muted-foreground">ground truth</p>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-mono">
              0.5 m / pixel
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm">Referência WorldView-3</p>
            <p className="text-xs text-muted-foreground">Ground truth VHR</p>
          </div>
          {/* NDVI Histogram */}
          <div className="px-3 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Histograma NDVI</p>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={generateHistogram(0.08)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(41 100% 47%)"
                  fill="hsl(41 100% 47%)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          MÉTRICAS CALCULADAS NESTE PATCH
        </h3>
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="text-center">
            <p className="font-mono text-2xl text-primary">{SR_METRICS.ssim}</p>
            <p className="text-muted-foreground">SSIM</p>
            <p className="text-xs text-success">↑ {((SR_METRICS.ssim / SR_METRICS.benchmark_ssim - 1) * 100).toFixed(1)}% vs benchmark</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl">{SR_METRICS.psnr}</p>
            <p className="text-muted-foreground">PSNR (dB)</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl text-success">{SR_METRICS.ergas}</p>
            <p className="text-muted-foreground">ERGAS</p>
            <p className="text-xs text-success">↓ {((1 - SR_METRICS.ergas / SR_METRICS.benchmark_ergas) * 100).toFixed(1)}% vs benchmark</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <p className="font-mono text-2xl">{SR_METRICS.sam}°</p>
            <p className="text-muted-foreground">SAM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
