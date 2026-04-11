---
trigger: always_on
---

# 🌸 Nuditos Tejidos — Contexto del Proyecto

## Negocio
- **Producto:** Ramos de crochet hechos a mano (bouquets tejidos)
- **País:** Colombia | **Moneda:** COP
- **WhatsApp:** 573144931525
- **Instagram:** nuditos_tejidos
- **Web:** nuditos.com.co

## Stack Tecnológico
- **Framework:** Astro v4+ (SSR/Hybrid)
- **Estilos:** Tailwind CSS
- **Base de Datos + Auth:** Supabase (PostgreSQL + Auth)
  - URL: fpyhkxikxdwjhukltmqf.supabase.co
  - Tablas: `productos`, `config`, `banners`, `pedidos`, `posts`
- **Imágenes:** Cloudinary (CDN, `q_auto,f_auto`, firmas seguras desde API)
- **Pagos:** Wompi (tarjeta, Nequi, PSE)
- **Carrito:** Nanostores (persistencia en browser)
- **Deploy:** Cloudflare Pages (auto-deploy desde git push)

## Estructura del Proyecto
```
src/
├── components/       # Componentes Astro + admin/
├── layouts/          # Layout principal y Admin
├── pages/            # Rutas: Home, Catálogo, Checkout, Admin
│   └── api/          # Endpoints servidor (Cloudinary signatures)
├── store/            # Nanostores (carrito, descuentos)
├── scripts/          # Lógica de cliente
├── lib/              # Supabase client, utilidades
└── data/             # Datos estáticos
public/               # Tipografías, scripts externos
astro.config.mjs
tailwind.config.mjs
```

## Flujo de Trabajo
- Desarrollo **local** → `git push` → **Cloudflare Pages** auto-despliega
- Admin panel en `/admin` (gestión sin tocar código)
- Variables de entorno en `.env` (nunca commitear)

## Variables de Entorno Requeridas
```env
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PUBLIC_CLOUDINARY_CLOUD_NAME=
PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## Checkout
- Flujo 3 pasos: Datos → Envío → Pago
- Integración Wompi + botón rápido WhatsApp
