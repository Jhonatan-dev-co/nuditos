# 🌸 Nuditos Tejidos — Boutique E-commerce

Bienvenido al repositorio oficial de **Nuditos Tejidos**, una plataforma de comercio electrónico boutique diseñada específicamente para la venta de ramos y productos tejidos a mano (crochet). Esta web combina una estética editorial minimalista con una infraestructura potente y moderna.

---

## 🚀 Stack Tecnológico

El proyecto está construido con un enfoque en rendimiento, escalabilidad y facilidad de administración:

*   **Framework:** [Astro](https://astro.build/) (v4+) para un rendimiento ultra rápido con islas de interactividad.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo y premium.
*   **Base de Datos y Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime).
*   **Gestión de Imágenes:** [Cloudinary](https://cloudinary.com/) (CDN, optimización automática y firmas seguras).
*   **Pasarela de Pagos:** [Wompi](https://wompi.co/) (Integración para pagos con tarjeta, Nequi, PSE).
*   **Estado Global:** [Nanostores](https://github.com/nanostores/nanostores) para persistencia del carrito en el navegador.
*   **Despliegue:** Preparado para **Cloudflare Pages** o **Netlify**.

---

## ✨ Características Principales

### 🛍️ Experiencia de Usuario (Storefront)
- **Diseño Editorial:** Home page con banners de alto impacto, tipografía cuidada (serif/sans) y espaciado boutique.
- **Catálogo Dinámico:** Filtros por categorías, búsqueda en tiempo real con overlay y tarjetas de producto optimizadas.
- **Carrito Persistente:** Bolsa de compras que recuerda tus productos. Incluye micro-animaciones y gesto de **Swipe-to-Delete** en dispositivos móviles.
- **Checkout Pro:** Flujo de pago profesional en 3 pasos (Datos, Envío, Pago) integrando **Wompi** para transacciones seguras y botón rápido de **WhatsApp**.
- **SEO & Performance:** Optimización agresiva de imágenes (Cloudinary `q_auto,f_auto`), meta-tags dinámicos por página y puntuaciones PageSpeed en verde.

### 🔐 Panel de Administración (CMS Pro)
Un panel completo accesible en `/admin` que permite gestionar toda la tienda sin tocar código:
- **Gestión de Ramos:** Crear, editar y eliminar productos. Cambio rápido de visibilidad, precios, ofertas y stock.
- **Vitrina Dinámica:** Configura qué ramos aparecen en el Hero (carrusel) y cuál es el "Ramo del Momento" en la home.
- **Editor de Banners:** Control total sobre los banners editoriales de la página de inicio (títulos, imágenes, links).
- **Módulo de Blog:** CMS sencillo para publicar artículos y novedades.
- **Control de Pedidos:** Visualización y cambio de estado de los pedidos realizados por los clientes.
- **SEO Tab:** Gestión individual de títulos, descripciones y Open Graph por cada sección del sitio.
- **Cloudinary Manager:** Subida directa de fotos desde el panel con firmas seguras generadas por el servidor.

---

## 🛠️ Estructura del Proyecto

```text
.
├── src/
│   ├── components/       # Componentes Astro (Banners, Cards, UI)
│   │   └── admin/        # Componentes exclusivos del Panel Admin
│   ├── layouts/          # Layout principal y Layout específico de Admin
│   ├── pages/            # Rutas del sitio (Home, Catálogo, Checkout, Admin)
│   │   └── api/          # Endpoints de servidor (Cloudinary signatures)
│   ├── store/            # Lógica de Nanostores (Carrito, Descuentos)
│   ├── scripts/          # Lógica de cliente (UI del carrito, validaciones)
│   ├── lib/              # Utilidades (Supabase client, Icons, etc.)
│   └── data/             # Datos estáticos y configuración base
├── public/               # Activos estáticos (Tipografías, Scripts externos)
├── astro.config.mjs      # Configuración de Astro e integraciones
└── tailwind.config.mjs   # Configuración de diseño y colores
```

---

## ⚙️ Configuración y Desarrollo

### 1. Clonar e Instalar
```bash
git clone <url-del-repo>
cd nuditos-astro-paso1
npm install
```

### 2. Variables de Entorno (.env)
Crea un archivo `.env` en la raíz con las siguientes claves:
```env
PUBLIC_SUPABASE_URL=tu_url_de_supabase
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_preset
```

### 3. Ejecutar en local
```bash
npm run dev
```
La tienda estará disponible en `http://localhost:4321`.

---

## 📦 Despliegue

El proyecto está configurado para ejecutarse en modo **SSR (Server-Side Rendering)** o **Hybrid** para permitir la gestión de APIs y Auth.

- **Cloudflare:** Usa el adaptador `@astrojs/cloudflare` incluido. El comando de build es `npm run build`.
- **Base de Datos:** Asegúrate de ejecutar el schema de Supabase (tablas: `productos`, `config`, `banners`, `pedidos`, `posts`).

---

## 💎 Créditos
Desarrollado con ❤️ para **Nuditos Tejidos**. Diseño enfocado en la delicadeza del trabajo manual y la eficiencia tecnológica.
