import React, { useState, useMemo } from "react";
import {
  Check, X, ChevronRight, HelpCircle, ArrowRight, ShoppingCart, ExternalLink,
  Shield, Zap, Scale, Wallet, CreditCard, Umbrella, Mic, MicOff, Trash2, Compass, Brain, AlertCircle,
} from "lucide-react";

// ---------- Perfis (mesmos 3 níveis do app completo, linguagem simplificada) ----------
const PROFILES = {
  conservador: { label: "Bem seguro", icon: Shield, blurb: "Prioriza nunca ver o dinheiro cair, mesmo que renda menos.",
    weights: { taxa: 0.6, liquidez: 1.6, protecao: 1.5, prazo: 1.3 } },
  moderado: { label: "Equilibrado", icon: Scale, blurb: "Aceita um pouco mais de prazo pra ganhar um pouco mais.",
    weights: { taxa: 1, liquidez: 1, protecao: 1, prazo: 1 } },
  agressivo: { label: "Mais ousado", icon: Zap, blurb: "Topa deixar o dinheiro mais tempo guardado pra render mais.",
    weights: { taxa: 1.8, liquidez: 0.5, protecao: 0.6, prazo: 0.4 } },
};

const PROFILE_DETAILS = {
  conservador: { horizon: "Pode precisar do dinheiro a qualquer momento", risk: "Não quer nenhuma surpresa", fit: "Ideal pra reserva de emergência e primeiros passos." },
  moderado: { horizon: "Pode deixar parado uns meses", risk: "Topa esperar um pouco mais por um pouco mais de retorno", fit: "Bom equilíbrio entre segurança e crescimento." },
  agressivo: { horizon: "Pode deixar guardado por mais tempo", risk: "Quer aproveitar ao máximo cada real guardado", fit: "Pra quem já tem uma reserva e quer fazer o dinheiro render mais." },
};

const QUIZ_QUESTIONS = [
  { q: "Se você precisasse desse dinheiro de repente, o que faria mais sentido?", options: [
    { text: "Ter ele disponível a qualquer momento", profile: "conservador" },
    { text: "Esperar alguns meses não é problema", profile: "moderado" },
    { text: "Consigo deixar guardado por mais tempo", profile: "agressivo" },
  ]},
  { q: "O que é mais importante pra você agora?", options: [
    { text: "Nunca ver esse dinheiro diminuir", profile: "conservador" },
    { text: "Um equilíbrio entre segurança e render mais", profile: "moderado" },
    { text: "Fazer esse dinheiro render o máximo possível", profile: "agressivo" },
  ]},
  { q: "Por quanto tempo pretende deixar esse dinheiro guardado?", options: [
    { text: "Não sei, pode ser que eu precise logo", profile: "conservador" },
    { text: "Uns meses, sem pressa", profile: "moderado" },
    { text: "Bastante tempo, não vou mexer", profile: "agressivo" },
  ]},
];

// ---------- Renda fixa (mesmos produtos do app completo) ----------
const FIXED_INCOME = [
  { id: "cdb-xp-diaria", name: "CDB liquidez diária", taxaLabel: "100% do CDI", taxaAnual: 10.9, liquidez: "Diária", liquidezScore: 100, prazoMeses: 0, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: false },
  { id: "cdb-inter-2a", name: "CDB 2 anos (taxa maior)", taxaLabel: "118% do CDI", taxaAnual: 12.9, liquidez: "No vencimento", liquidezScore: 20, prazoMeses: 24, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: false },
  { id: "tesouro-selic", name: "Tesouro Selic", taxaLabel: "Selic + 0,05%", taxaAnual: 10.95, liquidez: "Diária (D+1)", liquidezScore: 95, prazoMeses: 36, protecao: "Garantia do Tesouro Nacional", protecaoScore: 100, isentoIR: false },
  { id: "poupanca", name: "Poupança", taxaLabel: "~70% da Selic, isenta de IR", taxaAnual: 7.5, liquidez: "Diária", liquidezScore: 100, prazoMeses: 0, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: true },
  { id: "lci-banco", name: "LCI (isenta de imposto)", taxaLabel: "94% do CDI", taxaAnual: 10.3, liquidez: "Carência 90 dias", liquidezScore: 55, prazoMeses: 12, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: true },
  { id: "lca-banco", name: "LCA (isenta de imposto)", taxaLabel: "92% do CDI", taxaAnual: 10.05, liquidez: "No vencimento", liquidezScore: 25, prazoMeses: 18, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: true },
];

function normalizeRF(p, key) {
  if (key === "taxa") return Math.min(100, Math.max(0, (p.taxaAnual - 6) * 18));
  if (key === "liquidez") return p.liquidezScore;
  if (key === "protecao") return p.protecaoScore;
  if (key === "prazo") return Math.max(0, 100 - p.prazoMeses * 0.9);
  return 0;
}
function weightedScoreRF(p, profileKey) {
  const weights = PROFILES[profileKey].weights;
  let sum = 0, totalWeight = 0;
  Object.keys(weights).forEach((k) => { sum += normalizeRF(p, k) * weights[k]; totalWeight += weights[k]; });
  return Math.round(sum / totalWeight);
}
function classifyRF(score) {
  if (score >= 75) return { label: "Ótima opção pro seu momento", color: "var(--gold)" };
  if (score >= 45) return { label: "Boa opção, vale comparar", color: "var(--paper-dim)" };
  return { label: "Não é prioridade agora", color: "var(--rust)" };
}

// ---------- Estimativas de rendimento (Selic de referência + projeção em 12 meses) ----------
const SELIC_REFERENCE = 11.0;
function pctDaSelic(taxaAnual) {
  return Math.round((taxaAnual / SELIC_REFERENCE) * 100);
}
function estimativa12Meses(taxaAnual, valorBase = 1000) {
  const ganho = valorBase * (taxaAnual / 100);
  return { valorBase, ganho: Math.round(ganho), total: Math.round(valorBase + ganho) };
}

