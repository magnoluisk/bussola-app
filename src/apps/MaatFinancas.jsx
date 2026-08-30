import React, { useState, useMemo, useEffect } from "react";
import { Check, X, TrendingUp, TrendingDown, ChevronRight, Globe2, Shield, Zap, Scale, HelpCircle, ArrowRight, ShoppingCart, ExternalLink, Layers, PiggyBank, Bitcoin, AlertTriangle, FileText, BookOpen, Brain, Receipt, AlertCircle, Mail, RefreshCw, Wallet, CreditCard, Umbrella, Mic, MicOff, Trash2, Compass, PieChart, Landmark, Building2, Eye, EyeOff, Link2, Pencil, Search, Headphones, Volume2, Calendar, Flag, Bell, Target } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// ---------- Dados de exemplo (mock) ----------
const COMPANIES = [
  { ticker: "WEGE3", name: "WEG S.A.", market: "B3", sector: "Bens de Capital", currency: "R$", price: 42.15,
    roe: 22.4, debtEquity: 0.18, netMargin: 15.2, growth5y: 18.6, pe: 24.1, pb: 5.4, divYield: 1.2 },
  { ticker: "TAEE11", name: "Taesa", market: "B3", sector: "Energia", currency: "R$", price: 35.80,
    roe: 19.1, debtEquity: 0.61, netMargin: 38.7, growth5y: 6.2, pe: 9.8, pb: 1.9, divYield: 8.9 },
  { ticker: "ITUB4", name: "Itaú Unibanco", market: "B3", sector: "Financeiro", currency: "R$", price: 34.20,
    roe: 21.6, debtEquity: 0.42, netMargin: 24.3, growth5y: 9.1, pe: 8.9, pb: 1.8, divYield: 5.4 },
  { ticker: "PETR4", name: "Petrobras", market: "B3", sector: "Petróleo e Gás", currency: "R$", price: 38.90,
    roe: 28.3, debtEquity: 0.58, netMargin: 21.5, growth5y: -3.2, pe: 4.6, pb: 1.3, divYield: 14.2 },
  { ticker: "MGLU3", name: "Magazine Luiza", market: "B3", sector: "Varejo", currency: "R$", price: 8.40,
    roe: -4.1, debtEquity: 1.85, netMargin: -2.8, growth5y: -12.4, pe: 0, pb: 3.1, divYield: 0 },
  { ticker: "AAPL", name: "Apple Inc.", market: "EUA", sector: "Tecnologia", currency: "US$", price: 228.50,
    roe: 154.9, debtEquity: 1.79, netMargin: 26.4, growth5y: 11.3, pe: 31.2, pb: 48.6, divYield: 0.5 },
  { ticker: "MSFT", name: "Microsoft Corp.", market: "EUA", sector: "Tecnologia", currency: "US$", price: 415.20,
    roe: 38.5, debtEquity: 0.35, netMargin: 35.6, growth5y: 16.8, pe: 34.7, pb: 11.2, divYield: 0.8 },
  { ticker: "JNJ", name: "Johnson & Johnson", market: "EUA", sector: "Saúde", currency: "US$", price: 156.80,
    roe: 25.1, debtEquity: 0.48, netMargin: 19.8, growth5y: 5.4, pe: 15.9, pb: 5.9, divYield: 3.1 },
  { ticker: "KO", name: "Coca-Cola Co.", market: "EUA", sector: "Consumo", currency: "US$", price: 63.10,
    roe: 44.2, debtEquity: 1.72, netMargin: 22.9, growth5y: 4.8, pe: 24.3, pb: 10.8, divYield: 2.9 },
  { ticker: "TSLA", name: "Tesla Inc.", market: "EUA", sector: "Automotivo", currency: "US$", price: 245.90,
    roe: 9.8, debtEquity: 0.19, netMargin: 7.9, growth5y: 24.1, pe: 68.4, pb: 6.7, divYield: 0 },
  // BDRs — mesmas empresas dos EUA, negociadas em reais direto na B3
  { ticker: "AAPL34", name: "Apple Inc. (BDR)", market: "BDR", sector: "Tecnologia", currency: "R$", price: 46.50,
    roe: 154.9, debtEquity: 1.79, netMargin: 26.4, growth5y: 11.3, pe: 31.2, pb: 48.6, divYield: 0.5 },
  { ticker: "MSFT34", name: "Microsoft Corp. (BDR)", market: "BDR", sector: "Tecnologia", currency: "R$", price: 84.10,
    roe: 38.5, debtEquity: 0.35, netMargin: 35.6, growth5y: 16.8, pe: 34.7, pb: 11.2, divYield: 0.8 },
  { ticker: "GOGL34", name: "Alphabet Inc. (BDR)", market: "BDR", sector: "Tecnologia", currency: "R$", price: 32.90,
    roe: 30.2, debtEquity: 0.11, netMargin: 28.6, growth5y: 15.2, pe: 24.8, pb: 6.9, divYield: 0 },
  { ticker: "NVDC34", name: "Nvidia Corp. (BDR)", market: "BDR", sector: "Tecnologia", currency: "R$", price: 29.70,
    roe: 91.5, debtEquity: 0.24, netMargin: 55.8, growth5y: 62.1, pe: 45.9, pb: 38.2, divYield: 0.03 },
  { ticker: "JNJB34", name: "Johnson & Johnson (BDR)", market: "BDR", sector: "Saúde", currency: "R$", price: 31.70,
    roe: 25.1, debtEquity: 0.48, netMargin: 19.8, growth5y: 5.4, pe: 15.9, pb: 5.9, divYield: 3.1 },
];

// ---------- Critérios de avaliação (inspirados em Graham / Buffett) ----------
const CRITERIA = [
  { key: "roe", label: "Retorno sobre o Patrimônio", short: "ROE", unit: "%", test: (v) => v >= 15, direction: "up" },
  { key: "debtEquity", label: "Dívida sobre Patrimônio", short: "Dívida/PL", unit: "x", test: (v) => v <= 0.6, direction: "down" },
  { key: "netMargin", label: "Margem Líquida", short: "Margem", unit: "%", test: (v) => v >= 10, direction: "up" },
  { key: "growth5y", label: "Crescimento de Lucro (5 anos)", short: "Crescimento", unit: "%", test: (v) => v >= 5, direction: "up" },
  { key: "pe", label: "Preço sobre Lucro", short: "P/L", unit: "x", test: (v) => v > 0 && v <= 22, direction: "down" },
  { key: "divYield", label: "Dividend Yield", short: "Div. Yield", unit: "%", test: (v) => v >= 2, direction: "up" },
];

// ---------- Perfis de investidor: cada um pesa os critérios de um jeito ----------
const PROFILES = {
  conservador: {
    label: "Conservador",
    icon: Shield,
    blurb: "Prioriza empresas estáveis, com baixa dívida e bons dividendos.",
    weights: { roe: 0.8, debtEquity: 1.6, netMargin: 1.1, growth5y: 0.4, pe: 1.1, divYield: 1.6 },
  },
  moderado: {
    label: "Moderado",
    icon: Scale,
    blurb: "Equilíbrio entre segurança e crescimento, sem concentrar em um único fator.",
    weights: { roe: 1, debtEquity: 1, netMargin: 1, growth5y: 1, pe: 1, divYield: 1 },
  },
  agressivo: {
    label: "Agressivo",
    icon: Zap,
    blurb: "Prioriza crescimento e retorno sobre capital, tolera mais dívida e preço.",
    weights: { roe: 1.6, debtEquity: 0.4, netMargin: 1.1, growth5y: 1.8, pe: 0.5, divYield: 0.3 },
  },
};

// ---------- Conteúdo educativo: explica cada perfil pra quem ainda não sabe o seu ----------
const PROFILE_DETAILS = {
  conservador: {
    horizon: "Curto a médio prazo (até 3 anos)",
    risk: "Baixa tolerância a ver o patrimônio cair, mesmo temporariamente",
    focus: "Preservar o capital e gerar renda recorrente com dividendos",
    fit: "Quem prioriza dormir tranquilo a tentar maximizar ganho.",
  },
  moderado: {
    horizon: "Médio prazo (2 a 5 anos)",
    risk: "Aceita oscilações moderadas em troca de um crescimento melhor",
    focus: "Equilíbrio entre segurança e valorização do patrimônio",
    fit: "Quem quer crescer o patrimônio sem abrir mão de uma base sólida.",
  },
  agressivo: {
    horizon: "Longo prazo (5 anos ou mais)",
    risk: "Tolera quedas fortes no caminho em troca de retorno maior",
    focus: "Maximizar crescimento, mesmo com mais volatilidade",
    fit: "Quem consegue manter a cabeça fria em cenários de queda.",
  },
};

// perguntas simples de suitability pra sugerir um perfil de forma automática
const QUIZ_QUESTIONS = [
  {
    q: "Se seus investimentos caíssem 20% em um único mês, você...",
    options: [
      { text: "Venderia para evitar perder mais", profile: "conservador" },
      { text: "Manteria a posição e esperaria recuperar", profile: "moderado" },
      { text: "Aproveitaria pra comprar mais, com o preço mais baixo", profile: "agressivo" },
    ],
  },
  {
    q: "Qual frase descreve melhor seu objetivo com os investimentos?",
    options: [
      { text: "Proteger o que já conquistei", profile: "conservador" },
      { text: "Crescer o patrimônio com equilíbrio", profile: "moderado" },
      { text: "Maximizar o retorno, mesmo assumindo mais risco", profile: "agressivo" },
    ],
  },
  {
    q: "Por quanto tempo pretende deixar esse dinheiro investido?",
    options: [
      { text: "Menos de 2 anos", profile: "conservador" },
      { text: "Entre 2 e 5 anos", profile: "moderado" },
      { text: "Mais de 5 anos", profile: "agressivo" },
    ],
  },
  {
    q: "Como você reage a notícias ruins sobre a economia?",
    options: [
      { text: "Fico inquieto e revejo minhas posições", profile: "conservador" },
      { text: "Acompanho, mas mantenho o plano original", profile: "moderado" },
      { text: "Vejo como possível oportunidade", profile: "agressivo" },
    ],
  },
];

// corretoras pra redirecionamento de compra — versão final trocaria por deep link/API real de parceiro
const BROKERS = [
  { name: "XP Investimentos", url: "https://www.xpi.com.br/" },
  { name: "Rico", url: "https://www.rico.com.vc/" },
  { name: "Itaú", url: "https://www.itau.com.br/investimentos/" },
  { name: "Bradesco", url: "https://banco.bradesco/" },
];

// ---------- Estimativas de rendimento (Selic de referência + projeção em 12 meses) ----------
// Selic ilustrativa nesta versão de protótipo — numa versão conectada viria de dado real (BCB)
const SELIC_REFERENCE = 11.0;

function pctDaSelic(taxaAnual) {
  return Math.round((taxaAnual / SELIC_REFERENCE) * 100);
}

// projeta quanto um valor de referência renderia em 12 meses, dada uma taxa anual (%)
function estimativa12Meses(taxaAnual, valorBase = 1000) {
  const ganho = valorBase * (taxaAnual / 100);
  return { valorBase, ganho: Math.round(ganho), total: Math.round(valorBase + ganho) };
}

// ---------- Renda fixa (dados de exemplo) ----------
const FIXED_INCOME = [
  { id: "cdb-xp-diaria", name: "CDB XP Liquidez Diária", type: "CDB", indexador: "CDI",
    taxaLabel: "100% do CDI", taxaAnual: 10.9, liquidez: "Diária", liquidezScore: 100,
    prazoMeses: 0, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: false },
  { id: "cdb-inter-2a", name: "CDB Banco Inter 2 anos", type: "CDB", indexador: "CDI",
    taxaLabel: "118% do CDI", taxaAnual: 12.9, liquidez: "No vencimento", liquidezScore: 20,
    prazoMeses: 24, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: false },
  { id: "cdb-c6-diaria", name: "CDB C6 Bank Liquidez Diária", type: "CDB", indexador: "CDI",
    taxaLabel: "102% do CDI", taxaAnual: 11.1, liquidez: "Diária", liquidezScore: 100,
    prazoMeses: 0, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: false },
  { id: "tesouro-selic", name: "Tesouro Selic 2029", type: "Tesouro Direto", indexador: "Selic",
    taxaLabel: "Selic + 0,05%", taxaAnual: 10.95, liquidez: "Diária (D+1)", liquidezScore: 95,
    prazoMeses: 36, protecao: "Garantia do Tesouro Nacional", protecaoScore: 100, isentoIR: false },
  { id: "tesouro-ipca", name: "Tesouro IPCA+ 2035", type: "Tesouro Direto", indexador: "IPCA+",
    taxaLabel: "IPCA + 6,20%", taxaAnual: 12.4, liquidez: "Marcação a mercado", liquidezScore: 35,
    prazoMeses: 108, protecao: "Garantia do Tesouro Nacional", protecaoScore: 100, isentoIR: false },
  { id: "tesouro-pre", name: "Tesouro Prefixado 2028", type: "Tesouro Direto", indexador: "Prefixado",
    taxaLabel: "11,85% a.a.", taxaAnual: 11.85, liquidez: "Marcação a mercado", liquidezScore: 35,
    prazoMeses: 24, protecao: "Garantia do Tesouro Nacional", protecaoScore: 100, isentoIR: false },
  { id: "lci-bradesco", name: "LCI Bradesco", type: "LCI", indexador: "CDI",
    taxaLabel: "94% do CDI", taxaAnual: 10.3, liquidez: "Carência 90 dias", liquidezScore: 55,
    prazoMeses: 12, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: true },
  { id: "lca-santander", name: "LCA Santander", type: "LCA", indexador: "CDI",
    taxaLabel: "92% do CDI", taxaAnual: 10.05, liquidez: "No vencimento", liquidezScore: 25,
    prazoMeses: 18, protecao: "FGC até R$ 250 mil", protecaoScore: 90, isentoIR: true },
];

// pesos por perfil pra renda fixa: o que cada perfil valoriza mais na hora de escolher
const RF_PROFILE_WEIGHTS = {
  conservador: { taxa: 0.6, liquidez: 1.6, protecao: 1.5, prazo: 1.3 },
  moderado: { taxa: 1, liquidez: 1, protecao: 1, prazo: 1 },
  agressivo: { taxa: 1.8, liquidez: 0.5, protecao: 0.6, prazo: 0.4 },
};

function normalizeRF(product, key) {
  if (key === "taxa") return Math.min(100, Math.max(0, (product.taxaAnual - 9) * 22));
  if (key === "liquidez") return product.liquidezScore;
  if (key === "protecao") return product.protecaoScore;
  if (key === "prazo") return Math.max(0, 100 - product.prazoMeses * 0.9);
  return 0;
}

function weightedScoreRF(product, profileKey) {
  const weights = RF_PROFILE_WEIGHTS[profileKey];
  let sum = 0;
  let totalWeight = 0;
  Object.keys(weights).forEach((key) => {
    sum += normalizeRF(product, key) * weights[key];
    totalWeight += weights[key];
  });
  return Math.round(sum / totalWeight);
}

function classifyRF(score) {
  if (score >= 75) return { label: "Excelente encaixe pro perfil", color: "var(--gold)" };
  if (score >= 45) return { label: "Encaixe razoável, vale comparar", color: "var(--paper-dim)" };
  return { label: "Não é prioridade pra esse perfil", color: "var(--rust)" };
}

// ---------- Fundos Imobiliários (dados de exemplo) ----------
const FIIS = [
  { ticker: "HGLG11", name: "CSHG Logística", tipo: "Tijolo", segmento: "Galpões Logísticos", price: 168.40,
    divYieldAnual: 9.1, pvp: 0.98, liquidezScore: 90, vacancia: 3.2 },
  { ticker: "BTLG11", name: "BTG Pactual Logística", tipo: "Tijolo", segmento: "Galpões Logísticos", price: 101.20,
    divYieldAnual: 8.9, pvp: 0.96, liquidezScore: 85, vacancia: 2.1 },
  { ticker: "XPML11", name: "XP Malls", tipo: "Tijolo", segmento: "Shopping Centers", price: 112.75,
    divYieldAnual: 8.6, pvp: 0.95, liquidezScore: 88, vacancia: 5.4 },
  { ticker: "VISC11", name: "Vinci Shopping Centers", tipo: "Tijolo", segmento: "Shopping Centers", price: 118.90,
    divYieldAnual: 8.3, pvp: 0.93, liquidezScore: 75, vacancia: 6.1 },
  { ticker: "KNRI11", name: "Kinea Renda Imobiliária", tipo: "Tijolo", segmento: "Lajes Corporativas + Logística", price: 152.30,
    divYieldAnual: 8.0, pvp: 1.02, liquidezScore: 92, vacancia: 4.3 },
  { ticker: "MXRF11", name: "Maxi Renda", tipo: "Papel", segmento: "CRI / Recebíveis", price: 10.35,
    divYieldAnual: 11.4, pvp: 1.05, liquidezScore: 98, vacancia: 0 },
  { ticker: "KNCR11", name: "Kinea Rendimentos Imobiliários", tipo: "Papel", segmento: "CRI indexado ao CDI", price: 103.80,
    divYieldAnual: 10.8, pvp: 0.99, liquidezScore: 93, vacancia: 0 },
  { ticker: "RBRF11", name: "RBR Alpha Multiestratégia", tipo: "Fundo de Fundos", segmento: "Cotas de outros FIIs", price: 78.60,
    divYieldAnual: 9.6, pvp: 0.91, liquidezScore: 70, vacancia: 0 },
];

// pesos por perfil pra FIIs: conservador prioriza previsibilidade (yield, liquidez, desconto sobre o patrimônio,
// baixa vacância); agressivo tolera mais vacância/prêmio no preço em troca de teses de valorização
const FII_PROFILE_WEIGHTS = {
  conservador: { divYield: 1.3, pvp: 1.3, liquidez: 1.5, vacancia: 1.5 },
  moderado: { divYield: 1, pvp: 1, liquidez: 1, vacancia: 1 },
  agressivo: { divYield: 1.4, pvp: 0.5, liquidez: 0.6, vacancia: 0.4 },
};

function normalizeFII(fii, key) {
  if (key === "divYield") return Math.min(100, Math.max(0, fii.divYieldAnual * 8));
  if (key === "pvp") return Math.max(0, 100 - (fii.pvp - 0.8) * 150);
  if (key === "liquidez") return fii.liquidezScore;
  if (key === "vacancia") return Math.max(0, 100 - fii.vacancia * 12);
  return 0;
}

function weightedScoreFII(fii, profileKey) {
  const weights = FII_PROFILE_WEIGHTS[profileKey];
  let sum = 0;
  let totalWeight = 0;
  Object.keys(weights).forEach((key) => {
    sum += normalizeFII(fii, key) * weights[key];
    totalWeight += weights[key];
  });
  return Math.round(sum / totalWeight);
}

function classifyFII(score) {
  if (score >= 75) return { label: "Bom encaixe pro perfil", color: "var(--gold)" };
  if (score >= 45) return { label: "Encaixe razoável, vale comparar", color: "var(--paper-dim)" };
  return { label: "Fora da prioridade desse perfil", color: "var(--rust)" };
}

// ---------- ETFs (dados de exemplo) ----------
const ETFS = [
  { ticker: "BOVA11", name: "iShares Ibovespa", categoria: "Nacional · Ibovespa", price: 128.40,
    taxaAdm: 0.20, retorno12m: 14.2, volScore: 55, liquidezScore: 98 },
  { ticker: "SMAL11", name: "iShares Small Cap", categoria: "Nacional · Small Caps", price: 96.80,
    taxaAdm: 0.56, retorno12m: 9.8, volScore: 70, liquidezScore: 75 },
  { ticker: "DIVO11", name: "It Now IDIV", categoria: "Nacional · Dividendos", price: 78.20,
    taxaAdm: 0.50, retorno12m: 12.6, volScore: 45, liquidezScore: 65 },
  { ticker: "IVVB11", name: "iShares S&P 500", categoria: "Internacional · EUA", price: 312.90,
    taxaAdm: 0.23, retorno12m: 18.9, volScore: 50, liquidezScore: 92 },
  { ticker: "NASD11", name: "It Now Nasdaq 100", categoria: "Internacional · Tecnologia EUA", price: 145.60,
    taxaAdm: 0.36, retorno12m: 24.1, volScore: 68, liquidezScore: 70 },
  { ticker: "FIXA11", name: "It Now IMA-B", categoria: "Nacional · Renda Fixa (IPCA)", price: 88.10,
    taxaAdm: 0.25, retorno12m: 10.4, volScore: 20, liquidezScore: 60 },
];

const ASSET_PROFILE_WEIGHTS = {
  conservador: { taxa: 1.3, retorno: 0.6, liquidez: 1.3, volInv: 1.8 },
  moderado: { taxa: 1, retorno: 1, liquidez: 1, volInv: 1 },
  agressivo: { taxa: 0.5, retorno: 1.8, liquidez: 0.6, volInv: 0.4 },
};

function normalizeETF(etf, key) {
  if (key === "taxa") return Math.max(0, 100 - etf.taxaAdm * 130);
  if (key === "retorno") return Math.min(100, Math.max(0, (etf.retorno12m - 5) * 6));
  if (key === "liquidez") return etf.liquidezScore;
  if (key === "volInv") return 100 - etf.volScore;
  return 0;
}

function weightedScoreETF(etf, profileKey) {
  const weights = ASSET_PROFILE_WEIGHTS[profileKey];
  let sum = 0;
  let totalWeight = 0;
  Object.keys(weights).forEach((key) => {
    const wKey = key === "volInv" ? "volInv" : key;
    sum += normalizeETF(etf, wKey) * weights[key];
    totalWeight += weights[key];
  });
  return Math.round(sum / totalWeight);
}

function classifyETF(score) {
  if (score >= 75) return { label: "Bom encaixe pro perfil", color: "var(--gold)" };
  if (score >= 45) return { label: "Encaixe razoável, vale comparar", color: "var(--paper-dim)" };
  return { label: "Fora da prioridade desse perfil", color: "var(--rust)" };
}

// ---------- Previdência Privada (dados de exemplo) ----------
const PREVIDENCIA = [
  { id: "prev-sulamerica-rf", name: "SulAmérica PGBL Renda Fixa Curto Prazo", seguradora: "SulAmérica", tipo: "PGBL",
    categoria: "Renda Fixa", taxaAdm: 0.4, taxaCarregamento: 0, rentabilidade12m: 10.2 },
  { id: "prev-xp-vgbl-rf", name: "XP Seguros VGBL Renda Fixa", seguradora: "XP Seguros", tipo: "VGBL",
    categoria: "Renda Fixa", taxaAdm: 0.5, taxaCarregamento: 0, rentabilidade12m: 10.8 },
  { id: "prev-icatu-alvo", name: "Icatu VGBL Data-Alvo 2040", seguradora: "Icatu Seguros", tipo: "VGBL",
    categoria: "Data-Alvo", taxaAdm: 0.9, taxaCarregamento: 0, rentabilidade12m: 11.9 },
  { id: "prev-brasilprev-multi", name: "Brasilprev PGBL Multimercado", seguradora: "Brasilprev", tipo: "PGBL",
    categoria: "Multimercado", taxaAdm: 1.2, taxaCarregamento: 0, rentabilidade12m: 12.5 },
  { id: "prev-itau-acoes", name: "Itaú VGBL Ações", seguradora: "Itaú Seguros", tipo: "VGBL",
    categoria: "Ações", taxaAdm: 1.8, taxaCarregamento: 0, rentabilidade12m: 15.3 },
];

const PREV_PROFILE_WEIGHTS = {
  conservador: { taxaAdm: 1.5, carregamento: 1.2, rentabilidade: 0.6 },
  moderado: { taxaAdm: 1, carregamento: 1, rentabilidade: 1 },
  agressivo: { taxaAdm: 0.5, carregamento: 0.5, rentabilidade: 1.8 },
};

function normalizePrev(p, key) {
  if (key === "taxaAdm") return Math.max(0, 100 - p.taxaAdm * 40);
  if (key === "carregamento") return Math.max(0, 100 - p.taxaCarregamento * 50);
  if (key === "rentabilidade") return Math.min(100, Math.max(0, (p.rentabilidade12m - 8) * 15));
  return 0;
}

function weightedScorePrev(p, profileKey) {
  const weights = PREV_PROFILE_WEIGHTS[profileKey];
  let sum = 0;
  let totalWeight = 0;
  Object.keys(weights).forEach((key) => {
    sum += normalizePrev(p, key) * weights[key];
    totalWeight += weights[key];
  });
  return Math.round(sum / totalWeight);
}

function classifyPrev(score) {
  if (score >= 75) return { label: "Bom encaixe pro perfil", color: "var(--gold)" };
  if (score >= 45) return { label: "Encaixe razoável, vale comparar", color: "var(--paper-dim)" };
  return { label: "Fora da prioridade desse perfil", color: "var(--rust)" };
}

// ---------- Criptomoedas (dados de exemplo — altíssimo risco) ----------
const CRYPTO = [
  { symbol: "BTC", name: "Bitcoin", price: 612000, marketCapRank: 1, volatilidade30d: 38, liquidezScore: 98, variacao12m: 42 },
  { symbol: "ETH", name: "Ethereum", price: 21800, marketCapRank: 2, volatilidade30d: 46, liquidezScore: 95, variacao12m: 35 },
  { symbol: "SOL", name: "Solana", price: 980, marketCapRank: 5, volatilidade30d: 62, liquidezScore: 80, variacao12m: 58 },
  { symbol: "XRP", name: "XRP", price: 3.10, marketCapRank: 6, volatilidade30d: 58, liquidezScore: 78, variacao12m: 20 },
  { symbol: "ADA", name: "Cardano", price: 2.40, marketCapRank: 10, volatilidade30d: 65, liquidezScore: 65, variacao12m: 15 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.85, marketCapRank: 9, volatilidade30d: 85, liquidezScore: 70, variacao12m: -8 },
];

const CRYPTO_PROFILE_WEIGHTS = {
  conservador: { rank: 1.8, volInv: 1.6, liquidez: 1.2, variacao: 0.3 },
  moderado: { rank: 1, volInv: 1, liquidez: 1, variacao: 1 },
  agressivo: { rank: 0.4, volInv: 0.3, liquidez: 0.6, variacao: 1.8 },
};

function normalizeCrypto(c, key) {
  if (key === "rank") return Math.max(0, 100 - c.marketCapRank * 8);
  if (key === "volInv") return Math.max(0, 100 - c.volatilidade30d * 1.1);
  if (key === "liquidez") return c.liquidezScore;
  if (key === "variacao") return Math.min(100, Math.max(0, (c.variacao12m + 20) * 1.5));
  return 0;
}

function weightedScoreCrypto(c, profileKey) {
  const weights = CRYPTO_PROFILE_WEIGHTS[profileKey];
  let sum = 0;
  let totalWeight = 0;
  Object.keys(weights).forEach((key) => {
    sum += normalizeCrypto(c, key) * weights[key];
    totalWeight += weights[key];
  });
  return Math.round(sum / totalWeight);
}

function classifyCrypto(score) {
  if (score >= 75) return { label: "Mais alinhado ao perfil (ainda assim, alto risco)", color: "var(--gold)" };
  if (score >= 45) return { label: "Risco elevado — avalie com cautela", color: "var(--paper-dim)" };
  return { label: "Alto risco, pouco alinhado ao perfil", color: "var(--rust)" };
}

