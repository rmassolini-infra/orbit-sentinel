-- =====================================================
-- GRAFTER ORBIT DATABASE SCHEMA
-- Sistema de Monitoramento de Vegetação em LTs
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 1. TABELA DE CORREDORES DE TRANSMISSÃO
-- =====================================================
CREATE TABLE public.corridors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  total_km NUMERIC(10,2) NOT NULL,
  utm_zone TEXT,
  reference_system TEXT DEFAULT 'SIRGAS 2000',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corridors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Corridors are viewable by everyone"
  ON public.corridors FOR SELECT USING (true);

-- =====================================================
-- 2. TABELA DE SEGMENTOS
-- =====================================================
CREATE TABLE public.segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corridor_id UUID REFERENCES public.corridors(id) ON DELETE CASCADE,
  km_start NUMERIC(10,2) NOT NULL,
  km_end NUMERIC(10,2) NOT NULL,
  geometry GEOMETRY(LineString, 4326),
  ttc_days INTEGER,
  risk_level TEXT CHECK (risk_level IN ('CRITICO', 'ALTO', 'MEDIO', 'BAIXO')),
  chm_current NUMERIC(5,2),
  dms NUMERIC(5,2) DEFAULT 15.0,
  dominant_species TEXT,
  growth_rate NUMERIC(5,3),
  last_inspection_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Segments are viewable by everyone"
  ON public.segments FOR SELECT USING (true);

CREATE INDEX idx_segments_corridor ON public.segments(corridor_id);
CREATE INDEX idx_segments_risk ON public.segments(risk_level);
CREATE INDEX idx_segments_ttc ON public.segments(ttc_days);
CREATE INDEX idx_segments_geometry ON public.segments USING GIST(geometry);

-- =====================================================
-- 3. TABELA DE ALERTAS
-- =====================================================
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES public.segments(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('TTC_CRITICO', 'TTC_ALTO', 'CRESCIMENTO_ACELERADO', 'ANOMALIA_INSAR', 'COERENCIA_BAIXA')),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICO', 'ALTO', 'MEDIO', 'BAIXO')),
  message TEXT NOT NULL,
  ttc_value INTEGER,
  chm_value NUMERIC(5,2),
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alerts are viewable by everyone"
  ON public.alerts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can acknowledge alerts"
  ON public.alerts FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_alerts_segment ON public.alerts(segment_id);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);

-- =====================================================
-- 4. TABELA DE ORDENS DE SERVIÇO
-- =====================================================
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  segment_id UUID REFERENCES public.segments(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'agendada', 'execucao', 'concluida', 'cancelada')) DEFAULT 'pendente',
  priority TEXT NOT NULL CHECK (priority IN ('CRITICO', 'ALTO', 'MEDIO', 'BAIXO')) DEFAULT 'MEDIO',
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  team_assigned TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service orders are viewable by everyone"
  ON public.service_orders FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create service orders"
  ON public.service_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update service orders"
  ON public.service_orders FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_service_orders_status ON public.service_orders(status);
CREATE INDEX idx_service_orders_segment ON public.service_orders(segment_id);

-- =====================================================
-- 5. TABELA DE IMAGENS DE SATÉLITE
-- =====================================================
CREATE TABLE public.satellite_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  corridor_id UUID REFERENCES public.corridors(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('SENTINEL_1', 'SENTINEL_2', 'MODIS', 'LANDSAT', 'MAPBOX')),
  image_type TEXT NOT NULL CHECK (image_type IN ('SAR', 'OPTICAL', 'INFRARED', 'NDVI', 'CHM')),
  acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cloud_coverage_pct NUMERIC(5,2),
  tile_url TEXT,
  metadata JSONB,
  bounds GEOMETRY(Polygon, 4326),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.satellite_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Satellite images are viewable by everyone"
  ON public.satellite_images FOR SELECT USING (true);

CREATE INDEX idx_satellite_images_corridor ON public.satellite_images(corridor_id);
CREATE INDEX idx_satellite_images_source ON public.satellite_images(source);
CREATE INDEX idx_satellite_images_date ON public.satellite_images(acquisition_date DESC);

