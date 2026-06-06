// src/app/(shop)/produto/[slug]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { MOCK_PRODUCTS } from "@/utils/products.mock";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ShieldCheck,
  Truck,
  Package,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Busca o produto correspondente ao slug da URL nos nossos mocks
  const product = MOCK_PRODUCTS.find((p) => p.slug === params.slug);

  // Fallback caso o produto não seja encontrado
  if (!product) {
    return (
      <>
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center bg-neutral-950 px-4 text-center">
          <h2 className="text-xl font-bold text-white">
            Produto não encontrado
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            O item que você busca não existe ou foi removido.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-black hover:bg-orange-400 font-mono"
          >
            Voltar para a Home
          </Link>
        </div>
      </>
    );
  }

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddAndRedirect = () => {
    addToCart(product, quantity);
    // Redireciona opcionalmente ou avisa o usuário (vamos manter na página para melhor UX de multi-compra)
  };

  return (
    <>
      <Header />

      <main className="flex-1 bg-neutral-950 px-4 py-6 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> VOLTAR
        </button>

        {/* Layout de Duas Colunas */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Coluna Esquerda: Imagem */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-2 flex items-center justify-center aspect-square max-h-[500px]">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover object-center"
            />
          </div>

          {/* Coluna Direita: Informações de Compra */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-orange-500 uppercase font-mono">
                {/* CORREÇÃO: Lê o nome da categoria vinda do JOIN relacional de forma segura */}
                {product.categories?.name ||
                  (product as any).category ||
                  "Geral"}
              </span>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {product.name}
              </h1>

              <p className="mt-4 text-base font-black text-orange-500 text-2xl font-mono">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              <div className="mt-6 border-t border-b border-neutral-800 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Descrição
                </h3>
                <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Especificações Técnicas Rápidas (Crucial pro Nicho Automotivo) */}
              <div className="mt-6 grid grid-cols-2 gap-4 bg-neutral-900/50 p-4 rounded-lg border border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <Package className="h-4 w-4 text-neutral-500" />
                  <span>
                    Peso:{" "}
                    <strong className="text-neutral-200">
                      {product.weight}g
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <ShieldCheck className="h-4 w-4 text-neutral-500" />
                  <span>
                    Estoque:{" "}
                    <strong className="text-neutral-200">
                      {product.stock} un
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Ações de Compra Finais */}
            <div className="mt-8 border-t border-neutral-800 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Seletor de Quantidade */}
                <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 sm:w-32">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Botão Adicionar ao Carrinho */}
                <button
                  onClick={handleAddAndRedirect}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-orange-500 py-3 text-sm font-black text-black hover:bg-orange-400 transition-colors uppercase font-mono"
                >
                  <ShoppingCart className="h-4 w-4" /> Adicionar ao Carrinho
                </button>
              </div>

              {/* Info de Entrega Rápida */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                <Truck className="h-3.5 w-3.5 text-orange-500/70" />
                <span>
                  Envio imediato via transportadora com cálculo de peso
                  dinâmico.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
