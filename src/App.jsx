import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Lock } from "lucide-react";
import BussolaEducacaoDeInvestimentos from "./apps/BussolaEducacaoDeInvestimentos.jsx";

// ---------- Trava de acesso simples ----------
// Troque a senha aqui antes de mandar o link pros seus testadores.
// Não é criptografia militar, é só um filtro pra impedir acesso casual
// de quem não recebeu o link com essa senha de você.
const SITE_PASSWORD = "bussola2026";

function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("bussola_unlocked") === "true") {
      setUnlocked(true);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === SITE_PASSWORD) {
      sessionStorage.setItem("bussola_unlocked", "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (unlocked) return children;

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "#14291F", color: "#EDE6D6", fontFamily: "'Inter', sans-serif" }}
    >
      <Lock size={28} color="#BE9A5C" className="mb-3" />
      <h1 className="text-2xl font-bold mb-2 text-center">Acesso restrito</h1>
      <p className="text-sm mb-6 text-center max-w-xs" style={{ color: "#C9BFA4" }}>
        Esse protótipo ainda não é público. Digite a senha que você recebeu pra entrar.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Senha"
          autoFocus
          className="w-full text-sm px-3 py-2.5 rounded-sm mb-3"
          style={{ background: "#1C3527", border: `1px solid ${error ? "#B14A34" : "rgba(237,230,214,0.25)"}`, color: "#EDE6D6" }}
        />
        {error && (
          <p className="text-xs mb-3" style={{ color: "#B14A34" }}>Senha incorreta, tenta de novo.</p>
        )}
        <button
          type="submit"
          className="w-full text-sm font-semibold px-4 py-2.5 rounded-sm"
          style={{ background: "#BE9A5C", color: "#14291F" }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<BussolaEducacaoDeInvestimentos />} />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  );
}

