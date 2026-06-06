// src/app/page.tsx
import { Header } from "@/components/common/Header";
import { ProductCatalog } from "@/components/product/ProductCatalog";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl animate-in fade-in duration-500">
        
        {/* Banner Hero Comercial - Sintonizado em Cyber Cyan com Micro-Animação */}
        <div className="mb-10 rounded-xl bg-gradient-to-br from-neutral-900/90 to-neutral-950/95 p-6 sm:p-8 border border-neutral-800/80 relative overflow-hidden group transition-all duration-300 hover:border-brand-cyan/20">
          {/* Luz de Fundo com transição ao passar o mouse */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-brand-cyan/5 rounded-full blur-3xl transition-all duration-700 group-hover:bg-brand-cyan/10 group-hover:scale-110" />
          
          <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest text-brand-cyan uppercase font-mono bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded animate-pulse">
            Performance Automotiva
          </span>
          
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-4xl font-mono uppercase max-w-2xl leading-tight">
            O catálogo oficial de ferramentas e autopeças.
          </h1>
          
          <p className="mt-2 max-w-xl text-xs sm:text-sm text-neutral-400 font-mono leading-relaxed">
            Produtos de alta durabilidade e pronta entrega testados diretamente na oficina.
          </p>
        </div>

        {/* Componente Isolado do Catálogo Dinâmico (Já responsivo em 2 colunas!) */}
        <ProductCatalog />
      </main>
    </>
  );
}