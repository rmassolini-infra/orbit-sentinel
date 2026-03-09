import { useState } from 'react';
import { ALERTAS, STATS, type RiscoLevel } from '@/lib/mockData';
import { TtcBadge } from '@/components/TtcBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowUpDown } from 'lucide-react';

// Generate more mock data
const generateSegmentos = () => {
  const especies = [
    'Eucalyptus grandis',
    'Bambu (Bambusa sp.)',
    'Cerrado sensu stricto',
    'Mata de Galeria',
    'Pinus elliottii',
    'Floresta Estacional',
  ];

  const segmentos = [];
  for (let i = 0; i < 50; i++) {
    const km_ini = Math.floor(Math.random() * 840);
    const km_fim = km_ini + Math.floor(Math.random() * 5) + 1;
    const ttc = Math.floor(Math.random() * 200) + 5;
    const chm = Math.random() * 10 + 5;
    const dms = 15;
    
    let risco: RiscoLevel;
    if (ttc < 30) risco = 'CRITICO';
    else if (ttc < 45) risco = 'ALTO';
    else if (ttc < 90) risco = 'MEDIO';
    else risco = 'BAIXO';

    segmentos.push({
      id: `SEG-${String(i).padStart(4, '0')}`,
      km_ini,
      km_fim,
      ttc,
      risco,
      especie: especies[Math.floor(Math.random() * especies.length)],
      chm: Math.round(chm * 10) / 10,
      dms,
      margem: Math.round((dms - chm) * 10) / 10,
      os: Math.random() > 0.8 ? 'aberta' as const : null,
    });
  }

  return segmentos.sort((a, b) => a.ttc - b.ttc);
};

const segmentos = generateSegmentos();
const especies = [...new Set(segmentos.map((s) => s.especie))];

export default function AlertasPage() {
  const [filtroRisco, setFiltroRisco] = useState<string>('todos');
  const [filtroEspecie, setFiltroEspecie] = useState<string>('todas');
  const [busca, setBusca] = useState('');
  const [apenasOS, setApenasOS] = useState(false);
  const [sortBy, setSortBy] = useState<string>('ttc');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredSegmentos = segmentos
    .filter((s) => {
      if (filtroRisco !== 'todos' && s.risco !== filtroRisco) return false;
      if (filtroEspecie !== 'todas' && s.especie !== filtroEspecie) return false;
      if (busca && !`${s.km_ini}`.includes(busca) && !`${s.km_fim}`.includes(busca)) return false;
      if (apenasOS && !s.os) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSegmentos.length / pageSize);
  const paginatedSegmentos = filteredSegmentos.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="h-full p-4 space-y-4">
      <h1 className="font-display text-xl font-semibold">Painel de Alertas</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Nível de Risco</Label>
          <Select value={filtroRisco} onValueChange={setFiltroRisco}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="CRITICO">Crítico</SelectItem>
              <SelectItem value="ALTO">Alto</SelectItem>
              <SelectItem value="MEDIO">Médio</SelectItem>
              <SelectItem value="BAIXO">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Espécie Dominante</Label>
          <Select value={filtroEspecie} onValueChange={setFiltroEspecie}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="todas">Todas</SelectItem>
              {especies.map((esp) => (
                <SelectItem key={esp} value={esp}>
                  {esp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs text-muted-foreground">Busca por KM</Label>
          <Input
            placeholder="Ex: 234"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="apenasOS"
              checked={apenasOS}
              onCheckedChange={setApenasOS}
            />
            <Label htmlFor="apenasOS" className="text-sm">
              Apenas com OS
            </Label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                {[
                  { key: 'km_ini', label: 'KM INICIAL' },
                  { key: 'km_fim', label: 'KM FINAL' },
                  { key: 'ttc', label: 'TTC (dias)' },
                  { key: 'risco', label: 'RISCO' },
                  { key: 'especie', label: 'ESPÉCIE' },
                  { key: 'chm', label: 'CHM (m)' },
                  { key: 'margem', label: 'MARGEM' },
                  { key: 'os', label: 'STATUS OS' },
                  { key: 'acoes', label: 'AÇÕES' },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => col.key !== 'acoes' && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key !== 'acoes' && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSegmentos.map((seg) => (
                <tr
                  key={seg.id}
                  className="border-b border-border hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-sm">{seg.km_ini}</td>
                  <td className="px-4 py-3 font-mono text-sm">{seg.km_fim}</td>
                  <td className="px-4 py-3">
                    <TtcBadge value={seg.ttc} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-sm">{seg.risco}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[150px]">
                    {seg.especie}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{seg.chm}</td>
                  <td className="px-4 py-3 font-mono text-sm">{seg.margem}</td>
                  <td className="px-4 py-3">
                    {seg.os ? (
                      <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                        OS ABERTA
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredSegmentos.length)} de{' '}
            {filteredSegmentos.length} segmentos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
