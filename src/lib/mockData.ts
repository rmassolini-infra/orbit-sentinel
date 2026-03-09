// Estatísticas globais
export const STATS = {
  extensao_km: 847,
  segmentos_total: 847,
  criticos: 23,      // TTC < 30d
  altos: 41,         // TTC 30–45d
  medios: 89,        // TTC 45–90d
  baixos: 694,       // TTC > 90d
  ultima_aquisicao_s2: '2026-03-14T09:42:00Z',
  ultima_aquisicao_s1: '2026-03-13T22:18:00Z',
  cobertura_nuvens_pct: 12,
};

// Top alertas críticos
export const ALERTAS = [
  { id: 'OS-0891', km_ini: 234, km_fim: 237, ttc: 8,  especie: 'Eucalyptus grandis',     risco: 'CRITICO' as const, chm: 9.3,  dms: 15.0, os: 'aberta' as const   },
  { id: 'OS-0892', km_ini: 412, km_fim: 415, ttc: 14, especie: 'Bambu (Bambusa sp.)',    risco: 'CRITICO' as const, chm: 11.2, dms: 15.0, os: 'agendar' as const  },
  { id: 'OS-0893', km_ini:  89, km_fim:  91, ttc: 21, especie: 'Cerrado sensu stricto',  risco: 'CRITICO' as const, chm: 8.7,  dms: 15.0, os: 'agendar' as const  },
  { id: 'OS-0894', km_ini: 567, km_fim: 569, ttc: 27, especie: 'Mata de Galeria',        risco: 'CRITICO' as const, chm: 12.1, dms: 15.0, os: 'agendar' as const  },
  { id: 'OS-0895', km_ini: 701, km_fim: 704, ttc: 29, especie: 'Eucalyptus grandis',     risco: 'CRITICO' as const, chm: 9.8,  dms: 15.0, os: 'agendar' as const  },
];

// Parâmetros Richards do segmento KM 234
export const RICHARDS_KM234 = {
  K: 25.0, h0: 3.2, r: 0.18, m: 0.73,
  r_squared: 0.94, n_obs: 18,
  historico: [
    { mes: -12, chm: 5.1 }, { mes: -11, chm: 5.4 }, { mes: -10, chm: 5.8 },
    { mes:  -9, chm: 6.1 }, { mes:  -8, chm: 6.5 }, { mes:  -7, chm: 6.9 },
    { mes:  -6, chm: 7.2 }, { mes:  -5, chm: 7.6 }, { mes:  -4, chm: 7.9 },
    { mes:  -3, chm: 8.2 }, { mes:  -2, chm: 8.6 }, { mes:  -1, chm: 8.9 },
    { mes:   0, chm: 9.3 },
  ],
  projecao: [
    { mes: 0,  chm: 9.3,  ic_lower: 9.0,  ic_upper: 9.6  },
    { mes: 1,  chm: 11.1, ic_lower: 10.6, ic_upper: 11.6 },
    { mes: 2,  chm: 12.8, ic_lower: 12.1, ic_upper: 13.5 },
    { mes: 3,  chm: 14.3, ic_lower: 13.4, ic_upper: 15.2 },
    { mes: 6,  chm: 18.1, ic_lower: 16.8, ic_upper: 19.4 },
    { mes: 12, chm: 22.3, ic_lower: 20.1, ic_upper: 24.5 },
  ],
  dms: 15.0,
};

// Métricas SR-GAN
export const SR_METRICS = {
  ssim:  0.891,
  psnr:  32.4,
  ergas: 2.41,
  sam:   3.2,
  benchmark_ssim:  0.831,  // RS-ESRGAN referência
  benchmark_ergas: 3.12,
};

// Métricas InSAR CHM
export const INSAR_METRICS = {
  mae:  1.7,
  rmse: 2.1,
  vies: -0.6,  // viés pós-calibração
  n_pixeis: 84700,
};

// Ordens de Serviço para Kanban
export const ORDENS_SERVICO = [
  { id: 'OS-0891', km_ini: 234, km_fim: 237, ttc: 8,  especie: 'Eucalyptus', status: 'pendente', risco: 'CRITICO' as const },
  { id: 'OS-0847', km_ini: 412, km_fim: 415, ttc: 14, especie: 'Bambu', status: 'agendada', risco: 'ALTO' as const, data: '2026-03-15 09:00' },
  { id: 'OS-0823', km_ini: 89,  km_fim: 91,  ttc: 21, especie: 'Cerrado', status: 'execucao', risco: 'CRITICO' as const, equipe: 'Equipe A3' },
  { id: 'OS-0801', km_ini: 701, km_fim: 704, ttc: 29, especie: 'Eucalyptus', status: 'concluida', risco: 'CRITICO' as const, dataConclusao: '2026-03-14' },
];

// Segmentos para mapa (simulado)
export const SEGMENTOS_MAPA = [
  { id: 1, km_ini: 0, km_fim: 50, ttc: 120, risco: 'BAIXO' as const },
  { id: 2, km_ini: 50, km_fim: 89, ttc: 95, risco: 'BAIXO' as const },
  { id: 3, km_ini: 89, km_fim: 91, ttc: 21, risco: 'CRITICO' as const },
  { id: 4, km_ini: 91, km_fim: 150, ttc: 78, risco: 'MEDIO' as const },
  { id: 5, km_ini: 150, km_fim: 234, ttc: 55, risco: 'MEDIO' as const },
  { id: 6, km_ini: 234, km_fim: 237, ttc: 8, risco: 'CRITICO' as const },
  { id: 7, km_ini: 237, km_fim: 350, ttc: 110, risco: 'BAIXO' as const },
  { id: 8, km_ini: 350, km_fim: 412, ttc: 42, risco: 'ALTO' as const },
  { id: 9, km_ini: 412, km_fim: 415, ttc: 14, risco: 'CRITICO' as const },
  { id: 10, km_ini: 415, km_fim: 500, ttc: 150, risco: 'BAIXO' as const },
  { id: 11, km_ini: 500, km_fim: 567, ttc: 88, risco: 'MEDIO' as const },
  { id: 12, km_ini: 567, km_fim: 569, ttc: 27, risco: 'CRITICO' as const },
  { id: 13, km_ini: 569, km_fim: 700, ttc: 200, risco: 'BAIXO' as const },
  { id: 14, km_ini: 700, km_fim: 704, ttc: 29, risco: 'CRITICO' as const },
  { id: 15, km_ini: 704, km_fim: 847, ttc: 180, risco: 'BAIXO' as const },
];

export type Alerta = typeof ALERTAS[number];
export type Segmento = typeof SEGMENTOS_MAPA[number];
export type RiscoLevel = 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
