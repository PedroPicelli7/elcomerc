// src/app/carrinho/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/common/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package, User, MapPin, MessageSquare } from "lucide-react";

// Insira aqui o número de WhatsApp do seu pai (Apenas números, com DDD e código do país)
const WHATSAPP_NUMBER = "5519999999999"; 

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal 
  } = useCart();

  // Estados focados na lógica de venda consultiva e reserva física
  const [customerName, setCustomerName] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"retirada" | "entrega">("retirada");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // O total agora reflete estritamente a soma dos produtos
  const orderTotal = cartTotal;

  // Função centralizada para estruturar e disparar a mensagem para o WhatsApp
  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      alert("Por favor, preencha o seu nome para realizar a reserva.");
      return;
    }

    if (deliveryOption === "entrega" && !deliveryAddress.trim()) {
      alert("Por favor, preencha o endereço completo para a entrega.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Cabeçalho da mensagem estruturada
      let message = `*NOVA RESERVA - ELCOMERC*\n\n`;
      message += `*Cliente:* ${customerName.trim()}\n`;
      message += `*Forma de Retirada:* ${deliveryOption === "entrega" ? "Entrega a Combinar" : "Retirar na Oficina"}\n`;
      
      if (deliveryOption === "entrega") {
        message += `*Endereço:* ${deliveryAddress.trim()}\n`;
      }
      
      message += `\n*--- ITENS DO PEDIDO ---*\n`;

      // 2. Mapeamento dos produtos contidos no carrinho
      cart.forEach((item) => {
        const itemTotal = item.product.price * item.quantity;
        message += `• ${item.quantity}x ${item.product.name.toUpperCase()}\n`;
        message += `  Valor: ${itemTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n\n`;
      });

      message += `*TOTAL EM MERCADORIAS:* ${orderTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n\n`;
      message += `_Gostaria de confirmar a disponibilidade e combinar a forma de pagamento (Pix/Dinheiro) para retirada!_`;

      // 3. Codificação do texto para o protocolo URL padrão do WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;

      // 4. Limpa a sacola local e redireciona para o WhatsApp
      clearCart();
      window.location.href = whatsappUrl;
    } catch (err) {
      console.error("Erro ao gerar link do WhatsApp:", err);
      alert("Ocorreu um erro ao processar o seu pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-1 min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-neutral-950 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-full bg-neutral-900 p-6 border border-neutral-800">
            <ShoppingBag className="h-10 w-10 text-neutral-600" />
          </div>
          <h2 className="mt-6 text-xl font-bold font-mono text-white uppercase tracking-tight">Seu carrinho está vazio</h2>
          <p className="mt-2 max-w-sm text-xs font-mono text-neutral-400 leading-relaxed">
            Nenhuma ferramenta ou autopeça adicionada ainda. Explore o catálogo do Elcomerc para encontrar o que precisa.
          </p>
          <Link 
            href="/" 
            className="mt-6 rounded-md bg-brand-cyan px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-brand-cyan/80 transition-all duration-200 shadow-lg shadow-brand-cyan/10 hover:scale-[1.02] active:scale-[0.98] font-mono cursor-pointer"
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

      <main className="flex-1 bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl animate-in fade-in duration-500">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl font-mono uppercase mb-8">
          Seu <span className="text-brand-cyan">Carrinho</span>
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* COLUNA ESQUERDA: LISTA DE ITENS */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.map((item) => (
              <div 
                key={item.product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-4 transition-all duration-200 hover:border-neutral-700"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-brand-cyan uppercase">
                      {item.product.categories?.name || "Geral"}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1 font-mono uppercase">{item.product.name}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-neutral-500" /> {item.product.weight}g
                      </span>
                      <span>Estoque: {item.product.stock} un</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t border-neutral-800 sm:border-none">
                  <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 w-24">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="text-neutral-500 hover:text-white transition-colors disabled:opacity-20 cursor-pointer"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right font-mono min-w-[90px]">
                    <p className="text-[10px] text-neutral-500 uppercase">Total item</p>
                    <p className="text-sm font-bold text-white">
                      {(item.product.price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remover produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={clearCart}
              className="text-left text-xs font-mono text-neutral-500 hover:text-red-400 transition-colors mt-2 cursor-pointer"
            >
              [ Limpar todo o carrinho ]
          </button>
          </div>

          {/* COLUNA DIREITA: FORMULÁRIO CONSULTIVO DO WHATSAPP */}
          <div className="lg:col-span-4">
            <form onSubmit={handleWhatsAppCheckout} className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sticky top-24 space-y-5">
              
              {/* Campo: Nome do Comprador */}
              <div className="flex flex-col gap-1.5 font-mono text-xs text-neutral-300">
                <label className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-cyan" /> Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Gonçalves"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2.5 font-mono text-xs text-neutral-200 focus:border-brand-cyan focus:outline-none placeholder-neutral-800 transition-colors"
                />
              </div>

              {/* Opções de Recebimento */}
              <div className="font-mono text-xs text-neutral-300 space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-cyan" /> Como deseja receber?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption("retirada")}
                    className={`rounded border py-2 font-bold uppercase transition-all ${
                      deliveryOption === "retirada"
                        ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Retirar em Mãos
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption("entrega")}
                    className={`rounded border py-2 font-bold uppercase transition-all ${
                      deliveryOption === "entrega"
                        ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Combinar Entrega
                  </button>
                </div>
              </div>

              {/* Campo Condicional: Endereço Completo */}
              {deliveryOption === "entrega" && (
                <div className="flex flex-col gap-1.5 font-mono text-xs text-neutral-300 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold">
                    Endereço de Entrega Completo *
                  </label>
                  <input
                    type="text"
                    required={deliveryOption === "entrega"}
                    placeholder="Rua, número, bairro e cidade..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2.5 font-mono text-xs text-neutral-200 focus:border-brand-cyan focus:outline-none placeholder-neutral-800 transition-colors"
                  />
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="border-t border-neutral-800 pt-4">
                <div className="flex items-baseline justify-between font-mono mb-4">
                  <span className="text-xs font-bold text-neutral-400 uppercase">Subtotal da Reserva</span>
                  <span className="text-lg font-black text-brand-cyan">
                    {orderTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                <p className="text-[10px] font-mono text-neutral-500 leading-relaxed mb-4 bg-neutral-950/40 p-2.5 rounded border border-neutral-800/60">
                  [ NOTA ] Ao fechar, você será redirecionado ao WhatsApp da oficina para agendar o pagamento e a retirada do estoque.
                </p>

                {/* Botão de Disparo do WhatsApp */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-brand-cyan py-3 text-sm font-black text-black hover:bg-brand-cyan/80 transition-all duration-300 uppercase font-mono cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                >
                  <span>Reservar via WhatsApp</span> 
                  <MessageSquare className="h-4 w-4 fill-current" />
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </>
  );
}