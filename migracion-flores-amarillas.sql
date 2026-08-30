-- ═══════════════════════════════════════════════════════════════════
-- NUDITOS TEJIDOS — Migración Específica: Combos a Flores Amarillas
-- 
-- 1. Renombra los combos de 'Combo Mundial' a 'Combo Flores Amarillas'.
-- 2. Asigna los combos a la categoría 'flores-amarillas'.
-- 3. Mantiene los productos individuales en sus categorías originales:
--    - Virgencita del Carmen -> amigurumis
--    - Maceta orquídea       -> macetas
--    - Maceta de Girasol     -> macetas
--    - Ramo gatito           -> ramo-especiales
--    - Ramo flores amarillas -> flores-amarillas
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. ACTUALIZAR EXCLUSIVAMENTE LOS 3 COMBOS A FLORES AMARILLAS ──
UPDATE productos
SET 
  nombre = 'Combo Flores Amarillas: Maceta Tulipanes + Flores amarillas',
  categoria = 'flores-amarillas',
  emoji = '🌻',
  descripcion = '¡Edición especial de Flores Amarillas! Llévate la hermosa Maceta Tulipanes y el vibrante Ramo de Flores Amarillas a un precio de oferta único. Tejidos a mano con hilo premium 100% hipoalergénico. Envíos a toda Colombia.',
  badge = 'Flores Amarillas',
  badge_class = 'especial'
WHERE id = 134 OR nombre ILIKE '%Combo%Maceta Tulipanes%';

UPDATE productos
SET 
  nombre = 'Combo Flores Amarillas: Maceta Girasol + Virgencita',
  categoria = 'flores-amarillas',
  emoji = '🌻',
  descripcion = '¡Celebra con la alegría y luz de las Flores Amarillas! Este combo especial incluye la Maceta de Girasol y la Virgencita del Carmen tejida a crochet. Un detalle eterno lleno de amor y esperanza.',
  badge = 'Flores Amarillas',
  badge_class = 'especial'
WHERE id = 135 OR nombre ILIKE '%Combo%Maceta Girasol%';

UPDATE productos
SET 
  nombre = 'Combo Flores Amarillas: Ramo gatito + Maceta orquidea',
  categoria = 'flores-amarillas',
  emoji = '🌻',
  descripcion = 'Combina el tierno Ramo Gatito con la elegante Maceta Orquídea. Una hermosa explosión de flores y dulzura tejida a crochet para decorar y alegrar cualquier rincón especial.',
  badge = 'Flores Amarillas',
  badge_class = 'especial'
WHERE id = 136 OR nombre ILIKE '%Combo%Ramo gatito%';

-- ── 2. RESTABLECER PRODUCTOS INDIVIDUALES A SUS CATEGORÍAS ORIGINALES ──
UPDATE productos
SET categoria = 'macetas'
WHERE id = 78; -- Maceta de Girasol se queda estrictamente en macetas

UPDATE productos
SET categoria = 'macetas'
WHERE id = 114; -- Maceta orquídea se queda estrictamente en macetas

UPDATE productos
SET categoria = 'amigurumis'
WHERE id = 120; -- Virgencita del Carmen se queda estrictamente en amigurumis

UPDATE productos
SET categoria = 'ramo-especiales'
WHERE id = 94; -- Ramo gatito se queda estrictamente en ramo-especiales

UPDATE productos
SET categoria = 'flores-amarillas'
WHERE id = 110; -- Ramo flores amarillas en flores-amarillas

-- ── 3. DESACTIVAR CATEGORÍA MUNDIAL Y REDIRIGIR BANNERS ──
UPDATE categorias
SET activo = false
WHERE id = 'mundial';

UPDATE banners
SET cta_url = '/catalogo?categoria=flores-amarillas'
WHERE cta_url ILIKE '%categoria=mundial%';

UPDATE landings
SET is_active = false
WHERE slug = 'mundial';

-- ── 4. CONSULTA DE VERIFICACIÓN ──
SELECT id, nombre, categoria, badge, emoji 
FROM productos 
WHERE id IN (78, 94, 110, 114, 120, 134, 135, 136)
ORDER BY id ASC;
