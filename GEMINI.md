# 🌸 Nuditos Tejidos — Directrices de Desarrollo y Skills

Este repositorio corresponde a la tienda online de **Nuditos Tejidos** (bouquets y ramos de flores en crochet hechos a mano, Colombia).

## 🧰 Skills del Proyecto

Todas las skills viven en `.agents/skills/<nombre>/SKILL.md` (registradas en `.agents/skills.json`, versiones fijadas en `skills-lock.json`).

> **Instrucción para el agente:** Antes de empezar una tarea, identifica su tipo en la tabla de abajo y lee con `view_file` el `SKILL.md` correspondiente (máximo 2–3 skills por tarea; no cargues todas). Si la tarea combina tipos, carga primero la de la fila más específica.

### 🧭 Tabla de enrutamiento (tarea → skill)

| Si la tarea es… | Carga esta skill | Ruta |
|---|---|---|
| Compilar, verificar tipos, desplegar, subir imágenes, migrar BD | `nuditos-ops` | `.agents/skills/nuditos-ops/SKILL.md` |
| Crear/editar páginas, componentes, islas, rutas SSR, endpoints `/api` | `astro` | `.agents/skills/astro/SKILL.md` |
| Diseñar o rediseñar UI (landing, secciones, hero, tarjetas de producto) | `frontend-design` | `.agents/skills/frontend-design/SKILL.md` |
| Revisar UI existente: accesibilidad, UX, buenas prácticas de interfaz | `web-design-guidelines` | `.agents/skills/web-design-guidelines/SKILL.md` |
| Página lenta, peso de JS/CSS/fuentes/imágenes | `performance` | `.agents/skills/performance/SKILL.md` |
| Métricas LCP / INP / CLS, saltos de layout | `core-web-vitals` | `.agents/skills/core-web-vitals/SKILL.md` |
| Consultas, tablas, índices, RLS, migraciones Supabase | `supabase-postgres-best-practices` | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Algo roto, error, excepción, webhook Wompi falla, regresión | `diagnosing-bugs` | `.agents/skills/diagnosing-bugs/SKILL.md` |
| Revisar cambios / rama / "revisa lo que hice" | `code-review` | `.agents/skills/code-review/SKILL.md` |
| Automatizar navegador con CLI externa (solo si está instalada) | `agent-browser` | `.agents/skills/agent-browser/SKILL.md` |
| Buscar una capacidad nueva que no cubre ninguna skill | `find-skills` | Global |
| Auditoría de costos en Vercel | `vercel-optimize` | `.agents/skills/vercel-optimize/SKILL.md` |

### ⚙️ Adaptaciones al stack de Nuditos (prevalecen sobre la skill)

- **`frontend-design`**: implementar siempre con **Tailwind CSS** dentro de componentes `.astro`; imágenes desde **Cloudinary**; tono de marca artesanal/floral (crochet hecho a mano), en español.
- **`web-design-guidelines`**: entregar hallazgos en formato `archivo:línea`; si no se puede descargar la guía remota, revisar con el criterio de accesibilidad WCAG AA.
- **`diagnosing-bugs`**: no existe `GLOSSARY.md` ni ADRs; usar `.agents/rules/nuditos-context.md` como mapa del proyecto. Redactar siempre secretos de `.env`, Wompi y Supabase como `<REDACTED>`. Bucle de verificación preferido: `npm run build` + `npm run dev` + herramienta de navegador integrada.
- **`code-review`**: no hay issue tracker (ignorar el aviso de `/setup-matt-pocock-skills`). Punto fijo por defecto: `origin/main`. Fuente del "spec": la descripción del usuario en la conversación. Estándares: este `GEMINI.md` + `.agents/rules/`.
- **`agent-browser`**: CLI global **instalada** (v0.38.2 + Chrome en `~/.agent-browser`). Antes de usarla, cargar la guía con `agent-browser skills get core`. Flujo típico: `agent-browser open <url>` → `agent-browser snapshot` → interactuar → `agent-browser close`. Para el sitio local usar `http://localhost:4321` con `npm run dev` corriendo. Si `agent-browser --version` falla, usar la herramienta de navegador integrada del agente.
- **`vercel-optimize`**: el proyecto despliega en **Cloudflare**, no en Vercel; usar solo sus recomendaciones genéricas de frontend. Para rendimiento preferir `performance` y `core-web-vitals`.

---

## 🛠️ Stack Tecnológico
- **Framework:** Astro v4+ (SSR / Cloudflare Adapter)
- **Estilos:** Tailwind CSS (no crear archivos CSS adicionales salvo estricta necesidad)
- **Base de Datos & Auth:** Supabase PostgreSQL (`fpyhkxikxdwjhukltmqf.supabase.co`)
- **Imágenes & CDN:** Cloudinary (`dzxgu27wr/nuditos-products`)
- **Estado & Carrito:** Nanostores (`@nanostores/persistent`)
- **Infraestructura:** Cloudflare Pages & Workers (`wrangler`)
- **Pasarela de Pago:** Wompi + Checkout rápido WhatsApp

---

## 📋 Reglas de Flujo y Código
- **Autoverificación:** Antes de confirmar una tarea que modifique código o dependencias, ejecuta siempre `npm run build` en la terminal para garantizar que el proyecto compile limpiamente sin errores de TypeScript o Astro.
- **Imágenes:** No añadas fotos grandes al repositorio local; deben subirse a Cloudinary o servirse desde su CDN.
- **Idiomas:** La interfaz de usuario y todas las respuestas al usuario deben ser en español.
- **Seguridad:** Nunca imprimas ni modifiques claves privadas de `.env`.
