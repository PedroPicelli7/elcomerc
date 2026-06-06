// src/app/page.tsx
import { Header } from "@/components/common/Header";
import { ProductCatalog } from "@/components/product/ProductCatalog";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
        {/* Banner Hero Comercial */}
        <div className="mb-10 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-8 border border-neutral-800">
          <span className="text-xs font-bold tracking-widest text-orange-500 uppercase font-mono">
            Performance Automotiva
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            O catálogo oficial de ferramentas e autopeças.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-400">
            Produtos de alta durabilidade e pronta entrega testados diretamente na oficina.
          </p>
        </div>

        {/* Componente Isolado do Catálogo Dinâmico */}
        <ProductCatalog />
      </main>
    </>
  );
}