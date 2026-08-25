import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import BussolaEducacaoDeInvestimentos from "./apps/BussolaEducacaoDeInvestimentos.jsx";
import BussolaVidaFinanceira from "./apps/BussolaVidaFinanceira.jsx";

function Home() {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#14291F", color: "#EDE6D6", fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: "#BE9A5C" }}>
        <Compass size={28} />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center">Bússola</h1>
      <p className="text-sm mb-10 text-center max-w-sm" style={{ color: "#C9BFA4" }}>
        Escolha qual protótipo você quer abrir.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <Link
          to="/investimentos"
          className="flex items-center justify-between px-5 py-4 rounded-sm transition-colors"
          style={{ background: "#1C3527", border: "1px solid rgba(237,230,214,0.15)" }}
        >
          <div>
            <div className="font-semibold" style={{ color: "#EDE6D6" }}>Bússola Educação de Investimentos</div>
            <div className="text-xs mt-0.5" style={{ color: "#C9BFA4" }}>Completo — ações, renda fixa, FIIs, ETFs, previdência, cripto</div>
          </div>
          <ArrowRight size={18} color="#BE9A5C" />
        </Link>

        <Link
          to="/vida-financeira"
          className="flex items-center justify-between px-5 py-4 rounded-sm transition-colors"
          style={{ background: "#1C3527", border: "1px solid rgba(237,230,214,0.15)" }}
        >
          <div>
            <div className="font-semibold" style={{ color: "#EDE6D6" }}>Bússola Vida Financeira</div>
            <div className="text-xs mt-0.5" style={{ color: "#C9BFA4" }}>Simples — orçamento, dívidas, reserva e renda fixa</div>
          </div>
          <ArrowRight size={18} color="#BE9A5C" />
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/investimentos" element={<BussolaEducacaoDeInvestimentos />} />
        <Route path="/vida-financeira" element={<BussolaVidaFinanceira />} />
      </Routes>
    </BrowserRouter>
  );
}