const BROKERS = [
  { name: "Nubank", url: "https://nubank.com.br/" },
  { name: "Caixa Econômica Federal", url: "https://www.caixa.gov.br/" },
  { name: "C6 Bank", url: "https://www.c6bank.com.br/" },
  { name: "Banco do Brasil", url: "https://www.bb.com.br/" },
];

// ---------- Vida financeira ----------
function daysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

function statusVencimento(diaVencimento) {
  if (!diaVencimento) return null;
  const hoje = new Date().getDate();
  const diff = diaVencimento - hoje;
  if (diff < 0) return { label: "Vencida", color: "var(--rust)", urgente: true };
  if (diff <= 3) return { label: diff === 0 ? "Vence hoje" : `Vence em ${diff} dia${diff > 1 ? "s" : ""}`, color: "var(--rust)", urgente: true };
  if (diff <= 7) return { label: `Vence em ${diff} dias`, color: "var(--gold)", urgente: false };
  return { label: `Vence dia ${diaVencimento}`, color: "var(--paper-dim)", urgente: false };
}

function simulateDebtPayoff(dividas, extraMensal) {
  if (dividas.length === 0) return { meses: 0, totalJurosPago: 0 };
  let saldos = dividas.map((d) => ({ ...d, saldo: d.valor }));
  let meses = 0, totalJurosPago = 0;
  while (saldos.some((d) => d.saldo > 0.5) && meses < 240) {
    meses++;
    saldos.sort((a, b) => (b.saldo > 0 ? b.jurosMensal : -1) - (a.saldo > 0 ? a.jurosMensal : -1));
    let extraRestante = extraMensal;
    saldos = saldos.map((d) => {
      if (d.saldo <= 0) return d;
      const juros = d.saldo * (d.jurosMensal / 100);
      totalJurosPago += juros;
      let saldoComJuros = d.saldo + juros;
      let pagamento = Math.min(saldoComJuros, d.parcelaMinima);
      saldoComJuros -= pagamento;
      if (saldoComJuros > 0 && extraRestante > 0) {
        const extra = Math.min(saldoComJuros, extraRestante);
        saldoComJuros -= extra;
        extraRestante -= extra;
      }
      return { ...d, saldo: saldoComJuros };
    });
  }
  return { meses, totalJurosPago: Math.round(totalJurosPago) };
}

const EXPENSE_CATEGORIES = [
  { key: "mercado", label: "Mercado", keywords: ["mercado", "supermercado", "feira", "compras"] },
  { key: "alimentacao", label: "Alimentação/Delivery", keywords: ["restaurante", "ifood", "lanche", "comida", "delivery", "almoço", "jantar"] },
  { key: "transporte", label: "Transporte", keywords: ["uber", "gasolina", "combustível", "ônibus", "táxi", "99"] },
  { key: "lazer", label: "Lazer", keywords: ["cinema", "bar", "balada", "lazer", "viagem", "show"] },
  { key: "saude", label: "Saúde", keywords: ["farmácia", "remédio", "médico", "consulta"] },
  { key: "outros", label: "Outros", keywords: [] },
];

function parseVoiceExpense(transcript) {
  const text = transcript.toLowerCase();
  const match = text.match(/(\d+[.,]?\d*)/);
  const valor = match ? parseFloat(match[1].replace(",", ".")) : null;
  let categoria = EXPENSE_CATEGORIES.find((c) => c.keywords.some((k) => text.includes(k)));
  if (!categoria) categoria = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  const extraHints = ["conserto", "emergência", "presente", "imprevisto", "quebrou", "multa"];
  const tipo = extraHints.some((k) => text.includes(k)) ? "extra" : "variavel";
  return { valor, categoria: categoria.key, nome: transcript, tipo };
}

