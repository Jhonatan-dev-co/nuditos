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

export const products: Product[] = [];

export const getEditorialBanners = () => {
  return [];
};


export const slugify = (text: string) => {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
};

export function clUrl(url: string, width: number = 600) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('upload/v')) {
    return url.replace('upload/v', `upload/q_auto,f_auto,w_${width}/v`);
  }
  if (!url.includes('upload/q_auto')) {
     return url.replace('upload/', `upload/q_auto,f_auto,w_${width}/`);
  }
  return url;
}

