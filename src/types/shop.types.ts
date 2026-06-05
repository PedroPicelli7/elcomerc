// src/types/shop.types.ts

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url: string;
  category: string;
  weight: number; // Em gramas (ex: 1500 para 1.5kg) - Essencial para o frete futuro
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}