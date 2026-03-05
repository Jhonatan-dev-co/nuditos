# 🧶 NUDITOS — Documentación completa del proyecto

> Guía de referencia para saber exactamente **qué está dónde** y **cómo cambiar cualquier cosa** sin romper nada.

---

## 📁 Estructura de archivos

```
nuditos/
│
├── index.html              ← Tienda principal (lo que ve el cliente)
│
├── css/
│   └── main.css            ← Todos los estilos de la tienda
│
├── js/
│   ├── datos.js            ← Productos, categorías y configuración
│   └── app.js              ← Toda la lógica (carrito, modales, filtros...)
│
├── admin/
│   └── index.html          ← Panel de administración completo
│
└── img/                    ← Imágenes locales (logo, favicon, etc.)
```

---

## 🚨 LO PRIMERO QUE DEBES CAMBIAR ANTES DE PUBLICAR

Estos son los tres datos que están en placeholder y **deben cambiarse** antes de que la tienda funcione de verdad:

### 1. Número de WhatsApp
**Archivo:** `js/app.js` — **Línea 6**
```js
const WA_NUMBER = '...........';
//                 ↑ Cambia por tu número real. Formato: 57 + número sin espacios ni +
//                 Ejemplo Colombia Medellín: '573142345678'
```
Este número aparece en **todos** los botones de WhatsApp de la tienda automáticamente.

### 2. Llave de Wompi (pagos con tarjeta/PSE)
**Archivo:** `js/app.js` — **Línea 7**
```js
const WOMPI_PUBLIC_KEY = 'pub_test_XXXXXXXXXXXXXXXX';
//                        ↑ Reemplaza con tu llave pública de producción de Wompi
//                        La encuentras en wompi.com → Desarrolladores → Llaves de API
//                        La llave de producción empieza con 'pub_prod_...'
```
También puedes configurarla desde el panel admin en ⚙️ Tienda → Wompi.

### 3. Contraseña del panel admin
**Archivo:** `admin/index.html` — **Línea 402**
```js
const ADMIN_PASSWORD = 'nuditos2025';
//                      ↑ Cámbiala por una contraseña segura que solo tú conozcas
```

---

## 🎨 COLORES — Cómo cambiar la paleta completa

Todos los colores de la tienda están en **un solo lugar** como variables CSS. Si cambias estos valores, el cambio se aplica en toda la página automáticamente.

**Archivo:** `css/main.css` — **Líneas 9 a 29**

```css
:root {
  /* ── Morado/lila (color principal) ── */
  --lila:        #b794cc;   /* Lila base — botones, badges, acentos */
  --lila-dark:   #8c5fad;   /* Lila oscuro — hover de botones, precios */
  --lila-light:  #f3edf9;   /* Lila muy suave — fondos de cards */
  --lila-xlight: #faf6fd;   /* Lila casi blanco — fondos generales */

  /* ── Verde menta (color secundario) ── */
  --mint:        #7ec8a0;   /* Menta base — badges "Nuevo", confirmaciones */
  --mint-dark:   #4fa876;   /* Menta oscuro — hover del badge verde */
  --mint-light:  #eaf7f0;   /* Menta suave — fondos de éxito */

  /* ── Crema (fondo general) ── */
  --cream:       #faf8f5;   /* Fondo principal de la página */
  --cream-dark:  #f0ece6;   /* Fondo de las tarjetas de producto */

  /* ── Texto ── */
  --text:        #1a1220;   /* Texto principal oscuro */
  --text-soft:   #8a7592;   /* Texto secundario (descripciones, fechas) */
  --text-mid:    #4a3d52;   /* Texto intermedio */
}
```

**Ejemplo — cambiar de morado a rosa:**
```css
--lila:        #e879a0;   /* Rosa base */
--lila-dark:   #c2185b;   /* Rosa oscuro */
--lila-light:  #fce4ec;   /* Rosa claro */
--lila-xlight: #fdf0f5;   /* Rosa casi blanco */
```

---

## 🔤 TIPOGRAFÍAS — Cómo cambiar las fuentes

La tienda usa dos fuentes de Google Fonts:

