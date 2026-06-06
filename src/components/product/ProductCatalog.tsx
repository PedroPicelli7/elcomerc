// src/components/product/ProductCatalog.tsx
"use client";

import { useState } from "react";
import { MOCK_PRODUCTS } from "@/utils/products.mock";
import { useCart } from "@/context/CartContext";
import { Plus, Check } from "lucide-react";
import Link from "next/link";

export function ProductCatalog() {
  const { addToCart, cart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = ["Todas", "Iluminação", "Ferramentas", "Limpeza"];

  const filteredProducts = selectedCategory === "Todas"
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section className="w-full">
      {/* Filtros Rápidos de Categoria */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono mb-3">
          Categorias
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium font-mono transition-all border ${
                selectedCategory === category
                  ? "bg-orange-500 text-black border-orange-500 font-bold"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Peças e Ferramentas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => {
          const isAlreadyInCart = cart.some((item) => item.product.id === product.id);

          return (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700"
            >
              {/* Imagem do Produto com Link */}
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

              {/* Info */}
              <div className="flex flex-1 flex-col pt-4">
                <span className="text-[10px] font-bold tracking-wider text-orange-500 uppercase font-mono">
                  {product.category}
                </span>

                {/* Título com Link */}
                <Link href={`/produto/${product.slug}`} className="mt-1 block">
                  <h3 className="text-sm font-bold text-neutral-100 group-hover:text-orange-500 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-1 text-xs text-neutral-400 line-clamp-2 flex-1">
                  {product.description}
                </p>

                {/* Preço e Botão de Compra */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800">
                  <span className="text-base font-black text-white font-mono">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                      isAlreadyInCart
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-orange-500 text-black hover:bg-orange-400"
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
    </section>
  );
}