const INCOME_IDEAS = {
  conservador: [
    { title: "Freelance no que você já sabe fazer", desc: "Horas avulsas de serviço no que você já faz bem — menor risco, aproveita experiência já validada.", potencial: "R$ 300 – R$ 1.200/mês", esforco: "Médio" },
    { title: "Alugar um cômodo ou vaga", desc: "Renda passiva e previsível, sem exigir tempo extra recorrente.", potencial: "R$ 200 – R$ 800/mês", esforco: "Baixo" },
    { title: "Vender itens parados em casa", desc: "Dinheiro ocioso virando caixa imediato — bom pra cobrir um aperto pontual.", potencial: "R$ 100 – R$ 600 (pontual)", esforco: "Baixo" },
    { title: "Trabalho remoto part-time", desc: "Vagas de meio período complementam a renda com previsibilidade.", potencial: "R$ 400 – R$ 1.000/mês", esforco: "Médio" },
  ],
  moderado: [
    { title: "Apps de entrega ou transporte", desc: "Flexibilidade total de horário, começa a gerar caixa quase imediatamente.", potencial: "R$ 400 – R$ 1.500/mês", esforco: "Médio" },
    { title: "Ensinar algo que você já domina", desc: "Aulas particulares ou mentoria sobre o que você já sabe fazer.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
    { title: "Freelance em plataformas digitais", desc: "Design, texto, edição — monetiza uma habilidade sem depender de local fixo.", potencial: "R$ 500 – R$ 2.500/mês", esforco: "Médio" },
    { title: "Revenda com pouco investimento inicial", desc: "Margem imediata, exige organização mas pouco capital pra começar.", potencial: "R$ 300 – R$ 1.200/mês", esforco: "Médio" },
  ],
  agressivo: [
    { title: "Criar algo que já venda sozinho", desc: "Curso, e-book ou produto simples — investe tempo agora pra construir algo que cresce.", potencial: "R$ 500 – R$ 5.000+/mês", esforco: "Alto" },
    { title: "Usar suas redes sociais pra vender", desc: "Se já tem alguma audiência, vira renda com parcerias ou produto próprio.", potencial: "R$ 300 – R$ 3.000+/mês", esforco: "Alto" },
    { title: "Cobrar mais por um serviço especializado", desc: "Vender expertise específica em vez de tempo genérico.", potencial: "R$ 800 – R$ 4.000/mês", esforco: "Alto" },
    { title: "Pequeno negócio paralelo", desc: "Maior risco e esforço, mas potencial de crescer além de um complemento de renda.", potencial: "Variável, potencial alto", esforco: "Alto" },
  ],
};

const SKILL_INCOME_MAP = [
  { keywords: ["design", "photoshop", "canva", "artes"], title: "Design freelance (posts, artes)", desc: "Serviços pontuais pra redes sociais de pequenos negócios.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["texto", "redação", "escrita", "redator"], title: "Redação freelance", desc: "Textos pra blogs ou redes sociais de empresas.", potencial: "R$ 300 – R$ 1.800/mês", esforco: "Médio" },
  { keywords: ["costura", "crochê", "artesanato", "tricô", "bordado"], title: "Venda de peças artesanais", desc: "Sob encomenda ou em feiras e redes sociais.", potencial: "R$ 200 – R$ 1.200/mês", esforco: "Médio" },
  { keywords: ["cozinha", "culinária", "doces", "bolo", "confeit", "salgado"], title: "Comida/doces por encomenda", desc: "Produção caseira sob encomenda pra eventos ou vizinhança.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["maquiagem", "cabelo", "estética", "unha", "manicure", "sobrancelha"], title: "Serviços de beleza a domicílio", desc: "Atendimento particular, sem custo de aluguel de salão.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["dirigir", "carro", "moto", "cnh", "entrega"], title: "Motorista ou entregador de aplicativo", desc: "Horários flexíveis, gera renda quase imediatamente.", potencial: "R$ 400 – R$ 1.500/mês", esforco: "Médio" },
  { keywords: ["elétrica", "manutenção", "reparo", "encanador", "pedreiro", "marcenaria"], title: "Manutenção/reparo doméstico", desc: "Alta demanda local, remuneração por serviço.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["cuidador", "babá", "crianças", "idosos", "paciência"], title: "Cuidador de crianças ou idosos", desc: "Serviço de confiança com boa demanda na vizinhança.", potencial: "R$ 400 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["vendas", "comercial"], title: "Vendas por comissão", desc: "Comercializa produtos de terceiros, sem precisar de capital inicial.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
];

function matchSkillIdeas(text) {
  const t = text.toLowerCase();
  const matched = SKILL_INCOME_MAP.filter((item) => item.keywords.some((k) => t.includes(k)));
  const seen = new Set();
  return matched.filter((item) => (seen.has(item.title) ? false : (seen.add(item.title), true))).slice(0, 4);
}

function Seal({ score }) {
  const cls = classifyRF(score);
  return (
    <div className="relative w-24 h-24 shrink-0 select-none" style={{ transform: "rotate(-7deg)" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke={cls.color} strokeWidth="2" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={cls.color} strokeWidth="1" strokeDasharray="2 3" />
        <text x="50" y="46" textAnchor="middle" fontSize="24" fontWeight="700" fill={cls.color} style={{ fontFamily: "'Roboto Slab', serif" }}>{score}</text>
        <text x="50" y="62" textAnchor="middle" fontSize="7" letterSpacing="1" fill={cls.color} style={{ fontFamily: "'Inter', sans-serif" }}>PONTOS</text>
      </svg>
    </div>
  );
}

export default function BussolaVidaFinanceira() {
  const [profileKey, setProfileKey] = useState("moderado");
  const [showGuide, setShowGuide] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [tab, setTab] = useState("vida-financeira");
  const [showBrokers, setShowBrokers] = useState(false);
  const [confirmValor, setConfirmValor] = useState("");
  const [rfSelectedId, setRfSelectedId] = useState(null);
  const [showAssetInfo, setShowAssetInfo] = useState(false);
  const [showReservaDuvida, setShowReservaDuvida] = useState(false);

  const quizResult = useMemo(() => {
    const answered = Object.keys(quizAnswers).length;
    if (answered === 0) return null;
    const tally = { conservador: 0, moderado: 0, agressivo: 0 };
    Object.values(quizAnswers).forEach((p) => (tally[p] += 1));
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    return { top, answered, complete: answered === QUIZ_QUESTIONS.length };
  }, [quizAnswers]);

  const rankedRF = useMemo(() => {
    return FIXED_INCOME.map((p) => ({ ...p, profileScore: weightedScoreRF(p, profileKey) })).sort((a, b) => b.profileScore - a.profileScore);
  }, [profileKey]);
  const selectedRF = rankedRF.find((p) => p.id === rfSelectedId) || rankedRF[0];
  const profile = PROFILES[profileKey];

  // ---------- Vida financeira ----------
  const [rendaFixa, setRendaFixa] = useState(1600);
  const [rendaVariavel, setRendaVariavel] = useState(150);
  const [rendaExtra, setRendaExtra] = useState(50);
  const rendaMensal = rendaFixa + rendaVariavel + rendaExtra;

  const [custosFixos, setCustosFixos] = useState([
    { id: 1, nome: "Aluguel", valor: 600, diaVencimento: 5 },
    { id: 2, nome: "Contas (luz, água, internet)", valor: 200, diaVencimento: 10 },
  ]);
  const [novoCustoFixo, setNovoCustoFixo] = useState({ nome: "", valor: "", diaVencimento: "" });

  const [gastosVariaveis, setGastosVariaveis] = useState([]);
  const [novoGasto, setNovoGasto] = useState({ nome: "", valor: "", tipo: "variavel" });
  const totalCustosVariaveis = gastosVariaveis.filter((g) => g.tipo === "variavel").reduce((sum, g) => sum + g.valor, 0);
  const totalCustosExtras = gastosVariaveis.filter((g) => g.tipo === "extra").reduce((sum, g) => sum + g.valor, 0);

  const [dividas, setDividas] = useState([]);
  const [novaDivida, setNovaDivida] = useState({ nome: "", valor: "", jurosMensal: "", parcelaMinima: "" });

  const [reservaAtual, setReservaAtual] = useState(0);
  const [investimentos, setInvestimentos] = useState([]);
  const [novoInvestimento, setNovoInvestimento] = useState({ ativo: "", valor: "" });
  const totalInvestido = investimentos.reduce((sum, i) => sum + i.valor, 0);

  function registrarAplicacao(nomeAtivo) {
    if (!confirmValor) return;
    setInvestimentos((prev) => [...prev, { id: Date.now(), ativo: nomeAtivo, valor: Number(confirmValor) }]);
    setConfirmValor("");
    setShowBrokers(false);
  }

  const [isListening, setIsListening] = useState(false);
  const [voicePreview, setVoicePreview] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const [showProsperity, setShowProsperity] = useState(false);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [isListeningSkills, setIsListeningSkills] = useState(false);
  const matchedSkillIdeas = useMemo(() => (skillsInput.trim() ? matchSkillIdeas(skillsInput) : []), [skillsInput]);

  const totalCustosFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const sobraMensal = rendaMensal - totalCustosFixos;
  const totalGastoVariavelMes = gastosVariaveis.reduce((sum, g) => sum + g.valor, 0);
  const saldoDisponivelMes = sobraMensal - totalGastoVariavelMes;
  const diasRestantes = daysLeftInMonth();
  const orcamentoDiario = saldoDisponivelMes > 0 ? saldoDisponivelMes / diasRestantes : 0;
  const deficitAtivo = sobraMensal < 0;
  const orcamentoApertado = sobraMensal >= 0 && totalCustosFixos > 0 && sobraMensal < totalCustosFixos * 0.1;
  const prosperityVisible = showProsperity || deficitAtivo || orcamentoApertado;

  const totalDividas = dividas.reduce((sum, d) => sum + d.valor, 0);
  const parcelasMinimas = dividas.reduce((sum, d) => sum + d.parcelaMinima, 0);
  const extraParaDividas = Math.max(0, sobraMensal * 0.3 - parcelasMinimas > 0 ? sobraMensal * 0.3 - parcelasMinimas : sobraMensal * 0.15);
  const debtPayoff = useMemo(() => simulateDebtPayoff(dividas, Math.max(0, extraParaDividas)), [dividas, extraParaDividas]);
  const temDividaCara = dividas.some((d) => d.jurosMensal >= 5);

  const multiplicadorReserva = { conservador: 6, moderado: 4, agressivo: 3 }[profileKey];
  const metaReserva = totalCustosFixos * multiplicadorReserva;
  const progressoReserva = metaReserva > 0 ? Math.min(100, (reservaAtual / metaReserva) * 100) : 0;
  const aporteSugeridoReserva = temDividaCara ? Math.max(0, sobraMensal * 0.1) : Math.max(0, sobraMensal * 0.25);

  function startVoiceCapture() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (e) => { setVoicePreview(parseVoiceExpense(e.results[0][0].transcript)); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }
  function startVoiceCaptureSkills() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    setIsListeningSkills(true);
    recognition.onresult = (e) => { const t = e.results[0][0].transcript; setSkillsInput((prev) => (prev ? `${prev}, ${t}` : t)); setIsListeningSkills(false); };
    recognition.onerror = () => setIsListeningSkills(false);
    recognition.onend = () => setIsListeningSkills(false);
    recognition.start();
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{
        "--ink": "#14291F", "--panel": "#1C3527", "--paper": "#EDE6D6", "--paper-dim": "#C9BFA4",
        "--gold": "#BE9A5C", "--rust": "#B14A34",
        background: "var(--ink)", color: "var(--paper)", fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');`}</style>

      <header className="px-5 pt-8 pb-6 md:px-10" style={{ borderBottom: "1px solid rgba(237,230,214,0.15)" }}>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--gold)" }}>
          <Compass size={16} />
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Protótipo</span>
        </div>
        <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>Bússola Vida Financeira</h1>
        <p className="mt-2 max-w-xl text-sm md:text-base" style={{ color: "var(--paper-dim)" }}>
          Organize seu dinheiro, saia do aperto e comece a guardar — do jeito mais simples e seguro possível.
        </p>
      </header>

      <div className="px-5 md:px-10 pt-6">
        <button onClick={() => setShowGuide((v) => !v)} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--gold)" }}>
          <HelpCircle size={16} /> Não sabe qual é o seu jeito de guardar dinheiro? Entenda antes de começar
          <ArrowRight size={14} style={{ transform: showGuide ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {showGuide && (
          <div className="mt-4 rounded-sm p-4 md:p-6" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {Object.entries(PROFILES).map(([key, p]) => {
                const d = PROFILE_DETAILS[key]; const Icon = p.icon;
                return (
                  <div key={key} className="p-3 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2"><Icon size={15} color="var(--gold)" /><span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{p.label}</span></div>
                    <ul className="space-y-1.5 text-xs" style={{ color: "var(--paper-dim)" }}>
                      <li><span style={{ color: "var(--paper)" }}>Quando precisa do dinheiro:</span> {d.horizon}</li>
                      <li><span style={{ color: "var(--paper)" }}>Como se sente com risco:</span> {d.risk}</li>
                      <li className="pt-1 italic">{d.fit}</li>
                    </ul>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }} className="pt-5">
              <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>Teste rápido — 3 perguntas</div>
              <div className="space-y-5">
                {QUIZ_QUESTIONS.map((item, qi) => (
                  <div key={qi}>
                    <p className="text-sm mb-2">{qi + 1}. {item.q}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {item.options.map((opt, oi) => {
                        const isChosen = quizAnswers[qi] === opt.profile;
                        return (
                          <button key={oi} onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: opt.profile }))}
                            className="flex-1 text-left text-xs px-3 py-2 rounded-sm transition-colors"
                            style={{ background: isChosen ? "rgba(190,154,92,0.16)" : "transparent", border: `1px solid ${isChosen ? "var(--gold)" : "rgba(237,230,214,0.2)"}`, color: isChosen ? "var(--gold)" : "var(--paper-dim)" }}>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {quizResult && (
                <div className="mt-5 flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
                  <div className="text-sm">
                    {quizResult.complete ? (<>Seu jeito: <span className="font-semibold" style={{ color: "var(--gold)" }}>{PROFILES[quizResult.top].label}</span></>) : (
                      <span style={{ color: "var(--paper-dim)" }}>Responda as {QUIZ_QUESTIONS.length} perguntas ({quizResult.answered}/{QUIZ_QUESTIONS.length})</span>
                    )}
                  </div>
                  {quizResult.complete && (
                    <button onClick={() => { setProfileKey(quizResult.top); setShowGuide(false); }} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Usar esse resultado</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 md:px-10 pt-6">
        <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>Seu jeito de guardar dinheiro</div>
        <div className="grid grid-cols-3 gap-2 max-w-xl">
          {Object.entries(PROFILES).map(([key, p]) => {
            const Icon = p.icon; const active = key === profileKey;
            return (
              <button key={key} onClick={() => setProfileKey(key)} className="flex flex-col items-start gap-1.5 p-3 rounded-sm text-left transition-colors"
                style={{ background: active ? "rgba(190,154,92,0.14)" : "var(--panel)", border: `1px solid ${active ? "var(--gold)" : "rgba(237,230,214,0.15)"}` }}>
                <Icon size={16} color={active ? "var(--gold)" : "var(--paper-dim)"} />
                <span className="text-sm font-semibold" style={{ color: active ? "var(--gold)" : "var(--paper)" }}>{p.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-2 max-w-xl" style={{ color: "var(--paper-dim)" }}>{profile.blurb}</p>
      </div>

      <div className="px-5 md:px-10 pt-6 flex gap-2">
        {[{ key: "vida-financeira", label: "Vida Financeira" }, { key: "renda-fixa", label: "Onde Guardar" }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-4 py-2 text-sm font-semibold rounded-sm transition-colors"
            style={{ background: tab === t.key ? "var(--panel)" : "transparent", color: tab === t.key ? "var(--gold)" : "var(--paper-dim)", borderBottom: `2px solid ${tab === t.key ? "var(--gold)" : "transparent"}` }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vida-financeira" && (
      <div className="px-5 py-6 md:px-10 max-w-3xl">
        {/* Diagnóstico */}
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>1. Quanto entra e quanto é fixo</div>

          <label className="text-[10px] uppercase tracking-wide block mb-2" style={{ color: "var(--paper-dim)" }}>Sua renda mensal</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--paper-dim)" }}>Renda fixa (salário)</label>
              <input type="number" min="0" value={rendaFixa} onChange={(e) => setRendaFixa(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--paper-dim)" }}>Renda variável (bico, comissão)</label>
              <input type="number" min="0" value={rendaVariavel} onChange={(e) => setRendaVariavel(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10px] block mb-1" style={{ color: "var(--paper-dim)" }}>Renda extra (freela)</label>
              <input type="number" min="0" value={rendaExtra} onChange={(e) => setRendaExtra(Math.max(0, Number(e.target.value)))}
                className="w-full text-sm px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Renda total:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {rendaMensal.toLocaleString("pt-BR")}</span>
          </div>

          <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Custos fixos do mês</label>

          {custosFixos.some((c) => statusVencimento(c.diaVencimento)?.urgente) && (
            <div className="flex items-start gap-2 mb-2 p-2.5 rounded-sm" style={{ background: "rgba(177,74,52,0.1)", border: "1px solid rgba(177,74,52,0.35)" }}>
              <AlertCircle size={14} color="var(--rust)" className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
                Você tem conta{custosFixos.filter((c) => statusVencimento(c.diaVencimento)?.urgente).length > 1 ? "s" : ""} vencida ou vencendo nos próximos dias.
              </p>
            </div>
          )}

          <div className="space-y-1.5 mb-2">
            {custosFixos.map((c) => {
              const status = statusVencimento(c.diaVencimento);
              return (
                <div key={c.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-sm" style={{ border: `1px solid ${status?.urgente ? "rgba(177,74,52,0.35)" : "rgba(237,230,214,0.12)"}` }}>
                  <div>
                    <span style={{ color: "var(--paper)" }}>{c.nome}</span>
                    {status && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-sm text-[10px]" style={{ border: `1px solid ${status.color}`, color: status.color }}>{status.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {c.valor.toLocaleString("pt-BR")}</span>
                    <button onClick={() => setCustosFixos((prev) => prev.filter((x) => x.id !== c.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Nome do custo" value={novoCustoFixo.nome} onChange={(e) => setNovoCustoFixo((f) => ({ ...f, nome: e.target.value }))}
              className="flex-1 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
            <input type="number" min="0" placeholder="R$" value={novoCustoFixo.valor} onChange={(e) => setNovoCustoFixo((f) => ({ ...f, valor: e.target.value }))}
              className="w-20 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <input type="number" min="1" max="31" placeholder="Dia venc." value={novoCustoFixo.diaVencimento} onChange={(e) => setNovoCustoFixo((f) => ({ ...f, diaVencimento: e.target.value }))}
              className="w-20 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <button onClick={() => { if (!novoCustoFixo.nome || !novoCustoFixo.valor) return; setCustosFixos((prev) => [...prev, { id: Date.now(), nome: novoCustoFixo.nome, valor: Number(novoCustoFixo.valor), diaVencimento: novoCustoFixo.diaVencimento ? Number(novoCustoFixo.diaVencimento) : null }]); setNovoCustoFixo({ nome: "", valor: "", diaVencimento: "" }); }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>+</button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            <div><div className="text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>Renda</div><div className="text-sm font-semibold" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {rendaMensal.toLocaleString("pt-BR")}</div></div>
            <div><div className="text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>Custos fixos</div><div className="text-sm font-semibold" style={{ color: "var(--rust)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {totalCustosFixos.toLocaleString("pt-BR")}</div></div>
            <div><div className="text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>Sobra</div><div className="text-sm font-semibold" style={{ color: sobraMensal >= 0 ? "var(--gold)" : "var(--rust)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {sobraMensal.toLocaleString("pt-BR")}</div></div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            <div>
              <div className="text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>Custo Variável (ex: mercado, transporte)</div>
              <div className="text-sm font-semibold" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {totalCustosVariaveis.toLocaleString("pt-BR")}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>Custos Extras (ex: conserto, emergência)</div>
              <div className="text-sm font-semibold" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {totalCustosExtras.toLocaleString("pt-BR")}</div>
            </div>
          </div>

          {sobraMensal < 0 && (
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--rust)" }}>Seus custos fixos já superam sua renda. O foco agora é rever esses custos ou buscar uma renda extra.</p>
          )}

          <button onClick={() => setShowProsperity((v) => !v)} className="flex items-center gap-2 text-sm font-semibold mt-4 px-4 py-2.5 rounded-sm transition-colors" style={{ background: "var(--gold)", color: "var(--ink)" }}>
            <Compass size={16} />
            {prosperityVisible ? "Ocultar ideias de renda extra" : "Ver ideias de renda extra"}
            <ArrowRight size={14} style={{ transform: prosperityVisible ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        </div>

        {prosperityVisible && (
          <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--gold)" }}><Compass size={14} /> Ideias de renda extra</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--paper)" }}>
              {deficitAtivo ? `Seu orçamento está R$ ${Math.abs(sobraMensal).toLocaleString("pt-BR")} negativo esse mês. Separei opções pro seu jeito ${profile.label.toLowerCase()}.`
                : orcamentoApertado ? `Sua sobra está bem apertada (R$ ${sobraMensal.toLocaleString("pt-BR")}). Aqui vão ideias pro seu jeito ${profile.label.toLowerCase()}:`
                : `Suas finanças estão em bom equilíbrio. Aqui vão ideias caso queira acelerar seus objetivos:`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INCOME_IDEAS[profileKey].map((idea) => (
                <div key={idea.title} className="p-3 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
                  <div className="text-sm font-semibold mb-1" style={{ color: "var(--paper)" }}>{idea.title}</div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>{idea.desc}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{idea.potencial}</span>
                    <span className="px-2 py-0.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Esforço: {idea.esforco}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(190,154,92,0.25)" }}>
              <button onClick={() => setShowSkillsInput((v) => !v)} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--gold)" }}>
                <Brain size={13} /> Diga pra mim: quais habilidades você possui?
                <ArrowRight size={11} style={{ transform: showSkillsInput ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {showSkillsInput && (
                <div className="mt-3">
                  <p className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>Liste ou fale as habilidades que você tem — ex: "cozinhar, costura, dirigir".</p>
                  <div className="flex gap-2 mb-3">
                    <input type="text" placeholder="ex: costura, cozinhar..." value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
                    <button onClick={startVoiceCaptureSkills} className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1"
                      style={{ background: isListeningSkills ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningSkills ? "var(--paper)" : "var(--gold)" }}>
                      {isListeningSkills ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>
                  </div>
                  {skillsInput.trim() && (matchedSkillIdeas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matchedSkillIdeas.map((idea) => (
                        <div key={idea.title} className="p-3 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(190,154,92,0.3)" }}>
                          <div className="text-sm font-semibold mb-1" style={{ color: "var(--paper)" }}>{idea.title}</div>
                          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>{idea.desc}</p>
                          <div className="flex items-center justify-between text-[10px]">
                            <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{idea.potencial}</span>
                            <span className="px-2 py-0.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Esforço: {idea.esforco}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>Tenta palavras-chave diretas, tipo "costura", "cozinhar", "dirigir".</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orçamento diário */}
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>2. Quanto dá pra gastar por dia</div>
          <div className="rounded-sm p-4 mb-4 text-center" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="text-xs uppercase" style={{ color: "var(--paper-dim)" }}>Você pode gastar hoje até</div>
            <div className="text-3xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>R$ {orcamentoDiario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-xs mt-1" style={{ color: "var(--paper-dim)" }}>faltam {diasRestantes} dias no mês, saldo disponível R$ {saldoDisponivelMes.toLocaleString("pt-BR")}</div>
          </div>

          <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Registrar um gasto — digitando ou por áudio</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="p-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--paper)" }}>Custo Variável</div>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>Gastos do dia a dia que mudam de mês pra mês, mas você já espera — mercado, transporte, lazer.</p>
            </div>
            <div className="p-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--paper)" }}>Custo Extra</div>
              <p className="text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>Gastos fora da rotina, que você não esperava — um conserto, um presente, uma emergência.</p>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            {[{ key: "variavel", label: "Variável" }, { key: "extra", label: "Extra" }].map((t) => (
              <button key={t.key} onClick={() => setNovoGasto((f) => ({ ...f, tipo: t.key }))} className="px-3 py-1 text-xs rounded-sm"
                style={{ background: novoGasto.tipo === t.key ? "var(--gold)" : "transparent", color: novoGasto.tipo === t.key ? "var(--ink)" : "var(--paper-dim)", border: `1px solid ${novoGasto.tipo === t.key ? "var(--gold)" : "rgba(237,230,214,0.25)"}` }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="ex: mercado, uber..." value={novoGasto.nome} onChange={(e) => setNovoGasto((f) => ({ ...f, nome: e.target.value }))}
              className="flex-1 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
            <input type="number" min="0" placeholder="R$" value={novoGasto.valor} onChange={(e) => setNovoGasto((f) => ({ ...f, valor: e.target.value }))}
              className="w-24 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <button onClick={() => { if (!novoGasto.nome || !novoGasto.valor) return; setGastosVariaveis((prev) => [{ id: Date.now(), nome: novoGasto.nome, valor: Number(novoGasto.valor), tipo: novoGasto.tipo }, ...prev]); setNovoGasto({ nome: "", valor: "", tipo: "variavel" }); }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>+</button>
            <button onClick={startVoiceCapture} className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: isListening ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListening ? "var(--paper)" : "var(--gold)" }}>
              {isListening ? <MicOff size={13} /> : <Mic size={13} />}
              {isListening ? "Ouvindo..." : "Por áudio"}
            </button>
          </div>
          {!voiceSupported && <p className="text-[10px] mb-2" style={{ color: "var(--paper-dim)" }}>Voz não suportada nesse navegador — use o campo de texto.</p>}
          {voicePreview && (
            <div className="mb-3 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
              <div className="text-xs mb-2" style={{ color: "var(--paper)" }}>
                Entendi: <strong>"{voicePreview.nome}"</strong> — {EXPENSE_CATEGORIES.find((c) => c.key === voicePreview.categoria)?.label}
                {voicePreview.valor ? ` · R$ ${voicePreview.valor.toLocaleString("pt-BR")}` : " · não identifiquei o valor"}
              </div>
              <div className="flex gap-2 mb-2">
                {[{ key: "variavel", label: "Variável" }, { key: "extra", label: "Extra" }].map((t) => (
                  <button key={t.key} onClick={() => setVoicePreview((v) => ({ ...v, tipo: t.key }))} className="px-3 py-1 text-xs rounded-sm"
                    style={{ background: voicePreview.tipo === t.key ? "var(--gold)" : "transparent", color: voicePreview.tipo === t.key ? "var(--ink)" : "var(--paper-dim)", border: `1px solid ${voicePreview.tipo === t.key ? "var(--gold)" : "rgba(237,230,214,0.25)"}` }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (voicePreview.valor) setGastosVariaveis((prev) => [{ id: Date.now(), nome: voicePreview.nome, valor: voicePreview.valor, tipo: voicePreview.tipo || "variavel" }, ...prev]); setVoicePreview(null); }}
                  className="text-xs font-semibold px-3 py-1 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Confirmar</button>
                <button onClick={() => setVoicePreview(null)} className="text-xs px-3 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Descartar</button>
              </div>
            </div>
          )}
          {gastosVariaveis.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-2 text-xs">
                <span style={{ color: "var(--paper-dim)" }}>Custos Variáveis: <strong style={{ color: "var(--paper)" }}>R$ {totalCustosVariaveis.toLocaleString("pt-BR")}</strong></span>
                <span style={{ color: "var(--paper-dim)" }}>Custos Extras: <strong style={{ color: "var(--paper)" }}>R$ {totalCustosExtras.toLocaleString("pt-BR")}</strong></span>
              </div>
              <div className="space-y-1.5">
                {gastosVariaveis.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                    <span style={{ color: "var(--paper)" }}>
                      {g.nome}{" "}
                      <span className="ml-1 px-1.5 py-0.5 rounded-sm text-[10px]" style={{ border: `1px solid ${g.tipo === "extra" ? "rgba(177,74,52,0.4)" : "rgba(190,154,92,0.4)"}`, color: g.tipo === "extra" ? "var(--rust)" : "var(--gold)" }}>
                        {g.tipo === "extra" ? "Extra" : "Variável"}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {g.valor.toLocaleString("pt-BR")}</span>
                      <button onClick={() => setGastosVariaveis((prev) => prev.filter((x) => x.id !== g.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dívidas */}
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}><CreditCard size={13} /> 3. Sair das dívidas</div>
          <div className="space-y-1.5 mb-3">
            {dividas.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                <span style={{ color: "var(--paper)" }}>{d.nome} <span style={{ color: "var(--paper-dim)" }}>· {d.jurosMensal}% a.m.</span></span>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {d.valor.toLocaleString("pt-BR")}</span>
                  <button onClick={() => setDividas((prev) => prev.filter((x) => x.id !== d.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <input type="text" placeholder="Nome (ex: cartão)" value={novaDivida.nome} onChange={(e) => setNovaDivida((f) => ({ ...f, nome: e.target.value }))} className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
            <input type="number" placeholder="Valor total" value={novaDivida.valor} onChange={(e) => setNovaDivida((f) => ({ ...f, valor: e.target.value }))} className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <input type="number" placeholder="Juros % a.m." value={novaDivida.jurosMensal} onChange={(e) => setNovaDivida((f) => ({ ...f, jurosMensal: e.target.value }))} className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <input type="number" placeholder="Parcela mínima" value={novaDivida.parcelaMinima} onChange={(e) => setNovaDivida((f) => ({ ...f, parcelaMinima: e.target.value }))} className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <button onClick={() => { if (!novaDivida.nome || !novaDivida.valor) return; setDividas((prev) => [...prev, { id: Date.now(), nome: novaDivida.nome, valor: Number(novaDivida.valor), jurosMensal: Number(novaDivida.jurosMensal) || 0, parcelaMinima: Number(novaDivida.parcelaMinima) || 0 }]); setNovaDivida({ nome: "", valor: "", jurosMensal: "", parcelaMinima: "" }); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Adicionar dívida</button>

          {dividas.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--paper)" }}>
                Priorizando a dívida de maior juro, com R$ {extraParaDividas.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} extra por mês, você fica livre de dívidas em <strong style={{ color: "var(--gold)" }}>{debtPayoff.meses} meses</strong>, pagando cerca de R$ {debtPayoff.totalJurosPago.toLocaleString("pt-BR")} em juros.
              </p>
              {temDividaCara && <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--rust)" }}>Você tem dívida com juro alto (5%+ ao mês) — priorize quitar isso antes de guardar dinheiro.</p>}
            </div>
          )}
        </div>

        {/* Reserva de emergência */}
        <div className="rounded-sm p-4 md:p-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--gold)" }}><Umbrella size={13} /> 4. Sua reserva de emergência</div>
          <button onClick={() => setShowReservaDuvida((v) => !v)} className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "var(--paper-dim)" }}>
            <HelpCircle size={12} />
            (Posso investir esse valor?)
            <ArrowRight size={10} style={{ transform: showReservaDuvida ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {showReservaDuvida && (
            <p className="text-xs leading-relaxed mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)", color: "var(--paper)" }}>
              Sim — o ideal é não deixar parado rendendo zero. Mas a reserva precisa de <strong>liquidez imediata</strong> (poder sacar a qualquer momento) e <strong>nenhum risco de perder valor</strong>. Nada de ações ou algo com carência — o certo é <strong style={{ color: "var(--gold)" }}>CDB com liquidez diária</strong> ou <strong style={{ color: "var(--gold)" }}>Tesouro Selic</strong>, na aba "Onde Guardar".
            </p>
          )}

          <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Quanto você já tem guardado (R$)</label>
          <input type="number" min="0" value={reservaAtual} onChange={(e) => setReservaAtual(Math.max(0, Number(e.target.value)))}
            className="w-40 text-sm px-2 py-1.5 rounded-sm mb-4" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: "var(--paper-dim)" }}>Meta: {multiplicadorReserva}x seus custos fixos</span>
            <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {metaReserva.toLocaleString("pt-BR")}</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "rgba(237,230,214,0.1)" }}><div className="h-2 rounded-full" style={{ width: `${progressoReserva}%`, background: "var(--gold)" }} /></div>
          <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{progressoReserva.toFixed(0)}% da meta</div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--paper)" }}>
            Guarde por mês: <strong style={{ color: "var(--gold)" }}>R$ {aporteSugeridoReserva.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
          </p>
        </div>

        {/* Fundo de investimento */}
        <div className="rounded-sm p-4 md:p-5 mt-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}><Wallet size={13} /> 5. O que você já guardou</div>
          <p className="text-xs mb-3" style={{ color: "var(--paper-dim)" }}>Registre o que você já tem guardado — o nome e o valor aplicado em cada um.</p>
          <div className="space-y-1.5 mb-3">
            {investimentos.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                <span style={{ color: "var(--paper)" }}>{inv.ativo}</span>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {inv.valor.toLocaleString("pt-BR")}</span>
                  <button onClick={() => setInvestimentos((prev) => prev.filter((x) => x.id !== inv.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="ex: CDB Nubank, Tesouro Selic..." value={novoInvestimento.ativo} onChange={(e) => setNovoInvestimento((f) => ({ ...f, ativo: e.target.value }))}
              className="flex-1 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
            <input type="number" min="0" placeholder="Valor" value={novoInvestimento.valor} onChange={(e) => setNovoInvestimento((f) => ({ ...f, valor: e.target.value }))}
              className="w-28 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <button onClick={() => { if (!novoInvestimento.ativo || !novoInvestimento.valor) return; setInvestimentos((prev) => [...prev, { id: Date.now(), ativo: novoInvestimento.ativo, valor: Number(novoInvestimento.valor) }]); setNovoInvestimento({ ativo: "", valor: "" }); }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>+</button>
          </div>
          {investimentos.length > 0 && (
            <div className="mt-4 pt-3 flex items-center justify-between text-sm" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
              <span style={{ color: "var(--paper-dim)" }}>Total já guardado</span>
              <span className="font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {totalInvestido.toLocaleString("pt-BR")}</span>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
          Dados desta sessão são ilustrativos e não persistem entre acessos nesta versão de protótipo.
        </p>
      </div>
      )}

      {tab === "renda-fixa" && (
      <>
      <div className="px-5 md:px-10 pt-5">
        <button onClick={() => setShowAssetInfo((v) => !v)} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--gold)" }}>
          <HelpCircle size={14} /> O que é renda fixa?
          <ArrowRight size={11} style={{ transform: showAssetInfo ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
        </button>
        {showAssetInfo && (
          <p className="mt-2 text-xs leading-relaxed max-w-2xl" style={{ color: "var(--paper-dim)" }}>
            Renda fixa é quando você empresta dinheiro (pro banco ou pro governo) e já sabe, desde o início, a regra de quanto vai receber de volta — por isso é mais previsível e segura.
          </p>
        )}
      </div>
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedRF.map((p, i) => {
            const isActive = p.id === selectedRF.id; const cc = classifyRF(p.profileScore);
            return (
              <button key={p.id} onClick={() => setRfSelectedId(p.id)} className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{ borderBottom: "1px solid rgba(237,230,214,0.15)", background: isActive ? "rgba(190,154,92,0.12)" : "transparent" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}>{p.profileScore}</div>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{p.taxaLabel} <span className="opacity-70">(≈{pctDaSelic(p.taxaAnual)}% da Selic)</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>+R$ {estimativa12Meses(p.taxaAnual).ganho.toLocaleString("pt-BR")}</div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>em 12m / R$1.000</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>Onde guardar</div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{selectedRF.name}</h2>
              <div className="text-sm mt-1" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedRF.taxaLabel} <span style={{ color: "var(--paper-dim)" }}>≈ {pctDaSelic(selectedRF.taxaAnual)}% da Selic ({selectedRF.taxaAnual.toFixed(2)}% a.a.)</span>
              </div>
            </div>
            <Seal score={selectedRF.profileScore} />
          </div>
          <div className="mt-2 text-sm font-medium" style={{ color: classifyRF(selectedRF.profileScore).color }}>{classifyRF(selectedRF.profileScore).label}</div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Liquidez: {selectedRF.liquidez}</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>{selectedRF.protecao}</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: `1px solid ${selectedRF.isentoIR ? "var(--gold)" : "rgba(237,230,214,0.25)"}`, color: selectedRF.isentoIR ? "var(--gold)" : "var(--paper-dim)" }}>{selectedRF.isentoIR ? "Isento de Imposto de Renda" : "IR pela tabela regressiva"}</span>
          </div>

          <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
              Resumindo: <strong style={{ color: "var(--gold)" }}>{selectedRF.taxaLabel}</strong>, o equivalente a <strong style={{ color: "var(--gold)" }}>≈{pctDaSelic(selectedRF.taxaAnual)}% da Selic</strong> ao ano.
              {" "}Guardando <strong>R$ 1.000</strong> por 12 meses nessa taxa, você teria aproximadamente{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {estimativa12Meses(selectedRF.taxaAnual).total.toLocaleString("pt-BR")}</strong>{" "}
              (ganho de R$ {estimativa12Meses(selectedRF.taxaAnual).ganho.toLocaleString("pt-BR")}, antes de eventual IR).
            </p>
          </div>

          <div className="mt-5 relative">
            <button onClick={() => setShowBrokers((v) => !v)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
              <ShoppingCart size={15} /> Guardar em {selectedRF.name}
            </button>
            {showBrokers && (
              <div className="mt-2 max-w-sm rounded-sm p-3" style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>Abrir direto no seu banco/app:</div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors" style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}>
                      {b.name} <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu? Registre aqui pra entrar automaticamente no que você já guardou:</p>
                  <div className="flex gap-2">
                    <input type="number" min="0" placeholder="Valor aplicado (R$)" value={confirmValor} onChange={(e) => setConfirmValor(e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
                    <button onClick={() => registrarAplicacao(selectedRF.name)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Confirmar</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Só mostramos aqui as opções mais seguras — protegidas pelo FGC ou pelo Tesouro Nacional. Dados ilustrativos nesta versão de protótipo.
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
