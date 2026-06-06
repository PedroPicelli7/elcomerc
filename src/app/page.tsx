// src/app/page.tsx
import { Header } from "@/components/common/Header";
import { ProductCatalog } from "@/components/product/ProductCatalog";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl animate-in fade-in duration-300">
        {/* Banner Hero Comercial - Sintonizado em Cyber Cyan */}
        <div className="mb-10 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-950 p-8 border border-neutral-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-cyan/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-brand-cyan/10" />
          
          <span className="text-xs font-bold tracking-widest text-brand-cyan uppercase font-mono bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded">
            Performance Automotiva
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-mono">
            O catálogo oficial de ferramentas e autopeças.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-400 font-mono">
            Produtos de alta durabilidade e pronta entrega testados diretamente na oficina.
          </p>
        </div>

        {/* Componente Isolado do Catálogo Dinâmico */}
        <ProductCatalog />
      </main>
    </>
  );
}