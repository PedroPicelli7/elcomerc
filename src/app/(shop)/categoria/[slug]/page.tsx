// src/app/(shop)/categoria/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client";
import { Product } from "@/types/shop.types";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, ShoppingCart, Package, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      async function loadCategoryProducts() {
        try {
          setLoading(true);

          // 1. Busca primeiro a categoria para saber o nome real e validar o ID
          const { data: catData, error: catError } = await supabaseClient
            .from("categories")
            .select("id, name")
            .eq("slug", slug)
            .single();

          if (catError || !catData) {
            setCategoryName("Categoria não encontrada");
            return;
          }

          setCategoryName(catData.name);

          // 2. Busca todos os produtos vinculados a essa categoria específica
          const { data: prodData, error: prodError } = await supabaseClient
            .from("products")
            .select(`
              id, name, slug, description, price, image_url, weight, stock, category_id,
              categories ( id, name, slug )
            `)
            .eq("category_id", catData.id)
            .order("name");

          if (prodError) throw prodError;

          setProducts(
            (prodData || []).map((p: any) => ({
              ...p,
              price: Number(p.price),
            }))
          );
        } catch (err) {
          console.error("Erro ao carregar vitrine da categoria:", err);
        } finally {
          setLoading(false);
        }
      }
      loadCategoryProducts();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 font-mono text-xs">
        [ ORGANIZANDO PRATELEIRAS DA CATEGORIA... ]
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl space-y-6">
        
        {/* Voltar */}
        <div>
          <Link href="/" className="flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> [ Voltar para o catálogo geral ]
          </Link>
        </div>

        {/* Cabeçalho da Seção */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
          <div>
            <span className="text-[10px] font-black tracking-widest text-orange-500 font-mono uppercase">
              Filtrado por Seção
            </span>
            <h1 className="text-2xl font-black text-white font-mono uppercase mt-1">
              Setor: <span className="text-orange-500">{categoryName}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
            <SlidersHorizontal className="h-3.5 w-3.5 text-orange-500/80" />
            <span>{products.length} {products.length === 1 ? 'item encontrado' : 'itens encontrados'}</span>
          </div>
        </div>

        {/* VITRINE DE PRODUTOS */}
        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl font-mono text-xs text-neutral-500">
            Nenhum produto cadastrado nesta seção no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 transition-all hover:border-neutral-700 hover:bg-neutral-900"
              >
                {/* Imagem do Produto */}
                <div className="aspect-square w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 group-hover:opacity-90 transition-opacity">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Detalhes Textuais */}
                <div className="mt-4 space-y-1 flex-1">
                  <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {product.weight}g</span>
                    <span>Estoque: {product.stock} un</span>
                  </div>
                </div>

                {/* Bloco de Venda / Rodapé do Card */}
                <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between font-mono">
                  <span className="text-base font-black text-white">
                    {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="flex h-9 items-center justify-center gap-1.5 rounded bg-orange-500 px-3 text-xs font-black text-black hover:bg-orange-400 transition-colors disabled:opacity-30 uppercase tracking-tight"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </>
  );
}