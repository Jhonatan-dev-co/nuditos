-- ═══════════════════════════════════════════════════════════════════
-- NUDITOS TEJIDOS — Agregar Producto: Ramo Amor
-- 
-- Incluye:
-- 1. Foto real del ramo optimizada en Cloudinary (CDN).
-- 2. Plantillas SEO estándar (Meta Title, Meta Description, Alt Text, Keywords).
-- 3. Configuración de precio ($77.000 COP), categorías y stock.
-- 
-- Instrucciones de ejecución:
-- 1. Abre Supabase -> SQL Editor (https://supabase.com/dashboard/project/fpyhkxikxdwjhukltmqf/sql)
-- 2. Pega este código y presiona 'Run'
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO productos (
  nombre,
  precio,
  precio_original,
  precio_oferta,
  descripcion,
  categoria,
  emoji,
  img,
  imgs,
  stock,
  activo,
  destacado,
  badge,
  badge_class,
  oferta,
  envio_gratis,
  meta_title,
  meta_description,
  alt_text,
  seo_keywords
) VALUES (
  'Ramo amor',
  77000,
  0,
  0,
  'Hermoso ramo tejido a mano con hilo 100% antialérgico. Incluye un girasol, un tulipán, una rosa y cinco no me olvides tejidas a crochet. Disponible en 8 hermosos colores (lila/morado, amarillo pastel, azul rey, azul cielo, rosado, fucsia, vino tinto y amarillo). Incluye envoltura premium y tarjeta personalizada. Flores eternas que nunca se marchitan, el detalle perfecto para sorprender.',
  'flores-amarillas,ramo-rosas,ramos-tulipanes',
  '🌸',
  'https://res.cloudinary.com/dzxgu27wr/image/upload/w_1200,q_auto,f_auto/v1788319302/nuditos-products/ramo-amor-girasol-tulipan-rosa-tejido-crochet-v6hi.jpg',
  ARRAY[
    'https://res.cloudinary.com/dzxgu27wr/image/upload/w_1200,q_auto,f_auto/v1788319302/nuditos-products/ramo-amor-girasol-tulipan-rosa-tejido-crochet-v6hi.jpg'
  ],
  99,
  true,
  true,
  'Nuevo',
  'nuevo',
  false,
  true,
  'Ramo Amor a Crochet: Girasol, Tulipán y Rosa | Flores Eternas',
  'Ramo Amor tejido a mano a crochet con girasol, tulipán, rosa y no me olvides en hilo antialérgico. El regalo eterno ideal. Envíos a toda Colombia.',
  'Ramo de flores tejidas a mano a crochet compuesto por un girasol amarillo central, un tulipán amarillo, una rosa tejida y cinco pequeñas flores no me olvides blancas, envuelto en papel beige con lazo satinado rosa.',
  'ramo amor crochet, ramo de girasol tulipan y rosa tejido, flores tejidas colombia, ramo tejido con no me olvides, bouquet crochet personalizado, flores eternas bogota, regalo hecho a mano antialergico'
);

-- ── CONSULTA DE VERIFICACIÓN ──
SELECT id, nombre, precio, categoria, badge, activo, meta_title, img, imgs 
FROM productos 
WHERE nombre ILIKE '%Ramo amor%' 
ORDER BY id DESC 
LIMIT 5;
