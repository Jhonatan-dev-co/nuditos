/* ══════════════════════════════════════════
   NUDITOS v4 — Datos de productos y config
   js/datos.js

   Los datos se cargan desde Supabase en tiempo real.
   Este archivo funciona como FALLBACK si Supabase no responde.

   📸 CÓMO AGREGAR IMÁGENES:
   → Usa el panel Admin → selecciona el producto → sube la foto
   ══════════════════════════════════════════ */

/* ── Configuración por defecto (fallback) ── */
const CONFIG_DEFAULT = {
  ramoDestacado:      17,
  carruselHero:       [17, 55, 63],
  descuentoActivo:    false,
  descuentoCodigo:    'NUDITOS10',
  descuentoPorcentaje:10,
  descuentoTexto:     '10% de descuento en tu primer pedido',
  wompiActivo:        false,
  wompiKey:           '',
  catViews:           {},
};

/* ── Categorías ── */
const categories = [
  { id: 'todos',      name: 'Todos',            icon: '🌸' },
  { id: 'rosas',      name: 'Rosas',            icon: '🌹' },
  { id: 'amarillas',  name: 'Flores Amarillas', icon: '🌻' },
  { id: 'noche',      name: 'Noche Estrellada', icon: '🌙' },
  { id: 'snoopy',     name: 'Snoopy',           icon: '🐶' },
  { id: 'macetas',    name: 'Macetas',          icon: '🌱' },
  { id: 'rapunzel',   name: 'Rapunzel',         icon: '🌸' },
  { id: 'especial',   name: 'Especiales',       icon: '✨' },
  { id: 'amigurumis', name: 'Amigurumis',       icon: '🧸' },
];

/* ══════════════════════════════════════════
   PRODUCTOS (fallback — se reemplazan con Supabase)
   ══════════════════════════════════════════ */