// ---------- Carteira sugerida: como fatiar o valor disponível entre as classes de ativo ----------
const ASSET_CLASS_META = {
  rendaFixa: { label: "Renda Fixa" },
  acoes: { label: "Ações" },
  fiis: { label: "Fundos Imobiliários" },
  etfs: { label: "ETFs" },
  previdencia: { label: "Previdência Privada" },
  cripto: { label: "Criptomoedas" },
};

// alocação-base por perfil — soma sempre 100
const BASE_ALLOCATION = {
  conservador: { rendaFixa: 50, acoes: 10, fiis: 15, etfs: 15, previdencia: 10, cripto: 0 },
  moderado: { rendaFixa: 30, acoes: 22, fiis: 15, etfs: 20, previdencia: 10, cripto: 3 },
  agressivo: { rendaFixa: 10, acoes: 33, fiis: 10, etfs: 22, previdencia: 5, cripto: 20 },
};

// faixas de valor: quanto menor o montante, menos classes fazem sentido (evita fatiar demais um valor pequeno)
function getTier(amount) {
  if (amount <= 1000) return { key: "comecando", label: "Começando", allowed: ["rendaFixa", "etfs"] };
  if (amount <= 10000) return { key: "base", label: "Construindo base", allowed: ["rendaFixa", "etfs", "acoes", "fiis"] };
  if (amount <= 100000) return { key: "diversificando", label: "Diversificando", allowed: Object.keys(ASSET_CLASS_META) };
  return { key: "consolidado", label: "Patrimônio consolidado", allowed: Object.keys(ASSET_CLASS_META) };
}

function computeAllocation(profileKey, amount) {
  const base = BASE_ALLOCATION[profileKey];
  const tier = getTier(amount);
  const allowedWeightSum = tier.allowed.reduce((sum, key) => sum + base[key], 0);

  const pct = {};
  Object.keys(ASSET_CLASS_META).forEach((key) => {
    if (!tier.allowed.includes(key) || allowedWeightSum === 0) {
      pct[key] = 0;
    } else {
      pct[key] = Math.round((base[key] / allowedWeightSum) * 100);
    }
  });
  // corrige arredondamento pra somar exatamente 100
  const diff = 100 - Object.values(pct).reduce((a, b) => a + b, 0);
  const biggestKey = Object.keys(pct).reduce((a, b) => (pct[a] >= pct[b] ? a : b));
  pct[biggestKey] += diff;

  return { tier, pct };
}

// ---------- Mentor comportamental / Diário de decisões ----------
const MOTIVOS = [
  { key: "fundamentos", label: "Análise fundamentalista", reflective: false },
  { key: "rebalanceamento", label: "Rebalanceamento planejado", reflective: false },
  { key: "fomo", label: "Vi subir e não quis ficar de fora (FOMO)", reflective: true },
  { key: "panico", label: "Vendi com medo de perder mais (pânico)", reflective: true },
  { key: "noticia", label: "Reagi a uma notícia recente", reflective: true },
  { key: "dica", label: "Recomendação de terceiros / influenciador", reflective: true },
];

const REFLECTIVE_QUESTIONS = [
  "Essa decisão parte de um fundamento que você conseguiria explicar em uma frase, ou de uma emoção do momento?",
  "Se o preço estivesse parado há 6 meses, você tomaria a mesma decisão hoje?",
  "O que você diria a um amigo que estivesse prestes a tomar essa mesma decisão?",
];

// ---------- Radar de custos ocultos ----------
function simulateCosts({ valorInicial, aporteMensal, anos, retornoBrutoAnual, taxaAnual }) {
  const retornoLiquidoAnual = Math.max(0, retornoBrutoAnual - taxaAnual);
  const rateMensal = Math.pow(1 + retornoLiquidoAnual / 100, 1 / 12) - 1;
  let saldo = valorInicial;
  const pontos = [{ ano: 0, saldo }];
  for (let mes = 1; mes <= anos * 12; mes++) {
    saldo = saldo * (1 + rateMensal) + aporteMensal;
    if (mes % 12 === 0) pontos.push({ ano: mes / 12, saldo: Math.round(saldo) });
  }
  return { pontos, final: Math.round(saldo) };
}

// ---------- Relatório periódico da carteira ----------
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// variação simulada — determinística por ticker + score de fundamentos, pra parecer plausível sem dado real
function reportVariation(item, seed) {
  const h = hashStr((item.ticker || item.symbol || item.name) + seed);
  const noise = ((h % 1000) / 1000 - 0.5) * 14; // ruído entre -7% e +7%
  const bias = ((item.profileScore ?? 50) - 50) / 50 * 5; // viés de +-5% pelos fundamentos
  return +(noise + bias).toFixed(1);
}

function getPeriodDates(period) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (period === "quinzenal" ? 15 : 30));
  const fmt = (d) => d.toLocaleDateString("pt-BR");
  return { start: fmt(start), end: fmt(end) };
}

// ---------- Gestão financeira: diagnóstico, orçamento diário, dívidas e reserva ----------
function daysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, lastDay - now.getDate() + 1);
}

// status de vencimento de um custo fixo, a partir do dia do mês cadastrado
function statusVencimento(diaVencimento) {
  if (!diaVencimento) return null;
  const hoje = new Date().getDate();
  const diff = diaVencimento - hoje;
  if (diff < 0) return { label: "Em atraso", color: "var(--rust)", urgente: true };
  if (diff <= 3) return { label: diff === 0 ? "Vence hoje" : `Vence em ${diff} dia${diff > 1 ? "s" : ""}`, color: "var(--rust)", urgente: true };
  if (diff <= 7) return { label: `Vence em ${diff} dias`, color: "var(--gold)", urgente: false };
  return { label: "A vencer", color: "var(--paper-dim)", urgente: false };
}