**Archivo:** `index.html` — **Línea 9**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:...&family=Jost:...">
```

| Fuente | Uso | Dónde se aplica |
|--------|-----|-----------------|
| **Cormorant Garamond** | Titulares, precios, logo | `font-family:'Cormorant Garamond',serif` |
| **Jost** | Texto general, botones, descripciones | `font-family:'Jost',sans-serif` |

**Para cambiar la fuente del cuerpo (Jost):**
1. Busca una fuente en [fonts.google.com](https://fonts.google.com)
2. En `index.html` línea 9, reemplaza `Jost` por el nuevo nombre
3. En `css/main.css` línea 36: cambia `font-family:'Jost',sans-serif`

**Para cambiar la fuente de títulos (Cormorant Garamond):**
Busca `font-family:'Cormorant Garamond'` en `main.css` — aparece varias veces (logo, títulos hero, precios, nombres de productos en modal).

---

## 📦 PRODUCTOS — Cómo agregar, editar o desactivar

**La forma recomendada:** usa el panel admin en `/admin/index.html`. No necesitas tocar código.

**Si necesitas editar el código directamente:**

**Archivo:** `js/datos.js` — **A partir de línea 53**

Cada producto tiene esta estructura:
```js
{
  id: 1,              // ← NUNCA cambiar este número, es único e intocable
  name: 'Ramo de rosas',   // ← Nombre que ve el cliente
  desc: 'Envío gratis',    // ← Descripción corta (aparece en modal y "Ramo del momento")
  price: 93000,            // ← Precio en COP. Si pones 0 aparece "Consultar"
  emoji: '🌹',             // ← Se muestra cuando no hay foto
  img: '',                 // ← Link de Cloudinary para foto principal
  imgs: [],                // ← Array de links para fotos adicionales (galería en modal)
  cat: 'rosas',            // ← Debe coincidir exactamente con un id de categories
  badge: 'Popular',        // ← Etiqueta encima de la foto: 'Nuevo', 'Popular', 'Especial' o ''
  badgeClass: '',          // ← 'nuevo' = badge verde, '' = badge oscuro
  activo: true             // ← false = producto oculto sin borrar
}
```

**Cómo agregar fotos de Cloudinary:**
```js
img: 'https://res.cloudinary.com/TU-CUENTA/image/upload/w_600,q_auto,f_auto/nombre-foto.jpg',
imgs: [
  'https://res.cloudinary.com/TU-CUENTA/image/upload/w_600,q_auto,f_auto/foto2.jpg',
  'https://res.cloudinary.com/TU-CUENTA/image/upload/w_600,q_auto,f_auto/foto3.jpg',
],
```

---

## 🗂️ CATEGORÍAS — Cómo agregar o renombrar

**Archivo:** `js/datos.js` — **Líneas 26 a 36**

```js
const categories = [
  { id: 'todos',      name: 'Todos',            icon: '🌸' },
  { id: 'rosas',      name: 'Rosas',            icon: '🌹' },
  { id: 'amarillas',  name: 'Flores Amarillas', icon: '🌻' },
  // ... etc
];
```

**Para agregar una categoría nueva:**
1. Agrega una línea nueva en el array con un `id` único (sin espacios, sin tildes)
2. Crea productos con ese mismo `id` en el campo `cat`

**Para renombrar** solo cambia el campo `name` — el `id` nunca debe cambiar.

**⚠️ Importante:** el `id: 'todos'` siempre debe quedar primero y no debe borrarse.

---

## ⚙️ CONFIGURACIÓN INICIAL DE LA TIENDA

**Archivo:** `js/datos.js` — **Líneas 16 a 23**

```js
const CONFIG_DEFAULT = {
  ramoDestacado: 17,          // ← ID del producto que aparece en "Ramo del momento"
  carruselHero: [17, 55, 63], // ← IDs de los productos en el carrusel principal (máx 5)
  descuentoActivo: false,      // ← true/false — activa el banner de descuento
  descuentoCodigo: 'NUDITOS10', // ← Código que escribe el cliente en el carrito
  descuentoPorcentaje: 10,     // ← Porcentaje de descuento
  descuentoTexto: '10% de descuento en tu primer pedido', // ← Texto del banner superior
};
```

Estos valores son los que carga la tienda la primera vez. Después de guardar desde el admin, quedan guardados en `localStorage` y estos valores del código ya no se usan.

---

## 🏠 TEXTOS DE LA TIENDA — Dónde están los textos que ve el cliente

Todos en `index.html`:

| Texto | Línea |
|-------|-------|
| Título del navegador (pestaña) | 7 |
| Descripción SEO (buscadores) | 6 |
| Texto sección "Personalizado" — título | 118 |
| Texto sección "Personalizado" — descripción | 119 |
| Chips de ocasiones (Cumpleaños, Bodas...) | 121–126 |
| Botón de WhatsApp personalizado | 128 |
| Sección Nosotros — título | 139 |
| Sección Nosotros — párrafos | 140–141 |
| Íconos y texto de características (Hilos premium, etc.) | 143–146 |
| Copyright del footer | 192 |

---

## 🔗 REDES SOCIALES — Cómo conectar Instagram, TikTok, Facebook

**Archivo:** `index.html` — **Líneas 156 a 160**

```html
<a href="#" aria-label="Instagram"><i class="ri-instagram-line"></i></a>
<!--         ↑ Reemplaza # por: https://instagram.com/TU_USUARIO -->

