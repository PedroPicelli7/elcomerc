// src/types/shop.types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url: string;
  weight: number; 
  stock: number;
  category_id: string;
  categories?: Category; // Campo injetado quando fazemos o JOIN relacional do Supabase
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingRule {
  id: string;
  city_name: string;
  base_fee: number;
  per_kg_fee: number;
  estimated_days: number;
}