-- =====================================================
-- 6. TABELA DE MÉTRICAS INSAR
-- =====================================================
CREATE TABLE public.insar_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES public.segments(id) ON DELETE CASCADE,
  processing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  pair_date_1 DATE NOT NULL,
  pair_date_2 DATE NOT NULL,
  baseline_perpendicular NUMERIC(10,2),
  baseline_temporal INTEGER,
  coherence_mean NUMERIC(5,3),
  coherence_std NUMERIC(5,3),
  mae NUMERIC(5,2),
  rmse NUMERIC(5,2),
  bias NUMERIC(5,2),
  chm_derived NUMERIC(5,2),
  phase_residual_std NUMERIC(5,3),
  unwrapping_quality TEXT CHECK (unwrapping_quality IN ('EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insar_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "InSAR metrics are viewable by everyone"
  ON public.insar_metrics FOR SELECT USING (true);

CREATE INDEX idx_insar_metrics_segment ON public.insar_metrics(segment_id);
CREATE INDEX idx_insar_metrics_date ON public.insar_metrics(processing_date DESC);

-- =====================================================
-- 7. TABELA DE HISTÓRICO CHM (Séries Temporais)
-- =====================================================
CREATE TABLE public.chm_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES public.segments(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  chm_value NUMERIC(5,2) NOT NULL,
  source TEXT CHECK (source IN ('INSAR', 'LIDAR', 'SR_GAN', 'MANUAL')),
  confidence NUMERIC(5,3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(segment_id, measurement_date, source)
);

ALTER TABLE public.chm_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CHM history is viewable by everyone"
  ON public.chm_history FOR SELECT USING (true);

CREATE INDEX idx_chm_history_segment ON public.chm_history(segment_id);
CREATE INDEX idx_chm_history_date ON public.chm_history(measurement_date DESC);

-- =====================================================
-- 8. TABELA DE PARÂMETROS RICHARDS
-- =====================================================
CREATE TABLE public.richards_params (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES public.segments(id) ON DELETE CASCADE UNIQUE,
  k_asymptote NUMERIC(8,4) NOT NULL,
  h0_initial NUMERIC(8,4) NOT NULL,
  r_growth_rate NUMERIC(8,6) NOT NULL,
  m_shape NUMERIC(8,4) NOT NULL,
  r_squared NUMERIC(5,4),
  n_observations INTEGER,
  fit_start_date DATE,
  fit_end_date DATE,
  ttc_projection_days INTEGER,
  ic_lower_days INTEGER,
  ic_upper_days INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.richards_params ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Richards params are viewable by everyone"
  ON public.richards_params FOR SELECT USING (true);

-- =====================================================
-- 9. TABELA DE ESPÉCIES DE VEGETAÇÃO
-- =====================================================
CREATE TABLE public.vegetation_species (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scientific_name TEXT NOT NULL UNIQUE,
  common_name TEXT,
  growth_class TEXT CHECK (growth_class IN ('FAST', 'MODERATE', 'SLOW')),
  average_growth_rate NUMERIC(5,3),
  max_height NUMERIC(5,2),
  risk_category TEXT CHECK (risk_category IN ('HIGH', 'MEDIUM', 'LOW')),
  color_hex TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vegetation_species ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vegetation species are viewable by everyone"
  ON public.vegetation_species FOR SELECT USING (true);

-- =====================================================
-- 10. TABELA DE API KEYS CACHE (para evitar rate limits)
-- =====================================================
CREATE TABLE public.api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "API cache is viewable by everyone"
  ON public.api_cache FOR SELECT USING (true);

CREATE INDEX idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON public.api_cache(expires_at);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_corridors_updated_at
  BEFORE UPDATE ON public.corridors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_segments_updated_at
  BEFORE UPDATE ON public.segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_richards_params_updated_at
  BEFORE UPDATE ON public.richards_params
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNÇÃO PARA CALCULAR TTC
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_ttc(
  p_chm_current NUMERIC,
  p_dms NUMERIC,
  p_growth_rate NUMERIC
)
RETURNS INTEGER AS $$
BEGIN
  IF p_growth_rate <= 0 OR p_chm_current >= p_dms THEN
    RETURN 0;
  END IF;
  RETURN CEIL((p_dms - p_chm_current) / (p_growth_rate * 30));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- DADOS INICIAIS - CORREDOR
-- =====================================================
INSERT INTO public.corridors (name, start_location, end_location, total_km, utm_zone, reference_system)
VALUES ('LT Uberlândia – Montes Claros', 'Uberlândia, MG', 'Montes Claros, MG', 847, '23S', 'SIRGAS 2000');

-- =====================================================
-- DADOS INICIAIS - ESPÉCIES
-- =====================================================
INSERT INTO public.vegetation_species (scientific_name, common_name, growth_class, average_growth_rate, max_height, risk_category, color_hex) VALUES
('Eucalyptus grandis', 'Eucalipto', 'FAST', 0.18, 45, 'HIGH', '#22c55e'),
('Bambusa vulgaris', 'Bambu', 'FAST', 0.32, 25, 'HIGH', '#84cc16'),
('Cerrado sensu stricto', 'Cerrado', 'SLOW', 0.05, 12, 'LOW', '#a3e635'),
('Mata de Galeria', 'Mata Ciliar', 'MODERATE', 0.09, 30, 'MEDIUM', '#4ade80'),
('Pinus elliottii', 'Pinus', 'MODERATE', 0.15, 35, 'MEDIUM', '#16a34a'),
('Floresta Estacional Semidecidual', 'Floresta Estacional', 'SLOW', 0.04, 25, 'LOW', '#15803d');