<a href="#" aria-label="TikTok"><i class="ri-tiktok-line"></i></a>
<!--         ↑ Reemplaza # por: https://tiktok.com/@TU_USUARIO -->

<a href="https://wa.me/573000000000" aria-label="WhatsApp">...</a>
<!--         ↑ Ya apunta a tu número de WA (línea 6 de app.js) -->

<a href="#" aria-label="Facebook"><i class="ri-facebook-line"></i></a>
<!--         ↑ Reemplaza # por: https://facebook.com/TU_PAGINA -->
```

También están en el menú lateral (`index.html` línea 44) y en los links del footer (líneas 176–178).

---

## 📱 DISEÑO RESPONSIVO — Cómo se adapta la tienda

**Archivo:** `css/main.css`

| Breakpoint | Línea | Qué cambia |
|-----------|-------|------------|
| Móvil (base) | Todo el archivo | 1 columna, menú hamburguesa, modal desde abajo |
| Tablet `min-width: 768px` | 802 | 3 columnas de productos, menú links visibles, modal lateral derecho |
| Desktop `min-width: 1024px` | 829 | 4 columnas de productos, ancho máximo 1400px |

**Para cambiar el número de columnas en tablet:**
`css/main.css` línea 812 — `grid-template-columns:repeat(3,1fr)` → cambia el `3`

**Para cambiar el número de columnas en desktop:**
`css/main.css` línea 830 — `grid-template-columns:repeat(4,1fr)` → cambia el `4`

---

## 🖼️ IMÁGENES — Parámetros recomendados de Cloudinary

Cuando subas fotos a Cloudinary, usa estos parámetros en la URL según dónde va cada foto:

| Uso | Parámetros en la URL | Ejemplo |
|-----|---------------------|---------|
| Tarjeta del catálogo | `w_400,h_530,c_fill,q_auto,f_auto` | foto para la grilla |
| Modal / detalle | `w_600,h_750,c_fill,q_auto,f_auto` | foto para ampliar |
| Hero pantalla completa | `w_1200,q_auto,f_auto` | foto del carrusel |
| Thumbnail admin | `w_200,q_auto,f_auto` | miniatura en el panel |

**Formato de URL completa:**
```
https://res.cloudinary.com/TU-CLOUD-NAME/image/upload/w_600,q_auto,f_auto/nombre-del-archivo.jpg
```

`q_auto` = calidad óptima automática
`f_auto` = formato WebP para Chrome, JPG para otros (30-40% más liviano)
`c_fill` = recorta al centro inteligentemente

---

## 🛒 CARRITO — Textos y comportamiento

**Archivo:** `index.html` — **Líneas 200–231**

| Elemento | Dónde cambiarlo |
|----------|-----------------|
| Título "Bolsa de compras" | `index.html` línea 201 |
| Texto del botón WhatsApp | `index.html` línea 221 |
| Texto del botón Wompi | `index.html` línea 224 |
| Texto "Pago seguro con Wompi" | `index.html` línea 228 |
| Mensaje de carrito vacío 🌸 | `app.js` línea 544 |

**Texto del mensaje de WhatsApp que se envía al confirmar:**
**Archivo:** `js/app.js` — **Línea 620**
```js
`Hola Nuditos! 🌸\nQuiero pedir:\n\n${items}...`
// ↑ Cambia el saludo o el formato del mensaje
```

---

## 🎠 CARRUSEL DEL CATÁLOGO — Cuántas tarjetas se ven

**Archivo:** `js/app.js` — **Líneas 260–265**

```js
breakpoints: {
  480:  { slidesPerView: 2.2 },   // ← Móvil grande: 2 tarjetas y pico
  768:  { slidesPerView: 3.2 },   // ← Tablet: 3 tarjetas y pico
  1024: { slidesPerView: 4.2 },   // ← Desktop: 4 tarjetas y pico
  1280: { slidesPerView: 5 },     // ← Desktop grande: 5 tarjetas
},
```
El decimal (ej. `2.2`) hace que se vea el borde de la siguiente tarjeta, indicando que hay más para deslizar. Si pones un número entero, las tarjetas llenan exactamente el ancho.

---

## 🔍 BÚSQUEDA — Cómo funciona

La búsqueda filtra productos en tiempo real buscando en el **nombre** del producto. Si el cliente escribe "rosa" aparecen todos los productos que tengan "rosa" en el nombre.

**Archivo:** `js/app.js` — función `initSearch()` a partir de línea ~370

Para que un producto aparezca en búsqueda, asegúrate de que el campo `name` en `datos.js` sea descriptivo.

---

## 📊 PANEL ADMIN — Dónde está cada sección

**Archivo:** `admin/index.html`

| Pestaña | Qué hace |
|---------|----------|
| 🌸 Productos | Editar, agregar, ocultar productos. Subir fotos a Cloudinary. |
| 📊 Dashboard | Estadísticas, historial de cambios, productos más pedidos. |
| 📦 Pedidos | Registrar pedidos de WhatsApp, cambiar estados, contactar cliente. |
| ⭐ Vitrina | Elegir qué producto aparece destacado y cuáles van en el carrusel. |
| 🖼️ Banners | Editar los banners que aparecen entre categorías. |
| 🏷️ Descuentos | Activar código de descuento, cambiar porcentaje y texto del banner. |
| ⚙️ Tienda | Configurar Cloudinary, Wompi, vista de categorías, exportar datos.js. |

**Contraseña del admin:** `admin/index.html` línea 402 — `const ADMIN_PASSWORD = 'nuditos2025'`

---

## ☁️ CLOUDINARY — Configuración para subida de fotos

Para que el botón "Subir foto" del admin funcione, necesitas configurarlo una sola vez:

1. Entra a [cloudinary.com](https://cloudinary.com) → Settings → Upload → Upload Presets
2. Crea un preset **Unsigned** (sin firma)
3. Ponle un nombre fácil, por ejemplo: `nuditos_fotos`
4. En el admin → ⚙️ Tienda → sección Cloudinary:
   - **Cloud Name**: el nombre de tu cuenta (lo ves en el dashboard de Cloudinary)
   - **Upload Preset**: el nombre del preset que creaste (`nuditos_fotos`)
5. Guarda — solo necesitas hacerlo una vez

---

## 💾 CÓMO FUNCIONA EL GUARDADO DE DATOS

La tienda usa `localStorage` del navegador para guardar los cambios del admin. Esto significa:

**✅ Lo que SÍ funciona:**
- Los cambios del admin se aplican inmediatamente en la tienda
- Los cambios persisten aunque cierres el navegador
- Funciona sin necesitar servidor ni base de datos

**⚠️ Limitación importante:**
- Los datos guardados en `localStorage` solo existen en ese navegador y ese computador
- Si abres el admin desde otro computador o navegador, no verás los cambios

**Solución:** cuando termines de editar desde el admin, ve a ⚙️ Tienda → "Exportar datos.js" → descarga el archivo → súbelo a Netlify reemplazando el `datos.js` del proyecto. Así los cambios quedan permanentes para cualquier dispositivo.

---

## 🚀 CÓMO PUBLICAR EN NETLIFY

1. Entra a [netlify.com](https://netlify.com) → New site → Deploy manually
2. Arrastra toda la carpeta del proyecto
3. Netlify te da una URL automática como `nuditos-abc123.netlify.app`
4. Para dominio personalizado: Netlify → Domain settings → Add custom domain

**Para actualizar después de cambiar fotos o productos:**
- Exporta el `datos.js` desde el admin
- En Netlify → Deploys → arrastrar solo el archivo `datos.js` actualizado

---

## 🔧 ERRORES COMUNES Y SOLUCIONES

| Problema | Causa | Solución |
|----------|-------|----------|
| WhatsApp abre número incorrecto | `WA_NUMBER` en `app.js` línea 6 | Cambia al número real |
| Fotos no cargan | Link de Cloudinary incorrecto | Verifica que el link tenga `/upload/` en la URL |
| Botón Wompi no aparece | `wompiActivo: false` en el admin | Admin → ⚙️ Tienda → activar toggle Wompi |
| Cambios del admin no se ven | Caché del navegador | Ctrl+Shift+R para recargar sin caché |
| Banner de descuento no aparece | `descuentoActivo: false` | Admin → 🏷️ Descuentos → activar toggle |
| Modal no abre producto | Producto con `activo: false` | Admin → 🌸 Productos → cambiar a Visible |
| Producto sin foto muestra emoji | Campo `img: ''` vacío | Agregar link de Cloudinary en el admin |

---

## 📝 LIBRERÍAS USADAS (no necesitas descargar nada, cargan automáticamente)

| Librería | Versión | Para qué se usa |
|----------|---------|-----------------|
| Swiper.js | 11.0.5 | Carrusel hero y carruseles de categorías |
| AOS | 2.3.4 | Animaciones al hacer scroll |
| Remix Icons | última | Todos los íconos de la interfaz |
| Google Fonts | — | Cormorant Garamond y Jost |

---

*Documentación generada para Nuditos v5 — Última actualización: Febrero 2026*
