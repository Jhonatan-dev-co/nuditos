---
trigger: always_on
---

# 🤖 Nuditos Tejidos — Workflow del Agente

## Cómo trabajar en este proyecto

### ✅ SIEMPRE
- Usar Astro para componentes y páginas (.astro)
- Usar Tailwind CSS para estilos (no CSS custom salvo excepciones)
- Consultar Supabase para datos dinámicos (productos, pedidos, config)
- Usar Cloudinary para todas las imágenes (nunca <img src> local)
- Respetar el flujo: editar local → el usuario hace git push → Cloudflare despliega
- Responder en español

### ❌ NUNCA
- Modificar archivos .env ni imprimir claves secretas
- Hardcodear datos que deben venir de Supabase
- Crear estilos inline cuando Tailwind puede resolverlo
- Sugerir npm packages pesados sin justificar el porqué
- Asumir que el usuario tiene acceso directo al servidor

### 📁 Convenciones de Archivos
- Componentes reutilizables → src/components/NombreComponente.astro
- Componentes del admin → src/components/admin/
- Páginas nuevas → src/pages/nombre-pagina.astro
- Endpoints API → src/pages/api/nombre.ts
- Lógica cliente → src/scripts/nombre.js

### 🗄️ Supabase — Tablas Principales
- productos: Catálogo de ramos (nombre, precio, stock, visibilidad)
- config: Configuración global de la tienda
- banners: Banners editoriales del home
- pedidos: Órdenes de clientes
- posts: Blog/novedades

### 💳 Pagos
- Pasarela principal: Wompi (tarjeta, Nequi, PSE)
- Alternativa rápida: WhatsApp (573144931525)

### 🚀 Antes de proponer cambios grandes
1. Confirmar que el cambio no rompe el build de Cloudflare
2. Verificar que las variables de entorno necesarias ya existen
3. Avisar si requiere cambios en el schema de Supabase