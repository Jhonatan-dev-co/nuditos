export interface FaqItem {
  q: string;
  a: string;
}

export interface CommercialLandingConfig {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  eyebrow: string;
  heroCopy: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  audience: string;
  occasionBlockTitle: string;
  occasionBlockCopy: string;
  whyTitle: string;
  whyCopy: string;
  ctaLabel: string;
  relatedLinks: { label: string; href: string }[];
  productHints: string[];
  faq: FaqItem[];
}

export interface CityLandingConfig {
  slug: string;
  city: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  heroCopy: string;
  coverageCopy: string;
  localFaq: FaqItem[];
  relatedLinks: { label: string; href: string }[];
}

export const COMMERCIAL_LANDINGS: Record<string, CommercialLandingConfig> = {
  'regalo-para-esposa': {
    slug: 'regalo-para-esposa',
    title: 'Regalo para Esposa en Colombia | Flores Tejidas que Duran Años',
    description: 'Encuentra un regalo para tu esposa que simbolice amor eterno. Flores tejidas a crochet con acabado impecable y envío a toda Colombia.',
    keywords: 'regalo para esposa, regalos romanticos esposa, flores tejidas para esposa, detalle aniversario esposa, ramo crochet colombia',
    h1: 'Un regalo para tu esposa que cuenta una historia',
    eyebrow: 'Detalles que no se marchitan',
    heroCopy: 'Sorpréndela con algo tan duradero como su relación. Nuestros ramos de flores tejidas a mano son la alternativa perfecta a lo tradicional, ideales para decorar su rincón favorito.',
    primaryKeyword: 'regalo para esposa',
    secondaryKeywords: ['regalo aniversario esposa', 'flores eternas colombia', 'detalle hecho a mano'],
    audience: 'Esposos que buscan un detalle emocional, duradero y con un toque artístico único.',
    occasionBlockTitle: 'Momentos inolvidables',
    occasionBlockCopy: 'Ya sea para celebrar un aniversario de bodas, su cumpleaños o simplemente un martes cualquiera para recordarle cuánto la amas.',
    whyTitle: 'La magia de lo eterno frente a lo natural',
    whyCopy: 'A diferencia de las flores naturales, los ramos de Nuditos mantienen sus colores vivos y su forma original por años, sin necesidad de agua ni cuidados constantes.',
    ctaLabel: 'Ver ramos para ella',
    relatedLinks: [
      { label: 'Regalos de aniversario', href: '/regalos-de-aniversario' },
      { label: 'Regalo para novia', href: '/regalo-para-novia' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
    productHints: ['rosa', 'corazon', 'aniversario', 'amor'],
    faq: [
      { q: '¿Qué regalo para esposa dura más?', a: 'Nuestras flores tejidas son piezas de arte que pueden durar décadas si se mantienen alejadas del polvo excesivo y la humedad.' },
      { q: '¿Puedo elegir sus colores favoritos?', a: '¡Claro! Podemos asesorarte por WhatsApp para crear una combinación que encaje perfecto con su personalidad.' },
      { q: '¿Hacen envíos nacionales?', a: 'Sí, despachamos con empaque protegido desde nuestra sede a cualquier rincón de Colombia.' },
    ],
  },
  'flores-amarillas': {
    slug: 'flores-amarillas',
    title: 'Flores Amarillas Tejidas | El Regalo Eterno de Septiembre en Colombia',
    description: 'Celebra la tradición de las flores amarillas con ramos de crochet que nunca se mueren. El detalle perfecto para amistades y nuevos comienzos.',
    keywords: 'flores amarillas tejidas, flores amarillas septiembre colombia, girasoles crochet, regalo flores amarillas, flores eternas amarillas',
    h1: 'Lleva la alegría de las flores amarillas a otro nivel',
    eyebrow: 'Tradición y luz en cada puntada',
    heroCopy: 'No dejes que el regalo de septiembre dure solo una semana. Nuestras flores amarillas tejidas son un rayo de sol permanente que ilumina cualquier espacio.',
    primaryKeyword: 'flores amarillas tejidas',
    secondaryKeywords: ['flores amarillas septiembre', 'girasoles tejidos', 'regalo amistad colombia'],
    audience: 'Personas que quieren cumplir con el detalle de las flores amarillas pero buscan algo más original y duradero.',
    occasionBlockTitle: '¿Cuándo regalarlas?',
    occasionBlockCopy: 'Esenciales para el 21 de septiembre, pero también para desear éxitos, celebrar graduaciones o alegrar el día de tu mejor amiga.',
    whyTitle: 'Luz que no se apaga',
    whyCopy: 'Nuestros girasoles y rosas amarillas están tejidos con hilos de alta calidad que no pierden su brillo, convirtiéndose en un recuerdo tangible de tu buen deseo.',
    ctaLabel: 'Ver ramos amarillos',
    relatedLinks: [
      { label: 'Regalos amor y amistad', href: '/regalos-amor-y-amistad' },
      { label: 'Regalos para amiga', href: '/regalos-para-amiga' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
    productHints: ['amarilla', 'girasol', 'sol', 'alegria'],
    faq: [
      { q: '¿Por qué regalar flores amarillas tejidas?', a: 'Porque representan alegría y energía positiva, y al ser tejidas, el mensaje de optimismo dura para siempre.' },
      { q: '¿Tienen girasoles disponibles?', a: 'Sí, son nuestro producto estrella para esta categoría por su gran nivel de detalle.' },
    ],
  },
  'regalos-para-novia': {
    slug: 'regalos-para-novia',
    title: 'Regalo para Novia | Ramos de Flores Tejidas con Amor en Colombia',
    description: 'Encuentra el detalle ideal para tu novia. Flores que no se marchitan, amigurumis tiernos y ramos personalizados hechos a mano.',
    keywords: 'regalo para novia colombia, detalles para novia, flores tejidas para mi novia, regalo romántico artesanal',
    h1: 'Sorprende a tu novia con un detalle que hable por ti',
    eyebrow: 'Puntadas de puro romance',
    heroCopy: 'Si buscas salir de lo común y darle algo que realmente conserve, nuestros ramos de crochet son la respuesta. Un regalo delicado, suave y eterno.',
    primaryKeyword: 'regalo para novia colombia',
    secondaryKeywords: ['detalle romántico para novia', 'flores eternas novia', 'regalos personalizados colombia'],
    audience: 'Novios que buscan un regalo con carga emocional, alejado de lo industrial y fabricado masivamente.',
    occasionBlockTitle: 'Para cada etapa',
    occasionBlockCopy: 'Desde el primer mes de novios hasta el aniversario más importante, nuestras flores se adaptan a la intensidad de su historia.',
    whyTitle: 'Un gesto que se queda con ella',
    whyCopy: 'A diferencia de las flores que terminan en la basura en pocos días, un ramo de Nuditos se queda en su mesa de noche como un recordatorio constante de tu amor.',
    ctaLabel: 'Ver detalles para ella',
    relatedLinks: [
      { label: 'Regalos de aniversario', href: '/regalos-de-aniversario' },
      { label: 'Flores amarillas', href: '/flores-amarillas' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
    productHints: ['novia', 'amor', 'romantico', 'tulipan'],
    faq: [
      { q: '¿Qué flores le gustan más a las novias?', a: 'Nuestros tulipanes y rosas rojas tejidas son los favoritos por su elegancia y significado romántico.' },
      { q: '¿Puedo enviar una nota de amor?', a: '¡Por supuesto! Coordinamos cada detalle para que la sorpresa sea completa.' },
    ],
  },
  'regalos-dia-de-la-madre': {
    slug: 'regalos-dia-de-la-madre',
    title: 'Regalos para el Día de la Madre | Flores que Mamá Conservará Siempre',
    description: 'El mejor regalo para mamá: flores tejidas que no requieren agua y decoran su hogar con calidez. Envío nacional en Colombia.',
    keywords: 'regalos dia de la madre colombia, flores para mamá, detalles madre, ramos crochet mamá',
    h1: 'Para la mujer que lo merece todo: flores eternas',
    eyebrow: 'Gratitud en cada tejido',
    heroCopy: 'Mamá se merece algo tan resistente y hermoso como su amor. Regálale un ramo que no tenga que cuidar, pero que pueda admirar todos los días del año.',
    primaryKeyword: 'regalos dia de la madre colombia',
    secondaryKeywords: ['detalle para mamá', 'flores eternas mamá', 'regalo artesanal madre'],
    audience: 'Hijos e hijas que buscan un regalo elegante, con valor artesanal y que encaje perfecto en la decoración del hogar.',
    occasionBlockTitle: 'Más que un día',
    occasionBlockCopy: 'Aunque mayo es su mes, cualquier día es perfecto para agradecerle con un detalle que ella podrá lucir con orgullo en su sala.',
    whyTitle: 'Compañía sin mantenimiento',
    whyCopy: 'Nuestros ramos son perfectos para mamás que aman la naturaleza pero no tienen tiempo de cuidar plantas reales. Cero agua, cero marchitamiento.',
    ctaLabel: 'Ver ramos para mamá',
    relatedLinks: [
      { label: 'Regalos para esposa', href: '/regalo-para-esposa' },
      { label: 'Catálogo de ramos', href: '/catalogo' },
    ],
    productHints: ['mama', 'ramo', 'rosa', 'hogar'],
    faq: [
      { q: '¿Llegan a tiempo para el Día de la Madre?', a: 'Recomendamos pedir con al menos 5 días de anticipación para garantizar la entrega en fechas tan especiales.' },
      { q: '¿Son flores resistentes?', a: 'Sí, están tejidas con hilos firmes que mantienen la estructura del ramo por años.' },
    ],
  },
};

export const CITY_LANDINGS: Record<string, CityLandingConfig> = {
  'ramos-de-flores-bogota': {
    slug: 'ramos-de-flores-bogota',
    city: 'Bogotá',
    title: 'Ramos de Flores en Bogotá | Regalos a Domicilio que Perduran',
    description: 'Envía ramos de flores tejidas en Bogotá. El regalo ideal para cualquier clima, sin marchitamiento y con entrega personalizada.',
    keywords: 'ramos de flores bogota, flores tejidas bogota, regalos a domicilio bogota, detalles bogota domicilio',
    h1: 'Ramos de flores en Bogotá con alma artesanal',
    heroCopy: 'En el corazón de la capital, entregamos gestos que no se desvanecen con el frío. Nuestros ramos de crochet son la opción preferida para quienes buscan originalidad y calidez en cada detalle.',
    coverageCopy: 'Realizamos entregas en toda Bogotá (Norte, Sur, Centro y Occidente) y municipios cercanos. Coordinamos la hora y el lugar exacto para que tu sorpresa sea impecable.',
    localFaq: [
      { q: '¿Hacen entregas en oficinas?', a: 'Sí, es uno de nuestros servicios más solicitados en zonas empresariales de Bogotá.' },
      { q: '¿Cómo soportan el clima de Bogotá?', a: 'A diferencia de las naturales, nuestras flores tejidas no sufren por los cambios de temperatura de la ciudad.' },
    ],
    relatedLinks: [
      { label: 'Detalles a domicilio Bogotá', href: '/detalles-a-domicilio-bogota' },
      { label: 'Flores tejidas Bogotá', href: '/flores-tejidas-bogota' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
  },
  'ramos-de-flores-medellin': {
    slug: 'ramos-de-flores-medellin',
    city: 'Medellín',
    title: 'Ramos de Flores en Medellín | Detalles Artesanales a Domicilio',
    description: 'Encuentra los ramos de flores más originales en Medellín. Flores tejidas a mano que duran para siempre. Envío seguro y rápido.',
    keywords: 'ramos de flores medellin, flores tejidas medellin, regalos medellin domicilio, detalles originales medellin',
    h1: 'Flores eternas en la ciudad de la eterna primavera',
    heroCopy: 'En Medellín sabemos apreciar la belleza de una flor, por eso nuestras piezas tejidas rinden homenaje a la tradición floral de la región con un toque moderno y duradero.',
    coverageCopy: 'Cubrimos todo el Valle de Aburrá, desde Medellín hasta Envigado, Itagüí y Sabaneta. Nos aseguramos de que cada ramo llegue en perfectas condiciones.',
    localFaq: [
      { q: '¿Puedo enviar un ramo de sorpresa?', a: '¡Claro! La mayoría de nuestros pedidos en Medellín son sorpresas para cumpleaños o aniversarios.' },
      { q: '¿Tienen entrega inmediata?', a: 'Sujeto a disponibilidad; siempre te confirmaremos el tiempo exacto por WhatsApp.' },
    ],
    relatedLinks: [
      { label: 'Detalles domicilio Medellín', href: '/detalles-a-domicilio-medellin' },
      { label: 'Regalos originales Colombia', href: '/regalos-originales-colombia' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
  },
  'ramos-de-flores-cali': {
    slug: 'ramos-de-flores-cali',
    city: 'Cali',
    title: 'Ramos de Flores en Cali | Regalos que Enamoran en el Valle',
    description: 'Ramos de flores tejidas en Cali con envío a domicilio. Sorprende con un detalle único hecho a mano que nunca se marchita.',
    keywords: 'ramos de flores cali, flores tejidas cali, regalos cali domicilio, detalles cali personalizados',
    h1: 'Detalles en Cali para celebrar con alegría',
    heroCopy: 'Lleva el colorido del Valle a tu regalo con nuestras flores tejidas. Ideales para resistir el calor de la ciudad sin perder su forma ni su belleza original.',
    coverageCopy: 'Llegamos a todos los sectores de Cali y zonas aledañas. Coordinamos la logística por WhatsApp para garantizar que tu regalo llegue justo a tiempo.',
    localFaq: [
      { q: '¿Las flores se dañan con el calor?', a: 'En absoluto. Al ser tejidas con hilos de calidad, mantienen su estructura intacta sin importar el clima.' },
      { q: '¿Cómo hago el pedido?', a: 'Puedes elegir tu ramo favorito aquí y escribirnos directamente para acordar la entrega.' },
    ],
    relatedLinks: [
      { label: 'Detalles domicilio Cali', href: '/detalles-a-domicilio-cali' },
      { label: 'Regalos para novia', href: '/regalo-para-novia' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
  },
  'ramos-de-flores-barranquilla': {
    slug: 'ramos-de-flores-barranquilla',
    city: 'Barranquilla',
    title: 'Ramos de Flores en Barranquilla | Regalos con Sabor a Mar y Crochet',
    description: 'En Barranquilla regala flores que duran tanto como tu cariño. Ramos tejidos a crochet con envío a domicilio y atención personalizada.',
    keywords: 'ramos de flores barranquilla, flores tejidas barranquilla, detalles barranquilla domicilio',
    h1: 'Ramos de flores en Barranquilla: Brisa y Arte',
    heroCopy: 'Sorprende en la Arenosa con un detalle que aguanta hasta el sol más fuerte. Nuestras flores tejidas son la opción más fresca y duradera para tus regalos especiales.',
    coverageCopy: 'Cobertura completa en Barranquilla y Soledad. Nos encargamos de que el empaque sea seguro para que el ramo llegue impecable a su destino.',
    localFaq: [
      { q: '¿Hacen entregas los fines de semana?', a: 'Sí, coordinamos entregas según agenda previa para que no te pierdas ninguna celebración.' },
      { q: '¿Qué tan reales se ven?', a: 'Nuestros clientes aman el detalle de las hojas y pétalos; tienen una textura artesanal muy especial.' },
    ],
    relatedLinks: [
      { label: 'Regalos originales Colombia', href: '/regalos-originales-colombia' },
      { label: 'Flores tejidas a crochet', href: '/flores-tejidas-a-crochet' },
      { label: 'Catálogo completo', href: '/catalogo' },
    ],
  },
};
