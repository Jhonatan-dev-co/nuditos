---
name: nuditos-ops
description: Procedimientos y runbooks para desarrollo, verificación de compilación, despliegues en Cloudflare, subida de imágenes a Cloudinary y migraciones de base de datos en Nuditos Tejidos.
---

# 🧶 Nuditos Ops & Workflows

Esta skill proporciona las instrucciones y runbooks paso a paso para el mantenimiento, despliegue y desarrollo del proyecto **Nuditos Tejidos**.

## 1. Verificación y Compilación (Build Check)
Siempre antes de dar por finalizada una tarea o antes de desplegar, verifica que el código compile sin errores:

```bash
npm run build
```
O para verificar tipos de TypeScript y Astro:
```bash
npx astro check
```

## 2. Despliegue en Producción (Cloudflare Pages & Worker)
Para compilar y desplegar los cambios más recientes a Cloudflare:

```bash
npm run deploy
```
Este comando ejecuta:
- `astro build`
- `wrangler pages deploy dist --project-name=nuditos --branch=main`
- `wrangler deploy --config wrangler-worker.toml --keep-vars`

## 3. Subida y Gestión de Imágenes (Cloudinary)
Nuditos utiliza Cloudinary (`dzxgu27wr/nuditos-products`) con presets optimizados.
Para subir una imagen de producto desde la terminal:

```bash
node scripts/upload-image.js "ruta/a/imagen.jpg" "nombre-producto"
```

Reglas para imágenes:
- No guardar imágenes pesadas en el repositorio.
- Usar transformaciones automáticas de Cloudinary: `f_auto,q_auto`.

## 4. Base de Datos (Supabase PostgreSQL)
- **URL del proyecto:** `fpyhkxikxdwjhukltmqf.supabase.co`
- **Tablas principales:**
  - `productos`: Catálogo, precios, stock, imágenes y etiquetas.
  - `config`: Opciones globales de la tienda.
  - `banners`: Promociones activas y slides de portada.
  - `pedidos`: Historial de compras.
  - `posts`: Artículos del blog / novedades.
- **Migraciones:**
  - Guarda cualquier script de migración SQL en la raíz del proyecto con nombres descriptivos (ej. `cambio-precios.sql`).
  - Utiliza siempre transacciones seguras (`BEGIN; ... COMMIT;`).

## 5. Carrito y Estado (Nanostores)
El carrito de compras y los cupones residen en `src/store/`:
- Persistencia en navegador mediante `@nanostores/persistent`.
- Al modificar propiedades del producto en el carrito, asegurar compatibilidad hacia atrás con el almacenamiento local existente del cliente.
