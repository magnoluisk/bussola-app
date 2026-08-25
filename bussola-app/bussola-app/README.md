# Bússola — Projeto Web

Projeto real (Vite + React + Tailwind), pronto pra ser publicado numa URL
pública e testado no navegador do celular ou computador de qualquer pessoa.

## Estrutura

```
bussola-app/
├── src/
│   ├── App.jsx                          → tela inicial + rotas
│   ├── apps/
│   │   ├── BussolaEducacaoDeInvestimentos.jsx   → app completo
│   │   └── BussolaVidaFinanceira.jsx            → app simples
│   ├── main.jsx
│   └── index.css
├── public/manifest.json                 → configuração de PWA
└── index.html
```

Ao abrir a URL raiz (`/`), a pessoa vê uma tela simples pra escolher qual
dos dois produtos abrir. Cada um também tem sua própria URL direta:
`/investimentos` e `/vida-financeira`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/` — já testei esse build aqui e ele compila limpo.

## Publicando numa URL pública (o passo que falta pra "subir pra cima")

Recomendo **Vercel** ou **Netlify** — os dois têm plano gratuito, deploy em
minutos, e detectam projeto Vite automaticamente.

### Vercel (mais simples)

1. Suba esta pasta pra um repositório no GitHub
2. Entre em vercel.com, clique em "Add New Project", conecte o repositório
3. A Vercel detecta Vite sozinha — não precisa configurar nada
4. Clique em Deploy. Em ~1 minuto você tem uma URL tipo
   `https://bussola-seu-usuario.vercel.app`

### Netlify (alternativa igual de simples)

1. Mesma coisa: suba pro GitHub
2. Em netlify.com, "Add new site" → "Import an existing project"
3. Build command: `npm run build` — Publish directory: `dist`
4. Deploy

Depois do primeiro deploy, qualquer atualização que fizermos nos arquivos
(e você suba pro GitHub) publica automaticamente — sem passo manual.

## Transformando em PWA de verdade (ícone na tela inicial)

O `index.html` e o `public/manifest.json` já têm a configuração básica.
Falta só um ícone de verdade: gere um PNG quadrado (ex: 512x512, com o
símbolo da bússola) e coloque em `public/icon-512.png`, depois referencie
no `manifest.json` — te aviso quando você tiver a arte pronta e eu ajusto.

## Conectando o backend de dados reais

O `.env.example` já tem a variável `VITE_API_URL` apontando pro backend
que criamos (`bussola-backend/`). Os componentes ainda usam os dados
mockados (`COMPANIES`, `FIXED_INCOME` etc.) — trocar isso por chamadas
reais ao backend é o próximo passo técnico, depois que a URL pública
estiver no ar e você já estiver testando com pessoas reais.

## O que falta pra virar produto "de verdade"

1. ✅ Projeto real montado, buildando limpo
2. ⬜ Deploy numa URL pública (Vercel/Netlify) — passo seguinte
3. ⬜ Ícone de PWA
4. ⬜ Conectar o front-end ao backend de dados reais
5. ⬜ Login de usuário + banco de dados (pra dados persistirem entre acessos)
