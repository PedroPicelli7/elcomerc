// src/services/api/products.ts
import { createSupabaseServerClient } from "@/services/supabase/server";
import { withTimeout } from "@/utils/supabase-race";
import { Product, Category } from "@/types/shop.types";

/**
 * Busca todas as categorias cadastradas no banco
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  
  try {
    const query = supabase.from("categories").select("id, name, slug").order("name");
    
    // Convertendo explicitamente a estrutura de builders do Supabase para uma Promise limpa
    const { data, error } = await withTimeout<any>(query as any);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

/**
 * Busca os produtos com JOIN relacional na categoria
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();

  try {
    const query = supabase
      .from("products")
      .select(`
        id, name, slug, description, price, image_url, weight, stock, category_id,
        categories ( id, name, slug )
      `)
      .order("created_at", { ascending: false });

    // Resolvendo o conflito de assinaturas de tipos complexos do Postgrest
    const { data, error } = await withTimeout<any>(query as any);

    if (error) throw error;
    
    return (data as any[])?.map((prod) => ({
      ...prod,
      price: Number(prod.price),
    })) || [];

  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}