const products = [

  // ── ROSAS ──────────────────────────────────────────────────────────
  { id:1,  name:'Ramo de rosas',           desc:'Envío gratis', price:93000,  emoji:'🌹', img:'', imgs:[], cat:'rosas',      badge:'',        badgeClass:'',     activo:true },
  { id:2,  name:'Rosas eternas',           desc:'Envío gratis', price:59000,  emoji:'🌹', img:'', imgs:[], cat:'rosas',      badge:'',        badgeClass:'',     activo:true },
  { id:3,  name:'Ramo tres rosas',         desc:'Envío gratis', price:77000,  emoji:'🌹', img:'', imgs:[], cat:'rosas',      badge:'',        badgeClass:'',     activo:true },
  { id:4,  name:'Ramo amora',              desc:'Envío gratis', price:107000, emoji:'🌹', img:'', imgs:[], cat:'rosas',      badge:'Popular', badgeClass:'',     activo:true },
  { id:5,  name:'Cuatro rosas',            desc:'Envío gratis', price:85000,  emoji:'🌹', img:'', imgs:[], cat:'rosas',      badge:'',        badgeClass:'',     activo:true },

  // ── FLORES AMARILLAS ───────────────────────────────────────────────
  { id:6,  name:'Trío de girasoles',       desc:'Envío gratis', price:77000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'Popular', badgeClass:'',     activo:true },
  { id:7,  name:'Ramo amor ideal',         desc:'Envío gratis', price:75000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:8,  name:'Ramo girasoles grande',   desc:'Envío gratis', price:110000, emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:9,  name:'Primavera',               desc:'Envío gratis', price:84000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:10, name:'Ramo amor natural',       desc:'Envío gratis', price:79000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:11, name:'Lirio y abejita',         desc:'Envío gratis', price:71000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:12, name:'Flor y miel',             desc:'Envío gratis', price:68000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },
  { id:13, name:'Lluvia de girasoles',     desc:'Envío gratis', price:98000,  emoji:'🌻', img:'', imgs:[], cat:'amarillas',  badge:'',        badgeClass:'',     activo:true },

  // ── NOCHE ESTRELLADA ───────────────────────────────────────────────
  { id:14, name:'Ramo unión',              desc:'El color varía según tu elección',  price:98000,  emoji:'💙', img:'', imgs:[], cat:'noche', badge:'',        badgeClass:'', activo:true },
  { id:15, name:'Sueño de Van Gogh',       desc:'Envío gratis',                      price:80000,  emoji:'💙', img:'', imgs:[], cat:'noche', badge:'',        badgeClass:'', activo:true },
  { id:16, name:'Delirio de Van Gogh',     desc:'Envío gratis',                      price:92000,  emoji:'💙', img:'', imgs:[], cat:'noche', badge:'Popular', badgeClass:'', activo:true },
  { id:17, name:'Ramo noche estrellada',   desc:'Envío gratis',                      price:135000, emoji:'💙', img:'', imgs:[], cat:'noche', badge:'Especial',badgeClass:'', activo:true },
  { id:18, name:'Margaritas bajo estrellas',desc:'El tono del papel puede cambiar',  price:89000,  emoji:'💙', img:'', imgs:[], cat:'noche', badge:'',        badgeClass:'', activo:true },

  // ── SNOOPY ─────────────────────────────────────────────────────────
  { id:19, name:'Duo de rosas Snoopy',     desc:'Envío gratis',                      price:82000, emoji:'🐶', img:'', imgs:[], cat:'snoopy', badge:'Popular', badgeClass:'',    activo:true },
  { id:20, name:'Ramo Snoopy clásico',     desc:'Envío gratis',                      price:75000, emoji:'🐶', img:'', imgs:[], cat:'snoopy', badge:'',        badgeClass:'',    activo:true },
  { id:21, name:'Snoopy con margaritas',   desc:'Envío gratis',                      price:78000, emoji:'🐶', img:'', imgs:[], cat:'snoopy', badge:'',        badgeClass:'',    activo:true },
  { id:22, name:'Snoopy girasoles',        desc:'Envío gratis',                      price:80000, emoji:'🐶', img:'', imgs:[], cat:'snoopy', badge:'',        badgeClass:'',    activo:true },
  { id:23, name:'Tulipanes Snoopy amor',   desc:'Envío gratis a nivel nacional',     price:77000, emoji:'🐶', img:'', imgs:[], cat:'snoopy', badge:'Nuevo',   badgeClass:'nuevo',activo:true },

  // ── MACETAS ────────────────────────────────────────────────────────
  { id:24, name:'Maceta tulipanes',           desc:'Envío gratis', price:74000, emoji:'🌱', img:'', imgs:[], cat:'macetas', badge:'',      badgeClass:'',     activo:true },
  { id:25, name:'Maceta girasol',             desc:'Envío gratis', price:63000, emoji:'🌱', img:'', imgs:[], cat:'macetas', badge:'',      badgeClass:'',     activo:true },
  { id:26, name:'Maceta margarita',           desc:'Envío gratis', price:75000, emoji:'🌱', img:'', imgs:[], cat:'macetas', badge:'',      badgeClass:'',     activo:true },
  { id:27, name:'Maceta orquídea',            desc:'Envío gratis', price:76000, emoji:'🌱', img:'', imgs:[], cat:'macetas', badge:'',      badgeClass:'',     activo:true },
  { id:28, name:'Maceta lirio mágico',        desc:'Envío gratis', price:72000, emoji:'🌱', img:'', imgs:[], cat:'macetas', badge:'',      badgeClass:'',     activo:true },
  { id:29, name:'Maceta lirio mágico con abejita',desc:'Envío gratis',price:78000,emoji:'🌱',img:'',imgs:[],cat:'macetas', badge:'Nuevo', badgeClass:'nuevo',activo:true },

  // ── RAPUNZEL ───────────────────────────────────────────────────────
  { id:30, name:'Lirio mágico Rapunzel',      desc:'Envío gratis', price:59500, emoji:'🌸', img:'', imgs:[], cat:'rapunzel', badge:'',      badgeClass:'', activo:true },
  { id:31, name:'Ramo Rapunzel con Pascal',   desc:'Envío gratis', price:77000, emoji:'🌸', img:'', imgs:[], cat:'rapunzel', badge:'',      badgeClass:'', activo:true },

  // ── ESPECIALES ─────────────────────────────────────────────────────
  { id:32, name:'Ramo gatito',                    desc:'Color personalizado según tu Michi',              price:98000,  emoji:'🐱', img:'', imgs:[], cat:'especial', badge:'Popular', badgeClass:'',     activo:true },
  { id:33, name:'Ramo Hello Rosas',               desc:'Envío gratis',                                   price:89000,  emoji:'✨', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:34, name:'Ramo lirios eternos',            desc:'Envío gratis',                                   price:110000, emoji:'✨', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:35, name:'Ramo orquídea y lavanda',        desc:'Envío gratis',                                   price:81000,  emoji:'💜', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:36, name:'Tulipanes abiertos',             desc:'El color puede variar según preferencias',       price:143000, emoji:'🌷', img:'', imgs:[], cat:'especial', badge:'Especial',badgeClass:'',     activo:true },
  { id:37, name:'Ramo osito grado',               desc:'Envío gratis',                                   price:83000,  emoji:'🐻', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:38, name:'Tulipanes con no me olvides',    desc:'Incluye cinco flores no me olvides',             price:67000,  emoji:'🌷', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:39, name:'Duo tulipanes',                  desc:'Envío gratis',                                   price:56000,  emoji:'🌷', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:40, name:'Duo Hello Kitty',                desc:'Envío gratis',                                   price:67000,  emoji:'🎀', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:41, name:'Hello Kitty lluvia de flores',   desc:'Precio según personalización — consultar',       price:0,      emoji:'🎀', img:'', imgs:[], cat:'especial', badge:'Nuevo',   badgeClass:'nuevo',activo:true },
  { id:42, name:'Ramo Cinnamoroll',               desc:'Envío gratis',                                   price:85000,  emoji:'🩵', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:43, name:'Ramo Kurumi',                    desc:'Envío gratis',                                   price:107000, emoji:'✨', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:44, name:'Ramo cerdito',                   desc:'Color de tulipanes según tu preferencia',        price:61000,  emoji:'🐷', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:45, name:'Ramo Hello Kitty clásico',       desc:'Envío gratis',                                   price:79000,  emoji:'🎀', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:46, name:'Virgencita de Fátima',           desc:'Envío gratis',                                   price:122000, emoji:'🙏', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:47, name:'Virgencita del Carmen',          desc:'Envío gratis',                                   price:127000, emoji:'🙏', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:48, name:'Fresa corazón',                  desc:'Envío gratis',                                   price:89000,  emoji:'🍓', img:'', imgs:[], cat:'especial', badge:'Nuevo',   badgeClass:'nuevo',activo:true },
  { id:49, name:'Ramo margaritas',                desc:'Envío gratis',                                   price:83000,  emoji:'🌼', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:50, name:'Fruta del diablo',               desc:'Envío gratis',                                   price:100000, emoji:'😈', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:51, name:'Ramo lirios',                    desc:'Envío gratis',                                   price:73000,  emoji:'🌸', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:52, name:'Duo Shrek',                      desc:'Envío gratis',                                   price:77000,  emoji:'🟢', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:53, name:'Ramo súper héroes',              desc:'Envío gratis',                                   price:73000,  emoji:'🦸', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:54, name:'Bolso girasoles',                desc:'Solo bajo pedido, envío gratis',                 price:161000, emoji:'👜', img:'', imgs:[], cat:'especial', badge:'Especial',badgeClass:'',     activo:true },
  { id:55, name:'Gran ramo de grado',             desc:'Dos lirios + cuatro rosas + cinco no me olvides',price:250000, emoji:'🎓', img:'', imgs:[], cat:'especial', badge:'Especial',badgeClass:'',     activo:true },
  { id:56, name:'Ramo mixto amarillo',            desc:'La combinación perfecta',                        price:79000,  emoji:'🌻', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:57, name:'Vaquita muuu',                   desc:'Envío gratis',                                   price:125000, emoji:'🐄', img:'', imgs:[], cat:'especial', badge:'Nuevo',   badgeClass:'nuevo',activo:true },
  { id:58, name:'Ramo lirios eternidad',          desc:'Tres lirios acompañados de flores secas',        price:110000, emoji:'🌸', img:'', imgs:[], cat:'especial', badge:'',        badgeClass:'',     activo:true },
  { id:59, name:'PUCCA',                          desc:'Envío gratis a nivel nacional',                  price:125000, emoji:'🖤', img:'', imgs:[], cat:'especial', badge:'Popular', badgeClass:'',     activo:true },

  // ── AMIGURUMIS ─────────────────────────────────────────────────────
  { id:60, name:'Amigurumi Coraline',             desc:'Envío gratis',                                   price:138000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'Popular', badgeClass:'',     activo:true },
  { id:61, name:'It Takes Two pareja',            desc:'Envío gratis',                                   price:250000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'Especial',badgeClass:'',     activo:true },
  { id:62, name:'Goku y Milk',                   desc:'Envío gratis',                                   price:127000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'',        badgeClass:'',     activo:true },
  { id:63, name:'Harry Potter',                   desc:'Incluye capa, sombrero, varita, gafas y uniforme',price:143000,emoji:'🧙', img:'', imgs:[], cat:'amigurumis', badge:'Popular', badgeClass:'',     activo:true },
  { id:64, name:'Batman',                         desc:'Envío gratis',                                   price:125000, emoji:'🦇', img:'', imgs:[], cat:'amigurumis', badge:'',        badgeClass:'',     activo:true },
  { id:65, name:'Tal cual',                       desc:'Envío gratis',                                   price:110000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'',        badgeClass:'',     activo:true },
  { id:66, name:'Messi o Cristiano',              desc:'Se puede escoger el uniforme',                   price:125000, emoji:'⚽', img:'', imgs:[], cat:'amigurumis', badge:'Popular', badgeClass:'',     activo:true },
  { id:67, name:'Mulan',                          desc:'Envío gratis',                                   price:138000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'',        badgeClass:'',     activo:true },
  { id:68, name:'Luffy animé',                    desc:'Envío gratis',                                   price:137000, emoji:'🏴‍☠️', img:'', imgs:[], cat:'amigurumis', badge:'Nuevo',   badgeClass:'nuevo',activo:true },
  { id:69, name:'Amigurumi personalizado',        desc:'Precio varía según detalles y accesorios',       price:130000, emoji:'🧸', img:'', imgs:[], cat:'amigurumis', badge:'Especial',badgeClass:'',     activo:true },
  { id:70, name:'Amigurumi de grado personalizado',desc:'Personalizado con foto de referencia',          price:132000, emoji:'🎓', img:'', imgs:[], cat:'amigurumis', badge:'Especial',badgeClass:'',     activo:true },
];
