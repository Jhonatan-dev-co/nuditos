-- ═══════════════════════════════════════════════════════════════════
-- NUDITOS TEJIDOS — Eliminar Versión 1 de Flores Amarillas (ID 110)
-- Mantener únicamente la Versión 2 (ID 138)
-- 
-- Instrucciones:
-- 1. Abre Supabase -> SQL Editor (https://supabase.com/dashboard/project/fpyhkxikxdwjhukltmqf/sql)
-- 2. Pega este código y haz clic en 'Run'
-- ═══════════════════════════════════════════════════════════════════

-- 1. ELIMINAR LA VERSIÓN 1 (ID 110)
DELETE FROM productos WHERE id = 110;

-- 2. ASEGURAR QUE LA VERSIÓN 2 (ID 138) QUEDE ACTIVA Y VISIBLE
UPDATE productos 
SET 
  activo = true,
  badge = 'Popular',
  categoria = 'flores-amarillas'
WHERE id = 138;

-- 3. ACTUALIZAR CONFIGURACIÓN DE 'SELECCIÓN NUDITOS' (Reemplazar 110 por 138)
UPDATE config 
SET valor = '[138,101,77,75]' 
WHERE clave = 'seleccion_nuditos';

-- 4. VERIFICACIÓN
SELECT id, nombre, precio, categoria, activo, badge FROM productos WHERE categoria = 'flores-amarillas' ORDER BY id ASC;