// método avalanche: quita primeiro a dívida de maior juro, usando o valor extra disponível por mês
function simulateDebtPayoff(dividas, extraMensal) {
  if (dividas.length === 0) return { meses: 0, totalJurosPago: 0 };
  let saldos = dividas.map((d) => ({ ...d, saldo: d.valor }));
  let meses = 0;
  let totalJurosPago = 0;
  while (saldos.some((d) => d.saldo > 0.5) && meses < 240) {
    meses++;
    // ordena pelo maior juro entre as dívidas ainda em aberto
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

// dica de melhoria personalizada por categoria, usada no relatório de fim de mês
const EXPENSE_CATEGORY_TIPS = {
  mercado: "Vale comparar preços entre mercados, dar uma chance pras marcas próprias, e fazer uma lista antes de sair de casa pra evitar compra por impulso.",
  alimentacao: "Cozinhar mais em casa e reduzir os pedidos de delivery/restaurante costuma ser a economia mais rápida de sentir no bolso.",
  transporte: "Vale considerar caronas, transporte público em alguns trajetos, ou revisar rotas pra economizar combustível.",
  lazer: "Dá pra manter o lazer sem cortar tudo — buscando opções gratuitas ou promoções ajuda bastante.",
  saude: "Você teve alguns imprevistos com saúde esse mês — e tudo bem. Isso não é hora de cortar: saúde vem em primeiro lugar, sempre. Cuide de você e de quem você ama sem culpa nenhuma por esse gasto.",
  outros: "Vale revisar esses gastos com mais atenção pra entender exatamente de onde eles vêm.",
};

function categorizeExpenseName(nome) {
  const text = nome.toLowerCase();
  const found = EXPENSE_CATEGORIES.find((c) => c.keywords.some((k) => text.includes(k)));
  return found || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

// extrai valor em dinheiro de um texto falado, cobrindo os formatos que o reconhecimento
// de voz costuma gerar pra centavos (inclusive a fração estranha tipo "53 65/100")
function extrairValorMonetario(text) {
  const t = text.toLowerCase();

  let m = t.match(/(\d+)\s*(?:reais?)?\s*e\s*(\d{1,2})\s*centavos?/);
  if (m) return { valor: parseFloat(`${m[1]}.${m[2].padStart(2, "0")}`), bruto: m[0] };

  // reconhecimento de voz às vezes transcreve "53,65" como fração falada: "53 65/100"
  m = t.match(/(\d+)\s+(\d{1,2})\s*\/\s*100/);
  if (m) return { valor: parseFloat(`${m[1]}.${m[2].padStart(2, "0")}`), bruto: m[0] };

  m = t.match(/(\d+)[,.](\d{1,2})\b/);
  if (m) return { valor: parseFloat(`${m[1]}.${m[2].padStart(2, "0")}`), bruto: m[0] };

  m = t.match(/(\d+)/);
  if (m) return { valor: parseFloat(m[1]), bruto: m[0] };

  return { valor: null, bruto: "" };
}

function parseVoiceExpense(transcript) {
  const text = transcript.toLowerCase();
  const { valor } = extrairValorMonetario(text);
  let categoria = EXPENSE_CATEGORIES.find((c) => c.keywords.some((k) => text.includes(k)));
  if (!categoria) categoria = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  const extraHints = ["conserto", "emergência", "presente", "imprevisto", "quebrou", "multa"];
  const tipo = extraHints.some((k) => text.includes(k)) ? "extra" : "variavel";
  return { valor, categoria: categoria.key, nome: transcript, tipo };
}

// interpreta um custo fixo falado, tipo "aluguel 600 reais, vence dia 5"
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseVoiceCustoFixo(transcript) {
  const text = transcript.toLowerCase();
  const diaMatch = text.match(/dia\s+(\d{1,2})/);
  const dia = diaMatch ? parseInt(diaMatch[1], 10) : null;

  // pra achar o valor, ignora o número que já foi capturado como "dia X"
  const semDia = diaMatch ? text.replace(diaMatch[0], "") : text;
  const { valor, bruto } = extrairValorMonetario(semDia);

  let nome = transcript;
  if (bruto) nome = nome.replace(new RegExp(escapeRegex(bruto), "i"), "");
  if (diaMatch) nome = nome.replace(new RegExp(diaMatch[0], "i"), "");
  nome = nome.replace(/\breais?\b|\bvence\b|\btodo\b|\bcentavos?\b|\be\b/gi, "").replace(/\s{2,}/g, " ").trim().replace(/[,.\s]+$/, "");

  return { nome: nome || transcript, valor, dia };
}

// interpreta um objetivo falado, tipo "carro 20000 reais em 12 meses"
function parseVoiceObjetivo(transcript) {
  const text = transcript.toLowerCase();
  const prazoMatch = text.match(/(\d{1,3})\s*mes(es)?/);
  const prazoMeses = prazoMatch ? parseInt(prazoMatch[1], 10) : null;

  const semPrazo = prazoMatch ? text.replace(prazoMatch[0], "") : text;
  const { valor, bruto } = extrairValorMonetario(semPrazo);

  let nome = transcript;
  if (bruto) nome = nome.replace(new RegExp(escapeRegex(bruto), "i"), "");
  if (prazoMatch) nome = nome.replace(new RegExp(prazoMatch[0], "i"), "");
  nome = nome
    .replace(/\breais?\b|\bem\b|\bdaqui\b|\bquero\b|\bcomprar\b|\bpra\b|\bpara\b|\bum\b|\buma\b|\bcentavos?\b|\be\b/gi, "")
    .replace(/\s{2,}/g, " ").trim().replace(/[,.\s]+$/, "");

  return { nome: nome || transcript, valor, prazoMeses };
}

// interpreta uma renda falada, tipo "renda fixa 3500 reais" ou "ganhei 700 de comissão"
function parseVoiceRenda(transcript) {
  const text = transcript.toLowerCase();
  const { valor, bruto } = extrairValorMonetario(text);

  let tipo = "fixa";
  if (text.match(/vari[áa]vel|comiss[ãa]o|b[ôo]nus/)) tipo = "variavel";
  else if (text.match(/\bextra\b|freela|bico/)) tipo = "extra";
  else if (text.match(/fixa|sal[áa]rio/)) tipo = "fixa";

  let nome = transcript;
  if (bruto) nome = nome.replace(new RegExp(escapeRegex(bruto), "i"), "");
  nome = nome
    .replace(/\brenda\b|\bfixa\b|\bvari[áa]vel\b|\bextra\b|\bsal[áa]rio\b|\bcomiss[ãa]o\b|\bb[ôo]nus\b|\breais?\b|\bfreela\b|\bbico\b|\bganhei\b|\bde\b|\bcentavos?\b|\be\b/gi, "")
    .replace(/\s{2,}/g, " ").trim().replace(/[,.\s]+$/, "");
  if (!nome) nome = tipo === "fixa" ? "Salário" : tipo === "variavel" ? "Renda variável" : "Renda extra";

  return { tipo, valor, nome };
}

// ---------- Guia da Prosperidade: ideias de renda extra calibradas pelo perfil ----------
const INCOME_IDEAS = {
  conservador: [
    { title: "Freelance na sua área de atuação", desc: "Horas avulsas de consultoria ou serviço no que você já sabe fazer — menor risco, aproveita experiência já validada.", potencial: "R$ 300 – R$ 1.200/mês", esforco: "Médio" },
    { title: "Alugar um cômodo ou vaga de garagem", desc: "Renda passiva e previsível, sem exigir tempo extra recorrente.", potencial: "R$ 200 – R$ 800/mês", esforco: "Baixo" },
    { title: "Vender itens parados em casa", desc: "Rende rápido — dinheiro ocioso virando caixa imediato, bom pra cobrir um déficit pontual.", potencial: "R$ 100 – R$ 600 (pontual)", esforco: "Baixo" },
    { title: "Trabalho remoto part-time", desc: "Vagas de meio período em áreas administrativas ou de atendimento complementam a renda com previsibilidade.", potencial: "R$ 400 – R$ 1.000/mês", esforco: "Médio" },
  ],
  moderado: [
    { title: "Apps de entrega ou transporte em horários livres", desc: "Flexibilidade total de horário, começa a gerar caixa quase imediatamente.", potencial: "R$ 400 – R$ 1.500/mês", esforco: "Médio" },
    { title: "Vender um curso ou mentoria sobre o que você já domina", desc: "Aproveita conhecimento que você já tem — escala melhor que trocar hora por dinheiro.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
    { title: "Freelance em plataformas digitais", desc: "Design, texto, edição ou programação — monetiza uma habilidade específica sem depender de local fixo.", potencial: "R$ 500 – R$ 2.500/mês", esforco: "Médio" },
    { title: "Revenda de produtos com baixo investimento inicial", desc: "Margem imediata, exige organização mas pouco capital pra começar.", potencial: "R$ 300 – R$ 1.200/mês", esforco: "Médio" },
  ],
  agressivo: [
    { title: "Criar um produto digital escalável", desc: "Curso, e-book ou comunidade — investe tempo agora pra construir uma renda que cresce sem escalar o esforço na mesma proporção.", potencial: "R$ 500 – R$ 5.000+/mês", esforco: "Alto" },
    { title: "Monetizar audiência ou conteúdo nas redes", desc: "Se já tem algum público ou nicho, transforma isso em renda com parcerias, afiliados ou produto próprio.", potencial: "R$ 300 – R$ 3.000+/mês", esforco: "Alto" },
    { title: "Consultoria especializada de alto valor", desc: "Cobra mais por hora vendendo expertise específica em vez de tempo genérico.", potencial: "R$ 800 – R$ 4.000/mês", esforco: "Alto" },
    { title: "Pequeno negócio paralelo", desc: "Maior risco e esforço, mas potencial de crescer além de um simples complemento de renda.", potencial: "Variável, potencial alto", esforco: "Alto" },
  ],
};

// mapeia habilidades citadas pela pessoa (texto livre) pra ideias de renda extra específicas
const SKILL_INCOME_MAP = [
  { keywords: ["design", "photoshop", "canva", "artes", "ilustra"], title: "Design freelance (posts, logos, artes)", desc: "Serviços pontuais de identidade visual e conteúdo pra redes sociais de pequenos negócios.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["texto", "redação", "escrita", "copy", "redator"], title: "Redação freelance / copywriting", desc: "Textos pra blogs, redes sociais ou anúncios de empresas que não têm equipe própria de conteúdo.", potencial: "R$ 300 – R$ 1.800/mês", esforco: "Médio" },
  { keywords: ["programação", "código", "desenvolv", "programador", "site"], title: "Freelance de programação / sites", desc: "Desenvolvimento ou manutenção de sites e sistemas simples pra pequenos negócios.", potencial: "R$ 500 – R$ 3.000/mês", esforco: "Alto" },
  { keywords: ["inglês", "espanhol", "idioma", "língua"], title: "Aulas particulares de idioma", desc: "Aulas online ou presenciais, remuneração por hora com baixo investimento inicial.", potencial: "R$ 300 – R$ 1.500/mês", esforco: "Médio" },
  { keywords: ["costura", "crochê", "artesanato", "tricô", "bordado"], title: "Venda de peças artesanais", desc: "Produção sob encomenda ou venda em feiras e redes sociais.", potencial: "R$ 200 – R$ 1.200/mês", esforco: "Médio" },
  { keywords: ["cozinha", "culinária", "doces", "bolo", "confeit", "salgado"], title: "Venda de comida/doces por encomenda", desc: "Produção caseira sob encomenda pra eventos ou venda direta no bairro.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["maquiagem", "cabelo", "estética", "unha", "manicure", "sobrancelha"], title: "Serviços de beleza a domicílio", desc: "Atendimento particular, sem custo de aluguel de salão.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["fotografia", "foto", "vídeo", "filmagem", "edição de vídeo"], title: "Freelance de fotografia/vídeo", desc: "Cobertura de eventos, ensaios ou conteúdo pra redes sociais de outros negócios.", potencial: "R$ 300 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["planilha", "excel", "contabilidade", "financeiro", "organização"], title: "Organização financeira pra pequenos negócios", desc: "Montagem de planilhas e controle financeiro básico pra autônomos e pequenas empresas.", potencial: "R$ 300 – R$ 1.500/mês", esforco: "Médio" },
  { keywords: ["vendas", "comercial", "negociação"], title: "Vendas por comissão / representação comercial", desc: "Comercializa produtos de terceiros recebendo por comissão, sem precisar de capital inicial.", potencial: "R$ 300 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["música", "instrumento", "canto", "violão", "piano", "canta"], title: "Aulas de música particulares", desc: "Aulas presenciais ou online, remuneração por hora.", potencial: "R$ 300 – R$ 1.500/mês", esforco: "Médio" },
  { keywords: ["dirigir", "carro", "moto", "cnh", "entrega"], title: "Motorista ou entregador de aplicativo", desc: "Horários flexíveis, começa a gerar renda quase imediatamente.", potencial: "R$ 400 – R$ 1.500/mês", esforco: "Médio" },
  { keywords: ["elétrica", "manutenção", "reparo", "encanador", "pedreiro", "marcenaria"], title: "Serviços de manutenção/reparo doméstico", desc: "Alta demanda local, remuneração por serviço prestado.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["cuidador", "babá", "crianças", "idosos", "paciência"], title: "Cuidador de crianças ou idosos", desc: "Serviço de confiança com boa demanda recorrente na vizinhança.", potencial: "R$ 400 – R$ 2.000/mês", esforco: "Médio" },
  { keywords: ["personal", "academia", "educação física", "treino"], title: "Personal trainer / aulas de educação física", desc: "Atendimento particular ou em grupos pequenos, presencial ou online.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
  { keywords: ["marketing", "redes sociais", "social media", "instagram"], title: "Gestão de redes sociais pra pequenos negócios", desc: "Muitos pequenos empreendedores pagam por alguém que cuide do Instagram/conteúdo deles.", potencial: "R$ 400 – R$ 2.500/mês", esforco: "Médio" },
];

function matchSkillIdeas(text) {
  const t = text.toLowerCase();
  const matched = SKILL_INCOME_MAP.filter((item) => item.keywords.some((k) => t.includes(k)));
  const seen = new Set();
  return matched.filter((item) => (seen.has(item.title) ? false : (seen.add(item.title), true))).slice(0, 4);
}

// normaliza cada métrica pra uma escala 0-100 (quanto maior, melhor dentro do critério)
// ---------- Explicações educativas por classe de ativo ----------
const ASSET_EDUCATION = {
  acoes: { title: "O que são ações?", text: "Uma ação é uma fração pequena de uma empresa. Quando você compra, vira sócio(a) dela — ganha se a empresa lucra e cresce, mas o valor também pode cair conforme o mercado." },
  "renda-fixa": { title: "O que é renda fixa?", text: "Renda fixa é quando você empresta dinheiro (pro banco, pra empresa ou pro governo) e já sabe, desde o início, a regra de quanto vai receber de volta — por isso costuma ser mais previsível e segura que ações." },
  fiis: { title: "O que são Fundos Imobiliários?", text: "Um FII reúne o dinheiro de várias pessoas pra investir em imóveis (galpões, shoppings, prédios) ou papéis ligados a imóveis. Você compra cotas na bolsa, como numa ação, e recebe parte do aluguel/juros gerado, geralmente todo mês." },
  etfs: { title: "O que é um ETF?", text: "Um ETF é uma cesta de vários ativos que você compra de uma vez só, com um único ticker. Em vez de escolher ação por ação, você compra um \"pacote\" que já é diversificado." },
  previdencia: { title: "O que é Previdência Privada?", text: "É um investimento pensado pra longo prazo, geralmente aposentadoria, com um benefício fiscal específico dependendo do tipo (PGBL ou VGBL). O dinheiro fica investido por anos, com regras próprias de resgate e imposto." },
  cripto: { title: "O que é criptomoeda?", text: "É uma moeda digital que não é controlada por nenhum banco ou governo. O valor pode subir ou cair muito rápido — é a classe de maior risco entre as que o app cobre." },
};

function normalize(company, key) {
  const raw = company[key];
  if (key === "debtEquity") return Math.max(0, 100 - raw * 60);
  if (key === "pe") return raw <= 0 ? 0 : Math.max(0, 100 - raw * 2.2);
  const mult = key === "roe" ? 2.2 : key === "netMargin" ? 2.8 : key === "growth5y" ? 3.2 : 9;
  return Math.min(100, Math.max(0, raw * mult));
}

function weightedScore(company, profileKey) {
  const weights = PROFILES[profileKey].weights;
  let sum = 0;
  let totalWeight = 0;
  CRITERIA.forEach((c) => {
    const w = weights[c.key];
    sum += normalize(company, c.key) * w;
    totalWeight += w;
  });
  return Math.round(sum / totalWeight);
}

// estimativa ilustrativa de rentabilidade anual — combina crescimento de lucro e dividendos
// não é previsão real, serve só para ordenar/ilustrar o perfil
function estimateReturn(company, profileKey) {
  const growthPart = Math.max(company.growth5y, -5) * (profileKey === "agressivo" ? 0.55 : 0.35);
  const divPart = company.divYield * (profileKey === "conservador" ? 0.9 : 0.6);
  const base = growthPart + divPart;
  const low = Math.max(-5, base - 3);
  const high = base + 3;
  return { low: low.toFixed(1), high: high.toFixed(1) };
}

function classify(score) {
  if (score >= 75) return { label: "Margem de segurança sólida", color: "var(--gold)" };
  if (score >= 45) return { label: "Requer análise cuidadosa", color: "var(--paper-dim)" };
  return { label: "Fora dos critérios do perfil", color: "var(--rust)" };
}

function radarData(company) {
  return CRITERIA.map((c) => ({ subject: c.short, value: Math.round(normalize(company, c.key)) }));
}

// ---------- Explicação da recomendação: por que essa ação foi selecionada pro perfil ----------
function buildThesis(company, profileKey) {
  const weights = PROFILES[profileKey].weights;
  const evaluated = CRITERIA.map((c) => ({ ...c, value: company[c.key], pass: c.test(company[c.key]), weight: weights[c.key] }));
  const strengths = evaluated.filter((c) => c.pass).sort((a, b) => b.weight - a.weight);
  const cautions = evaluated.filter((c) => !c.pass).sort((a, b) => b.weight - a.weight);
  const topDriver = [...evaluated].sort((a, b) => b.weight - a.weight)[0];

  let opening;
  if (strengths.length >= 5) {
    opening = `${company.name} aparece bem posicionada pro perfil ${PROFILES[profileKey].label.toLowerCase()} porque atende à maioria dos critérios clássicos de segurança e consistência que esse perfil prioriza.`;
  } else if (strengths.length >= 3) {
    opening = `${company.name} atende parte relevante dos critérios avaliados, com destaque pro que o perfil ${PROFILES[profileKey].label.toLowerCase()} mais valoriza: ${topDriver.label.toLowerCase()}.`;
  } else {
    opening = `${company.name} entra no radar com ressalvas — vale entender os pontos de atenção antes de decidir, principalmente olhando pro que o perfil ${PROFILES[profileKey].label.toLowerCase()} prioriza.`;
  }

  return { opening, strengths, cautions, topDriver };
}

// documentos recentes ilustrativos — numa versão conectada viriam da B3/CVM (fatos relevantes, ITR)
// ou da SEC (10-Q, 8-K), via API ou scraping oficial
function buildDocuments(company) {
  const isForeign = company.market === "EUA" || company.market === "BDR";
  const growthTone = company.growth5y >= 5
    ? "reforçou a trajetória de crescimento de lucro dos últimos anos"
    : "sinalizou atenção a um cenário mais desafiador no período";
  return [
    {
      title: isForeign ? "10-Q · Relatório Trimestral" : "ITR · Informações Trimestrais",
      date: "último trimestre divulgado",
      summary: `Margem líquida reportada de ${company.netMargin.toFixed(1)}%, ${company.netMargin >= 10 ? "acima" : "abaixo"} do patamar considerado saudável pelos critérios clássicos.`,
    },
    {
      title: isForeign ? "8-K · Fato Relevante" : "Fato Relevante / Comunicado ao Mercado",
      date: "últimas semanas",
      summary: `A administração ${growthTone}.`,
    },
    {
      title: isForeign ? "Earnings Call · Transcrição" : "Release de Resultados",
      date: "última divulgação de resultados",
      summary: `ROE de ${company.roe.toFixed(1)}% destacado como reflexo da eficiência no uso do capital próprio.`,
    },
  ];
}

function Seal({ score }) {
  const cls = classify(score);
  return (
    <div className="relative w-28 h-28 shrink-0 select-none" style={{ transform: "rotate(-7deg)" }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="none" stroke={cls.color} strokeWidth="2" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={cls.color} strokeWidth="1" strokeDasharray="2 3" />
        <text x="50" y="46" textAnchor="middle" fontSize="26" fontWeight="700" fill={cls.color} style={{ fontFamily: "'Roboto Slab', serif" }}>
          {score}
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="7" letterSpacing="1" fill={cls.color} style={{ fontFamily: "'Inter', sans-serif" }}>
          PONTOS
        </text>
      </svg>
    </div>
  );
}

function AccordionItem({ id, title, isOpen, onToggle, children }) {
  return (
    <div className="mb-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
      <button
        onClick={() => onToggle(isOpen ? null : id)}
        className="w-full flex items-center justify-between text-left px-3 py-3"
      >
        <span className="text-sm font-semibold" style={{ color: isOpen ? "var(--gold)" : "var(--paper)" }}>{title}</span>
        <ArrowRight size={14} color="var(--gold)" style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0, marginLeft: 8 }} />
      </button>
      {isOpen && <div className="px-3 pb-4">{children}</div>}
    </div>
  );
}

function IconMenuSection({ title, items, activeKey, onSelect }) {
  return (
    <div className="px-5 md:px-10 pt-6">
      <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
        {title}
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-2xl">
        {items.map((tab) => {
          const Icon = tab.icon;
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: active ? "rgba(190,154,92,0.16)" : "var(--panel)",
                  border: `1px solid ${active ? "var(--gold)" : "rgba(237,230,214,0.15)"}`,
                }}
              >
                <Icon size={22} color={active ? "var(--gold)" : "var(--paper-dim)"} />
              </div>
              <span className="text-[11px] leading-tight" style={{ color: active ? "var(--gold)" : "var(--paper-dim)", fontWeight: active ? 600 : 400 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function classifyGeneric(score) {
  if (score >= 70) return { label: "Pode ser interessante, vale estudar mais a fundo", color: "var(--gold)" };
  if (score >= 40) return { label: "Neutro — nem a favor, nem contra", color: "var(--paper-dim)" };
  return { label: "Sinais de cautela nessa estimativa preliminar", color: "var(--rust)" };
}

function AssetSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-3">
      <Search size={14} color="var(--paper-dim)" className="absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs pl-9 pr-3 py-2 rounded-sm"
        style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.2)", color: "var(--paper)" }}
      />
    </div>
  );
}

function SimulatedAssetCard({ query, profileLabel }) {
  const score = hashStr(query.toLowerCase() + profileLabel) % 100;
  const cls = classifyGeneric(score);
  return (
    <div className="mt-2 p-4 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--gold)" }}>
        <Search size={13} /> "{query}" não está na nossa lista curada
      </div>
      <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
        Como ainda não temos dados de mercado reais conectados pra esse ativo específico, geramos uma estimativa preliminar e ilustrativa pro perfil {profileLabel.toLowerCase()}: pontuação aproximada de{" "}
        <strong style={{ color: cls.color }}>{score}/100</strong> — {cls.label.toLowerCase()}.
      </p>
      <p className="text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
        Isso <strong>não é</strong> uma recomendação de compra ou venda — é só uma referência inicial pra você pesquisar mais a fundo antes de decidir. Quando conectarmos dados reais de mercado, essa análise passa a ser calculada com números de verdade, do mesmo jeito que já fazemos com os ativos da nossa lista. A decisão final sobre investir ou não é sempre sua.
      </p>
    </div>
  );
}

function AssetInfoBlock({ tabKey, show, onToggle }) {
  const info = ASSET_EDUCATION[tabKey];
  return (
    <div className="px-5 md:px-10 pt-5">
      <button onClick={onToggle} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--gold)" }}>
        <HelpCircle size={14} />
        {info.title}
        <ArrowRight size={11} style={{ transform: show ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {show && (
        <p className="mt-2 text-xs leading-relaxed max-w-2xl" style={{ color: "var(--paper-dim)" }}>
          {info.text}
        </p>
      )}
    </div>
  );
}

export default function BussolaEducacaoDeInvestimentos() {
  const [market, setMarket] = useState("Todos");
  const [profileKey, setProfileKey] = useState("moderado");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showComecarPor, setShowComecarPor] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [welcomeSection, setWelcomeSection] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showBrokers, setShowBrokers] = useState(false);
  const [showAssetInfo, setShowAssetInfo] = useState(false);
  const [searchAcoes, setSearchAcoes] = useState("");
  const [searchRF, setSearchRF] = useState("");
  const [searchFII, setSearchFII] = useState("");
  const [searchETF, setSearchETF] = useState("");
  const [searchPrev, setSearchPrev] = useState("");
  const [searchCripto, setSearchCripto] = useState("");
  const [showReservaDuvida, setShowReservaDuvida] = useState(false);
  const [confirmValor, setConfirmValor] = useState("");
  function registrarAplicacao(nomeAtivo) {
    if (!confirmValor) return;
    setInvestimentos((prev) => [...prev, { id: Date.now(), ativo: nomeAtivo, valor: Number(confirmValor) }]);
    setConfirmValor("");
    setShowBrokers(false);
  }
  const [assetClass, setAssetClass] = useState("acoes");
  const [homeSection, setHomeSection] = useState(null);
  const [vidaSection, setVidaSection] = useState(null);
  const [rfSelectedId, setRfSelectedId] = useState(null);

  const rankedRF = useMemo(() => {
    return FIXED_INCOME.map((p) => ({ ...p, profileScore: weightedScoreRF(p, profileKey) })).sort(
      (a, b) => b.profileScore - a.profileScore
    );
  }, [profileKey]);
  const selectedRF = rankedRF.find((p) => p.id === rfSelectedId) || rankedRF[0];

  const [fiiSelectedTicker, setFiiSelectedTicker] = useState(null);
  const rankedFII = useMemo(() => {
    return FIIS.map((f) => ({ ...f, profileScore: weightedScoreFII(f, profileKey) })).sort(
      (a, b) => b.profileScore - a.profileScore
    );
  }, [profileKey]);
  const selectedFII = rankedFII.find((f) => f.ticker === fiiSelectedTicker) || rankedFII[0];

  const [etfSelectedTicker, setEtfSelectedTicker] = useState(null);
  const rankedETF = useMemo(() => {
    return ETFS.map((e) => ({ ...e, profileScore: weightedScoreETF(e, profileKey) })).sort(
      (a, b) => b.profileScore - a.profileScore
    );
  }, [profileKey]);
  const selectedETF = rankedETF.find((e) => e.ticker === etfSelectedTicker) || rankedETF[0];

  const [prevSelectedId, setPrevSelectedId] = useState(null);
  const rankedPrev = useMemo(() => {
    return PREVIDENCIA.map((p) => ({ ...p, profileScore: weightedScorePrev(p, profileKey) })).sort(
      (a, b) => b.profileScore - a.profileScore
    );
  }, [profileKey]);
  const selectedPrev = rankedPrev.find((p) => p.id === prevSelectedId) || rankedPrev[0];

  const [cryptoSelectedSymbol, setCryptoSelectedSymbol] = useState(null);
  const rankedCrypto = useMemo(() => {
    return CRYPTO.map((c) => ({ ...c, profileScore: weightedScoreCrypto(c, profileKey) })).sort(
      (a, b) => b.profileScore - a.profileScore
    );
  }, [profileKey]);
  const selectedCrypto = rankedCrypto.find((c) => c.symbol === cryptoSelectedSymbol) || rankedCrypto[0];

  const [investAmount, setInvestAmount] = useState(5000);
  const allocation = useMemo(() => computeAllocation(profileKey, investAmount), [profileKey, investAmount]);

  // rebalanceamento — posições atuais informadas pela pessoa
  const [showRebalance, setShowRebalance] = useState(false);
  const [currentPositions, setCurrentPositions] = useState({ rendaFixa: 0, acoes: 0, fiis: 0, etfs: 0, previdencia: 0, cripto: 0 });
  const totalCurrent = Object.values(currentPositions).reduce((a, b) => a + b, 0);

  // diário de decisões
  const [journal, setJournal] = useState([]);
  const [journalForm, setJournalForm] = useState({ ativo: "", tipo: "Compra", motivoKey: "fundamentos", valor: "" });
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionAck, setReflectionAck] = useState(false);

  // radar de custos ocultos
  const [costInputs, setCostInputs] = useState({ valorInicial: 5000, aporteMensal: 500, anos: 15, retornoBrutoAnual: 11, taxaBaixa: 0.3, taxaAlta: 2.0 });
  const costLow = useMemo(() => simulateCosts({ ...costInputs, taxaAnual: costInputs.taxaBaixa }), [costInputs]);
  const costHigh = useMemo(() => simulateCosts({ ...costInputs, taxaAnual: costInputs.taxaAlta }), [costInputs]);
  const costChartData = costLow.pontos.map((p, i) => ({ ano: p.ano, "Taxa baixa": p.saldo, "Taxa alta": costHigh.pontos[i]?.saldo ?? 0 }));

  const quizResult = useMemo(() => {
    const answered = Object.keys(quizAnswers).length;
    if (answered === 0) return null;
    const tally = { conservador: 0, moderado: 0, agressivo: 0 };
    Object.values(quizAnswers).forEach((p) => (tally[p] += 1));
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    return { top, answered, complete: answered === QUIZ_QUESTIONS.length };
  }, [quizAnswers]);

  const ranked = useMemo(() => {
    return COMPANIES.map((c) => ({
      ...c,
      profileScore: weightedScore(c, profileKey),
      ret: estimateReturn(c, profileKey),
    })).sort((a, b) => b.profileScore - a.profileScore);
  }, [profileKey]);

  const filtered = ranked.filter((c) => market === "Todos" || c.market === market);
  const selected = filtered.find((c) => c.ticker === selectedTicker) || filtered[0];
  const cls = classify(selected.profileScore);
  const thesis = buildThesis(selected, profileKey);
  const documents = buildDocuments(selected);

  // relatório periódico
  const [reportPeriod, setReportPeriod] = useState("mensal");
  const [reportSeed, setReportSeed] = useState(0);
  const periodDates = getPeriodDates(reportPeriod);
  const sampleHoldings = useMemo(() => {
    const stocks = ranked.slice(0, 3).map((c) => ({ ...c, classe: "Ações" }));
    const fii = rankedFII.slice(0, 1).map((f) => ({ ...f, classe: "FII" }));
    const etf = rankedETF.slice(0, 1).map((e) => ({ ...e, classe: "ETF" }));
    return [...stocks, ...fii, ...etf];
  }, [ranked, rankedFII, rankedETF]);
  const reportHoldings = useMemo(() => {
    return sampleHoldings.map((h) => {
      const variacao = reportVariation(h, reportPeriod + reportSeed);
      const isStock = h.classe === "Ações";
      const failCount = isStock ? CRITERIA.filter((c) => !c.test(h[c.key])).length : 0;
      const flagged = isStock ? failCount >= 3 : h.profileScore < 45;
      return { ...h, variacao, flagged, failCount };
    });
  }, [sampleHoldings, reportPeriod, reportSeed]);
  const portfolioVariation = (
    reportHoldings.reduce((sum, h) => sum + h.variacao, 0) / (reportHoldings.length || 1)
  ).toFixed(1);
  const profile = PROFILES[profileKey];

  // ---------- Gestão financeira ----------
  const [contaCorrente, setContaCorrente] = useState(0);
  const [saldoEspecie, setSaldoEspecie] = useState(0);
  const [saldoPoupanca, setSaldoPoupanca] = useState(0);
  const [showSaldo, setShowSaldo] = useState(true);
  const [rendaFixaItens, setRendaFixaItens] = useState([{ id: 1, nome: "Salário", valor: 3500 }]);
  const [rendaVariavelItens, setRendaVariavelItens] = useState([{ id: 1, nome: "Comissão/Bônus", valor: 700 }]);
  const [rendaExtraItens, setRendaExtraItens] = useState([{ id: 1, nome: "Freela/Bico", valor: 300 }]);
  const [novaRendaFixa, setNovaRendaFixa] = useState({ nome: "", valor: "" });
  const [novaRendaVariavel, setNovaRendaVariavel] = useState({ nome: "", valor: "" });
  const [novaRendaExtra, setNovaRendaExtra] = useState({ nome: "", valor: "" });
  const rendaFixa = rendaFixaItens.reduce((s, i) => s + i.valor, 0);
  const rendaVariavel = rendaVariavelItens.reduce((s, i) => s + i.valor, 0);
  const rendaExtra = rendaExtraItens.reduce((s, i) => s + i.valor, 0);
  const rendaMensal = rendaFixa + rendaVariavel + rendaExtra;
  const [custosFixos, setCustosFixos] = useState([
    { id: 1, nome: "Aluguel/Financiamento", valor: 1200, diaVencimento: 5, pago: false },
    { id: 2, nome: "Contas (luz, água, internet)", valor: 350, diaVencimento: 10, pago: false },
    { id: 3, nome: "Transporte", valor: 300, diaVencimento: 15, pago: false },
  ]);
  const [novoCustoFixo, setNovoCustoFixo] = useState({ nome: "", valor: "", diaVencimento: "" });
  const [editingCustoId, setEditingCustoId] = useState(null);
  const [editingCustoValor, setEditingCustoValor] = useState("");

  const [gastosVariaveis, setGastosVariaveis] = useState([]);
  const [novoGasto, setNovoGasto] = useState({ nome: "", valor: "", tipo: "variavel" });
  const [despesaTab, setDespesaTab] = useState("fixo");
  const [editingGastoId, setEditingGastoId] = useState(null);
  const [editingGastoValor, setEditingGastoValor] = useState("");
  const totalCustosVariaveis = gastosVariaveis.filter((g) => g.tipo === "variavel").reduce((sum, g) => sum + g.valor, 0);
  const totalCustosExtras = gastosVariaveis.filter((g) => g.tipo === "extra").reduce((sum, g) => sum + g.valor, 0);

  // ---------- Relatório de fim de mês: gastos por categoria + dicas personalizadas ----------
  const gastosPorCategoria = useMemo(() => {
    const somas = {};
    gastosVariaveis.forEach((g) => {
      const cat = categorizeExpenseName(g.nome);
      somas[cat.key] = (somas[cat.key] || 0) + g.valor;
    });
    return Object.entries(somas)
      .map(([key, total]) => ({ key, label: EXPENSE_CATEGORIES.find((c) => c.key === key)?.label || key, total }))
      .sort((a, b) => b.total - a.total);
  }, [gastosVariaveis]);

  const [dividas, setDividas] = useState([]);
  const [novaDivida, setNovaDivida] = useState({ nome: "", valor: "", jurosMensal: "", parcelaMinima: "" });

  const [reservaAtual, setReservaAtual] = useState(0);
  const [investimentos, setInvestimentos] = useState([]);
  const [novoInvestimento, setNovoInvestimento] = useState({ ativo: "", valor: "" });
  const totalInvestido = investimentos.reduce((sum, i) => sum + i.valor, 0);
  const totalDisponivel = contaCorrente + saldoEspecie + saldoPoupanca + totalInvestido;
  const [showProsperity, setShowProsperity] = useState(false);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [isListeningSkills, setIsListeningSkills] = useState(false);
  const matchedSkillIdeas = useMemo(() => (skillsInput.trim() ? matchSkillIdeas(skillsInput) : []), [skillsInput]);

  const [isListening, setIsListening] = useState(false);
  const [voicePreview, setVoicePreview] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(true);

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

  // ---------- Compromisso mensal de reserva ("pague-se primeiro") ----------
  const [showReservaMensalModal, setShowReservaMensalModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [modalValorInput, setModalValorInput] = useState("");
  const [modalDiaInput, setModalDiaInput] = useState("");
  const [reservaMensalValor, setReservaMensalValor] = useState(null);
  const [reservaMensalDia, setReservaMensalDia] = useState(null);
  const [reservaMensalPaga, setReservaMensalPaga] = useState(false);
  const [reservaMensalRespondidoMes, setReservaMensalRespondidoMes] = useState(null);

  // ---------- Planejamento mensal de gastos (fixas, variáveis, extras) ----------
  const [showPlanejamentoModal, setShowPlanejamentoModal] = useState(false);
  const [showRelatorioMensal, setShowRelatorioMensal] = useState(false);
  const [showMaatFlutuante, setShowMaatFlutuante] = useState(false);
  const [planejamentoStep, setPlanejamentoStep] = useState(1);
  const [metaFixasInput, setMetaFixasInput] = useState("");
  const [metaVariavelInput, setMetaVariavelInput] = useState("");
  const [metaExtraInput, setMetaExtraInput] = useState("");
  const [metaFixas, setMetaFixas] = useState(null);
  const [metaVariavel, setMetaVariavel] = useState(null);
  const [metaExtra, setMetaExtra] = useState(null);
  const [planejamentoRespondidoMes, setPlanejamentoRespondidoMes] = useState(null);

  const mesAtualKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;

  // "Aquece" a lista de vozes do navegador cedo, pra já ter uma voz feminina em pt-BR pronta quando a Maat Assistente falar
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (new Date().getDate() === 1 && reservaMensalRespondidoMes !== mesAtualKey) {
      setModalValorInput(String(Math.round(aporteSugeridoReserva) || 100));
      setModalStep(1);
      setShowReservaMensalModal(true);
    }
    if (new Date().getDate() === 1 && planejamentoRespondidoMes !== mesAtualKey) {
      setMetaFixasInput(String(Math.round(totalCustosFixos) || 0));
      setPlanejamentoStep(1);
      setShowPlanejamentoModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirPlanejamentoManual() {
    setMetaFixasInput(String(metaFixas ?? Math.round(totalCustosFixos) ?? 0));
    setMetaVariavelInput(metaVariavel ? String(metaVariavel) : "");
    setMetaExtraInput(metaExtra ? String(metaExtra) : "");
    setPlanejamentoStep(1);
    setShowPlanejamentoModal(true);
  }

  function confirmarPlanejamento() {
    setMetaFixas(Number(metaFixasInput) || 0);
    setMetaVariavel(Number(metaVariavelInput) || 0);
    setMetaExtra(Number(metaExtraInput) || 0);
    setPlanejamentoRespondidoMes(mesAtualKey);
    setShowPlanejamentoModal(false);
  }

  function abrirCompromissoManual() {
    setModalValorInput(String(reservaMensalValor ?? (Math.round(aporteSugeridoReserva) || 100)));
    setModalDiaInput(reservaMensalDia ? String(reservaMensalDia) : "");
    setModalStep(1);
    setShowReservaMensalModal(true);
  }

  function confirmarValorCompromisso() {
    if (!modalValorInput) return;
    setModalStep(2);
  }

  function confirmarDiaCompromisso() {
    if (!modalDiaInput) return;
    setReservaMensalValor(Number(modalValorInput));
    setReservaMensalDia(Number(modalDiaInput));
    setReservaMensalPaga(false);
    setReservaMensalRespondidoMes(mesAtualKey);
    setShowReservaMensalModal(false);
  }
  const [isListeningCustoFixo, setIsListeningCustoFixo] = useState(false);
  const [isListeningRenda, setIsListeningRenda] = useState(false);
  const [ultimaRendaCapturada, setUltimaRendaCapturada] = useState(null);
  const [mockTransaction, setMockTransaction] = useState(null);
  const [objetivos, setObjetivos] = useState([]);
  const [novoObjetivo, setNovoObjetivo] = useState({ nome: "", valorAlvo: "", prazoMeses: "", valorAtual: "", ondeGuardar: "" });
  const [editingObjetivoId, setEditingObjetivoId] = useState(null);
  const [editingObjetivoValor, setEditingObjetivoValor] = useState("");
  const [isListeningObjetivo, setIsListeningObjetivo] = useState(false);
  const [mockTransactionResposta, setMockTransactionResposta] = useState(null);
  const [mockTransactionTexto, setMockTransactionTexto] = useState("");
  const [isListeningMockTransaction, setIsListeningMockTransaction] = useState(false);
  const [isListeningConsultor, setIsListeningConsultor] = useState(false);
  const [consultorQuestion, setConsultorQuestion] = useState("");
  const [consultorResponse, setConsultorResponse] = useState("");
  const [consultorModoResposta, setConsultorModoResposta] = useState("voz");

  // ---------- Motor único de reconhecimento de voz (com trava de segurança contra microfone travado) ----------
  function iniciarReconhecimentoDeVoz({ onResult, onStart, onStop, timeoutMs = 7000 }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let jaFinalizou = false;
    const finalizar = () => {
      if (jaFinalizou) return;
      jaFinalizou = true;
      clearTimeout(timerSeguranca);
      onStop && onStop();
    };

    // trava de segurança: se o navegador não avisar sozinho, força parar depois de alguns segundos
    const timerSeguranca = setTimeout(() => {
      try { recognition.stop(); } catch (e) {}
      finalizar();
    }, timeoutMs);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      clearTimeout(timerSeguranca);
      jaFinalizou = true;
      onResult(transcript);
      onStop && onStop();
    };
    recognition.onerror = () => finalizar();
    recognition.onend = () => finalizar();
    recognition.onspeechend = () => { try { recognition.stop(); } catch (e) {} };

    onStart && onStart();
    try {
      recognition.start();
    } catch (e) {
      finalizar();
    }
    return recognition;
  }

  function startVoiceCapture() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListening(true),
      onStop: () => setIsListening(false),
      onResult: (transcript) => {
        const parsed = parseVoiceExpense(transcript);
        setNovoGasto({ nome: parsed.nome, valor: parsed.valor != null ? String(parsed.valor) : "", tipo: parsed.tipo });
        setVoicePreview(parsed);
      },
    });
  }

  function startVoiceCaptureCustoFixo() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningCustoFixo(true),
      onStop: () => setIsListeningCustoFixo(false),
      onResult: (transcript) => {
        const parsed = parseVoiceCustoFixo(transcript);
        setNovoCustoFixo({
          nome: parsed.nome,
          valor: parsed.valor != null ? String(parsed.valor) : "",
          diaVencimento: parsed.dia != null ? String(parsed.dia) : "",
        });
      },
    });
  }

  function startVoiceCaptureRenda() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningRenda(true),
      onStop: () => setIsListeningRenda(false),
      onResult: (transcript) => {
        const parsed = parseVoiceRenda(transcript);
        if (parsed.valor != null) {
          const preenchido = { nome: parsed.nome, valor: String(parsed.valor) };
          if (parsed.tipo === "fixa") setNovaRendaFixa(preenchido);
          else if (parsed.tipo === "variavel") setNovaRendaVariavel(preenchido);
          else if (parsed.tipo === "extra") setNovaRendaExtra(preenchido);
        }
        setUltimaRendaCapturada({ transcript, ...parsed });
      },
    });
  }

  function startVoiceCaptureObjetivo() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningObjetivo(true),
      onStop: () => setIsListeningObjetivo(false),
      onResult: (transcript) => {
        const parsed = parseVoiceObjetivo(transcript);
        setNovoObjetivo((f) => ({
          ...f,
          nome: parsed.nome,
          valorAlvo: parsed.valor != null ? String(parsed.valor) : f.valorAlvo,
          prazoMeses: parsed.prazoMeses != null ? String(parsed.prazoMeses) : f.prazoMeses,
        }));
      },
    });
  }

  // ---------- Simulação de notificação de transação bancária (demo, sem backend real) ----------
  function gerarTransacaoSimulada(tipo) {
    const valor = tipo === "saida" ? Math.round((15 + Math.random() * 280) * 100) / 100 : Math.round((80 + Math.random() * 900) * 100) / 100;
    setMockTransaction({ tipo, valor });
  }

  function responderTransacaoSimulada(transcript) {
    if (!mockTransaction) return;
    if (mockTransaction.tipo === "saida") {
      const parsed = parseVoiceExpense(transcript);
      setGastosVariaveis((prev) => [{ id: Date.now(), nome: transcript, valor: mockTransaction.valor, tipo: parsed.tipo }, ...prev]);
    } else {
      const parsed = parseVoiceRenda(transcript);
      const item = { id: Date.now(), nome: parsed.nome, valor: mockTransaction.valor };
      if (parsed.tipo === "fixa") setRendaFixaItens((prev) => [...prev, item]);
      else if (parsed.tipo === "variavel") setRendaVariavelItens((prev) => [...prev, item]);
      else setRendaExtraItens((prev) => [...prev, item]);
    }
    setMockTransactionResposta(transcript);
    setTimeout(() => { setMockTransaction(null); setMockTransactionResposta(null); }, 2500);
  }

  function startVoiceCaptureMockTransaction() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningMockTransaction(true),
      onStop: () => setIsListeningMockTransaction(false),
      onResult: (transcript) => responderTransacaoSimulada(transcript),
    });
  }

  // ---------- Minha Consultora Maat Assistente ----------
  function buildConsultorResponse(query) {
    const q = query.toLowerCase();

    if (q.match(/gastar hoje|posso gastar|gasto hoje|sair|saída|saida|balada|role|rolê/)) {
      if (orcamentoDiario <= 0) {
        return "Hoje seu orçamento diário está zerado ou negativo — os gastos já passaram do que sobrava pro mês. O ideal agora é não gastar nada extra e rever os custos, pra não fechar o mês no vermelho.";
      }
      return `Seu orçamento hoje está em dia. Você pode gastar até R$ ${orcamentoDiario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem comprometer o resto do mês, considerando que faltam ${diasRestantes} dias e seu saldo disponível é de R$ ${saldoDisponivelMes.toLocaleString("pt-BR")}. Se você ultrapassar esse valor hoje, vai precisar economizar um pouco mais nos próximos dias pra compensar.`;
    }

    if (q.match(/d[íi]vida|atraso|cart[ãa]o/)) {
      if (dividas.length === 0) return "Você não tem nenhuma dívida cadastrada agora. Isso é ótimo — foco em manter a reserva de emergência e, se quiser, começar a investir.";
      return `Você tem ${dividas.length} dívida${dividas.length > 1 ? "s" : ""} cadastrada${dividas.length > 1 ? "s" : ""}, somando R$ ${totalDividas.toLocaleString("pt-BR")}. No ritmo atual, com o extra que você tem disponível pra pagar, você fica livre delas em aproximadamente ${debtPayoff.meses} meses.${temDividaCara ? " Atenção: uma delas tem juro alto, priorize quitar essa primeiro." : ""}`;
    }

    if (q.match(/reserva|emerg[êe]ncia/)) {
      return `Sua reserva de emergência está em R$ ${reservaAtual.toLocaleString("pt-BR")}, o que é ${progressoReserva.toFixed(0)}% da meta de R$ ${metaReserva.toLocaleString("pt-BR")}. O aporte mensal sugerido pra você agora é de R$ ${aporteSugeridoReserva.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}.`;
    }

    if (q.match(/quanto tenho|saldo|conta corrente|dinheiro dispon[íi]vel|esp[ée]cie/)) {
      return `Você tem R$ ${contaCorrente.toLocaleString("pt-BR")} na conta corrente e R$ ${saldoEspecie.toLocaleString("pt-BR")} em espécie, totalizando R$ ${totalDisponivel.toLocaleString("pt-BR")} disponível.`;
    }

    if (q.match(/situa[çc][ãa]o financeira|como estou|como est[áa] meu or[çc]amento|or[çc]amento/)) {
      return `Sua renda mensal é R$ ${rendaMensal.toLocaleString("pt-BR")}, seus custos fixos somam R$ ${totalCustosFixos.toLocaleString("pt-BR")}, sobrando R$ ${sobraMensal.toLocaleString("pt-BR")} por mês. Até agora você já gastou R$ ${totalGastoVariavelMes.toLocaleString("pt-BR")} em custos variáveis e extras, e seu orçamento pra hoje é de R$ ${orcamentoDiario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    }

    // ---- explicações sobre o próprio app, pra Maat poder tirar dúvida de qualquer lugar ----
    if (q.match(/quem [ée] voc[êe]|o que voc[êe] (faz|é)/)) {
      return `Eu sou a Maat, sua assistente dentro do app. Posso responder dúvidas sobre sua vida financeira, explicar qualquer parte do aplicativo, e também registrar despesas, receitas e outras informações se você me pedir por voz.`;
    }
    if (q.match(/o que [ée] (a )?minha carteira|como funciona a carteira/)) {
      return `Minha Carteira, dentro de Investimentos, mostra quanto e como investir de acordo com o seu perfil — conservador, moderado ou agressivo. É lá que você vê a divisão sugerida entre ações, renda fixa, fundos imobiliários e outras classes.`;
    }
    if (q.match(/o que [ée] (a[çc][õo]es|renda fixa|fundo imobili[áa]rio|fiis|etfs?|previd[êe]ncia|cripto)/)) {
      return `Cada uma dessas é uma classe de investimento diferente, com risco e liquidez próprios. Dentro de Investimentos, cada aba explica a classe específica e mostra o porquê de cada recomendação pro seu perfil. Vale abrir "O que é isso?" dentro de qualquer uma delas pra entender melhor.`;
    }
    if (q.match(/o que [ée] (o guia da prosperidade|prosperidade)/)) {
      return `O Guia da Prosperidade te dá ideias de renda extra e pequenos negócios, calibradas pelo seu perfil e pelas habilidades que você descrever. Fica dentro de Vida Financeira.`;
    }
    if (q.match(/o que [ée] (meus objetivos|objetivo)/)) {
      return `Em Meus Objetivos você cadastra sonhos como carro, casa ou viagem, com valor e prazo, e eu calculo quanto guardar por mês pra chegar lá — dá até pra falar isso por voz.`;
    }
    if (q.match(/como (eu )?(uso|funciona|navego)|estudar mais|onde (fica|encontro)/)) {
      return `O app tem duas partes principais: Vida Financeira (organizar renda, despesas, dívidas e reserva) e Investimentos (ações, renda fixa e outras classes, pelo seu perfil). Se quiser um resumo completo, abre o botão "Conheça tudo o que você tem aqui" na tela inicial — ele explica cada função em detalhe.`;
    }

    return `Não entendi exatamente sua pergunta, mas aqui vai um resumo rápido: seu orçamento de hoje é R$ ${orcamentoDiario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, e sua sobra do mês é R$ ${sobraMensal.toLocaleString("pt-BR")}. Você pode me perguntar sobre "quanto posso gastar hoje", "minhas dívidas", "minha reserva de emergência", "minha situação financeira", ou como usar qualquer parte do app.`;
  }

  // reconhece se a fala é um pedido pra REGISTRAR algo (despesa ou receita), em vez de uma pergunta
  function limparNomeDoComando(transcript) {
    let nome = transcript.toLowerCase();
    nome = nome.replace(/\d+\s+\d{1,2}\s*\/\s*100/g, ""); // formato de fração falado: "53 65/100"
    nome = nome.replace(/\d+\s*(?:reais?)?\s*e\s*\d{1,2}\s*centavos?/g, ""); // "53 e 65 centavos"
    nome = nome.replace(/(\d+[.,]?\d*)/g, ""); // resto dos números
    nome = nome.replace(/\b(registra|registrar|anota|anotar|acrescenta|acrescentar|adiciona|adicionar|coloca|colocar|lan[çc]a|lan[çc]ar|inclui|incluir|põe|por favor|uma|um|no|na|de|da|do|despesa|receita|reais?|centavos?|gastei|comprei|paguei|gasto|recebi|receb[íi]|ganhei|entrou|entrada)\b/gi, "");
    nome = nome.replace(/\s{2,}/g, " ").trim().replace(/[,.\s]+$/, "");
    return nome;
  }

  function detectarComandoDeRegistro(transcript) {
    const text = transcript.toLowerCase();
    // qualquer verbo de ação (registrar, acrescentar, adicionar, lançar...) conta como comando,
    // não só as palavras específicas de antes
    const acaoGenerica = /registra|anota|acrescent|adicion|coloc|lan[çc]|inclui|põe/;
    const ehReceitaPalavra = /receb[ie]|ganhei|entrou|renda extra|freela\b|bico\b|sal[áa]rio|receita|entrada/;
    const ehDespesaPalavra = /gastei|comprei|paguei|despesa|\bgasto\b/;

    const pareceReceita = ehReceitaPalavra.test(text);
    const pareceDespesa = ehDespesaPalavra.test(text);
    const temAcao = acaoGenerica.test(text);

    // só entra em modo "comando" se tiver ação/verbo de registro OU palavra específica de receita/despesa
    if (!temAcao && !pareceReceita && !pareceDespesa) return null;

    if (pareceReceita && !pareceDespesa) {
      const parsed = parseVoiceRenda(text);
      if (parsed.valor != null) {
        const nomeLimpo = limparNomeDoComando(transcript);
        return { tipo: "receita", parsed: { ...parsed, nome: nomeLimpo || parsed.nome } };
      }
    }

    // padrão: se não ficou claro que é receita, trata como despesa (é o caso mais comum)
    const parsed = parseVoiceExpense(text);
    if (parsed.valor != null) {
      const nomeLimpo = limparNomeDoComando(transcript);
      const categoriaLabel = EXPENSE_CATEGORIES.find((c) => c.key === parsed.categoria)?.label || "Despesa";
      return { tipo: "despesa", parsed: { ...parsed, nome: nomeLimpo || categoriaLabel } };
    }
    return null;
  }

  function speakConsultorResponse(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";

    // tom e ritmo mais suaves, menos "robóticos" — pequenos ajustes, dentro do que a voz do aparelho permite
    utterance.rate = 0.93;
    utterance.pitch = 1.08;
    utterance.volume = 1;

    // tenta escolher uma voz feminina em português — nomes variam por navegador/sistema
    const vozesFemininas = ["luciana", "maria", "helena", "camila", "fernanda", "female", "mulher", "google português do brasil"];
    const vozes = window.speechSynthesis.getVoices();
    const vozPt = vozes.filter((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
    const vozFeminina =
      vozPt.find((v) => vozesFemininas.some((nome) => v.name.toLowerCase().includes(nome))) || vozPt[0];
    if (vozFeminina) utterance.voice = vozFeminina;

    window.speechSynthesis.speak(utterance);
  }

  function startVoiceCaptureConsultor() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningConsultor(true),
      onStop: () => setIsListeningConsultor(false),
      onResult: (transcript) => {
        setConsultorQuestion(transcript);

        // se for um comando de registrar despesa/receita, executa direto e avisa
        const comando = detectarComandoDeRegistro(transcript);
        let response;
        if (comando && comando.tipo === "despesa") {
          setGastosVariaveis((prev) => [{ id: Date.now(), nome: comando.parsed.nome, valor: comando.parsed.valor, tipo: comando.parsed.tipo }, ...prev]);
          response = `Prontinho, registrei "${comando.parsed.nome}" de R$ ${comando.parsed.valor.toLocaleString("pt-BR")} nas suas despesas.`;
        } else if (comando && comando.tipo === "receita") {
          const item = { id: Date.now(), nome: comando.parsed.nome, valor: comando.parsed.valor };
          if (comando.parsed.tipo === "fixa") setRendaFixaItens((prev) => [...prev, item]);
          else if (comando.parsed.tipo === "variavel") setRendaVariavelItens((prev) => [...prev, item]);
          else setRendaExtraItens((prev) => [...prev, item]);
          response = `Prontinho, registrei R$ ${comando.parsed.valor.toLocaleString("pt-BR")} como renda ${comando.parsed.tipo === "fixa" ? "fixa" : comando.parsed.tipo === "variavel" ? "variável" : "extra"}.`;
        } else {
          response = buildConsultorResponse(transcript);
        }

        setConsultorResponse(response);
        if (consultorModoResposta === "voz") speakConsultorResponse(response);
      },
    });
  }

  function startVoiceCaptureSkills() {
    iniciarReconhecimentoDeVoz({
      onStart: () => setIsListeningSkills(true),
      onStop: () => setIsListeningSkills(false),
      onResult: (transcript) => setSkillsInput((prev) => (prev ? `${prev}, ${transcript}` : transcript)),
    });
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{
        "--ink": "#14291F",
        "--panel": "#1C3527",
        "--paper": "#EDE6D6",
        "--paper-dim": "#C9BFA4",
        "--gold": "#BE9A5C",
        "--rust": "#B14A34",
        background: "var(--ink)",
        color: "var(--paper)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>

      {/* Guia de boas-vindas — aparece ao abrir o app, reaberto pelo botão do cabeçalho */}
      {showWelcomeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
          style={{ background: "rgba(20,41,31,0.9)" }}
        >
          <div className="w-full max-w-xl rounded-sm p-5 md:p-7 overflow-y-auto" style={{ background: "var(--panel)", border: "1px solid var(--gold)", maxHeight: "88vh" }}>
            <div className="flex items-center gap-2 mb-1">
              <Compass size={20} color="var(--gold)" />
              <span className="text-lg font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Bora conhecer a Maat? 🧭</span>
            </div>
            <p className="text-xs mb-5" style={{ color: "var(--paper-dim)" }}>Um resumo rapidinho antes de você mandar ver. Clique em cada tópico pra abrir.</p>

            <AccordionItem id="rumo" title="Você sabia que aqui dentro você tem uma parceira? A Maat Assistente? Aprenda como ela funciona" isOpen={welcomeSection === "rumo"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
                Ela é sua agente financeira de bolso — está sempre disponível pra você no <strong style={{ color: "var(--gold)" }}>botão flutuante no canto da tela</strong>, em qualquer parte do app. É só clicar e falar. Ela tira suas dúvidas do dia a dia antes de gastar, explica qualquer função do aplicativo, e também registra suas despesas e receitas por voz. Tá na correria e não consegue digitar? Pede pra ela por voz que ela registra a informação. Você só precisa confirmar depois.
              </p>
            </AccordionItem>

            <AccordionItem id="comecar" title="Por onde começar?" isOpen={welcomeSection === "comecar"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                Bora com o pé direito: a primeira coisa que você precisa fazer pra organizar sua vida financeira é começar pelo <strong style={{ color: "var(--gold)" }}>Vida Financeira</strong>. Ali dentro você vai:
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                <li>🔗 <strong style={{ color: "var(--paper)" }}>Conectar suas contas bancárias</strong> ao aplicativo — e, se você tiver conta em alguma corretora de investimento, também dá pra adicionar, pra acompanhar tudo em tempo real</li>
              </ul>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                Agora que você já estruturou, vamos pra parte das despesas:
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                <li>🧾 Registrar suas <strong style={{ color: "var(--paper)" }}>despesas</strong> — e aprender a diferença entre custo fixo, variável e extra</li>
                <li>💰 Colocar seus <strong style={{ color: "var(--paper)" }}>ganhos</strong> — tudo que entra no seu bolso</li>
                <li>💳 Organizar suas <strong style={{ color: "var(--paper)" }}>dívidas</strong>, com valores, juros e parcelas, tudo bonitinho</li>
                <li>🛟 Começar a formar sua <strong style={{ color: "var(--paper)" }}>reserva de emergência</strong></li>
              </ul>
              <p className="text-xs leading-relaxed italic" style={{ color: "var(--paper-dim)" }}>
                Só depois que suas finanças estiverem organizadas é que vale a pena partir pros investimentos maiores. Sem pressa — dinheiro investido sem base sólida costuma sumir rápido que nem doce na mão de criança.
              </p>
            </AccordionItem>

            <AccordionItem id="custos" title="Não sabe diferenciar seus custos? Aprenda agora mesmo" isOpen={welcomeSection === "custos"} onToggle={setWelcomeSection}>
              <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--gold)" }}>Custo Fixo</strong> — chega todo mês, com o mesmo valor (ou quase). Ex: aluguel, financiamento, mensalidade da academia, plano de celular.</li>
                <li><strong style={{ color: "var(--gold)" }}>Custo Variável</strong> — muda de mês pra mês, mas você já espera que vai gastar. Ex: mercado, gasolina, delivery, lazer.</li>
                <li><strong style={{ color: "var(--gold)" }}>Custo Extra</strong> — pinta do nada, sem avisar. Ex: conserto do carro, presente de aniversário, remédio, multa.</li>
              </ul>
            </AccordionItem>

            <AccordionItem id="ganhos" title="Não sabe diferenciar seus ganhos? Aprenda agora mesmo" isOpen={welcomeSection === "ganhos"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                Viu que você tem custo fixo, variável e extra? Pois é — pra equilibrar de verdade suas contas, o ideal é você também ter <strong style={{ color: "var(--gold)" }}>três tipos de ganho</strong>. A maioria das pessoas vive só do salário, mas quem diversifica a entrada de dinheiro sente muito menos aperto no fim do mês:
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--gold)" }}>Renda Fixa</strong> — entra todo mês, sempre com o mesmo valor. Ex: salário do seu emprego.</li>
                <li><strong style={{ color: "var(--gold)" }}>Renda Variável</strong> — entra com frequência, mas o valor muda. Ex: comissão, bônus, hora extra.</li>
                <li>
                  <strong style={{ color: "var(--gold)" }}>Renda Extra</strong> — não é garantida, mas ajuda quando aparece. Ex: freela, bico, venda de algo que você não usa mais, ou um serviço que você presta de vez em quando pra um vizinho, parente ou desconhecido — pintar uma grade, pintar uma casa, ajudar numa pequena reforma, fazer um serviço de jardinagem, ou fazer uma maquiagem — coisa que você não faz todo dia, mas de vez em quando rende uma grana extra.
                </li>
              </ul>
            </AccordionItem>

            <AccordionItem id="comportamento" title="Organizar a vida financeira não é só matemática" isOpen={welcomeSection === "comportamento"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                Somar, subtrair, multiplicar, dividir — beleza, isso qualquer calculadora faz. Mas ter uma vida financeira saudável de verdade não é sobre números, é sobre <strong style={{ color: "var(--gold)" }}>comportamento</strong>.
              </p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                O desafio de verdade não é fazer a conta — é resistir àquele impulso de comprar o que não precisa, dizer não pro delivery quando já tem comida em casa, e pensar duas vezes antes de parcelar aquilo que só vai te dar prazer por 5 minutos.
              </p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                E tem um detalhe sorrateiro nisso tudo: muita vez a gente compra pra agradar os outros, não a si mesmo. Vê alguém com uma coisa nova e já quer igual — mesmo sem precisar. Compra pra "pertencer" a um grupo, pra não ficar de fora. Só que ninguém te conta uma coisa: quem sente o aperto no bolso depois é você, não quem te inspirou a comprar.
              </p>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                A boa notícia? Isso se treina que nem músculo. Quanto mais você presta atenção nos seus próprios hábitos, mais fácil fica escolher o seu futuro em vez da vontade do momento.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
                E o prêmio no fim vale muito a pena: uma vida financeira estável não é só ter dinheiro guardado — é viver com mais liberdade, menos ansiedade, e aproveitar os bons momentos sem peso na consciência.
              </p>
            </AccordionItem>

            <AccordionItem id="prosperidade" title="Aqui dentro você tem o Guia da Prosperidade. Sabe como ele funciona?" isOpen={welcomeSection === "prosperidade"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                É o nosso diferencial: ela te dá um <strong style={{ color: "var(--gold)" }}>norte pra fechar as contas do mês</strong> quando o orçamento aperta. Ela ajuda de três formas:
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--gold)" }}>Ideias de renda extra</strong> — sugestões calibradas pelo seu perfil, pra você fazer um dinheiro a mais todo mês.</li>
                <li><strong style={{ color: "var(--gold)" }}>Dicas de pequenos negócios</strong> — caminhos que você pode começar a explorar com pouco investimento inicial.</li>
                <li><strong style={{ color: "var(--gold)" }}>Sugestões pelas suas habilidades</strong> — basta descrever (por texto ou por voz) o que você sabe fazer, que o Guia da Prosperidade te dá um norte de coisas específicas que você pode fazer pra levantar uma grana extra.</li>
              </ul>
            </AccordionItem>

            <AccordionItem id="vida-financeira-mapa" title="O que tem dentro de Vida Financeira" isOpen={welcomeSection === "vida-financeira-mapa"} onToggle={setWelcomeSection}>
              <ul className="space-y-1 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--paper)" }}>Saldo Disponível</strong> — conta corrente, espécie, poupança e investimentos, tudo num lugar</li>
                <li><strong style={{ color: "var(--paper)" }}>Receitas</strong> — todas as suas fontes de renda, fixa, variável e extra</li>
                <li><strong style={{ color: "var(--paper)" }}>Despesas</strong> — três abas (Fixo, Variável, Extra), cada uma com sua lista e formulário próprios, mais o planejamento do mês com a regra 50/30/20</li>
                <li><strong style={{ color: "var(--paper)" }}>Guia da Prosperidade</strong> — ideias de renda extra pro seu perfil</li>
                <li><strong style={{ color: "var(--paper)" }}>Orçamento Diário</strong> — quanto você pode gastar hoje</li>
                <li><strong style={{ color: "var(--paper)" }}>Poupança</strong> — se você ainda guarda dinheiro ali</li>
                <li><strong style={{ color: "var(--paper)" }}>Quitação de Dívida</strong> — plano pra ficar livre delas</li>
                <li><strong style={{ color: "var(--paper)" }}>Fundo de Emergência</strong> — sua reserva guiada, com o compromisso mensal de "se pagar primeiro"</li>
                <li><strong style={{ color: "var(--paper)" }}>Meu Fundo de Investimento</strong> — o que você já tem investido</li>
                <li><strong style={{ color: "var(--paper)" }}>Meus Objetivos</strong> — carro, casa, viagem: defina valor, prazo e onde vai guardar (por texto ou voz), e a gente calcula quanto guardar por mês — inclusive já linkando esse valor direto nas suas Despesas Fixas</li>
              </ul>
            </AccordionItem>

            <AccordionItem id="planejamento-mapa" title="Todo mês, a gente te ajuda a se planejar" isOpen={welcomeSection === "planejamento-mapa"} onToggle={setWelcomeSection}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                No dia 1 de cada mês, o app te pergunta duas coisas, pra você começar o mês com clareza:
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--gold)" }}>Quanto vamos guardar pra reserva de emergência?</strong> — você define o valor e o dia do depósito, e a gente cobra de você (com carinho) até lá.</li>
                <li><strong style={{ color: "var(--gold)" }}>Quanto você planeja gastar em cada tipo de despesa?</strong> — fixas, variáveis e extras. Conforme o mês passa, dentro de Despesas a gente mostra, num painel único, o real gasto de cada categoria contra o planejado, com barra de progresso, e avisa quando você está perto de estourar ou já passou do combinado.</li>
              </ul>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper-dim)" }}>
                Esse painel também traz uma referência de especialistas em finanças pessoais, a <strong style={{ color: "var(--gold)" }}>regra 50/30/20</strong>: até 50% da renda em Custos Fixos, até 30% em Custo Variável, e os 20% restantes pra reserva e investimentos — o Custo Extra fica de fora dessa conta, já que ele é imprevisível por natureza.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                Mudou de ideia no meio do mês? Sem problema — dá pra editar o planejamento a qualquer momento, direto dentro de Despesas e do Fundo de Emergência.
              </p>
            </AccordionItem>

            <AccordionItem id="investimentos-mapa" title="O que tem dentro de Investimentos" isOpen={welcomeSection === "investimentos-mapa"} onToggle={setWelcomeSection}>
              <ul className="space-y-1 text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
                <li><strong style={{ color: "var(--paper)" }}>Minha Carteira</strong> — quando investir e como investir, de acordo com o seu perfil</li>
                <li><strong style={{ color: "var(--paper)" }}>Relatório Periódico</strong> e <strong style={{ color: "var(--paper)" }}>Diário do Investidor</strong> — acompanhamento e autoconhecimento</li>
                <li><strong style={{ color: "var(--paper)" }}>Ações, Renda Fixa, FIIs, ETFs, Previdência, Cripto</strong> — cada classe explicada, com o porquê de cada recomendação</li>
              </ul>
              <p className="text-xs leading-relaxed p-2.5 rounded-sm" style={{ color: "var(--paper)", background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
                <strong style={{ color: "var(--gold)" }}>Importante:</strong> nossas análises são educacionais, embasadas no tipo do seu perfil de investidor — não é uma recomendação individual e exclusiva pra você. Nenhum investimento é garantido, e o caminho que mostramos é um bom caminho, não o único. A decisão final é sempre sua — inclusive sobre em qual banco, corretora ou instituição você prefere ter conta: não recomendamos nenhuma instituição específica. Isso vale também pra Renda Fixa — você pode escolher livremente o CDB do banco de sua preferência, não só os que aparecem aqui.
              </p>
            </AccordionItem>

            <button
              onClick={() => setShowWelcomeGuide(false)}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-sm mt-4"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Entendi, vamos começar
            </button>
          </div>
        </div>
      )}

      {/* Modal "pague-se primeiro" — compromisso mensal com a reserva de emergência */}
      {showReservaMensalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
          style={{ background: "rgba(20,41,31,0.85)" }}
        >
          <div className="w-full max-w-sm rounded-sm p-5 md:p-6 overflow-y-auto" style={{ background: "var(--panel)", border: "1px solid var(--gold)", maxHeight: "88vh" }}>
            <div className="flex items-center gap-2 mb-3">
              <Umbrella size={18} color="var(--gold)" />
              <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Novo mês, novo compromisso</span>
            </div>

            {modalStep === 1 && (
              <>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--paper)" }}>
                  Quanto vamos economizar neste mês pra sua reserva de emergência? Lembre-se: <strong style={{ color: "var(--gold)" }}>você precisa se pagar primeiro.</strong>
                </p>
                <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>
                  Valor sugerido: R$ {Math.round(aporteSugeridoReserva).toLocaleString("pt-BR")} — edite se quiser
                </label>
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
                  <span className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>R$</span>
                  <input
                    type="number" min="0" autoFocus value={modalValorInput}
                    onChange={(e) => setModalValorInput(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent outline-none"
                    style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowReservaMensalModal(false)} className="flex-1 text-xs px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
                    Agora não
                  </button>
                  <button onClick={confirmarValorCompromisso} className="flex-1 text-sm font-semibold px-3 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                    Confirmar valor
                  </button>
                </div>
              </>
            )}

            {modalStep === 2 && (
              <>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--paper)" }}>
                  Combinado: <strong style={{ color: "var(--gold)" }}>R$ {Number(modalValorInput).toLocaleString("pt-BR")}</strong>. Até que dia do mês vamos depositar isso — numa poupança, CDB, ou onde você guarda sua reserva?
                </p>
                <input
                  type="number" min="1" max="31" autoFocus placeholder="Dia do mês (ex: 10)" value={modalDiaInput}
                  onChange={(e) => setModalDiaInput(e.target.value)}
                  className="w-full text-lg font-semibold px-3 py-2 rounded-sm mb-4"
                  style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <div className="flex gap-2">
                  <button onClick={() => setModalStep(1)} className="flex-1 text-xs px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
                    Voltar
                  </button>
                  <button onClick={confirmarDiaCompromisso} className="flex-1 text-sm font-semibold px-3 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de planejamento mensal — metas de gasto pra fixas, variáveis e extras */}
      {showPlanejamentoModal && !showReservaMensalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
          style={{ background: "rgba(20,41,31,0.85)" }}
        >
          <div className="w-full max-w-sm rounded-sm p-5 md:p-6 overflow-y-auto" style={{ background: "var(--panel)", border: "1px solid var(--gold)", maxHeight: "88vh" }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} color="var(--gold)" />
              <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Planejamento do mês</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--paper)" }}>
              Vamos definir o quanto você pretende gastar esse mês em cada tipo de despesa. Isso ajuda a gente a te avisar se o mês está saindo do controle.
            </p>

            <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Despesas Fixas (aluguel, contas...)</label>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" value={metaFixasInput}
                onChange={(e) => setMetaFixasInput(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Despesas Variáveis (mercado, transporte, lazer...)</label>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" placeholder="0" value={metaVariavelInput}
                onChange={(e) => setMetaVariavelInput(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Despesas Extras (imprevistos)</label>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" placeholder="0" value={metaExtraInput}
                onChange={(e) => setMetaExtraInput(e.target.value)}
                className="w-full text-sm font-semibold bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowPlanejamentoModal(false)} className="flex-1 text-xs px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
                Agora não
              </button>
              <button onClick={confirmarPlanejamento} className="flex-1 text-sm font-semibold px-3 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                Confirmar planejamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do relatório de fim de mês — gastos por categoria + dicas personalizadas */}
      {showRelatorioMensal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8"
          style={{ background: "rgba(20,41,31,0.85)" }}
        >
          <div className="w-full max-w-md rounded-sm p-5 md:p-6 overflow-y-auto" style={{ background: "var(--panel)", border: "1px solid var(--gold)", maxHeight: "88vh" }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} color="var(--gold)" />
              <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Relatório do mês</span>
            </div>

            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--paper)" }}>
              {gastosPorCategoria[0]?.key === "saude"
                ? "Percebi que boa parte do seu gasto esse mês foi com saúde. Isso não é motivo de preocupação financeira — imprevistos de saúde acontecem, e cuidar de você e da sua família vem sempre em primeiro lugar."
                : sobraMensal < 0
                ? "Esse mês seus custos fixos já superaram sua renda — a prioridade agora é ajustar o orçamento, não investir."
                : (metaVariavel !== null && totalCustosVariaveis > metaVariavel) || (metaExtra !== null && totalCustosExtras > metaExtra)
                ? "Esse mês o orçamento estourou em pelo menos uma categoria. Vamos entender onde, pra melhorar no próximo mês:"
                : (metaVariavel !== null && totalCustosVariaveis >= metaVariavel * 0.8)
                ? "Esse mês quase comprometeu mais o seu orçamento do que devia — deu pra sentir o aperto. Aqui vai o raio-x:"
                : "Esse mês seu orçamento ficou sob controle. Mesmo assim, olha onde seu dinheiro mais foi — sempre dá pra afinar um pouco mais:"}
            </p>

            <div className="space-y-3 mb-2">
              {gastosPorCategoria.slice(0, 3).map((cat, i) => (
                <div key={cat.key} className="p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: "var(--paper)" }}>
                      {cat.key === "saude" ? "❤️" : i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {cat.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {cat.total.toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                    {EXPENSE_CATEGORY_TIPS[cat.key] || EXPENSE_CATEGORY_TIPS.outros}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[10px] leading-relaxed mb-4" style={{ color: "var(--paper-dim)" }}>
              Categorização automática, com base no nome do que você registrou — pode não ser 100% precisa, mas já dá uma boa direção de onde focar.
            </p>

            <button
              onClick={() => setShowRelatorioMensal(false)}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-sm"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Entendi, vamos melhorar
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="px-5 pt-8 pb-6 md:px-10" style={{ borderBottom: "1px solid rgba(237,230,214,0.15)" }}>
        <div className="flex items-center gap-2 mb-1" style={{ color: "var(--gold)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Protótipo · Fase 1
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
          Maat Finanças
        </h1>
        <p className="mt-2 max-w-xl text-sm md:text-base" style={{ color: "var(--paper-dim)" }}>
          Análise fundamentalista de empresas segundo os critérios clássicos dos grandes investidores — ajustada ao perfil de cada cliente.
        </p>
      </header>

      {/* Não sabe o perfil? Entenda e faça o teste */}
      <div className="px-5 md:px-10 pt-6">
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
          style={{ background: "var(--gold)", color: "var(--ink)" }}
        >
          <HelpCircle size={16} />
          Não sabe qual é o seu perfil de investidor? Entenda antes de começar
          <ArrowRight size={14} style={{ transform: showGuide ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
        </button>

        {showGuide && (
          <div className="mt-4 rounded-sm p-4 md:p-6" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
            {/* Explicação dos 3 perfis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {Object.entries(PROFILES).map(([key, p]) => {
                const d = PROFILE_DETAILS[key];
                const Icon = p.icon;
                return (
                  <div key={key} className="p-3 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={15} color="var(--gold)" />
                      <span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{p.label}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs" style={{ color: "var(--paper-dim)" }}>
                      <li><span style={{ color: "var(--paper)" }}>Horizonte:</span> {d.horizon}</li>
                      <li><span style={{ color: "var(--paper)" }}>Risco:</span> {d.risk}</li>
                      <li><span style={{ color: "var(--paper)" }}>Foco:</span> {d.focus}</li>
                      <li className="pt-1 italic">{d.fit}</li>
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Teste rápido */}
            <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }} className="pt-5">
              <div className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                Teste rápido — 4 perguntas
              </div>
              <div className="space-y-5">
                {QUIZ_QUESTIONS.map((item, qi) => (
                  <div key={qi}>
                    <p className="text-sm mb-2">{qi + 1}. {item.q}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {item.options.map((opt, oi) => {
                        const isChosen = quizAnswers[qi] === opt.profile;
                        return (
                          <button
                            key={oi}
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: opt.profile }))}
                            className="flex-1 text-left text-xs px-3 py-2 rounded-sm transition-colors"
                            style={{
                              background: isChosen ? "rgba(190,154,92,0.16)" : "transparent",
                              border: `1px solid ${isChosen ? "var(--gold)" : "rgba(237,230,214,0.2)"}`,
                              color: isChosen ? "var(--gold)" : "var(--paper-dim)",
                            }}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {quizResult && (
                <div
                  className="mt-5 flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-sm"
                  style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}
                >
                  <div className="text-sm">
                    {quizResult.complete ? (
                      <>Perfil sugerido: <span className="font-semibold" style={{ color: "var(--gold)" }}>{PROFILES[quizResult.top].label}</span></>
                    ) : (
                      <span style={{ color: "var(--paper-dim)" }}>
                        Responda as {QUIZ_QUESTIONS.length} perguntas pra ver o perfil sugerido ({quizResult.answered}/{QUIZ_QUESTIONS.length})
                      </span>
                    )}
                  </div>
                  {quizResult.complete && (
                    <button
                      onClick={() => {
                        setProfileKey(quizResult.top);
                        setShowGuide(false);
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-sm"
                      style={{ background: "var(--gold)", color: "var(--ink)" }}
                    >
                      Usar esse perfil
                    </button>
                  )}
                </div>
              )}
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                Teste simplificado para fins ilustrativos — não substitui a análise de suitability formal exigida por corretoras e assessores regulados.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Seletor de perfil */}
      <div className="px-5 md:px-10 pt-6">
        <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
          Perfil do cliente
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-xl">
          {Object.entries(PROFILES).map(([key, p]) => {
            const Icon = p.icon;
            const active = key === profileKey;
            return (
              <button
                key={key}
                onClick={() => setProfileKey(key)}
                className="flex flex-col items-start gap-1.5 p-3 rounded-sm text-left transition-colors"
                style={{
                  background: active ? "rgba(190,154,92,0.14)" : "var(--panel)",
                  border: `1px solid ${active ? "var(--gold)" : "rgba(237,230,214,0.15)"}`,
                }}
              >
                <Icon size={16} color={active ? "var(--gold)" : "var(--paper-dim)"} />
                <span className="text-sm font-semibold" style={{ color: active ? "var(--gold)" : "var(--paper)" }}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs mt-2 max-w-xl" style={{ color: "var(--paper-dim)" }}>
          {profile.blurb}
        </p>
      </div>

      {/* Tela inicial: escolha entre Vida Financeira e Investimentos */}
      {homeSection === null && (
        <div className="px-5 md:px-10 pt-8 pb-6">
          <button
            onClick={() => setShowComecarPor((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm mb-4 transition-colors"
            style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            <Flag size={16} />
            Por onde eu começo? Leia antes de continuar
            <ArrowRight size={14} style={{ transform: showComecarPor ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          {showComecarPor && (
            <div className="mb-6 max-w-2xl rounded-sm p-4 md:p-5" style={{ background: "var(--panel)", border: "1px solid var(--gold)" }}>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--paper)" }}>
                <strong style={{ color: "var(--gold)" }}>Comece pela Vida Financeira — os Investimentos esperam por você.</strong>
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
                Esse app existe pra te ajudar a dar a volta por cima nas dívidas e organizar sua vida financeira do zero. Só depois, com essa base sólida, faz sentido avançar pros investimentos — nenhum investimento compensa o juro de uma dívida alta correndo em paralelo.
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
                Organizando primeiro seu orçamento e suas contas, em poucos meses você já consegue guardar dinheiro de verdade e sentir mais estabilidade no dia a dia. Isso exige disciplina — mas cuidar das suas finanças é, antes de tudo, se colocar em primeiro lugar.
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
                Quem tem as finanças em dia vive melhor, aproveita mais os bons momentos e carrega menos peso nos ombros. É por isso que vale tanto a pena estabilizar essa parte da sua vida.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
                <strong style={{ color: "var(--gold)" }}>Agora que você entendeu, vamos em frente:</strong> clique no ícone <strong>Vida Financeira</strong> abaixo e registre suas despesas, rendas e contas. Se já tiver sua vida financeira estabilizada, preencha do mesmo jeito e siga direto pra aba <strong>Investimentos</strong>, pra aprender quais combinam melhor com você.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 max-w-xl">
            <button
              onClick={() => { setHomeSection("vida"); setAssetClass("vida-financeira"); setVidaSection(null); }}
              className="flex flex-col items-center gap-3 p-5 rounded-sm transition-colors"
              style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(190,154,92,0.14)", border: "1px solid var(--gold)" }}>
                <Wallet size={24} color="var(--gold)" />
              </div>
              <span className="text-sm font-semibold text-center" style={{ color: "var(--paper)" }}>Vida Financeira</span>
            </button>
            <button
              onClick={() => { setHomeSection("investimentos"); setAssetClass("carteira"); }}
              className="flex flex-col items-center gap-3 p-5 rounded-sm transition-colors"
              style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(190,154,92,0.14)", border: "1px solid var(--gold)" }}>
                <TrendingUp size={24} color="var(--gold)" />
              </div>
              <span className="text-sm font-semibold text-center" style={{ color: "var(--paper)" }}>Investimentos</span>
            </button>
            <button
              onClick={() => setShowWelcomeGuide(true)}
              className="flex flex-col items-center gap-3 p-5 rounded-sm transition-colors"
              style={{ background: "var(--panel)", border: "1px solid var(--gold)" }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(190,154,92,0.14)", border: "1px solid var(--gold)" }}>
                <BookOpen size={24} color="var(--gold)" />
              </div>
              <span className="text-sm font-semibold text-center" style={{ color: "var(--gold)" }}>Conheça tudo o que você tem aqui</span>
            </button>
          </div>
        </div>
      )}

      {homeSection !== null && (
      <>
      <div className="px-5 md:px-10 pt-4">
        <button onClick={() => setHomeSection(null)} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gold)" }}>
          <ArrowRight size={12} style={{ transform: "rotate(180deg)" }} /> Voltar
        </button>
      </div>

      {homeSection === "investimentos" && (
      <IconMenuSection
        title="Menu de Investimentos"
        items={[
          { key: "carteira", label: "Minha Carteira", icon: PieChart },
          { key: "relatorio", label: "Relatório", icon: Mail },
          { key: "diario", label: "Diário", icon: Brain },
          { key: "custos", label: "Custos Ocultos", icon: Receipt },
          { key: "acoes", label: "Ações", icon: TrendingUp },
          { key: "renda-fixa", label: "Renda Fixa", icon: Landmark },
          { key: "fiis", label: "FIIs", icon: Building2 },
          { key: "etfs", label: "ETFs", icon: Layers },
          { key: "previdencia", label: "Previdência", icon: PiggyBank },
          { key: "cripto", label: "Cripto", icon: Bitcoin },
        ]}
        activeKey={assetClass}
        onSelect={setAssetClass}
      />
      )}

      {assetClass === "vida-financeira" && (
      <div className="px-5 py-6 md:px-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={18} color="var(--gold)" />
          <h2 className="text-xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>Vida Financeira</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--paper-dim)" }}>
          Antes de investir, organize a base: quanto entra, quanto é fixo, quanto sobra pra gastar com consciência — e, se houver dívida, um plano pra sair dela.
        </p>

        {vidaSection === null && (
          <div className="grid grid-cols-4 gap-3 max-w-2xl">
            {[
              { key: "saldo", label: "Saldo Disponível", icon: Wallet },
              { key: "receitas", label: "Receitas", icon: TrendingUp },
              { key: "rumo", label: "Falar com a Maat Assistente", icon: Mic },
              { key: "despesas", label: "Despesas", icon: Receipt },
              { key: "prosperidade", label: "Guia da Prosperidade", icon: Compass },
              { key: "orcamento", label: "Orçamento Diário", icon: Calendar },
              { key: "poupanca", label: "Poupança", icon: Landmark },
              { key: "dividas", label: "Quitação de Dívida", icon: CreditCard },
              { key: "reserva", label: "Fundo de Emergência", icon: Umbrella },
              { key: "fundo", label: "Meu Fundo de Investimento", icon: PiggyBank },
              { key: "objetivos", label: "Meus Objetivos", icon: Target },
            ].map((item) => {
              const Icon = item.icon;
              const alerta = item.key === "prosperidade" && (deficitAtivo || orcamentoApertado);
              return (
                <button key={item.key} onClick={() => setVidaSection(item.key)} className="flex flex-col items-center gap-2 text-center">
                  <div className="relative w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "var(--panel)", border: `1px solid ${alerta ? "var(--gold)" : "rgba(237,230,214,0.15)"}` }}>
                    <Icon size={22} color={alerta ? "var(--gold)" : "var(--paper-dim)"} />
                    {alerta && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--rust)" }} />}
                  </div>
                  <span className="text-[11px] leading-tight" style={{ color: "var(--paper-dim)" }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {vidaSection !== null && (
        <>
        <button onClick={() => setVidaSection(null)} className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "var(--gold)" }}>
          <ArrowRight size={12} style={{ transform: "rotate(180deg)" }} /> Voltar
        </button>

        {vidaSection === "saldo" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--gold)" }}>Seu dinheiro disponível</span>
            <button onClick={() => setShowSaldo((v) => !v)} className="flex items-center gap-1 text-xs" style={{ color: "var(--paper-dim)" }}>
              {showSaldo ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Conta corrente</label>
              {showSaldo ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$</span>
                  <input
                    type="number"
                    value={contaCorrente}
                    onChange={(e) => setContaCorrente(Math.max(0, Number(e.target.value)))}
                    className="text-2xl font-bold w-full bg-transparent outline-none"
                    style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}
                    placeholder="0"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$ ••••</div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Em espécie</label>
              {showSaldo ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$</span>
                  <input
                    type="number"
                    value={saldoEspecie}
                    onChange={(e) => setSaldoEspecie(Math.max(0, Number(e.target.value)))}
                    className="text-2xl font-bold w-full bg-transparent outline-none"
                    style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}
                    placeholder="0"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$ ••••</div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Poupança</label>
              {showSaldo ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$</span>
                  <input
                    type="number"
                    value={saldoPoupanca}
                    onChange={(e) => setSaldoPoupanca(Math.max(0, Number(e.target.value)))}
                    className="text-2xl font-bold w-full bg-transparent outline-none"
                    style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}
                    placeholder="0"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$ ••••</div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Investimentos</label>
              {showSaldo ? (
                <div className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>
                  R$ {totalInvestido.toLocaleString("pt-BR")}
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>••••</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            <span className="text-xs" style={{ color: "var(--paper-dim)" }}>Total disponível</span>
            <span className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
              {showSaldo ? `R$ ${totalDisponivel.toLocaleString("pt-BR")}` : "R$ ••••••"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-[11px]" style={{ color: "var(--paper-dim)" }}>
            <Link2 size={12} />
            Conta corrente e poupança preenchidas manualmente por enquanto — quando você conectar seu banco (Open Finance), atualizam sozinhas. Investimentos somam automaticamente tudo que você registrou no ícone "Meu Fundo de Investimento" (CDB, ações, o que for). O valor em espécie sempre será manual.
          </div>
        </div>
        )}

        {vidaSection === "saldo" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--gold)" }}>
            <Bell size={13} /> Notificação automática de transação
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
            Quando sua conta bancária estiver conectada de verdade, toda vez que você fizer uma compra ou receber um valor, o app te avisa na hora perguntando onde lançar — e você responde por voz, sem precisar confirmar depois. Testa como vai funcionar:
          </p>

          {!mockTransaction ? (
            <div className="flex gap-2">
              <button onClick={() => gerarTransacaoSimulada("saida")} className="flex-1 text-xs font-semibold px-3 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                Simular uma compra
              </button>
              <button onClick={() => gerarTransacaoSimulada("entrada")} className="flex-1 text-xs font-semibold px-3 py-2 rounded-sm" style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>
                Simular um recebimento
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid var(--gold)" }}>
              {mockTransactionResposta ? (
                <p className="text-xs leading-relaxed" style={{ color: "var(--gold)" }}>
                  ✓ Lançado! Você disse "{mockTransactionResposta}" — já registrei certinho.
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--paper)" }}>
                    {mockTransaction.tipo === "saida"
                      ? `Olá! Vi que você fez uma compra no valor de R$ ${mockTransaction.valor.toLocaleString("pt-BR")}. Onde eu posso lançar isso pra você?`
                      : `Vi que entrou um valor de R$ ${mockTransaction.valor.toLocaleString("pt-BR")} na sua conta. Onde eu posso lançar esse recebimento?`}
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={mockTransactionTexto}
                      onChange={(e) => setMockTransactionTexto(e.target.value)}
                      placeholder={mockTransaction.tipo === "saida" ? "ex: fui no mercado, comprei água" : "ex: foi um serviço extra que eu fiz"}
                      className="flex-1 text-xs px-2 py-1.5 rounded-sm"
                      style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
                    />
                    <button
                      onClick={startVoiceCaptureMockTransaction}
                      className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1"
                      style={{ background: isListeningMockTransaction ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningMockTransaction ? "var(--paper)" : "var(--gold)" }}
                    >
                      {isListeningMockTransaction ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>
                    <button
                      onClick={() => { if (mockTransactionTexto.trim()) { responderTransacaoSimulada(mockTransactionTexto); setMockTransactionTexto(""); } }}
                      className="text-xs font-semibold px-3 rounded-sm"
                      style={{ background: "var(--gold)", color: "var(--ink)" }}
                    >
                      Enviar
                    </button>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--paper-dim)" }}>
                    Fala ou digita de que se trata — assim que você responde, já lança sozinho, sem precisar confirmar de novo.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
        )}

        {vidaSection === "receitas" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>
            <TrendingUp size={13} /> Receitas — de onde vem seu dinheiro
          </div>

          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Digite ou fale seus valores</label>
            <button
              onClick={startVoiceCaptureRenda}
              className="text-xs font-semibold px-3 py-1.5 rounded-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: isListeningRenda ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningRenda ? "var(--paper)" : "var(--gold)" }}
            >
              {isListeningRenda ? <MicOff size={13} /> : <Mic size={13} />}
              {isListeningRenda ? "Ouvindo..." : "Falar por áudio"}
            </button>
          </div>

          {!voiceSupported && (
            <p className="text-[10px] mb-2" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado neste navegador — use os campos abaixo.</p>
          )}

          {ultimaRendaCapturada && (
            <div className="mb-3 p-2.5 rounded-sm text-xs" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
              {ultimaRendaCapturada.valor != null ? (
                <span style={{ color: "var(--paper)" }}>
                  Entendi: <strong style={{ color: "var(--gold)" }}>R$ {ultimaRendaCapturada.valor.toLocaleString("pt-BR")}</strong> como renda{" "}
                  {ultimaRendaCapturada.tipo === "fixa" ? "fixa" : ultimaRendaCapturada.tipo === "variavel" ? "variável" : "extra"}. Já preenchi o campo dessa categoria abaixo — confira e clique no <strong style={{ color: "var(--gold)" }}>+</strong> pra confirmar a inclusão.
                </span>
              ) : (
                <span style={{ color: "var(--paper-dim)" }}>Não consegui identificar um valor em "{ultimaRendaCapturada.transcript}" — tenta falar algo como "renda fixa 3500 reais".</span>
              )}
            </div>
          )}

          <p className="text-[10px] mb-3" style={{ color: "var(--paper-dim)" }}>
            Exemplos pra falar: "renda fixa 3500 reais", "renda variável 700", "renda extra 300". Depois de falar, confira o campo preenchido e clique no <strong style={{ color: "var(--gold)" }}>+</strong> do grupo certo pra confirmar.
          </p>

          {[
            { titulo: "Renda fixa (salário)", itens: rendaFixaItens, setItens: setRendaFixaItens, novo: novaRendaFixa, setNovo: setNovaRendaFixa, total: rendaFixa },
            { titulo: "Renda variável (comissão, bônus)", itens: rendaVariavelItens, setItens: setRendaVariavelItens, novo: novaRendaVariavel, setNovo: setNovaRendaVariavel, total: rendaVariavel },
            { titulo: "Renda extra (freela, bico)", itens: rendaExtraItens, setItens: setRendaExtraItens, novo: novaRendaExtra, setNovo: setNovaRendaExtra, total: rendaExtra },
          ].map((grupo) => (
            <div key={grupo.titulo} className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>{grupo.titulo}</label>
                <span className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {grupo.total.toLocaleString("pt-BR")}</span>
              </div>

              <div className="space-y-1.5 mb-2">
                {grupo.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                    <span style={{ color: "var(--paper)" }}>{item.nome}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {item.valor.toLocaleString("pt-BR")}</span>
                      <button onClick={() => grupo.setItens((prev) => prev.filter((x) => x.id !== item.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                    </div>
                  </div>
                ))}
                {grupo.itens.length === 0 && (
                  <p className="text-[10px] italic" style={{ color: "var(--paper-dim)" }}>Nenhuma fonte cadastrada ainda.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text" placeholder="Descrição (ex: bico de fim de semana)" value={grupo.novo.nome}
                  onChange={(e) => grupo.setNovo((f) => ({ ...f, nome: e.target.value }))}
                  className="flex-1 text-xs px-2 py-1.5 rounded-sm"
                  style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
                />
                <div className="flex items-center gap-1 w-28 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
                  <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                  <input
                    type="number" min="0" value={grupo.novo.valor}
                    onChange={(e) => grupo.setNovo((f) => ({ ...f, valor: e.target.value }))}
                    className="w-full text-xs bg-transparent outline-none"
                    style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!grupo.novo.nome || !grupo.novo.valor) return;
                    grupo.setItens((prev) => [...prev, { id: Date.now(), nome: grupo.novo.nome, valor: Number(grupo.novo.valor) }]);
                    grupo.setNovo({ nome: "", valor: "" });
                  }}
                  className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            <span className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Renda total:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {rendaMensal.toLocaleString("pt-BR")}</span>
          </div>
        </div>
        )}

        {vidaSection === "poupanca" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>
            <Landmark size={13} /> Poupança
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--paper-dim)" }}>
            Ainda é a aplicação mais usada por boa parte das pessoas — mesmo rendendo menos que Tesouro Selic ou CDB. Registre aqui quanto você tem guardado.
          </p>
          <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Saldo na poupança</label>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-bold" style={{ color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}>R$</span>
            <input
              type="number" min="0" value={saldoPoupanca}
              onChange={(e) => setSaldoPoupanca(Math.max(0, Number(e.target.value)))}
              className="w-40 text-2xl font-bold px-2 py-1.5 rounded-sm bg-transparent outline-none"
              style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'Roboto Slab', serif" }}
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--paper-dim)" }}>
            <Link2 size={12} />
            Preenchido manualmente por enquanto — quando você conectar sua conta poupança (Open Finance), esse valor passa a atualizar sozinho, do mesmo jeito que a conta corrente.
          </div>
        </div>
        )}

        {vidaSection === "rumo" && (
        <div
          className="rounded-sm p-4 md:p-5 mb-5"
          style={{ background: "linear-gradient(135deg, rgba(190,154,92,0.16), rgba(190,154,92,0.04))", border: "1px solid var(--gold)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Mic size={18} color="var(--gold)" />
            <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Minha Consultora Maat</span>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--paper-dim)" }}>
            Pergunte por voz sobre sua vida financeira — ex: "hoje vou sair com amigos, quanto posso gastar sem comprometer meu orçamento?"
          </p>

          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Você prefere a resposta por voz ou por escrito?</label>
            <div className="flex gap-2">
              {[{ key: "voz", label: "Por voz" }, { key: "texto", label: "Só por escrito" }].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setConsultorModoResposta(opt.key)}
                  className="px-3 py-1.5 text-xs rounded-sm"
                  style={{
                    background: consultorModoResposta === opt.key ? "var(--gold)" : "transparent",
                    color: consultorModoResposta === opt.key ? "var(--ink)" : "var(--paper-dim)",
                    border: `1px solid ${consultorModoResposta === opt.key ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startVoiceCaptureConsultor}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm w-full justify-center transition-colors"
            style={{ background: isListeningConsultor ? "var(--rust)" : "var(--gold)", color: isListeningConsultor ? "var(--paper)" : "var(--ink)" }}
          >
            {isListeningConsultor ? <MicOff size={16} /> : <Mic size={16} />}
            {isListeningConsultor ? "Ouvindo... fale sua pergunta" : "Falar com a Maat Assistente"}
          </button>

          {!voiceSupported && (
            <p className="text-[10px] mt-2" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado nesse navegador.</p>
          )}

          {consultorQuestion && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(190,154,92,0.3)" }}>
              <p className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                Você perguntou: <span style={{ color: "var(--paper)" }}>"{consultorQuestion}"</span>
              </p>
              <div className="flex items-start gap-2 p-3 rounded-sm" style={{ background: "var(--panel)" }}>
                <Volume2 size={14} color="var(--gold)" className="shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed" style={{ color: "var(--paper)" }}>{consultorResponse}</p>
              </div>
            </div>
          )}

          <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            A Maat Assistente responde com base nos dados que você já cadastrou aqui no app — hoje ela reconhece perguntas sobre orçamento do dia a dia, dívidas, reserva de emergência e saldo. A intenção da Maat Assistente é te orientar no seu dia a dia, pra evitar gastos impulsivos e desnecessários. Se a resposta em áudio não tocar automaticamente, seu navegador pode não suportar leitura de voz.
          </p>
        </div>
        )}

        {vidaSection === "despesas" && (
        <>
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>Despesas — fixas, variáveis e extras</div>

          <div className="mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--gold)" }}>Planejamento do mês</span>
              <button onClick={abrirPlanejamentoManual} className="text-[10px]" style={{ color: "var(--paper-dim)", textDecoration: "underline" }}>Editar planejamento</button>
            </div>
            <p className="text-[10px] mb-2" style={{ color: "var(--paper-dim)" }}>Valor planejado vs. valores usados</p>

            <p className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>
              💡 Referência de especialistas em finanças pessoais: regra 50/30/20, pra você ter uma vida financeira saudável
            </p>
            <p className="text-[10px] leading-relaxed mb-3 pb-2" style={{ color: "var(--paper-dim)", borderBottom: "1px solid rgba(237,230,214,0.15)" }}>
              Até <strong style={{ color: "var(--gold)" }}>50%</strong> da renda em Custos Fixos, até <strong style={{ color: "var(--gold)" }}>30%</strong> em Custo Variável, e os <strong style={{ color: "var(--gold)" }}>20%</strong> restantes pra reserva e investimentos. Custo Extra não entra nessa conta — ele é imprevisível por natureza, e é justamente pra isso que existe a sua reserva de emergência.
            </p>

            <div className="flex items-center justify-between text-xs mb-2 pb-2" style={{ borderBottom: "1px solid rgba(237,230,214,0.15)" }}>
              <span style={{ color: "var(--paper-dim)" }}>Renda</span>
              <span style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {rendaMensal.toLocaleString("pt-BR")}</span>
            </div>

            {[
              { label: "Custos Fixos", gasto: totalCustosFixos, meta: metaFixas },
              { label: "Custo Variável", gasto: totalCustosVariaveis, meta: metaVariavel },
              { label: "Custo Extra", gasto: totalCustosExtras, meta: metaExtra },
            ].map((c) => {
              const temMeta = c.meta !== null && c.meta > 0;
              const pct = temMeta ? Math.min(100, (c.gasto / c.meta) * 100) : 0;
              const estourou = temMeta && c.gasto > c.meta;
              const perto = temMeta && !estourou && pct >= 80;
              const cor = estourou ? "var(--rust)" : perto ? "#D99A3C" : "var(--gold)";
              return (
                <div key={c.label} className="mb-2.5 last:mb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "var(--paper)" }}>{c.label}</span>
                    <span style={{ color: temMeta ? cor : "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}>Real: R$ {c.gasto.toLocaleString("pt-BR")}</span>
                  </div>
                  {temMeta ? (
                    <>
                      <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(237,230,214,0.12)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: cor, transition: "width 0.3s" }} />
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--paper-dim)" }}>Planejado: R$ {c.meta.toLocaleString("pt-BR")}</div>
                      {estourou && (
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--rust)" }}>Cuidado: você já passou do planejado em {c.label.toLowerCase()} esse mês.</p>
                      )}
                      {perto && (
                        <p className="text-[10px] mt-0.5" style={{ color: "#D99A3C" }}>Atenção: você já usou {pct.toFixed(0)}% do planejado — seu mês pode estourar.</p>
                      )}
                    </>
                  ) : (
                    <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>Planejado: não definido</div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between text-xs mt-2 pt-2" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
              <span style={{ color: "var(--paper-dim)" }}>Sobra Mensal</span>
              <span style={{ color: sobraMensal >= 0 ? "var(--gold)" : "var(--rust)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {sobraMensal.toLocaleString("pt-BR")}</span>
            </div>

            {gastosPorCategoria.length > 0 && (
              <button
                onClick={() => setShowRelatorioMensal(true)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-sm mt-3 flex items-center justify-center gap-1.5"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                <FileText size={13} /> Ver relatório do mês com dicas pra melhorar
              </button>
            )}
          </div>

          <div className="flex rounded-sm overflow-hidden mb-4" style={{ border: "1px solid var(--gold)" }}>
            {[
              { key: "fixo", label: "Custo Fixo" },
              { key: "variavel", label: "Custo Variável" },
              { key: "extra", label: "Custo Extra" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setDespesaTab(t.key)}
                className="flex-1 text-xs font-semibold py-2"
                style={{
                  background: despesaTab === t.key ? "var(--gold)" : "transparent",
                  color: despesaTab === t.key ? "var(--ink)" : "var(--gold)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {despesaTab === "fixo" && (
          <>
          <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Custos fixos do mês</label>

          {custosFixos.some((c) => !c.pago && statusVencimento(c.diaVencimento)?.urgente) && (
            <div className="flex items-start gap-2 mb-2 p-2.5 rounded-sm" style={{ background: "rgba(177,74,52,0.1)", border: "1px solid rgba(177,74,52,0.35)" }}>
              <AlertCircle size={14} color="var(--rust)" className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
                Você tem conta{custosFixos.filter((c) => !c.pago && statusVencimento(c.diaVencimento)?.urgente).length > 1 ? "s" : ""} em atraso ou vencendo nos próximos dias — confira abaixo.
              </p>
            </div>
          )}

          <div className="space-y-1.5 mb-2">
            {custosFixos.map((c) => {
              const status = statusVencimento(c.diaVencimento);
              const urgente = !c.pago && status?.urgente;
              return (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs px-3 py-2 rounded-sm" style={{ border: `1px solid ${urgente ? "rgba(177,74,52,0.35)" : "rgba(237,230,214,0.12)"}`, opacity: c.pago ? 0.6 : 1 }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ color: "var(--paper)", textDecoration: c.pago ? "line-through" : "none" }}>{c.nome}</span>
                    {c.pago ? (
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] shrink-0" style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>Pago</span>
                    ) : status && (
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] shrink-0" style={{ border: `1px solid ${status.color}`, color: status.color }}>
                        {status.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingCustoId === c.id ? (
                      <>
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-sm" style={{ background: "var(--ink)", border: "1px solid var(--gold)" }}>
                          <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                          <input
                            type="number" min="0" autoFocus value={editingCustoValor}
                            onChange={(e) => setEditingCustoValor(e.target.value)}
                            className="w-16 text-xs bg-transparent outline-none"
                            style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            setCustosFixos((prev) => prev.map((x) => (x.id === c.id ? { ...x, valor: Number(editingCustoValor) || x.valor } : x)));
                            setEditingCustoId(null);
                          }}
                        >
                          <Check size={14} color="var(--gold)" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {c.valor.toLocaleString("pt-BR")}</span>
                        <button onClick={() => { setEditingCustoId(c.id); setEditingCustoValor(String(c.valor)); }} title="Editar valor">
                          <Pencil size={11} color="var(--paper-dim)" />
                        </button>
                      </>
                    )}
                    {/* Toggle de pago/em aberto */}
                    <button
                      onClick={() => setCustosFixos((prev) => prev.map((x) => (x.id === c.id ? { ...x, pago: !x.pago } : x)))}
                      className="relative shrink-0"
                      style={{ width: 34, height: 18, borderRadius: 999, background: c.pago ? "var(--gold)" : "rgba(237,230,214,0.2)", transition: "background 0.15s" }}
                      title={c.pago ? "Marcar como não pago" : "Marcar como pago"}
                    >
                      <span
                        style={{
                          position: "absolute", top: 2, left: c.pago ? 18 : 2,
                          width: 14, height: 14, borderRadius: "50%", background: c.pago ? "var(--ink)" : "var(--paper-dim)",
                          transition: "left 0.15s",
                        }}
                      />
                    </button>
                    <button onClick={() => setCustosFixos((prev) => prev.filter((x) => x.id !== c.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text" placeholder="Nome do custo" value={novoCustoFixo.nome}
              onChange={(e) => setNovoCustoFixo((f) => ({ ...f, nome: e.target.value }))}
              className="flex-1 text-xs px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
            <div className="flex items-center gap-1 w-24 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" value={novoCustoFixo.valor}
                onChange={(e) => setNovoCustoFixo((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <input
              type="number" min="1" max="31" placeholder="Dia venc." value={novoCustoFixo.diaVencimento}
              onChange={(e) => setNovoCustoFixo((f) => ({ ...f, diaVencimento: e.target.value }))}
              className="w-24 text-xs px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
            />
            <button
              onClick={() => {
                if (!novoCustoFixo.nome || !novoCustoFixo.valor) return;
                setCustosFixos((prev) => [...prev, { id: Date.now(), nome: novoCustoFixo.nome, valor: Number(novoCustoFixo.valor), diaVencimento: novoCustoFixo.diaVencimento ? Number(novoCustoFixo.diaVencimento) : null, pago: false }]);
                setNovoCustoFixo({ nome: "", valor: "", diaVencimento: "" });
              }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              +
            </button>
            <button
              onClick={startVoiceCaptureCustoFixo}
              className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: isListeningCustoFixo ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningCustoFixo ? "var(--paper)" : "var(--gold)" }}
              title="Adicionar custo fixo por áudio"
            >
              {isListeningCustoFixo ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: "var(--paper-dim)" }}>
            Por áudio, fale algo como "aluguel 600 reais, vence dia 5" — a gente já tenta preencher nome, valor e dia sozinho. Depois de falar, confira os campos e clique no <strong style={{ color: "var(--gold)" }}>+</strong> pra confirmar a inclusão.
          </p>
          </>
          )}

          {despesaTab === "variavel" && (
          <>
          <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Custos variáveis do mês</label>

          <div className="space-y-1.5 mb-2">
            {gastosVariaveis.filter((g) => g.tipo === "variavel").map((g) => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                <span style={{ color: "var(--paper)" }}>{g.nome}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {editingGastoId === g.id ? (
                    <>
                      <div className="flex items-center gap-1 px-1.5 py-1 rounded-sm" style={{ background: "var(--ink)", border: "1px solid var(--gold)" }}>
                        <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                        <input
                          type="number" min="0" autoFocus value={editingGastoValor}
                          onChange={(e) => setEditingGastoValor(e.target.value)}
                          className="w-16 text-xs bg-transparent outline-none"
                          style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setGastosVariaveis((prev) => prev.map((x) => (x.id === g.id ? { ...x, valor: Number(editingGastoValor) || x.valor } : x)));
                          setEditingGastoId(null);
                        }}
                      >
                        <Check size={14} color="var(--gold)" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {g.valor.toLocaleString("pt-BR")}</span>
                      <button onClick={() => { setEditingGastoId(g.id); setEditingGastoValor(String(g.valor)); }} title="Editar valor">
                        <Pencil size={11} color="var(--paper-dim)" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setGastosVariaveis((prev) => prev.filter((x) => x.id !== g.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                </div>
              </div>
            ))}
            {gastosVariaveis.filter((g) => g.tipo === "variavel").length === 0 && (
              <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>Nenhum custo variável registrado ainda.</p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <input
              type="text" placeholder="ex: mercado, uber, ifood..." value={novoGasto.nome}
              onChange={(e) => setNovoGasto((f) => ({ ...f, nome: e.target.value }))}
              className="flex-1 min-w-[120px] text-xs px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
            <div className="flex items-center gap-1 w-24 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" value={novoGasto.valor}
                onChange={(e) => setNovoGasto((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <button
              onClick={() => {
                if (!novoGasto.nome || !novoGasto.valor) return;
                setGastosVariaveis((prev) => [{ id: Date.now(), nome: novoGasto.nome, valor: Number(novoGasto.valor), tipo: "variavel" }, ...prev]);
                setNovoGasto({ nome: "", valor: "", tipo: "variavel" });
              }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              +
            </button>
            <button
              onClick={startVoiceCapture}
              className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: isListening ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListening ? "var(--paper)" : "var(--gold)" }}
              title="Adicionar despesa por áudio"
            >
              {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
          </div>

          {!voiceSupported && (
            <p className="text-[10px] mt-1.5" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado neste navegador — use o campo de texto.</p>
          )}

          {voicePreview && voicePreview.tipo !== "extra" && (
            <p className="mt-2 text-[10px] leading-relaxed" style={{ color: "var(--paper)" }}>
              Entendi{voicePreview.valor ? "" : " parcialmente"}: já preenchi o nome e o valor{voicePreview.valor ? "" : " (não identifiquei, confira)"} acima. Confira e clique no <strong style={{ color: "var(--gold)" }}>+</strong> pra confirmar.
            </p>
          )}

          <p className="text-[10px] mt-1.5" style={{ color: "var(--paper-dim)" }}>
            Exemplo pra falar: "mercado 50 reais". Voz e registro manual funcionam nesta versão — detectar gastos automaticamente direto do seu banco/cartão é possível numa versão conectada via Open Finance.
          </p>
          </>
          )}

          {despesaTab === "extra" && (
          <>
          <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Custos extras do mês</label>

          <div className="space-y-1.5 mb-2">
            {gastosVariaveis.filter((g) => g.tipo === "extra").map((g) => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                <span style={{ color: "var(--paper)" }}>{g.nome}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {editingGastoId === g.id ? (
                    <>
                      <div className="flex items-center gap-1 px-1.5 py-1 rounded-sm" style={{ background: "var(--ink)", border: "1px solid var(--gold)" }}>
                        <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                        <input
                          type="number" min="0" autoFocus value={editingGastoValor}
                          onChange={(e) => setEditingGastoValor(e.target.value)}
                          className="w-16 text-xs bg-transparent outline-none"
                          style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setGastosVariaveis((prev) => prev.map((x) => (x.id === g.id ? { ...x, valor: Number(editingGastoValor) || x.valor } : x)));
                          setEditingGastoId(null);
                        }}
                      >
                        <Check size={14} color="var(--gold)" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {g.valor.toLocaleString("pt-BR")}</span>
                      <button onClick={() => { setEditingGastoId(g.id); setEditingGastoValor(String(g.valor)); }} title="Editar valor">
                        <Pencil size={11} color="var(--paper-dim)" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setGastosVariaveis((prev) => prev.filter((x) => x.id !== g.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                </div>
              </div>
            ))}
            {gastosVariaveis.filter((g) => g.tipo === "extra").length === 0 && (
              <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>Nenhum custo extra registrado ainda.</p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <input
              type="text" placeholder="ex: conserto, presente, remédio..." value={novoGasto.nome}
              onChange={(e) => setNovoGasto((f) => ({ ...f, nome: e.target.value }))}
              className="flex-1 min-w-[120px] text-xs px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
            <div className="flex items-center gap-1 w-24 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" value={novoGasto.valor}
                onChange={(e) => setNovoGasto((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <button
              onClick={() => {
                if (!novoGasto.nome || !novoGasto.valor) return;
                setGastosVariaveis((prev) => [{ id: Date.now(), nome: novoGasto.nome, valor: Number(novoGasto.valor), tipo: "extra" }, ...prev]);
                setNovoGasto({ nome: "", valor: "", tipo: "variavel" });
              }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              +
            </button>
            <button
              onClick={startVoiceCapture}
              className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1.5 whitespace-nowrap"
              style={{ background: isListening ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListening ? "var(--paper)" : "var(--gold)" }}
              title="Adicionar despesa por áudio"
            >
              {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
          </div>

          {!voiceSupported && (
            <p className="text-[10px] mt-1.5" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado neste navegador — use o campo de texto.</p>
          )}

          {voicePreview && voicePreview.tipo === "extra" && (
            <p className="mt-2 text-[10px] leading-relaxed" style={{ color: "var(--paper)" }}>
              Entendi{voicePreview.valor ? "" : " parcialmente"}: já preenchi o nome e o valor{voicePreview.valor ? "" : " (não identifiquei, confira)"} acima. Confira e clique no <strong style={{ color: "var(--gold)" }}>+</strong> pra confirmar.
            </p>
          )}

          <p className="text-[10px] mt-1.5" style={{ color: "var(--paper-dim)" }}>
            Exemplo pra falar: "conserto do carro 150 reais". Voz e registro manual funcionam nesta versão — detectar gastos automaticamente direto do seu banco/cartão é possível numa versão conectada via Open Finance.
          </p>
          </>
          )}

          {sobraMensal < 0 && (
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--rust)" }}>
              Seus custos fixos já superam sua renda. Antes de qualquer outra decisão, o foco precisa ser rever esses custos ou buscar uma renda extra — investir agora não é prioridade.
            </p>
          )}
        </div>
        </>
        )}

        {vidaSection === "prosperidade" && (
          <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--gold)" }}>
              <Compass size={14} /> Seu Guia da Prosperidade
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--paper)" }}>
              {deficitAtivo
                ? `Seu orçamento está R$ ${Math.abs(sobraMensal).toLocaleString("pt-BR")} negativo esse mês. Uma renda extra é o caminho mais rápido pra fechar essa conta — separei opções calibradas pro seu perfil ${profile.label.toLowerCase()}.`
                : orcamentoApertado
                ? `Sua sobra mensal está bem apertada (R$ ${sobraMensal.toLocaleString("pt-BR")}). Um pouco de renda extra cria folga real e te tira da beira do vermelho. Aqui vão ideias pro seu perfil ${profile.label.toLowerCase()}:`
                : `Suas finanças estão em bom equilíbrio agora. Mesmo assim, aqui vão ideias de renda extra caso você queira acelerar objetivos ou criar mais folga — calibradas pro seu perfil ${profile.label.toLowerCase()}:`}
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
            <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
              Sugestões ilustrativas e calibradas pelo perfil de comportamento, não pela sua profissão ou habilidades específicas — numa versão conectada, isso poderia cruzar também com o que você já sabe fazer.
            </p>

            {/* Habilidades da pessoa — sugestões mais específicas */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(190,154,92,0.25)" }}>
              <button
                onClick={() => setShowSkillsInput((v) => !v)}
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: "var(--gold)" }}
              >
                <Brain size={13} />
                Diga pra mim: quais habilidades você possui?
                <ArrowRight size={11} style={{ transform: showSkillsInput ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
              </button>

              {showSkillsInput && (
                <div className="mt-3">
                  <p className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                    Liste ou fale as habilidades que você tem — ex: "cozinhar, design, inglês, dirigir".
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="ex: design, inglês, cozinhar..."
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 rounded-sm"
                      style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
                    />
                    <button
                      onClick={startVoiceCaptureSkills}
                      className="text-xs font-semibold px-3 rounded-sm flex items-center gap-1"
                      style={{ background: isListeningSkills ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningSkills ? "var(--paper)" : "var(--gold)" }}
                    >
                      {isListeningSkills ? <MicOff size={13} /> : <Mic size={13} />}
                    </button>
                  </div>

                  {!voiceSupported && (
                    <p className="text-[10px] mb-2" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado neste navegador — use o campo de texto.</p>
                  )}

                  {skillsInput.trim() && (
                    matchedSkillIdeas.length > 0 ? (
                      <>
                        <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>
                          Baseado no que você disse, isso combina com você:
                        </p>
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
                      </>
                    ) : (
                      <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>
                        Não identifiquei uma habilidade específica nesse texto ainda — tenta usar palavras-chave diretas, tipo "design", "inglês", "cozinhar", "vendas".
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {vidaSection === "orcamento" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>Orçamento diário disponível</div>

          <div className="rounded-sm p-4 text-center" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="text-xs uppercase" style={{ color: "var(--paper-dim)" }}>Você pode gastar hoje até</div>
            <div className="text-3xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>
              R$ {orcamentoDiario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--paper-dim)" }}>
              considerando {diasRestantes} dias restantes no mês e R$ {saldoDisponivelMes.toLocaleString("pt-BR")} de saldo disponível
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Esse número já desconta tudo que você registrou na aba "Despesas". Registre seus gastos por lá pra manter esse valor sempre atualizado.
          </p>
        </div>
        )}


        {vidaSection === "dividas" && (
        <div className="rounded-sm p-4 md:p-5 mb-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>
            <CreditCard size={13} /> Quitação de dívidas
          </div>

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
            <input type="text" placeholder="Nome (ex: cartão)" value={novaDivida.nome} onChange={(e) => setNovaDivida((f) => ({ ...f, nome: e.target.value }))}
              className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }} />
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input type="number" placeholder="Valor total" value={novaDivida.valor} onChange={(e) => setNovaDivida((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
            <input type="number" placeholder="Juros % a.m." value={novaDivida.jurosMensal} onChange={(e) => setNovaDivida((f) => ({ ...f, jurosMensal: e.target.value }))}
              className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input type="number" placeholder="Parcela mínima" value={novaDivida.parcelaMinima} onChange={(e) => setNovaDivida((f) => ({ ...f, parcelaMinima: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>
          <button
            onClick={() => {
              if (!novaDivida.nome || !novaDivida.valor) return;
              setDividas((prev) => [...prev, {
                id: Date.now(), nome: novaDivida.nome, valor: Number(novaDivida.valor),
                jurosMensal: Number(novaDivida.jurosMensal) || 0, parcelaMinima: Number(novaDivida.parcelaMinima) || 0,
              }]);
              setNovaDivida({ nome: "", valor: "", jurosMensal: "", parcelaMinima: "" });
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            Adicionar dívida
          </button>

          {dividas.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--paper)" }}>
                Estratégia avalanche: priorizando sempre a dívida de maior juro, com R$ {extraParaDividas.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} extra por mês além das parcelas mínimas,
                {" "}sua projeção é ficar livre de dívidas em <strong style={{ color: "var(--gold)" }}>{debtPayoff.meses} meses</strong>, pagando cerca de R$ {debtPayoff.totalJurosPago.toLocaleString("pt-BR")} em juros no caminho.
              </p>
              {temDividaCara && (
                <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--rust)" }}>
                  Você tem dívida com juro acima de 5% ao mês — isso supera qualquer retorno razoável de investimento. Priorize quitar essa dívida antes de aportar pesado em investimentos ou até na reserva.
                </p>
              )}
            </div>
          )}
        </div>
        )}

        {vidaSection === "reserva" && (
        <div className="rounded-sm p-4 md:p-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--gold)" }}>
            <Umbrella size={13} /> Fundo de emergência guiado
          </div>

          {/* Compromisso mensal — "pague-se primeiro" */}
          {reservaMensalValor !== null ? (
            (() => {
              const statusCompromisso = statusVencimento(reservaMensalDia);
              return (
                <div className="mt-3 mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "var(--paper)" }}>Reserva de emergência</span>
                      {statusCompromisso && !reservaMensalPaga && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-sm text-[10px]" style={{ border: `1px solid ${statusCompromisso.color}`, color: statusCompromisso.color }}>
                          Vencimento dia {reservaMensalDia} · {statusCompromisso.label}
                        </span>
                      )}
                      {reservaMensalPaga && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-sm text-[10px]" style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>Depositado</span>
                      )}
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {reservaMensalValor.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={abrirCompromissoManual} className="text-[10px]" style={{ color: "var(--paper-dim)", textDecoration: "underline" }}>
                      Editar valor/dia
                    </button>
                    <button
                      onClick={() => setReservaMensalPaga((v) => !v)}
                      className="relative shrink-0"
                      style={{ width: 34, height: 18, borderRadius: 999, background: reservaMensalPaga ? "var(--gold)" : "rgba(237,230,214,0.2)" }}
                      title={reservaMensalPaga ? "Marcar como não depositado" : "Marcar como depositado"}
                    >
                      <span style={{ position: "absolute", top: 2, left: reservaMensalPaga ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: reservaMensalPaga ? "var(--ink)" : "var(--paper-dim)" }} />
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <button onClick={abrirCompromissoManual} className="text-xs font-semibold mt-3 mb-4 px-3 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
              Definir meu compromisso deste mês
            </button>
          )}

          <p className="text-xs leading-relaxed mb-4 italic" style={{ color: "var(--paper-dim)" }}>
            Reservar todos os meses uma quantia, nem que seja pouca, é fundamental pro seu crescimento financeiro.
          </p>

          <button
            onClick={() => setShowReservaDuvida((v) => !v)}
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: "var(--paper-dim)" }}
          >
            <HelpCircle size={12} />
            (Posso investir esse valor?)
            <ArrowRight size={10} style={{ transform: showReservaDuvida ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {showReservaDuvida && (
            <p className="text-xs leading-relaxed mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)", color: "var(--paper)" }}>
              Sim — e o ideal é não deixar parado rendendo zero. Só que a reserva de emergência precisa de duas coisas ao mesmo tempo: <strong>liquidez imediata</strong> (poder sacar a qualquer momento, sem carência) e <strong>nenhum risco de perder valor</strong>. Isso deixa de fora ações, FIIs, cripto e até Tesouro Prefixado/IPCA+ (podem perder valor se vendidos antes do prazo). O que combina é <strong style={{ color: "var(--gold)" }}>CDB com liquidez diária</strong> ou <strong style={{ color: "var(--gold)" }}>Tesouro Selic</strong> — na aba Renda Fixa, são os marcados como "Diária".
            </p>
          )}

          <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Quanto você já tem guardado</label>
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
            <input
              type="number" min="0" value={reservaAtual}
              onChange={(e) => setReservaAtual(Math.max(0, Number(e.target.value)))}
              className="w-40 text-sm px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: "var(--paper-dim)" }}>Meta: {multiplicadorReserva}x seus custos fixos (perfil {profile.label.toLowerCase()})</span>
            <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$ {metaReserva.toLocaleString("pt-BR")}</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: "rgba(237,230,214,0.1)" }}>
            <div className="h-2 rounded-full" style={{ width: `${progressoReserva}%`, background: "var(--gold)" }} />
          </div>
          <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{progressoReserva.toFixed(0)}% da meta atingida</div>

          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--paper)" }}>
            Aporte mensal sugerido: <strong style={{ color: "var(--gold)" }}>R$ {aporteSugeridoReserva.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
            {temDividaCara ? " — reduzido porque agora o foco é quitar a dívida cara primeiro." : " — com a dívida sob controle, dá pra acelerar essa reserva."}
          </p>
        </div>
        )}

        {vidaSection === "fundo" && (
        <div className="rounded-sm p-4 md:p-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--gold)" }}>
            <PiggyBank size={13} /> Meu Fundo de Investimento
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--paper-dim)" }}>
            Registre o que você já tem investido — o ativo e o valor aplicado em cada um.
          </p>

          <div className="flex items-center justify-between mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <span className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Total de valores investidos</span>
            <span className="text-lg font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>R$ {totalInvestido.toLocaleString("pt-BR")}</span>
          </div>

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
            <input
              type="text" placeholder="Ativo (ex: CDB Itaú, Tesouro Selic, PETR4...)" value={novoInvestimento.ativo}
              onChange={(e) => setNovoInvestimento((f) => ({ ...f, ativo: e.target.value }))}
              className="flex-1 text-xs px-2 py-1.5 rounded-sm"
              style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
            <div className="flex items-center gap-1 w-32 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" value={novoInvestimento.valor}
                onChange={(e) => setNovoInvestimento((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none"
                style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <button
              onClick={() => {
                if (!novoInvestimento.ativo || !novoInvestimento.valor) return;
                setInvestimentos((prev) => [...prev, { id: Date.now(), ativo: novoInvestimento.ativo, valor: Number(novoInvestimento.valor) }]);
                setNovoInvestimento({ ativo: "", valor: "" });
              }}
              className="text-xs font-semibold px-3 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              +
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Registro livre nesta versão — ainda não conectado às abas de investimento do app. Numa versão conectada, isso puxaria automaticamente da carteira real da pessoa.
          </p>
        </div>
        )}

        {vidaSection === "objetivos" && (
        <div className="rounded-sm p-4 md:p-5" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--gold)" }}>
            <Target size={13} /> Meus Objetivos
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--paper-dim)" }}>
            Quer comprar um carro? Dar entrada numa casa? Fazer aquela viagem? Coloque aqui — com valor e prazo — e a gente calcula quanto guardar por mês pra chegar lá.
          </p>

          <div className="space-y-3 mb-4">
            {objetivos.map((o) => {
              const progresso = o.valorAlvo > 0 ? Math.min(100, (o.valorAtual / o.valorAlvo) * 100) : 0;
              const faltam = Math.max(0, o.valorAlvo - o.valorAtual);
              const aporteSugerido = o.prazoMeses > 0 ? faltam / o.prazoMeses : null;
              const atingido = o.valorAtual >= o.valorAlvo;
              return (
                <div key={o.id} className="p-3 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: "var(--paper)" }}>{o.nome}</span>
                    <button onClick={() => setObjetivos((prev) => prev.filter((x) => x.id !== o.id))}><Trash2 size={12} color="var(--paper-dim)" /></button>
                  </div>

                  <div className="w-full h-2 rounded-full mb-1.5" style={{ background: "rgba(237,230,214,0.12)" }}>
                    <div className="h-2 rounded-full" style={{ width: `${progresso}%`, background: atingido ? "var(--gold)" : "var(--gold)", transition: "width 0.3s" }} />
                  </div>

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "var(--paper-dim)" }}>
                      {editingObjetivoId === o.id ? (
                        <span className="flex items-center gap-1">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                          <input
                            type="number" min="0" autoFocus value={editingObjetivoValor}
                            onChange={(e) => setEditingObjetivoValor(e.target.value)}
                            className="w-20 px-1 py-0.5 rounded-sm"
                            style={{ background: "var(--ink)", border: "1px solid var(--gold)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                          />
                          <button onClick={() => {
                            setObjetivos((prev) => prev.map((x) => (x.id === o.id ? { ...x, valorAtual: Number(editingObjetivoValor) || 0 } : x)));
                            setEditingObjetivoId(null);
                          }}>
                            <Check size={13} color="var(--gold)" />
                          </button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          R$ {o.valorAtual.toLocaleString("pt-BR")} de R$ {o.valorAlvo.toLocaleString("pt-BR")}
                          <button onClick={() => { setEditingObjetivoId(o.id); setEditingObjetivoValor(String(o.valorAtual)); }} title="Atualizar quanto já guardou">
                            <Pencil size={10} color="var(--paper-dim)" />
                          </button>
                        </span>
                      )}
                    </span>
                    <span style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{progresso.toFixed(0)}%</span>
                  </div>

                  <p className="text-[11px]" style={{ color: "var(--paper-dim)" }}>
                    {atingido
                      ? "🎉 Objetivo alcançado!"
                      : aporteSugerido !== null
                      ? `Faltam R$ ${faltam.toLocaleString("pt-BR")}, em ${o.prazoMeses} ${o.prazoMeses === 1 ? "mês" : "meses"}.`
                      : `Faltam R$ ${faltam.toLocaleString("pt-BR")}. Defina um prazo pra ver quanto guardar por mês.`}
                  </p>
                  {o.ondeGuardar && (
                    <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "var(--paper-dim)" }}>
                      <Landmark size={11} /> Guardando em: {o.ondeGuardar}
                    </p>
                  )}

                  {!atingido && aporteSugerido !== null && (
                    <div className="mt-2 p-2.5 rounded-sm flex items-center justify-between gap-2 flex-wrap" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Guarde todo mês</div>
                        <div className="text-lg font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>
                          R$ {aporteSugerido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      {!custosFixos.some((c) => c.objetivoId === o.id) ? (
                        <button
                          onClick={() => setCustosFixos((prev) => [...prev, { id: Date.now(), nome: `Objetivo: ${o.nome}`, valor: Math.round(aporteSugerido), diaVencimento: null, pago: false, objetivoId: o.id }])}
                          className="text-[11px] font-semibold px-2.5 py-1.5 rounded-sm"
                          style={{ background: "var(--gold)", color: "var(--ink)" }}
                        >
                          Adicionar em Despesas Fixas
                        </button>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-sm" style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>✓ Já está nas Despesas Fixas</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {objetivos.length === 0 && (
              <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>Nenhum objetivo cadastrado ainda.</p>
            )}
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>Novo objetivo</label>
            <button
              onClick={startVoiceCaptureObjetivo}
              className="text-xs font-semibold px-2.5 py-1 rounded-sm flex items-center gap-1.5"
              style={{ background: isListeningObjetivo ? "var(--rust)" : "transparent", border: "1px solid rgba(190,154,92,0.4)", color: isListeningObjetivo ? "var(--paper)" : "var(--gold)" }}
            >
              {isListeningObjetivo ? <MicOff size={12} /> : <Mic size={12} />}
              {isListeningObjetivo ? "Ouvindo..." : "Falar objetivo"}
            </button>
          </div>
          <p className="text-[10px] mb-2" style={{ color: "var(--paper-dim)" }}>
            Exemplo pra falar: "carro 20000 reais em 12 meses". Depois de falar, confira os campos abaixo e clique em <strong style={{ color: "var(--gold)" }}>+ Adicionar</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text" placeholder="Nome (ex: Carro, Viagem)" value={novoObjetivo.nome}
              onChange={(e) => setNovoObjetivo((f) => ({ ...f, nome: e.target.value }))}
              className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
            <input
              type="text" placeholder="Onde vai guardar? (ex: poupança, conta separada)" value={novoObjetivo.ondeGuardar}
              onChange={(e) => setNovoObjetivo((f) => ({ ...f, ondeGuardar: e.target.value }))}
              className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" placeholder="Valor alvo" value={novoObjetivo.valorAlvo}
                onChange={(e) => setNovoObjetivo((f) => ({ ...f, valorAlvo: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
              <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
              <input
                type="number" min="0" placeholder="Já guardado" value={novoObjetivo.valorAtual}
                onChange={(e) => setNovoObjetivo((f) => ({ ...f, valorAtual: e.target.value }))}
                className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
            <input
              type="number" min="0" placeholder="Prazo (meses)" value={novoObjetivo.prazoMeses}
              onChange={(e) => setNovoObjetivo((f) => ({ ...f, prazoMeses: e.target.value }))}
              className="text-xs px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <button
            onClick={() => {
              if (!novoObjetivo.nome || !novoObjetivo.valorAlvo) return;
              setObjetivos((prev) => [...prev, {
                id: Date.now(),
                nome: novoObjetivo.nome,
                valorAlvo: Number(novoObjetivo.valorAlvo),
                valorAtual: Number(novoObjetivo.valorAtual) || 0,
                prazoMeses: Number(novoObjetivo.prazoMeses) || 0,
                ondeGuardar: novoObjetivo.ondeGuardar,
              }]);
              setNovoObjetivo({ nome: "", valorAlvo: "", prazoMeses: "", valorAtual: "", ondeGuardar: "" });
            }}
            className="w-full text-xs font-semibold px-3 py-2 rounded-sm mb-2" style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            + Adicionar
          </button>
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Já tem algo guardado pra esse objetivo? Depois de adicionar, clique no lápis ao lado do valor pra atualizar quanto você já tem.
          </p>
        </div>
        )}
        </>
        )}

        <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
          Essa é a base antes de investir: renda organizada, orçamento sob controle, dívida cara quitada e reserva formada. Só depois disso faz sentido acelerar nos investimentos da aba "Minha Carteira". Dados desta sessão são ilustrativos e não persistem entre acessos nesta versão de protótipo.
        </p>
      </div>
      )}

      {assetClass === "carteira" && (
      <div className="px-5 py-6 md:px-10 max-w-2xl">
        <div className="mb-6">
          <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
            Quanto você tem disponível pra investir agora?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={investAmount}
              onChange={(e) => setInvestAmount(Math.max(0, Number(e.target.value)))}
              className="text-lg font-semibold px-3 py-2 rounded-sm w-40"
              style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <span className="text-xs" style={{ color: "var(--paper-dim)" }}>Fase da carteira:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{allocation.tier.label}</span>
            <span className="text-xs" style={{ color: "var(--paper-dim)" }}>· perfil {profile.label.toLowerCase()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {Object.keys(ASSET_CLASS_META).map((key) => {
            const pct = allocation.pct[key];
            const baseWeight = BASE_ALLOCATION[profileKey][key];
            const classAmount = (investAmount * pct) / 100;
            const excluded = pct === 0 && baseWeight > 0;

            let suggestionItems = [];
            if (key === "rendaFixa") suggestionItems = rankedRF.slice(0, 2).map((p) => ({ label: p.name, sub: p.taxaLabel }));
            if (key === "acoes") suggestionItems = ranked.slice(0, 2).map((c) => ({ label: `${c.ticker} · ${c.name}`, sub: `${c.market}` }));
            if (key === "fiis") suggestionItems = rankedFII.slice(0, 2).map((f) => ({ label: `${f.ticker} · ${f.name}`, sub: f.tipo }));
            if (key === "etfs") suggestionItems = rankedETF.slice(0, 2).map((e) => ({ label: `${e.ticker} · ${e.name}`, sub: e.categoria }));
            if (key === "previdencia") suggestionItems = rankedPrev.slice(0, 2).map((p) => ({ label: p.name, sub: p.tipo }));
            if (key === "cripto") suggestionItems = rankedCrypto.slice(0, 2).map((c) => ({ label: `${c.symbol} · ${c.name}`, sub: `#${c.marketCapRank} em cap. de mercado` }));

            return (
              <div key={key} className="rounded-sm p-4" style={{ background: pct > 0 ? "var(--panel)" : "transparent", border: `1px solid ${pct > 0 ? "rgba(237,230,214,0.15)" : "rgba(237,230,214,0.08)"}`, opacity: pct > 0 ? 1 : 0.55 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{ASSET_CLASS_META[key].label}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>

                <div className="h-1.5 rounded-full mb-2" style={{ background: "rgba(237,230,214,0.1)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: "var(--gold)" }} />
                </div>

                {pct > 0 ? (
                  <>
                    <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                      R$ {classAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="space-y-1">
                      {suggestionItems.map((item, idx) => (
                        <div key={item.label} className="text-xs flex items-center justify-between" style={{ color: "var(--paper-dim)" }}>
                          <span style={{ color: "var(--paper)" }}>{item.label} <span className="opacity-70">· {item.sub}</span></span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            R$ {(classAmount * (idx === 0 ? 0.6 : 0.4)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs italic" style={{ color: "var(--paper-dim)" }}>
                    {excluded ? "Ainda não indicada pra esse valor disponível — melhor concentrar em menos classes por enquanto." : "Não faz parte da alocação desse perfil."}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
          A divisão por classe é calibrada pelo perfil {profile.label.toLowerCase()}, e a inclusão de cada classe considera o valor disponível — valores pequenos concentram em menos classes (renda fixa + ETFs) pra evitar fatiar demais um montante baixo; conforme o valor cresce, mais classes entram na mistura. Os produtos sugeridos dentro de cada classe são os melhor colocados no ranking daquele perfil. Simulação ilustrativa — não é recomendação de investimento personalizada.
        </p>

        {/* Alerta de desvio de carteira */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          <button
            onClick={() => setShowRebalance((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--gold)" }}
          >
            <AlertCircle size={16} />
            Já tenho posições? Comparar com o alvo e ver desvios
            <ArrowRight size={14} style={{ transform: showRebalance ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
          </button>

          {showRebalance && (
            <div className="mt-4 rounded-sm p-4" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
              <div className="text-xs mb-3" style={{ color: "var(--paper-dim)" }}>
                Informe quanto você já tem hoje em cada classe (posição atual):
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                {Object.keys(ASSET_CLASS_META).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>
                      {ASSET_CLASS_META[key].label}
                    </label>
                    <div className="flex items-center gap-1 w-full px-2 py-1.5 rounded-sm" style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input
                        type="number"
                        min="0"
                        value={currentPositions[key]}
                        onChange={(e) => setCurrentPositions((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))}
                        className="w-full text-sm bg-transparent outline-none"
                        style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {totalCurrent > 0 ? (
                <div className="space-y-2">
                  {Object.keys(ASSET_CLASS_META).map((key) => {
                    const currentPct = (currentPositions[key] / totalCurrent) * 100;
                    const targetPct = allocation.pct[key];
                    const deviation = currentPct - targetPct;
                    const isOff = Math.abs(deviation) >= 5;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between text-xs px-3 py-2 rounded-sm"
                        style={{ background: isOff ? "rgba(177,74,52,0.1)" : "transparent", border: `1px solid ${isOff ? "rgba(177,74,52,0.35)" : "rgba(237,230,214,0.12)"}` }}
                      >
                        <div>
                          <span style={{ color: "var(--paper)" }}>{ASSET_CLASS_META[key].label}</span>
                          <span style={{ color: "var(--paper-dim)" }}> — atual {currentPct.toFixed(0)}% · alvo {targetPct}%</span>
                        </div>
                        {isOff ? (
                          <span style={{ color: "var(--rust)" }} className="font-medium">
                            {deviation > 0 ? `+${deviation.toFixed(0)}pp acima — pausar aportes aqui` : `${deviation.toFixed(0)}pp abaixo — priorizar próximos aportes aqui`}
                          </span>
                        ) : (
                          <span style={{ color: "var(--gold)" }}>Dentro do alvo</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs italic" style={{ color: "var(--paper-dim)" }}>
                  Preencha os valores acima pra ver o comparativo com a alocação alvo.
                </div>
              )}
              <p className="mt-3 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                Consideramos desvio relevante a partir de 5 pontos percentuais de diferença entre o peso atual e o peso-alvo da classe.
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {assetClass === "relatorio" && (
      <div className="px-5 py-6 md:px-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={18} color="var(--gold)" />
          <h2 className="text-xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>Relatório Periódico da Carteira</h2>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--paper-dim)" }}>
          Um resumo profissional do desempenho e dos alertas da sua carteira, enviado automaticamente no ritmo que você escolher.
        </p>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["quinzenal", "mensal"].map((p) => (
            <button
              key={p}
              onClick={() => setReportPeriod(p)}
              className="px-3 py-1.5 text-xs uppercase tracking-wide rounded-sm transition-colors"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: reportPeriod === p ? "var(--gold)" : "transparent",
                color: reportPeriod === p ? "var(--ink)" : "var(--paper-dim)",
                border: `1px solid ${reportPeriod === p ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
              }}
            >
              {p === "quinzenal" ? "A cada 15 dias" : "Mensal"}
            </button>
          ))}
          <button
            onClick={() => setReportSeed((s) => s + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm ml-auto"
            style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}
          >
            <RefreshCw size={12} /> Simular novo período
          </button>
        </div>

        {/* Documento do relatório */}
        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4" style={{ borderBottom: "1px solid rgba(237,230,214,0.15)" }}>
            <div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                Maat Finanças · Relatório {reportPeriod === "quinzenal" ? "Quinzenal" : "Mensal"}
              </div>
              <div className="text-sm mt-0.5" style={{ color: "var(--paper-dim)" }}>Período: {periodDates.start} a {periodDates.end}</div>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: "var(--paper-dim)" }}>Variação da carteira no período</div>
              <div className="text-2xl font-bold" style={{ color: portfolioVariation >= 0 ? "var(--gold)" : "var(--rust)", fontFamily: "'Roboto Slab', serif" }}>
                {portfolioVariation >= 0 ? "+" : ""}{portfolioVariation}%
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed mt-4" style={{ color: "var(--paper)" }}>
            Perfil {profile.label.toLowerCase()}. Sua carteira de exemplo {portfolioVariation >= 0 ? "avançou" : "recuou"} {Math.abs(portfolioVariation)}% no período,
            {" "}considerando {reportHoldings.length} posições acompanhadas. {reportHoldings.filter((h) => h.flagged).length > 0
              ? `${reportHoldings.filter((h) => h.flagged).length} posição(ões) merecem atenção — veja os detalhes abaixo.`
              : "Nenhuma posição acionou alerta de atenção neste período."}
          </p>

          {/* Desempenho por posição */}
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--paper-dim)" }}>Desempenho por posição</div>
            <div className="space-y-1.5">
              {reportHoldings.map((h) => (
                <div key={h.ticker || h.symbol} className="flex items-center justify-between text-sm px-3 py-2 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.12)" }}>
                  <div>
                    <span style={{ color: "var(--paper)" }} className="font-medium">{h.ticker || h.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--paper-dim)" }}>{h.classe} · {h.name}</span>
                  </div>
                  <span style={{ color: h.variacao >= 0 ? "var(--gold)" : "var(--rust)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {h.variacao >= 0 ? "+" : ""}{h.variacao}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Destaques positivos */}
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--gold)" }}>Destaques positivos</div>
            {[...reportHoldings].sort((a, b) => b.variacao - a.variacao).slice(0, 2).map((h) => (
              <p key={h.ticker || h.symbol} className="text-xs leading-relaxed mb-1" style={{ color: "var(--paper-dim)" }}>
                <span style={{ color: "var(--paper)" }}>{h.ticker || h.symbol}</span> valorizou {h.variacao}% no período — segue entre os melhor avaliados pra esse perfil.
              </p>
            ))}
          </div>

          {/* Pontos de atenção */}
          {reportHoldings.some((h) => h.flagged) && (
            <div className="mt-5 p-4 rounded-sm" style={{ background: "rgba(177,74,52,0.1)", border: "1px solid rgba(177,74,52,0.35)" }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "var(--rust)" }}>
                <AlertTriangle size={13} /> Pontos de atenção
              </div>
              {reportHoldings.filter((h) => h.flagged).map((h) => (
                <p key={h.ticker || h.symbol} className="text-xs leading-relaxed mb-2" style={{ color: "var(--paper)" }}>
                  <strong>{h.ticker || h.symbol}</strong> — {h.classe === "Ações"
                    ? `não atende a ${h.failCount} dos ${CRITERIA.length} critérios fundamentalistas acompanhados nesse período.`
                    : `pontuação abaixo do ideal pro perfil ${profile.label.toLowerCase()} nesse período.`}
                  {" "}Vale revisar essa posição e considerar se ela ainda se encaixa na sua estratégia.
                </p>
              ))}
            </div>
          )}

          <p className="mt-5 pt-4 text-[10px] leading-relaxed" style={{ borderTop: "1px solid rgba(237,230,214,0.15)", color: "var(--paper-dim)" }}>
            Relatório ilustrativo gerado com dados simulados nesta versão de protótipo, a partir da carteira de exemplo do seu perfil. Numa versão conectada, esse documento seria gerado automaticamente por um serviço agendado (a cada 15 dias ou todo mês), com preços e fundamentos reais das suas posições, e enviado por e-mail ou notificação push.
          </p>
        </div>
      </div>
      )}

      {assetClass === "diario" && (
      <div className="px-5 py-6 md:px-10 max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={18} color="var(--gold)" />
          <h2 className="text-xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>Diário do Investidor</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--paper-dim)" }}>
          Registre por que você tomou cada decisão. Com o tempo, os próprios padrões — bons ou ruins — ficam visíveis pra você.
        </p>

        {/* Formulário de novo registro */}
        <div className="rounded-sm p-4 mb-6" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Ativo</label>
              <input
                type="text"
                placeholder="ex: PETR4, BTC, Tesouro Selic..."
                value={journalForm.ativo}
                onChange={(e) => setJournalForm((f) => ({ ...f, ativo: e.target.value }))}
                className="w-full text-sm px-2 py-1.5 rounded-sm"
                style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)" }}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Valor (R$)</label>
              <input
                type="number"
                min="0"
                value={journalForm.valor}
                onChange={(e) => setJournalForm((f) => ({ ...f, valor: e.target.value }))}
                className="w-full text-sm px-2 py-1.5 rounded-sm"
                style={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>Tipo</label>
            <div className="flex gap-2">
              {["Compra", "Venda"].map((t) => (
                <button
                  key={t}
                  onClick={() => setJournalForm((f) => ({ ...f, tipo: t }))}
                  className="px-3 py-1.5 text-xs rounded-sm"
                  style={{
                    background: journalForm.tipo === t ? "var(--gold)" : "transparent",
                    color: journalForm.tipo === t ? "var(--ink)" : "var(--paper-dim)",
                    border: `1px solid ${journalForm.tipo === t ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wide block mb-1.5" style={{ color: "var(--paper-dim)" }}>Por que você está tomando essa decisão?</label>
            <div className="flex flex-col gap-1.5">
              {MOTIVOS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => { setJournalForm((f) => ({ ...f, motivoKey: m.key })); setReflectionAck(false); }}
                  className="text-left text-xs px-3 py-2 rounded-sm"
                  style={{
                    background: journalForm.motivoKey === m.key ? "rgba(190,154,92,0.14)" : "transparent",
                    border: `1px solid ${journalForm.motivoKey === m.key ? "var(--gold)" : "rgba(237,230,214,0.2)"}`,
                    color: journalForm.motivoKey === m.key ? "var(--gold)" : "var(--paper-dim)",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reflexão comportamental — só aparece pra motivos emocionais */}
          {MOTIVOS.find((m) => m.key === journalForm.motivoKey)?.reflective && (
            <div className="mb-4 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "var(--gold)" }}>
                <Brain size={13} /> Antes de seguir, três perguntas
              </div>
              <ul className="space-y-1.5 mb-3">
                {REFLECTIVE_QUESTIONS.map((q) => (
                  <li key={q} className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>· {q}</li>
                ))}
              </ul>
              <label className="flex items-start gap-2 text-xs" style={{ color: "var(--paper-dim)" }}>
                <input type="checkbox" checked={reflectionAck} onChange={(e) => setReflectionAck(e.target.checked)} className="mt-0.5" />
                Já refleti sobre essas perguntas e quero registrar a decisão mesmo assim.
              </label>
            </div>
          )}

          <button
            disabled={!journalForm.ativo || !journalForm.valor || (MOTIVOS.find((m) => m.key === journalForm.motivoKey)?.reflective && !reflectionAck)}
            onClick={() => {
              setJournal((prev) => [
                { id: Date.now(), data: new Date().toLocaleDateString("pt-BR"), ...journalForm },
                ...prev,
              ]);
              setJournalForm({ ativo: "", tipo: "Compra", motivoKey: "fundamentos", valor: "" });
              setReflectionAck(false);
            }}
            className="text-sm font-semibold px-4 py-2 rounded-sm"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
              opacity: !journalForm.ativo || !journalForm.valor || (MOTIVOS.find((m) => m.key === journalForm.motivoKey)?.reflective && !reflectionAck) ? 0.4 : 1,
            }}
          >
            Registrar decisão
          </button>
        </div>

        {/* Padrão detectado */}
        {journal.filter((j) => MOTIVOS.find((m) => m.key === j.motivoKey)?.reflective).length >= 2 && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-sm" style={{ background: "rgba(177,74,52,0.1)", border: "1px solid rgba(177,74,52,0.35)" }}>
            <AlertTriangle size={16} color="var(--rust)" className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
              Você já registrou {journal.filter((j) => MOTIVOS.find((m) => m.key === j.motivoKey)?.reflective).length} decisões motivadas por FOMO, pânico, notícia ou dica de terceiros. Vale revisar esse padrão com calma antes da próxima decisão parecida.
            </p>
          </div>
        )}

        {/* Histórico */}
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: "var(--paper-dim)" }}>
          <BookOpen size={13} /> HISTÓRICO DESTA SESSÃO
        </div>
        {journal.length === 0 ? (
          <p className="text-xs italic" style={{ color: "var(--paper-dim)" }}>Nenhum registro ainda. Suas próximas decisões aparecem aqui.</p>
        ) : (
          <div className="space-y-2">
            {journal.map((j) => {
              const motivo = MOTIVOS.find((m) => m.key === j.motivoKey);
              return (
                <div key={j.id} className="text-xs px-3 py-2.5 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.15)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ color: "var(--paper)" }} className="font-semibold">{j.tipo} de {j.ativo}</span>
                    <span style={{ color: "var(--paper-dim)" }}>{j.data}</span>
                  </div>
                  <div style={{ color: "var(--paper-dim)" }}>
                    R$ {Number(j.valor).toLocaleString("pt-BR")} · <span style={{ color: motivo?.reflective ? "var(--rust)" : "var(--gold)" }}>{motivo?.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
          Histórico válido pra esta sessão do protótipo. Numa versão conectada, ficaria salvo permanentemente e alimentaria relatórios de padrão comportamental ao longo dos meses.
        </p>
      </div>
      )}

      {assetClass === "custos" && (
      <div className="px-5 py-6 md:px-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Receipt size={18} color="var(--gold)" />
          <h2 className="text-xl" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>Radar de Custos Ocultos</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--paper-dim)" }}>
          Taxas parecem pequenas no dia a dia, mas compostas ao longo dos anos corroem boa parte do seu patrimônio. Veja o impacto real.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { key: "valorInicial", label: "Valor inicial" },
            { key: "aporteMensal", label: "Aporte mensal" },
            { key: "anos", label: "Anos" },
            { key: "retornoBrutoAnual", label: "Retorno bruto (% a.a.)" },
            { key: "taxaBaixa", label: "Taxa baixa (% a.a.)" },
            { key: "taxaAlta", label: "Taxa alta (% a.a.)" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10px] uppercase tracking-wide block mb-1" style={{ color: "var(--paper-dim)" }}>{f.label}</label>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                {(f.key === "valorInicial" || f.key === "aporteMensal") && (
                  <span className="text-sm" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                )}
                <input
                  type="number"
                  min="0"
                  step={f.key.includes("taxa") || f.key === "retornoBrutoAnual" ? "0.1" : "1"}
                  value={costInputs[f.key]}
                  onChange={(e) => setCostInputs((prev) => ({ ...prev, [f.key]: Math.max(0, Number(e.target.value)) }))}
                  className="w-full text-sm bg-transparent outline-none"
                  style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="rounded-sm p-4" style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}>
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--paper-dim)" }}>Com taxa de {costInputs.taxaBaixa}% a.a.</div>
            <div className="text-2xl font-semibold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>
              R$ {costLow.final.toLocaleString("pt-BR")}
            </div>
          </div>
          <div className="rounded-sm p-4" style={{ background: "rgba(177,74,52,0.1)", border: "1px solid rgba(177,74,52,0.3)" }}>
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--paper-dim)" }}>Com taxa de {costInputs.taxaAlta}% a.a.</div>
            <div className="text-2xl font-semibold" style={{ color: "var(--rust)", fontFamily: "'Roboto Slab', serif" }}>
              R$ {costHigh.final.toLocaleString("pt-BR")}
            </div>
          </div>
        </div>

        <div className="rounded-sm p-4 mb-6 text-center" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--paper-dim)" }}>Diferença ao final de {costInputs.anos} anos</div>
          <div className="text-3xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>
            R$ {(costLow.final - costHigh.final).toLocaleString("pt-BR")}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--paper-dim)" }}>é o que a diferença de taxa sozinha custa pro seu patrimônio</div>
        </div>

        <div className="h-64 rounded-sm p-3" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.15)" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costChartData}>
              <CartesianGrid stroke="rgba(237,230,214,0.1)" />
              <XAxis dataKey="ano" tick={{ fill: "var(--paper-dim)", fontSize: 11 }} label={{ value: "Anos", position: "insideBottom", offset: -3, fill: "var(--paper-dim)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--paper-dim)", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`}
                contentStyle={{ background: "var(--ink)", border: "1px solid rgba(237,230,214,0.25)", fontSize: 12 }}
                labelStyle={{ color: "var(--paper)" }}
              />
              <Line type="monotone" dataKey="Taxa baixa" stroke="var(--gold)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Taxa alta" stroke="var(--rust)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
          Simulação simplificada de juros compostos com aportes mensais, aplicando a diferença de taxa direto sobre o retorno anual. Não considera imposto de renda, inflação ou variação de mercado — serve pra ilustrar o efeito da taxa isoladamente, não como projeção real.
        </p>
      </div>
      )}

      {assetClass === "acoes" && (
      <>
      <AssetInfoBlock tabKey="acoes" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 pt-4 md:px-10">
        <p className="text-xs leading-relaxed p-3 rounded-sm" style={{ color: "var(--paper)", background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
          <strong style={{ color: "var(--gold)" }}>Importante:</strong> essa análise é educacional, embasada no tipo do seu perfil de investidor — não é uma recomendação individual e exclusiva pra você. Ações envolvem risco e nenhum retorno é garantido. A decisão final sobre comprar, vender ou manter é sempre sua, assim como a escolha de qual corretora usar.
        </p>
      </div>
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Lista de empresas, ordenada pelo perfil selecionado */}
        <div>
          <div className="flex gap-2 mb-4">
            {["Todos", "B3", "EUA", "BDR"].map((m) => (
              <button
                key={m}
                onClick={() => setMarket(m)}
                className="px-3 py-1.5 text-xs uppercase tracking-wide rounded-sm transition-colors"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: market === m ? "var(--gold)" : "transparent",
                  color: market === m ? "var(--ink)" : "var(--paper-dim)",
                  border: `1px solid ${market === m ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
                }}
              >
                {m === "Todos" ? "Todos" : m === "B3" ? "🇧🇷 B3" : m === "EUA" ? "🇺🇸 EUA" : "🌎 BDR"}
              </button>
            ))}
          </div>

          <AssetSearchBar value={searchAcoes} onChange={setSearchAcoes} placeholder="Buscar outro ticker ou empresa..." />

          <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            {filtered.filter((c) => !searchAcoes.trim() || (c.ticker + c.name).toLowerCase().includes(searchAcoes.toLowerCase())).map((c, i) => {
              const isActive = c.ticker === selected.ticker;
              const cc = classify(c.profileScore);
              return (
                <button
                  key={c.ticker}
                  onClick={() => setSelectedTicker(c.ticker)}
                  className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                  style={{
                    borderBottom: "1px solid rgba(237,230,214,0.15)",
                    background: isActive ? "rgba(190,154,92,0.12)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {i + 1}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}
                    >
                      {c.profileScore}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {c.ticker}
                        <span className="ml-2 text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>
                          {c.market}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: "var(--paper-dim)" }}>
                        {c.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {c.ret.low}% a {c.ret.high}%
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>
                      est. a.a.
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {searchAcoes.trim() && filtered.filter((c) => (c.ticker + c.name).toLowerCase().includes(searchAcoes.toLowerCase())).length === 0 && (
            <SimulatedAssetCard query={searchAcoes} profileLabel={profile.label} />
          )}
        </div>

        {/* Painel de detalhe */}
        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                <Globe2 size={12} /> {selected.market} · {selected.sector}
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
                {selected.name}
              </h2>
              <div className="text-sm mt-1" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selected.ticker} · {selected.currency} {selected.price.toFixed(2)}
              </div>
            </div>
            <Seal score={selected.profileScore} />
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" style={{ color: cls.color }}>
              {cls.label}
            </span>
            <span className="text-xs" style={{ color: "var(--paper-dim)" }}>
              · pontuação calibrada para perfil {profile.label.toLowerCase()}
            </span>
          </div>

          {/* Por que recomendamos */}
          <div className="mt-5 p-4 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)" }}>
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
              Por que recomendamos {selected.ticker} pra você
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--paper)" }}>
              {thesis.opening}
            </p>

            {thesis.strengths.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--gold)" }}>Pontos fortes</div>
                <ul className="space-y-1">
                  {thesis.strengths.map((s) => (
                    <li key={s.key} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--paper-dim)" }}>
                      <Check size={12} color="var(--gold)" className="mt-0.5 shrink-0" />
                      {s.label}: {s.value.toFixed(1)}{s.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {thesis.cautions.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--rust)" }}>Pontos de atenção</div>
                <ul className="space-y-1">
                  {thesis.cautions.map((s) => (
                    <li key={s.key} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--paper-dim)" }}>
                      <X size={12} color="var(--rust)" className="mt-0.5 shrink-0" />
                      {s.label}: {s.value.toFixed(1)}{s.unit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "var(--paper)" }}>
                <FileText size={13} color="var(--gold)" />
                Baseado nos documentos e divulgações mais recentes
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.title} className="text-xs" style={{ color: "var(--paper-dim)" }}>
                    <span style={{ color: "var(--paper)" }}>{doc.title}</span>
                    <span className="opacity-70"> · {doc.date}</span>
                    <div className="leading-relaxed">{doc.summary}</div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed opacity-80">
                Documentos ilustrativos nesta versão de protótipo. Numa versão conectada, viriam direto da B3/CVM (Fato Relevante, ITR) ou da SEC (10-Q, 8-K), atualizados a cada nova divulgação.
              </p>
            </div>
          </div>

          {/* Comprar — redirecionamento pra corretora */}
          <div className="mt-4 relative">
            <button
              onClick={() => setShowBrokers((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              <ShoppingCart size={15} />
              Comprar {selected.ticker}
            </button>

            {showBrokers && (
              <div
                className="mt-2 max-w-sm rounded-sm p-3"
                style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}
              >
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                  Abrir {selected.ticker} direto na sua corretora:
                </div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a
                      key={b.name}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors"
                      style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}
                    >
                      {b.name}
                      <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed" style={{ color: "var(--paper-dim)" }}>
                  Protótipo: hoje o link abre o site da corretora. Numa versão conectada, isso levaria direto pra tela de compra de {selected.ticker} já preenchida, via parceria de API com a corretora.
                </p>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu essa compra? Registre aqui pra entrar automaticamente no seu Fundo de Investimento:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input
                        type="number" min="0" value={confirmValor}
                        onChange={(e) => setConfirmValor(e.target.value)}
                        className="w-full text-xs bg-transparent outline-none"
                        style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <button onClick={() => registrarAplicacao(selected.ticker)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                      Confirmar aplicação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="mt-3 inline-flex items-baseline gap-2 px-3 py-1.5 rounded-sm"
            style={{ background: "rgba(190,154,92,0.1)", border: "1px solid rgba(190,154,92,0.3)" }}
          >
            <span className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)" }}>
              Rentabilidade estimada
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
              {selected.ret.low}% – {selected.ret.high}% a.a.
            </span>
          </div>

          {/* Prévia de rendimento em 12 meses */}
          <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
              Com R$ 1.000 investidos, em 12 meses você teria entre{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {(1000 * (1 + parseFloat(selected.ret.low) / 100)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
              {" "}e{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {(1000 * (1 + parseFloat(selected.ret.high) / 100)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong>
              {" "}— estimativa ilustrativa, ações não têm rendimento garantido.
            </p>
          </div>

          {/* Radar */}
          <div className="mt-6 h-56 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData(selected)} outerRadius="75%">
                <PolarGrid stroke="rgba(237,230,214,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--paper-dim)", fontSize: 10 }} />
                <Radar dataKey="value" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Critérios */}
          <div className="mt-4" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
            {CRITERIA.map((c) => {
              const value = selected[c.key];
              const pass = c.test(value);
              const Icon = c.direction === "up" ? TrendingUp : TrendingDown;
              const w = profile.weights[c.key];
              return (
                <div
                  key={c.key}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(237,230,214,0.1)" }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} color="var(--paper-dim)" />
                    <span className="text-sm">{c.label}</span>
                    {w !== 1 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-sm"
                        style={{
                          color: w > 1 ? "var(--gold)" : "var(--paper-dim)",
                          border: `1px solid ${w > 1 ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
                        }}
                      >
                        peso {w}x
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--paper-dim)" }}>
                      {value.toFixed(1)}
                      {c.unit}
                    </span>
                    {pass ? <Check size={16} color="var(--gold)" /> : <X size={16} color="var(--rust)" />}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação e ordenação recalculadas conforme o peso que o perfil {profile.label.toLowerCase()} dá a cada critério. A rentabilidade estimada é uma ilustração baseada em crescimento histórico e dividendos — não é garantia de retorno futuro. Dados fictícios nesta versão de protótipo.
          </p>
        </div>
      </div>
      </>
      )}

      {assetClass === "renda-fixa" && (
      <>
      <AssetInfoBlock tabKey="renda-fixa" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 pt-4 md:px-10">
        <p className="text-xs leading-relaxed p-3 rounded-sm" style={{ color: "var(--paper)", background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.3)" }}>
          <strong style={{ color: "var(--gold)" }}>Importante:</strong> essa análise é educacional, embasada no tipo do seu perfil de investidor — não é uma recomendação individual e exclusiva pra você. Os produtos aqui são só exemplos: você pode escolher livremente o CDB, Tesouro ou LCI/LCA do banco ou corretora de sua preferência, não só os que aparecem nesta lista. A decisão final é sempre sua.
        </p>
      </div>
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Lista de produtos de renda fixa, ordenada pelo perfil selecionado */}
        <div>
        <AssetSearchBar value={searchRF} onChange={setSearchRF} placeholder="Buscar outro produto de renda fixa..." />
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedRF.filter((p) => !searchRF.trim() || p.name.toLowerCase().includes(searchRF.toLowerCase())).map((p, i) => {
            const isActive = p.id === selectedRF.id;
            const cc = classifyRF(p.profileScore);
            return (
              <button
                key={p.id}
                onClick={() => setRfSelectedId(p.id)}
                className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{
                  borderBottom: "1px solid rgba(237,230,214,0.15)",
                  background: isActive ? "rgba(190,154,92,0.12)" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}
                  >
                    {p.profileScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>
                      {p.type} · {p.taxaLabel} <span className="opacity-70">(≈{pctDaSelic(p.taxaAnual)}% da Selic)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                    +R$ {estimativa12Meses(p.taxaAnual).ganho.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>
                    em 12m / R$1.000
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {searchRF.trim() && rankedRF.filter((p) => p.name.toLowerCase().includes(searchRF.toLowerCase())).length === 0 && (
          <SimulatedAssetCard query={searchRF} profileLabel={profile.label} />
        )}
        </div>

        {/* Painel de detalhe do produto */}
        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedRF.type} · Indexador {selectedRF.indexador}
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
                {selectedRF.name}
              </h2>
              <div className="text-sm mt-1" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedRF.taxaLabel} <span style={{ color: "var(--paper-dim)" }}>≈ {pctDaSelic(selectedRF.taxaAnual)}% da Selic ({selectedRF.taxaAnual.toFixed(2)}% a.a.)</span>
              </div>
            </div>
            <Seal score={selectedRF.profileScore} />
          </div>

          <div className="mt-2 text-sm font-medium" style={{ color: classifyRF(selectedRF.profileScore).color }}>
            {classifyRF(selectedRF.profileScore).label}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              Liquidez: {selectedRF.liquidez}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              {selectedRF.protecao}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              {selectedRF.prazoMeses === 0 ? "Sem prazo de carência" : `Prazo ${selectedRF.prazoMeses} meses`}
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-sm"
              style={{ border: `1px solid ${selectedRF.isentoIR ? "var(--gold)" : "rgba(237,230,214,0.25)"}`, color: selectedRF.isentoIR ? "var(--gold)" : "var(--paper-dim)" }}
            >
              {selectedRF.isentoIR ? "Isento de Imposto de Renda" : "IR pela tabela regressiva"}
            </span>
          </div>

          {/* Prévia de rendimento em 12 meses */}
          <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
              Resumindo: <strong style={{ color: "var(--gold)" }}>{selectedRF.taxaLabel}</strong>, o equivalente a <strong style={{ color: "var(--gold)" }}>≈{pctDaSelic(selectedRF.taxaAnual)}% da Selic</strong> ao ano.
              {" "}Aplicando <strong>R$ 1.000</strong> por 12 meses nessa taxa, você teria aproximadamente{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {estimativa12Meses(selectedRF.taxaAnual).total.toLocaleString("pt-BR")}</strong>{" "}
              (ganho de R$ {estimativa12Meses(selectedRF.taxaAnual).ganho.toLocaleString("pt-BR")}, antes de eventual IR).
            </p>
          </div>

          {/* Comprar — redirecionamento pra corretora */}
          <div className="mt-5 relative">
            <button
              onClick={() => setShowBrokers((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              <ShoppingCart size={15} />
              Aplicar em {selectedRF.name}
            </button>

            {showBrokers && (
              <div className="mt-2 max-w-sm rounded-sm p-3" style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                  Abrir aplicação direto na sua corretora/banco:
                </div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a
                      key={b.name}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors"
                      style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}
                    >
                      {b.name}
                      <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu essa aplicação? Registre aqui pra entrar automaticamente no seu Fundo de Investimento:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input
                        type="number" min="0" value={confirmValor}
                        onChange={(e) => setConfirmValor(e.target.value)}
                        className="w-full text-xs bg-transparent outline-none"
                        style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <button onClick={() => registrarAplicacao(selectedRF.name)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                      Confirmar aplicação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação calculada a partir do peso que o perfil {profile.label.toLowerCase()} dá pra taxa, liquidez, proteção e prazo de cada produto. Taxas e condições são ilustrativas nesta versão de protótipo — numa versão conectada, viriam atualizadas direto da API do banco/corretora ou do Tesouro Direto.
          </p>
        </div>
      </div>
      </>
      )}

      {assetClass === "fiis" && (
      <>
      <AssetInfoBlock tabKey="fiis" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        {/* Lista de FIIs, ordenada pelo perfil selecionado */}
        <div>
        <AssetSearchBar value={searchFII} onChange={setSearchFII} placeholder="Buscar outro FII..." />
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedFII.filter((f) => !searchFII.trim() || (f.ticker + f.name).toLowerCase().includes(searchFII.toLowerCase())).map((f, i) => {
            const isActive = f.ticker === selectedFII.ticker;
            const cc = classifyFII(f.profileScore);
            return (
              <button
                key={f.ticker}
                onClick={() => setFiiSelectedTicker(f.ticker)}
                className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{
                  borderBottom: "1px solid rgba(237,230,214,0.15)",
                  background: isActive ? "rgba(190,154,92,0.12)" : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}
                  >
                    {f.profileScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {f.ticker}
                      <span className="ml-2 text-[10px] uppercase" style={{ color: "var(--paper-dim)" }}>
                        {f.tipo}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>
                      {f.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {f.divYieldAnual.toFixed(1)}% a.a.
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>
                    div. yield
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {searchFII.trim() && rankedFII.filter((f) => (f.ticker + f.name).toLowerCase().includes(searchFII.toLowerCase())).length === 0 && (
          <SimulatedAssetCard query={searchFII} profileLabel={profile.label} />
        )}
        </div>

        {/* Painel de detalhe do FII */}
        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedFII.tipo} · {selectedFII.segmento}
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>
                {selectedFII.name}
              </h2>
              <div className="text-sm mt-1" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                {selectedFII.ticker} · R$ {selectedFII.price.toFixed(2)}
              </div>
            </div>
            <Seal score={selectedFII.profileScore} />
          </div>

          <div className="mt-2 text-sm font-medium" style={{ color: classifyFII(selectedFII.profileScore).color }}>
            {classifyFII(selectedFII.profileScore).label}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              Dividend Yield: {selectedFII.divYieldAnual.toFixed(1)}% a.a.
            </span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              P/VP: {selectedFII.pvp.toFixed(2)}
            </span>
            {selectedFII.tipo === "Tijolo" && (
              <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
                Vacância: {selectedFII.vacancia.toFixed(1)}%
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>
              Negociado na B3, como uma ação
            </span>
          </div>

          {/* Prévia de rendimento em 12 meses (só dividendos, sem contar variação do preço da cota) */}
          <div className="mt-3 p-3 rounded-sm" style={{ background: "rgba(190,154,92,0.08)", border: "1px solid rgba(190,154,92,0.25)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
              Com R$ 1.000 investidos, os dividendos de 12 meses somariam aproximadamente{" "}
              <strong style={{ color: "var(--gold)" }}>R$ {estimativa12Meses(selectedFII.divYieldAnual).ganho.toLocaleString("pt-BR")}</strong>{" "}
              — isso não considera se a cota valorizou ou desvalorizou no período.
            </p>
          </div>

          {/* Comprar — redirecionamento pra corretora */}
          <div className="mt-5 relative">
            <button
              onClick={() => setShowBrokers((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              <ShoppingCart size={15} />
              Comprar {selectedFII.ticker}
            </button>

            {showBrokers && (
              <div className="mt-2 max-w-sm rounded-sm p-3" style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                  Abrir {selectedFII.ticker} direto na sua corretora:
                </div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a
                      key={b.name}
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors"
                      style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}
                    >
                      {b.name}
                      <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu essa compra? Registre aqui pra entrar automaticamente no seu Fundo de Investimento:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input
                        type="number" min="0" value={confirmValor}
                        onChange={(e) => setConfirmValor(e.target.value)}
                        className="w-full text-xs bg-transparent outline-none"
                        style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }}
                      />
                    </div>
                    <button onClick={() => registrarAplicacao(selectedFII.ticker)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
                      Confirmar aplicação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação calculada a partir do peso que o perfil {profile.label.toLowerCase()} dá pra dividend yield, desconto/prêmio sobre o valor patrimonial (P/VP), liquidez e vacância. Fundos de papel (CRI) não têm vacância, por isso esse critério não entra na conta pra eles. Dados fictícios nesta versão de protótipo.
          </p>
        </div>
      </div>
      </>
      )}

      {assetClass === "etfs" && (
      <>
      <AssetInfoBlock tabKey="etfs" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <div>
        <AssetSearchBar value={searchETF} onChange={setSearchETF} placeholder="Buscar outro ETF..." />
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedETF.filter((e) => !searchETF.trim() || (e.ticker + e.name).toLowerCase().includes(searchETF.toLowerCase())).map((e, i) => {
            const isActive = e.ticker === selectedETF.ticker;
            const cc = classifyETF(e.profileScore);
            return (
              <button
                key={e.ticker}
                onClick={() => setEtfSelectedTicker(e.ticker)}
                className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{ borderBottom: "1px solid rgba(237,230,214,0.15)", background: isActive ? "rgba(190,154,92,0.12)" : "transparent" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}>
                    {e.profileScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{e.ticker}</div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{e.categoria}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{e.retorno12m.toFixed(1)}%</div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>12 meses</div>
                </div>
              </button>
            );
          })}
        </div>

        {searchETF.trim() && rankedETF.filter((e) => (e.ticker + e.name).toLowerCase().includes(searchETF.toLowerCase())).length === 0 && (
          <SimulatedAssetCard query={searchETF} profileLabel={profile.label} />
        )}
        </div>

        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                <Layers size={12} /> {selectedETF.categoria}
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{selectedETF.name}</h2>
              <div className="text-sm mt-1" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{selectedETF.ticker} · R$ {selectedETF.price.toFixed(2)}</div>
            </div>
            <Seal score={selectedETF.profileScore} />
          </div>

          <div className="mt-2 text-sm font-medium" style={{ color: classifyETF(selectedETF.profileScore).color }}>
            {classifyETF(selectedETF.profileScore).label}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Taxa de administração: {selectedETF.taxaAdm.toFixed(2)}% a.a.</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Retorno 12 meses: {selectedETF.retorno12m.toFixed(1)}%</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Negociado na B3, como uma ação</span>
          </div>

          <div className="mt-5 relative">
            <button onClick={() => setShowBrokers((v) => !v)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
              <ShoppingCart size={15} /> Comprar {selectedETF.ticker}
            </button>
            {showBrokers && (
              <div className="mt-2 max-w-sm rounded-sm p-3" style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>Abrir {selectedETF.ticker} direto na sua corretora:</div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors" style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}>
                      {b.name} <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu essa compra? Registre aqui pra entrar automaticamente no seu Fundo de Investimento:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input type="number" min="0" value={confirmValor} onChange={(e) => setConfirmValor(e.target.value)}
                        className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                    <button onClick={() => registrarAplicacao(selectedETF.ticker)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Confirmar aplicação</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação calculada pelo peso que o perfil {profile.label.toLowerCase()} dá pra taxa de administração, retorno recente, liquidez e volatilidade. Um único ETF já entrega diversificação — ideal pra quem não quer escolher ação por ação. Dados fictícios nesta versão de protótipo.
          </p>
        </div>
      </div>
      </>
      )}

      {assetClass === "previdencia" && (
      <>
      <AssetInfoBlock tabKey="previdencia" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 py-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <div>
        <AssetSearchBar value={searchPrev} onChange={setSearchPrev} placeholder="Buscar outro plano de previdência..." />
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedPrev.filter((p) => !searchPrev.trim() || p.name.toLowerCase().includes(searchPrev.toLowerCase())).map((p, i) => {
            const isActive = p.id === selectedPrev.id;
            const cc = classifyPrev(p.profileScore);
            return (
              <button
                key={p.id}
                onClick={() => setPrevSelectedId(p.id)}
                className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{ borderBottom: "1px solid rgba(237,230,214,0.15)", background: isActive ? "rgba(190,154,92,0.12)" : "transparent" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}>
                    {p.profileScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{p.tipo} · {p.categoria}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{p.rentabilidade12m.toFixed(1)}%</div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>12 meses</div>
                </div>
              </button>
            );
          })}
        </div>

        {searchPrev.trim() && rankedPrev.filter((p) => p.name.toLowerCase().includes(searchPrev.toLowerCase())).length === 0 && (
          <SimulatedAssetCard query={searchPrev} profileLabel={profile.label} />
        )}
        </div>

        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                <PiggyBank size={12} /> {selectedPrev.seguradora} · {selectedPrev.tipo}
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{selectedPrev.name}</h2>
              <div className="text-sm mt-1" style={{ color: "var(--gold)", fontFamily: "'JetBrains Mono', monospace" }}>{selectedPrev.categoria}</div>
            </div>
            <Seal score={selectedPrev.profileScore} />
          </div>

          <div className="mt-2 text-sm font-medium" style={{ color: classifyPrev(selectedPrev.profileScore).color }}>
            {classifyPrev(selectedPrev.profileScore).label}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Taxa de administração: {selectedPrev.taxaAdm.toFixed(2)}% a.a.</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Carregamento: {selectedPrev.taxaCarregamento === 0 ? "Isento" : `${selectedPrev.taxaCarregamento}%`}</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Rentabilidade 12 meses: {selectedPrev.rentabilidade12m.toFixed(1)}%</span>
          </div>

          <p className="mt-4 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            {selectedPrev.tipo === "PGBL"
              ? "PGBL costuma valer mais pra quem declara Imposto de Renda no modelo completo e pode deduzir até 12% da renda bruta anual."
              : "VGBL costuma valer mais pra quem já usa o limite do PGBL, declara no modelo simplificado, ou é isento de IR."}
          </p>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação calculada pelo peso que o perfil {profile.label.toLowerCase()} dá pra taxa de administração, taxa de carregamento e rentabilidade recente. Previdência é um produto pra pensar em décadas, não em meses — vale conversar com um especialista tributário antes de decidir entre PGBL e VGBL. Dados fictícios nesta versão de protótipo.
          </p>
        </div>
      </div>
      </>
      )}

      {assetClass === "cripto" && (
      <>
      <AssetInfoBlock tabKey="cripto" show={showAssetInfo} onToggle={() => setShowAssetInfo((v) => !v)} />
      <div className="px-5 md:px-10 pt-1">
        <div className="flex items-start gap-3 p-4 rounded-sm mb-6" style={{ background: "rgba(177,74,52,0.12)", border: "1px solid rgba(177,74,52,0.4)" }}>
          <AlertTriangle size={18} color="var(--rust)" className="shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ color: "var(--paper)" }}>
            Criptomoedas são ativos de <strong>altíssimo risco e volatilidade</strong>, sem garantia do FGC ou de qualquer órgão regulador. Oscilações de dois dígitos em um único dia são comuns. Só faz sentido alocar dinheiro que a pessoa pode se dar ao luxo de perder, e o percentual da carteira deve ser pequeno — especialmente pra perfis conservadores e moderados.
          </p>
        </div>
      </div>
      {assetClass === "cripto" && (
      <div className="px-5 pb-6 md:px-10 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <div>
        <AssetSearchBar value={searchCripto} onChange={setSearchCripto} placeholder="Buscar outra criptomoeda..." />
        <div style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
          {rankedCrypto.filter((c) => !searchCripto.trim() || (c.symbol + c.name).toLowerCase().includes(searchCripto.toLowerCase())).map((c, i) => {
            const isActive = c.symbol === selectedCrypto.symbol;
            const cc = classifyCrypto(c.profileScore);
            return (
              <button
                key={c.symbol}
                onClick={() => setCryptoSelectedSymbol(c.symbol)}
                className="w-full flex items-center justify-between py-3 px-2 text-left transition-colors"
                style={{ borderBottom: "1px solid rgba(237,230,214,0.15)", background: isActive ? "rgba(190,154,92,0.12)" : "transparent" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ border: `1.5px solid ${cc.color}`, color: cc.color, fontFamily: "'Roboto Slab', serif" }}>
                    {c.profileScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.symbol}</div>
                    <div className="text-xs" style={{ color: "var(--paper-dim)" }}>{c.name} · #{c.marketCapRank} em cap. de mercado</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: c.variacao12m >= 0 ? "var(--gold)" : "var(--rust)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.variacao12m >= 0 ? "+" : ""}{c.variacao12m.toFixed(1)}%
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--paper-dim)" }}>12 meses</div>
                </div>
              </button>
            );
          })}
        </div>

        {searchCripto.trim() && rankedCrypto.filter((c) => (c.symbol + c.name).toLowerCase().includes(searchCripto.toLowerCase())).length === 0 && (
          <SimulatedAssetCard query={searchCripto} profileLabel={profile.label} />
        )}
        </div>

        <div className="rounded-sm p-5 md:p-7" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
                <Bitcoin size={12} /> #{selectedCrypto.marketCapRank} em capitalização de mercado
              </div>
              <h2 className="text-2xl mt-1" style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700 }}>{selectedCrypto.name}</h2>
              <div className="text-sm mt-1" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{selectedCrypto.symbol} · R$ {selectedCrypto.price.toLocaleString("pt-BR")}</div>
            </div>
            <Seal score={selectedCrypto.profileScore} />
          </div>

          <div className="mt-2 text-sm font-medium" style={{ color: classifyCrypto(selectedCrypto.profileScore).color }}>
            {classifyCrypto(selectedCrypto.profileScore).label}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Volatilidade 30 dias: {selectedCrypto.volatilidade30d.toFixed(0)}%</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Variação 12 meses: {selectedCrypto.variacao12m >= 0 ? "+" : ""}{selectedCrypto.variacao12m.toFixed(1)}%</span>
            <span className="text-xs px-2.5 py-1 rounded-sm" style={{ border: "1px solid rgba(237,230,214,0.25)", color: "var(--paper-dim)" }}>Sem garantia do FGC</span>
          </div>

          <div className="mt-5 relative">
            <button onClick={() => setShowBrokers((v) => !v)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>
              <ShoppingCart size={15} /> Comprar {selectedCrypto.symbol}
            </button>
            {showBrokers && (
              <div className="mt-2 max-w-sm rounded-sm p-3" style={{ background: "var(--ink)", border: "1px solid rgba(190,154,92,0.35)" }}>
                <div className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>Abrir {selectedCrypto.symbol} direto na sua corretora/exchange:</div>
                <div className="space-y-1.5">
                  {BROKERS.map((b) => (
                    <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2 rounded-sm text-sm transition-colors" style={{ border: "1px solid rgba(237,230,214,0.15)", color: "var(--paper)" }}>
                      {b.name} <ExternalLink size={13} color="var(--paper-dim)" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(237,230,214,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--paper)" }}>Já concluiu essa compra? Registre aqui pra entrar automaticamente no seu Fundo de Investimento:</p>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-sm" style={{ background: "var(--panel)", border: "1px solid rgba(237,230,214,0.25)" }}>
                      <span className="text-xs" style={{ color: "var(--paper-dim)", fontFamily: "'JetBrains Mono', monospace" }}>R$</span>
                      <input type="number" min="0" value={confirmValor} onChange={(e) => setConfirmValor(e.target.value)}
                        className="w-full text-xs bg-transparent outline-none" style={{ color: "var(--paper)", fontFamily: "'JetBrains Mono', monospace" }} />
                    </div>
                    <button onClick={() => registrarAplicacao(selectedCrypto.symbol)} className="text-xs font-semibold px-3 py-1.5 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Confirmar aplicação</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: "var(--paper-dim)" }}>
            Pontuação calculada pelo peso que o perfil {profile.label.toLowerCase()} dá pra posição no ranking de mercado, volatilidade, liquidez e valorização recente — mesmo assim, toda a classe de cripto carrega risco muito acima de ações, FIIs e renda fixa. Dados fictícios nesta versão de protótipo.
          </p>
        </div>
      </div>
      )}
      </>
      )}
      </>
      )}

      {/* Botão flutuante da Maat Assistente — acessível em qualquer tela do app, como uma Alexa */}
      <button
        onClick={() => setShowMaatFlutuante(true)}
        className="fixed z-40 flex flex-col items-center justify-center rounded-2xl shadow-lg gap-0.5"
        style={{
          bottom: 20, right: 20, width: 66, height: 66,
          background: "var(--gold)", color: "var(--ink)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
        title="Assistente de voz"
      >
        <Mic size={22} />
        <span style={{ fontSize: 8, fontWeight: 700, lineHeight: 1.1, textAlign: "center" }}>Assistente<br />de voz</span>
      </button>

      {showMaatFlutuante && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-5 py-6"
          style={{ background: "rgba(20,41,31,0.85)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMaatFlutuante(false); }}
        >
          <div className="w-full max-w-sm rounded-sm p-5 overflow-y-auto" style={{ background: "var(--panel)", border: "1px solid var(--gold)", maxHeight: "85vh" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic size={18} color="var(--gold)" />
                <span className="text-sm font-bold" style={{ color: "var(--gold)", fontFamily: "'Roboto Slab', serif" }}>Maat Assistente</span>
              </div>
              <button onClick={() => setShowMaatFlutuante(false)}><X size={18} color="var(--paper-dim)" /></button>
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--paper-dim)" }}>
              Pergunte qualquer coisa sobre sua vida financeira, sobre como usar o app, ou peça pra eu registrar uma despesa ou receita — de qualquer tela, a qualquer momento.
            </p>

            <div className="mb-3">
              <div className="flex gap-2">
                {[{ key: "voz", label: "Por voz" }, { key: "texto", label: "Só por escrito" }].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setConsultorModoResposta(opt.key)}
                    className="px-3 py-1.5 text-xs rounded-sm"
                    style={{
                      background: consultorModoResposta === opt.key ? "var(--gold)" : "transparent",
                      color: consultorModoResposta === opt.key ? "var(--ink)" : "var(--paper-dim)",
                      border: `1px solid ${consultorModoResposta === opt.key ? "var(--gold)" : "rgba(237,230,214,0.25)"}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startVoiceCaptureConsultor}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm w-full justify-center transition-colors"
              style={{ background: isListeningConsultor ? "var(--rust)" : "var(--gold)", color: isListeningConsultor ? "var(--paper)" : "var(--ink)" }}
            >
              {isListeningConsultor ? <MicOff size={16} /> : <Mic size={16} />}
              {isListeningConsultor ? "Ouvindo... fale agora" : "Falar com a Maat"}
            </button>

            {!voiceSupported && (
              <p className="text-[10px] mt-2" style={{ color: "var(--paper-dim)" }}>Reconhecimento de voz não suportado nesse navegador.</p>
            )}

            {consultorQuestion && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(190,154,92,0.3)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--paper-dim)" }}>
                  Você perguntou: <span style={{ color: "var(--paper)" }}>"{consultorQuestion}"</span>
                </p>
                <div className="flex items-start gap-2 p-3 rounded-sm" style={{ background: "var(--ink)" }}>
                  <Volume2 size={14} color="var(--gold)" className="shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--paper)" }}>{consultorResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
