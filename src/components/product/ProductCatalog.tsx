// src/components/product/ProductCatalog.tsx
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useDebounce } from "@/hooks/useDebounce";
import { supabaseClient } from "@/services/supabase/client";
import { Plus, Check, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types/shop.types";

export function ProductCatalog() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const categories = ["Todas", "Iluminação", "Ferramentas", "Limpeza"];

  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabaseClient
          .from("products")
          .select(`id, name, slug, price, stock, description, image_url, weight, category_id, categories ( name )`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setProducts(
          (data || []).map((p: any) => ({
            ...p,
            price: Number(p.price),
            stock: Number(p.stock),
          }))
        );
      } catch (err) {
        console.error("Erro ao sincronizar vitrine com Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const productCategoryName = product.categories?.name || (product as any).category || "Geral";
    const matchesCategory = selectedCategory === "Todas" || productCategoryName.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                          
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="w-full">
      {/* Barra de Filtros e Busca */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="O que você está procurando hoje?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 transition-all focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 self-end sm:self-auto">
          <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
          <span>
            {loading ? "Sincronizando..." : `${filteredProducts.length} itens encontrados`}
          </span>
        </div>
      </div>

      {/* Filtros Rápidos de Categorias com Scroll Lateral nativo no Mobile */}
      <div className="mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 font-mono text-xs min-w-max pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 font-bold tracking-tight uppercase border transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-brand-cyan text-black border-brand-cyan shadow-lg shadow-brand-cyan/20 scale-102"
                    : "bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Altamente Responsivo (2 colunas em telas pequenas) */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] w-full animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/40" />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const isAlreadyInCart = cart.some((item) => item.product.id === product.id);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3 sm:p-4 transition-all duration-300 hover:border-brand-cyan/30 hover:shadow-2xl hover:shadow-brand-cyan/5 animate-in fade-in slide-in-from-bottom-3 duration-500"
              >
                {/* Imagem Proporcional */}
                <Link href={`/produto/${product.slug}`} className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-950 block">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-104"
                    loading="lazy"
                  />
                </Link>

                <div className="flex flex-1 flex-col pt-3 sm:pt-4">
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-brand-cyan uppercase font-mono">
                    {product.categories?.name || "Geral"}
                  </span>

                  <Link href={`/produto/${product.slug}`} className="mt-0.5 sm:mt-1 block">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-100 group-hover:text-brand-cyan transition-colors line-clamp-1 font-mono uppercase tracking-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-[11px] sm:text-xs text-neutral-400 line-clamp-2 flex-1 font-mono leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-3 sm:mt-4 flex items-center justify-between pt-2.5 border-t border-neutral-800/60">
                    <span className="text-sm sm:text-base font-black text-white font-mono">
                      {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>

                    {/* Botão com Micro-efeito de Escala */}
                    <button
                      onClick={() => addToCart(product, 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition-all active:scale-90 cursor-pointer ${
                        isAlreadyInCart
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-brand-cyan text-black hover:bg-brand-cyan/80 shadow-md hover:shadow-brand-cyan/20"
                      }`}
                    >
                      {isAlreadyInCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center w-full col-span-full font-mono text-xs text-neutral-400">
          Nenhum produto cadastrado nesta categoria.
        </div>
      )}
    </section>
  );
}