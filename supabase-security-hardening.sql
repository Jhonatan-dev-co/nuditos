-- ════════════════════════════════════════════════════════════════════════════════
-- NUDITOS TEJIDOS — SCRIPT DEFINITIVO DE BLINDAJE SUPABASE (RLS)
-- Archivo: supabase-security-hardening.sql
-- 
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase:
-- https://supabase.com/dashboard/project/fpyhkxikxdwjhukltmqf/sql/new
-- 
-- NOTA DE SEGURIDAD:
-- Este script NO borra datos, NO elimina tablas ni altera tus productos/precios.
-- Su única función es definir los PERMISOS de acceso (Row Level Security)
-- para que extraños o bots no puedan leer claves privadas ni datos de clientes.
-- ════════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1: Eliminar dinámicamente TODAS las políticas antiguas o permisivas
-- (Garantiza que ninguna política vieja previa deje puertas abiertas con OR)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('config', 'pedidos', 'productos', 'banners', 'categorias', 'posts', 'cupones')
    ) LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP; 
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2: TABLA `config` (Configuración y Claves Secretas)
-- ─────────────────────────────────────────────────────────────────────────────
-- Activar RLS
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Clientes y público anónimo: SOLO pueden leer configuraciones públicas
-- (Quedan 100% bloqueadas: resend_api_key, wompi_integrity_secret, wompi_events_secret, admin_email)
CREATE POLICY "anon_select_public_config"
ON public.config
FOR SELECT
TO anon
USING (
  clave NOT IN (
    'resend_api_key',
    'wompi_integrity_secret',
    'wompi_events_secret',
    'admin_email'
  )
);

-- Administrador autenticado en /admin: Puede leer todas las configuraciones
CREATE POLICY "authenticated_select_all_config"
ON public.config
FOR SELECT
TO authenticated
USING (true);

-- Administrador autenticado en /admin: Puede guardar/actualizar configuraciones
CREATE POLICY "authenticated_modify_config"
ON public.config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3: TABLA `pedidos` (Datos Personales y Órdenes de Clientes)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Público anónimo: 0 acceso. Ningún visitante externo puede ver datos de clientes.
-- Solo administradores autenticados y backend (service_role) tienen acceso.
CREATE POLICY "authenticated_manage_pedidos"
ON public.pedidos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4: TABLA `productos` (Catálogo de Ramos)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Público anónimo: Solo lectura para que los clientes vean la tienda
CREATE POLICY "anon_read_productos"
ON public.productos
FOR SELECT
TO anon
USING (true);

-- Solo administrador autenticado puede crear, modificar o borrar productos
CREATE POLICY "authenticated_manage_productos"
ON public.productos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 5: TABLA `banners` (Banners de Portada)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_banners"
ON public.banners
FOR SELECT
TO anon
USING (true);

CREATE POLICY "authenticated_manage_banners"
ON public.banners
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 6: TABLA `categorias` (Categorías de la Tienda)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_categorias"
ON public.categorias
FOR SELECT
TO anon
USING (true);

CREATE POLICY "authenticated_manage_categorias"
ON public.categorias
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 7: TABLA `posts` (Blog)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_posts"
ON public.posts
FOR SELECT
TO anon
USING (true);

CREATE POLICY "authenticated_manage_posts"
ON public.posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 8: TABLA `cupones` (Descuentos)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_cupones"
ON public.cupones
FOR SELECT
TO anon
USING (activo = true);

CREATE POLICY "authenticated_manage_cupones"
ON public.cupones
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

COMMIT;
