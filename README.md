# Nuditos Tejidos — Proyecto Astro

## Estructura del proyecto

```
.
├── public/                 # Estáticos servidos tal cual (/scripts, /styles, favicon…)
│   ├── robots.txt
│   ├── favicon.svg
│   ├── styles/
│   └── scripts/
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       ├── index.astro
│       ├── sobre-nosotros.astro
│       ├── preguntas-frecuentes.astro
│       └── admin.astro
├── netlify/
│   └── functions/
│       └── cloudinary-sign.js   # Firma subidas Cloudinary (env en Netlify)
├── astro.config.mjs
├── netlify.toml
└── package.json
```

Los CSS y JS de la tienda viven en **`public/`** porque el layout los enlaza con rutas absolutas (`/styles/main.css`, `/scripts/…`). No duplicar en `src/` para evitar copias desincronizadas.

## Instalación

```bash
npm install
npm run dev
```

- Desarrollo: http://localhost:4321  
- Build: `npm run build` · Preview: `npm run preview`

## Netlify

- Build: `npm install && npm run build` (definido en `netlify.toml`).
- **Cloudinary** (panel Netlify → Site settings → Environment): `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, y opcionalmente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`, `CLOUDINARY_FOLDER`.

## Páginas

| URL | Archivo |
|-----|---------|
| `/` | `src/pages/index.astro` |
| `/sobre-nosotros` | `src/pages/sobre-nosotros.astro` |
| `/preguntas-frecuentes` | `src/pages/preguntas-frecuentes.astro` |
| `/admin` | `src/pages/admin.astro` |
