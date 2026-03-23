# Nuditos Tejidos — Proyecto Astro

## Estructura del proyecto

```
nuditos-astro/
├── public/
│   ├── robots.txt
│   ├── favicon.svg          ← Agrega tu favicon aquí
│   └── styles/
│       ├── main.css         ← Copia tu main.css aquí
│       └── admin.css
│   └── scripts/             ← Copia tus JS aquí
│       ├── app.js
│       ├── datos.js
│       ├── emails.js
│       └── supabase.js
├── src/
│   ├── layouts/
│   │   └── Layout.astro     ← Navbar + footer reutilizable
│   ├── pages/
│   │   ├── index.astro              ← Página principal
│   │   ├── sobre-nosotros.astro
│   │   ├── preguntas-frecuentes.astro
│   │   ├── politicas.astro          ← Pendiente
│   │   ├── blog/
│   │   │   ├── index.astro          ← Listado del blog (Paso 5)
│   │   │   └── [slug].astro         ← Post individual (Paso 5)
│   │   └── producto/
│   │       └── [slug].astro         ← Página por producto (Paso 3) ⭐ SEO
│   └── styles/
│       └── main.css
├── netlify/
│   └── functions/           ← Tus funciones Netlify (sin cambios)
├── astro.config.mjs
├── netlify.toml
└── package.json
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Desarrollo local
npm run dev
# → Abre http://localhost:4321

# 3. Build para producción
npm run build

# 4. Preview del build
npm run preview
```

## ⚠️ Antes de correr en dev

1. Copia `main.css` y `admin.css` a `public/styles/`
2. Copia `app.js`, `datos.js`, `emails.js`, `supabase.js` a `public/scripts/`
3. Agrega un `favicon.svg` en `public/`

## Páginas generadas

| URL | Archivo | Estado |
|-----|---------|--------|
| `/` | `src/pages/index.astro` | ✅ Listo |
| `/sobre-nosotros` | `src/pages/sobre-nosotros.astro` | ✅ Listo |
| `/preguntas-frecuentes` | `src/pages/preguntas-frecuentes.astro` | ✅ Listo |
| `/politicas` | pendiente | 🔜 Paso 2 |
| `/producto/[slug]` | pendiente | 🔜 Paso 3 (SEO principal) |
| `/blog` | pendiente | 🔜 Paso 5 |
| `/blog/[slug]` | pendiente | 🔜 Paso 5 |

## Próximo paso

**Paso 3 — Páginas de producto** (`/producto/[slug].astro`)
Cada producto de Supabase tendrá su propia URL con:
- Meta title y description únicos
- Schema.org `Product` (rich snippets en Google)
- Open Graph para compartir en WhatsApp
- URL amigable: `/producto/ramo-tulipanes-lila`
