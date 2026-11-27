import { imageAsset } from '../lib/asset'

export type TintName = 'sage' | 'butter' | 'sand' | 'blush' | 'sky' | 'stone'

export interface ProductFinish {
  name: string
  color: string
}

export interface StarterCategory {
  id: string
  name: string
  tint: TintName
  image: string
}

export interface StarterProduct {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviews: number
  tint: TintName
  image: string
  scene?: string | null
  stock: number
  badge?: string | null
  blurb: string
  finishes: ProductFinish[]
  details: string[]
  dimensions: string
  care: string
}

export const CATEGORIES: StarterCategory[] = [
  { id: 'seating', name: 'Seating', tint: 'sage', image: imageAsset('chair.webp') },
  { id: 'lighting', name: 'Lighting', tint: 'butter', image: imageAsset('pendant.webp') },
  { id: 'tables', name: 'Tables', tint: 'sand', image: imageAsset('table.webp') },
  { id: 'textiles', name: 'Textiles', tint: 'blush', image: imageAsset('throw.webp') },
  { id: 'ceramics', name: 'Ceramics', tint: 'sky', image: imageAsset('vase.webp') },
]

export const PRODUCTS: StarterProduct[] = [
  {
    id: 'bolle-lounge-chair',
    name: 'Bolle Lounge Chair',
    category: 'seating',
    price: 890,
    rating: 4.9,
    reviews: 312,
    tint: 'sage',
    image: imageAsset('chair.webp'),
    scene: imageAsset('best-chair.jpg'),
    stock: 42,
    badge: 'Bestseller',
    blurb:
      'A low, rounded lounge chair in heavy wool bouclé on four solid-oak legs. Deep enough to fold your legs under.',
    finishes: [
      { name: 'Oat bouclé', color: '#e9e3d7' },
      { name: 'Moss bouclé', color: '#5f6b4f' },
      { name: 'Clay bouclé', color: '#b97a5b' },
    ],
    details: [
      'Wool-blend bouclé, 780 g/m²',
      'Solid FSC® oak legs, oiled',
      'Removable seat cushion',
      'Arrives fully assembled',
    ],
    dimensions: 'W 82 × D 78 × H 74 cm · Seat height 40 cm',
    care: 'Vacuum weekly with a soft brush. Blot spills, never rub. Re-oil legs once a year.',
  },
  {
    id: 'linne-table-lamp',
    name: 'Linne Table Lamp',
    category: 'lighting',
    price: 189,
    rating: 4.8,
    reviews: 204,
    tint: 'butter',
    image: imageAsset('lamp.webp'),
    scene: imageAsset('best-lamp.jpg'),
    stock: 36,
    badge: 'New',
    blurb:
      'Hand-pleated linen shade over a turned oak base. Throws a warm, low pool of light for evenings that start early.',
    finishes: [
      { name: 'Natural linen', color: '#efe6d6' },
      { name: 'Sand linen', color: '#d8c4a4' },
    ],
    details: [
      'Pleated linen shade',
      'Turned solid oak base',
      'Dimmable E27, 2700K bulb included',
      '2 m braided cord',
    ],
    dimensions: 'Ø 30 × H 52 cm',
    care: 'Dust the shade with a dry brush. Wipe the base with a damp cloth.',
  },
  {
    id: 'moln-pendant',
    name: 'Moln Pendant',
    category: 'lighting',
    price: 249,
    rating: 4.7,
    reviews: 158,
    tint: 'sky',
    image: imageAsset('pendant.webp'),
    scene: imageAsset('interior.jpg'),
    stock: 28,
    blurb:
      'A paper-and-rice-fibre cloud that softens any bulb into a glow. Light enough to hang from a single hook.',
    finishes: [
      { name: 'Rice paper', color: '#f3efe6' },
      { name: 'Warm paper', color: '#e8dcc6' },
    ],
    details: [
      'Rice-fibre paper over steel frame',
      'Oak canopy and cord grip',
      'Adjustable 2.5 m drop',
      'E27, max 40 W LED',
    ],
    dimensions: 'Ø 48 × H 40 cm',
    care: 'Keep dry. Dust with a hairdryer on cool.',
  },
  {
    id: 'stubbe-stool',
    name: 'Stubbe Stool',
    category: 'seating',
    price: 210,
    rating: 4.8,
    reviews: 121,
    tint: 'sand',
    image: imageAsset('stool.webp'),
    stock: 16,
    blurb:
      'A three-legged milking stool carved from a single oak blank. Side table, plant stand or the extra seat at dinner.',
    finishes: [
      { name: 'Oiled oak', color: '#c8955a' },
      { name: 'Smoked oak', color: '#6e4a2c' },
    ],
    details: ['Solid FSC® oak', 'Hand-shaped seat', 'Holds 120 kg', 'Stackable in pairs'],
    dimensions: 'Ø 34 × H 46 cm',
    care: 'Wipe clean. Re-oil every 12 months.',
  },
  {
    id: 'rund-side-table',
    name: 'Rund Side Table',
    category: 'tables',
    price: 640,
    rating: 4.9,
    reviews: 97,
    tint: 'stone',
    image: imageAsset('table.webp'),
    scene: imageAsset('feature-detail.jpg'),
    stock: 9,
    badge: 'Low stock',
    blurb:
      'A pedestal table turned from laminated oak, with a top that takes coffee, books and the occasional elbow.',
    finishes: [
      { name: 'White oak', color: '#e2cfae' },
      { name: 'Ash grey', color: '#a7a299' },
    ],
    details: [
      'Laminated solid oak',
      'Matte hard-wax oil finish',
      'Felt-lined base',
      'Ships flat, assembles in 5 minutes',
    ],
    dimensions: 'Ø 60 × H 48 cm',
    care: 'Use coasters for hot cups. Refresh the wax twice a year.',
  },
  {
    id: 'vagn-wool-throw',
    name: 'Vagn Wool Throw',
    category: 'textiles',
    price: 129,
    rating: 4.9,
    reviews: 268,
    tint: 'blush',
    image: imageAsset('throw.webp'),
    scene: imageAsset('best-throw.jpg'),
    stock: 40,
    blurb:
      'Brushed lambswool woven with a single forest stripe and finished with a hand-knotted fringe.',
    finishes: [
      { name: 'Oat / forest', color: '#d9cfbd' },
      { name: 'Stone / ink', color: '#bdb7ad' },
    ],
    details: [
      '100% lambswool',
      'Brushed on both sides',
      'Hand-knotted fringe',
      'Woven in Portugal',
    ],
    dimensions: '130 × 180 cm',
    care: 'Air between uses. Dry clean or hand wash cold.',
  },
  {
    id: 'lera-vase',
    name: 'Lera Vase',
    category: 'ceramics',
    price: 78,
    rating: 4.6,
    reviews: 88,
    tint: 'sky',
    image: imageAsset('vase.webp'),
    stock: 30,
    blurb:
      'Thrown on the wheel in speckled stoneware and left unglazed outside, so the clay keeps its texture.',
    finishes: [
      { name: 'Speckled sand', color: '#cbbfa8' },
      { name: 'Charcoal', color: '#4a4744' },
    ],
    details: [
      'Speckled stoneware',
      'Glazed inside, watertight',
      'Each one slightly different',
      'Made in Denmark',
    ],
    dimensions: 'Ø 15 × H 30 cm',
    care: 'Hand wash. Not for the dishwasher.',
  },
  {
    id: 'skal-bowl',
    name: 'Skål Serving Bowl',
    category: 'ceramics',
    price: 56,
    rating: 4.7,
    reviews: 143,
    tint: 'butter',
    image: imageAsset('bowl.webp'),
    stock: 44,
    blurb:
      'A wide, low bowl in terracotta with a satin glaze. Salad on Sunday, lemons the rest of the week.',
    finishes: [
      { name: 'Terracotta', color: '#b9653d' },
      { name: 'Bone', color: '#e8e0d0' },
    ],
    details: ['Terracotta with satin glaze', 'Food safe', 'Dishwasher safe', 'Ø 28 cm'],
    dimensions: 'Ø 28 × H 11 cm',
    care: 'Dishwasher safe. Avoid sudden temperature changes.',
  },
  {
    id: 'kudde-cushion',
    name: 'Kudde Linen Cushion',
    category: 'textiles',
    price: 64,
    rating: 4.8,
    reviews: 176,
    tint: 'sage',
    image: imageAsset('cushion.webp'),
    stock: 52,
    blurb:
      'Stonewashed Belgian linen over a feather-and-down insert. Soft from day one, softer every wash.',
    finishes: [
      { name: 'Forest', color: '#3f4a36' },
      { name: 'Oat', color: '#ddd3c1' },
      { name: 'Rust', color: '#a65a3a' },
    ],
    details: ['Stonewashed Belgian linen', 'Feather and down insert', 'Hidden zip', '50 × 50 cm'],
    dimensions: '50 × 50 cm',
    care: 'Cover machine washes at 40°C. Tumble dry low.',
  },
]

export const CATEGORY_BY_ID: Record<string, StarterCategory> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)

export const TINT_BG: Record<TintName, string> = {
  sage: 'bg-sage',
  butter: 'bg-butter',
  sand: 'bg-sand',
  blush: 'bg-blush',
  sky: 'bg-sky',
  stone: 'bg-stone',
}
