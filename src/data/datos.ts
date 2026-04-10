export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  emoji: string;
  img: string;
  imgs: string[];
  cat: string;
  badge: string;
  badgeClass: string;
  activo: boolean;
  oferta?: boolean;
  precioOriginal?: number;
  envioGratis?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CONFIG_DEFAULT = {
  ramoDestacado:      17,
  carruselHero:       [17, 55, 63],
  descuentoActivo:    false,
  descuentoCodigo:    'NUDITOS10',
  descuentoPorcentaje:10,
  descuentoTexto:     '10% de descuento en tu primer pedido',
  wompiActivo:        false,
  wompiKey:           '',
  catViews:           {},
  metaPixelActivo:    false,
  metaPixelId:        '',
};

export const categories: Category[] = [
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

export const products: Product[] = [
  {
    id: 17,
    name: 'Ramo Sueño de Van Gogh',
    desc: 'Un tributo tejido a la Noche Estrellada con girasoles y rosas azules.',
    price: 85000,
    emoji: '🌻',
    img: 'https://images.unsplash.com/photo-1599307767316-776533da941c?q=80&w=800',
    imgs: [],
    cat: 'noche',
    badge: 'Popular',
    badgeClass: 'especial',
    activo: true,
    oferta: true,
    precioOriginal: 95000
  },
  {
    id: 55,
    name: 'Ramo Rosas Eternas',
    desc: 'Rosas que nunca se marchitan, símbolo de amor infinito.',
    price: 65000,
    emoji: '🌹',
    img: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?q=80&w=800',
    imgs: [],
    cat: 'rosas',
    badge: 'Nuevo',
    badgeClass: 'nuevo',
    activo: true
  }
];

export const getEditorialBanners = () => {
  return [];
};


export const slugify = (text: string) => {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
};

export function clUrl(url: string, width: number = 480) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  
  // Limpiamos la URL de cualquier transformación previa (anchos, calidad, formato) 
  // que pueda estar incrustada y cause duplicidad.
  let cleanUrl = url.replace(/upload\/[^\/]+\/v/i, 'upload/v');
  // Fallback para URLs sin versión
  if (cleanUrl === url) {
    cleanUrl = url.replace(/upload\/[^\/]+\//i, 'upload/');
  }

  if (cleanUrl.includes('upload/v')) {
    return cleanUrl.replace('upload/v', `upload/q_auto,f_auto,w_${width}/v`);
  }
  return cleanUrl.replace('upload/', `upload/q_auto,f_auto,w_${width}/`);
}

