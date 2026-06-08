// src/app/(shop)/produto/[slug]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/common/Header";
import { supabaseClient } from "@/services/supabase/client"; // Cliente oficial do banco
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/shop.types"; // Tipo global exigido pelo seu CartContext
import {
  ChevronLeft,
  ShieldCheck,
  MessageSquare,
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
  
  // Estados para gerenciar o produto dinâmico vindo do Supabase
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Busca o produto de forma assíncrona usando o Slug da URL
  useEffect(() => {
    async function loadProductDetail() {
      if (!params?.slug) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabaseClient
          .from("products")
          .select(`id, name, slug, price, stock, description, image_url, weight, category_id, categories ( id, name, slug )`)
          .eq("slug", params.slug)
          .single();

        if (error) throw error;

        if (data) {
          // Trata o retorno do Supabase para encaixar perfeitamente no tipo 'Product'
          const rawCategory = data.categories;
          const formattedCategory = Array.isArray(rawCategory) 
            ? rawCategory[0] 
            : rawCategory;

          setProduct({
            ...data,
            price: Number(data.price),
            stock: Number(data.stock),
            categories: formattedCategory || null
          } as Product);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do produto no Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductDetail();
  }, [params?.slug]);

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (!product) return;
    if (type === "increase" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // 1. Estado de Carregamento Assíncrono (Skeleton / Loading)
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex flex-1 min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-950 font-mono text-xs text-neutral-500 animate-pulse">
          [ CARREGANDO DETALHES TÉCNICOS... ]
        </div>
      </>
    );
  }

  // 2. Estado de Fallback se o produto realmente não existir no Supabase
  if (!product) {
    return (
      <>
        <Header />
        <div className="flex flex-1 min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-950 px-4 text-center font-mono animate-in fade-in duration-300">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Produto não encontrado
          </h2>
          <p className="mt-2 text-xs text-neutral-400">
            O item que você busca não existe ou foi removido do estoque da oficina.
          </p>
          <Link
            href="/"
            className="mt-6 rounded border border-brand-cyan/20 bg-brand-cyan/10 px-5 py-2.5 text-xs font-black text-brand-cyan hover:bg-brand-cyan/20 transition-all uppercase"
          >
            Voltar para a Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-brand-cyan transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" /> VOLTAR
        </button>

        {/* Layout de Duas Colunas */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Imagem do Produto */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-2 flex items-center justify-center aspect-square max-h-[500px]">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover object-center transition-transform duration-500 hover:scale-102"
            />
          </div>

          {/* Informações de Compra */}
          <div className="flex flex-col justify-between space-y-6 lg:space-y-0">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-brand-cyan uppercase font-mono bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded">
                {product.categories?.name || (product as any).category || "Geral"}
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl font-mono uppercase">
                {product.name}
              </h1>

              <p className="mt-4 font-black text-brand-cyan text-2xl font-mono tracking-tight">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              <div className="mt-6 border-t border-b border-neutral-800/80 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                  Descrição Técnica
                </h3>
                <p className="mt-2 text-xs font-mono text-neutral-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Especificações Técnicas Rápidas */}
              <div className="mt-6 grid grid-cols-2 gap-4 bg-neutral-900/40 p-4 rounded-lg border border-neutral-800/60">
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
            <div className="mt-8 border-t border-neutral-800/60 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Seletor de Quantidade */}
                <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 sm:w-32">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="text-neutral-500 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="text-neutral-500 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Botão Adicionar ao Carrinho */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock <= 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-brand-cyan py-3 text-sm font-black text-black hover:bg-brand-cyan/80 transition-all duration-300 uppercase font-mono tracking-tight shadow-lg shadow-brand-cyan/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" /> Adicionar à Reserva
                </button>
              </div>

              {/* Info de Retirada Consultiva da Oficina */}
              <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                <MessageSquare className="h-3.5 w-3.5 text-brand-cyan/60" />
                <span>
                  Disponibilidade garantida para reserva imediata e retirada agendada via WhatsApp.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}