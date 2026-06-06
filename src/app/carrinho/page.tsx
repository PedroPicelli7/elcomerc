// src/app/carrinho/page.tsx
"use client";

import Link from "next/link";
import { Header } from "@/components/common/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Package } from "lucide-react";

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartTotalWeight 
  } = useCart();

  // Conversão simples de gramas para Kg para exibição comercial amigável
  const totalWeightInKg = (cartTotalWeight / 1000).toFixed(2);

  // Simulação de frete baseada no peso total acumulado das peças
  // Regra: R$ 15,00 fixo + R$ 5,00 por quilo de mercadoria
  const estimatedShipping = cart.length > 0 ? 15 + (cartTotalWeight / 1000) * 5 : 0;
  
  const orderTotal = cartTotal + estimatedShipping;

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center bg-neutral-950 px-4 text-center">
          <div className="rounded-full bg-neutral-900 p-6 border border-neutral-800">
            <ShoppingBag className="h-10 w-10 text-neutral-600" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-white">Seu carrinho está vazio</h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-400">
            Nenhuma ferramenta ou autopeça adicionada ainda. Explore o catálogo do Elcomerc para encontrar o que precisa.
          </p>
          <Link 
            href="/" 
            className="mt-6 rounded-md bg-orange-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-orange-400 transition-colors font-mono"
          >
            Voltar para as compras
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl font-mono uppercase mb-8">
          Seu <span className="text-orange-500">Carrinho</span>
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* COLUNA ESQUERDA: LISTA DE ITENS (8 colunas) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.map((item) => (
              <div 
                key={item.product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-4 transition-all hover:border-neutral-700"
              >
                {/* Imagem e Detalhes principais */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-orange-500 uppercase">
                      {item.product.category}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{item.product.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-neutral-500" /> {item.product.weight}g
                      </span>
                      <span>Estoque: {item.product.stock} un</span>
                    </div>
                  </div>
                </div>

                {/* Controles de Quantidade e Preço */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t border-neutral-800 sm:border-none">
                  {/* Seletor */}
                  <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 w-24">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="text-neutral-500 hover:text-white transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Preço Acumulado */}
                  <div className="text-right font-mono min-w-[90px]">
                    <p className="text-xs text-neutral-400">Total item</p>
                    <p className="text-sm font-bold text-white">
                      {(item.product.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>

                  {/* Botão Deletar */}
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    title="Remover produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Ações Auxiliares */}
            <button 
              onClick={clearCart}
              className="text-left text-xs font-mono text-neutral-500 hover:text-red-400 transition-colors mt-2"
            >
              [ Limpar todo o carrinho ]
            </button>
          </div>

          {/* COLUNA DIREITA: RESUMO FINANCEIRO E LOGÍSTICO (4 colunas) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sticky top-24">
              <h2 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 font-mono text-xs border-b border-neutral-800 pb-4">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal itens</span>
                  <span className="text-neutral-200">
                    {cartTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                
                {/* Peso cubado aparente para clareza operacional */}
                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-neutral-500" /> Peso Total</span>
                  <span className="text-neutral-200 font-bold">{totalWeightInKg} kg</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-orange-500/70" /> Frete estimado</span>
                  <span className="text-green-400 font-bold">
                    {estimatedShipping.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>

              {/* Total Geral */}
              <div className="flex items-baseline justify-between font-mono pt-4 mb-6">
                <span className="text-sm font-bold text-white uppercase">Total</span>
                <span className="text-xl font-black text-orange-500">
                  {orderTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              {/* Botão de Checkout Final */}
              <button 
                onClick={() => alert("Pronto! Integração com gateway ou WhatsApp do catálogo vêm na sequência.")}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-orange-500 py-3 text-sm font-black text-black hover:bg-orange-400 transition-colors uppercase font-mono"
              >
                Fechar Pedido <ArrowRight className="h-4 w-4" />
              </button>

              <Link 
                href="/" 
                className="block text-center text-xs font-mono text-neutral-400 hover:text-white transition-colors mt-4"
              >
                Continuar comprando
              </Link>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}