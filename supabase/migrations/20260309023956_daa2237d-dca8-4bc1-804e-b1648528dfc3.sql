-- =====================================================
-- CORREÇÕES DE SEGURANÇA
-- =====================================================

-- 1. Mover extensão PostGIS para schema extensions
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- Recriar coluna geometry com schema correto
ALTER TABLE public.segments DROP COLUMN IF EXISTS geometry;
ALTER TABLE public.segments ADD COLUMN geometry extensions.geometry(LineString, 4326);
CREATE INDEX idx_segments_geometry ON public.segments USING GIST(geometry);

ALTER TABLE public.satellite_images DROP COLUMN IF EXISTS bounds;
ALTER TABLE public.satellite_images ADD COLUMN bounds extensions.geometry(Polygon, 4326);

-- 2. Corrigir search_path nas funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_ttc(
  p_chm_current NUMERIC,
  p_dms NUMERIC,
  p_growth_rate NUMERIC
)
RETURNS INTEGER 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF p_growth_rate <= 0 OR p_chm_current >= p_dms THEN
    RETURN 0;
  END IF;
  RETURN CEIL((p_dms - p_chm_current) / (p_growth_rate * 30));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Habilitar RLS em spatial_ref_sys se existir no public (do PostGIS)
-- Essa tabela foi removida ao dropar a extensão, então não precisa mais