// src/utils/products.mock.ts
import { Product } from "@/types/shop.types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Par Lâmpada LED C6 H4 Super Branca",
    slug: "par-lampada-led-c6-h4",
    description: "Iluminação automotiva de alta performance com cooler integrado para dissipação de calor.",
    price: 89.90,
    image_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60",
    weight: 350,
    stock: 15,
    category_id: "cat-1",
    categories: { id: "cat-1", name: "Iluminação", slug: "iluminacao" }
  },
  {
    id: "prod-2",
    name: "Jogo de Chaves Fixas Combinadas CR-V (6 a 22mm)",
    slug: "jogo-de-chaves-combinadas-crv",
    description: "Kit profissional com 12 peças em aço Cromo Vanádio com acabamento fosco premium.",
    price: 149.90,
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
    weight: 1800,
    stock: 8,
    category_id: "cat-2",
    categories: { id: "cat-2", name: "Ferramentas", slug: "ferramentas" }
  },
  {
    id: "prod-3",
    name: "Cera Carnaúba Hidrofóbica Premium 200g",
    slug: "cera-carnauba-hidrofobica-premium",
    description: "Brilho profundo de alto reflexo e proteção contra raios UV com repelência a água.",
    price: 54.00,
    image_url: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop&q=60",
    weight: 250,
    stock: 22,
    category_id: "cat-3",
    categories: { id: "cat-3", name: "Limpeza", slug: "limpeza" }
  },
  {
    id: "prod-4",
    name: "Aspirador de Pó Automotivo Portátil 12V 60W",
    slug: "aspirador-de-po-automotivo-12v",
    description: "Alta potência de sucção, ideal para limpeza rápida de estofados e carpetes do veículo.",
    price: 119.00,
    image_url: "https://images.unsplash.com/photo-1599256621730-535171e28e50?w=500&auto=format&fit=crop&q=60",
    weight: 850,
    stock: 5,
    category_id: "cat-3",
    categories: { id: "cat-3", name: "Limpeza", slug: "limpeza" }
  }
];