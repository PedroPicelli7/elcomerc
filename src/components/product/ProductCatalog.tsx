// src/components/product/ProductCatalog.tsx
"use client";

import { useState } from "react";
import { MOCK_PRODUCTS } from "@/utils/products.mock";
import { useCart } from "@/context/CartContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Check, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export function ProductCatalog() {
  const { addToCart, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Ativa o debounce para a string de busca (aguarda 300ms após o término da digitação)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const categories = ["Todas", "Iluminação", "Ferramentas", "Limpeza"];

  // Filtro combinado inteligente (Filtra por Categoria E por Texto via Debounce)
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const productCategoryName = product.categories?.name || (product as any).category;
    
    const matchesCategory = selectedCategory === "Todas" || productCategoryName === selectedCategory;
    
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
                          
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="w-full">
      {/* Barra de Filtros e Busca Local */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Input de Busca Estilo Tech */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="O que você está procurando hoje?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder-neutral-500 transition-all focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan"
          />
        </div>

        {/* Indicador de quantidade de itens encontrados */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </span>
        </div>
      </div>

      {/* Filtros Rápidos de Categoria */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono mb-3">
          Filtrar por Categoria
        </h2>
        
        {/* SELETOR DE CATEGORIAS RENDERIZANDO CYBER CYAN */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 font-bold tracking-tight uppercase border transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-cyan text-black border-brand-cyan shadow-lg shadow-brand-cyan/10"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Peças e Ferramentas */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const isAlreadyInCart = cart.some(
              (item) => item.product.id === product.id,
            );

            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700/80 animate-in fade-in duration-300"
              >
                {/* Imagem do Produto */}
                <Link
                  href={`/produto/${product.slug}`}
                  className="aspect-square w-full overflow-hidden rounded-md bg-neutral-950"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>

                <div className="flex flex-1 flex-col pt-4">
                  {/* TAG DA CATEGORIA COM O NOVO TOM DA MARCA */}
                  <span className="text-[10px] font-bold tracking-wider text-brand-cyan uppercase font-mono">
                    {product.categories?.name || (product as any).category || "Geral"}
                  </span>

                  <Link
                    href={`/produto/${product.slug}`}
                    className="mt-1 block"
                  >
                    <h3 className="text-sm font-bold text-neutral-100 group-hover:text-brand-cyan transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  {/* Preço e Compra Dinâmica */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800">
                    <span className="text-base font-black text-white font-mono">
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-pointer ${
                        isAlreadyInCart
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-brand-cyan text-black hover:bg-brand-cyan/80"
                      }`}
                      title="Adicionar ao carrinho"
                    >
                      {isAlreadyInCart ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vazio de Busca */
        <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center">
          <p className="text-sm text-neutral-400 font-mono">
            Nenhum produto corresponde à sua busca atual.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Todas");
            }}
            className="mt-3 text-xs font-mono text-brand-cyan hover:underline cursor-pointer"
          >
            [ Limpar filtros ]
          </button>
        </div>
      )}
    </section>
  );
}