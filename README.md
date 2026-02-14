# NeX IA - Terminal de Inteligência Artificial

<p align="center">
  <strong>Serviço de Inteligência Artificial Multi-Modelo</strong><br>
  <em>Powered by IAHub360°</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PWA-Ready-green?style=flat-square" alt="PWA Ready">
  <img src="https://img.shields.io/badge/License-Commercial-red?style=flat-square" alt="License">
</p>

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [API Reference](#api-reference)
- [PWA Features](#pwa-features)
- [SEO & Metadados](#seo--metadados)
- [Deploy](#deploy)
- [Estrutura de Ficheiros](#estrutura-de-ficheiros)
- [Segurança](#segurança)
- [Performance](#performance)
- [Licença](#licença)

---

## 🎯 Visão Geral

**NeX IA** é um terminal de inteligência artificial multi-modelo que oferece uma interface avançada para interação com diferentes modelos de IA através da API OpenRouter. O projeto foi desenhado para funcionar como uma Progressive Web App (PWA), permitindo instalação em dispositivos móveis e desktop.

### Características Principais

| Feature | Descrição |
|---------|-----------|
| **Multi-Modelo** | Suporte a múltiplos modelos de IA (GPT-4, Claude, DeepSeek, Mistral) |
| **4 Modos de Operação** | Normal, Pensante, Engenheiro, Rápido |
| **PWA** | Instalável como app nativo em iOS/Android/Desktop |
| **Offline** | Funcionalidade offline após primeira visita |
| **3D Particles** | Interface visual com Three.js e 45.000 partículas interativas |
| **Audio Engine** | Sistema de áudio sintetizado para feedback |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   HTML/CSS  │  │  Three.js   │  │   Service Worker (PWA)  │  │
│  │  (Static)   │  │  (WebGL)    │  │      (Offline Cache)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Frontend JavaScript                       ││
│  │  • Chat Interface  • Mode Selector  • Audio Engine          ││
│  │  • 3D Particles    • PWA Install   • Service Worker Reg     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Edge/Serverless)             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    /api/chat (POST)                      │    │
│  │  • Request Validation                                     │    │
│  │  • Mode → Model Mapping                                   │    │
│  │  • API Key Management (Server-side)                      │    │
│  │  • OpenRouter Proxy                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     OPENROUTER API                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │  OpenAI   │ │ Anthropic │ │ DeepSeek  │ │   Mistral     │   │
│  │   GPT-4   │ │  Claude   │ │  Coder    │ │   Small       │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais

- **Frontend Estático**: HTML/CSS/JS servido diretamente sem React
- **Backend Proxy**: API route para esconder API keys e fazer proxy
- **Edge Ready**: Compatível com Edge Functions da Vercel
- **Serverless**: Sem estado de servidor, stateless

---

## ⚙️ Stack Tecnológica

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| HTML5 | - | Estrutura semântica |
| CSS3 | - | Estilos e animações |
| JavaScript (ES6+) | - | Lógica cliente |
| Three.js | r128 | Motor 3D WebGL |
| Tailwind CSS | CDN | Utility classes |
| Space Grotesk | Google Fonts | Tipografia principal |
| JetBrains Mono | Google Fonts | Código e monospace |

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Next.js | 16.1 | Framework serverless |
| TypeScript | 5.0 | Type safety |
| App Router | - | Routing system |

### PWA

| Tecnologia | Propósito |
|------------|-----------|
| Service Worker | Cache offline |
| Web App Manifest | Instalação |
| Cache API | Storage |

### APIs Externas

| API | Propósito |
|-----|-----------|
| OpenRouter | Multi-modelo AI gateway |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ ou Bun
- Conta OpenRouter com API Key

### Quick Start

```bash
# Clone o repositório
git clone https://github.com/iahub360/nex-ia.git
cd nex-ia

# Instale dependências
bun install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua API key

# Execute em desenvolvimento
bun run dev

# Build para produção
bun run build
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projeto:

```env
# ===========================================
# OPENROUTER CONFIGURATION
# ===========================================
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# ===========================================
# MODEL CONFIGURATION
# ===========================================
DEFAULT_MODEL=openai/gpt-4o-mini

# Mode-specific models
MODEL_NORMAL=openai/gpt-4o-mini
MODEL_PENSANTE=openai/gpt-4.1
MODEL_PENSANTE_ALT=anthropic/claude-3.5-sonnet
MODEL_ENGENHEIRO=deepseek/deepseek-coder
MODEL_RAPIDO=mistralai/mistral-small

# Security whitelist
ALLOWED_MODELS=openai/gpt-4o-mini,openai/gpt-4.1,anthropic/claude-3.5-sonnet,deepseek/deepseek-coder,mistralai/mistral-small
```

### Mapa de Modos

| Modo | Descrição | Modelo Padrão | Alternativo |
|------|-----------|---------------|-------------|
| `normal` | Assistente versátil | `openai/gpt-4o-mini` | - |
| `pensante` | Análise profunda | `openai/gpt-4.1` | `anthropic/claude-3.5-sonnet` |
| `engenheiro` | Código e técnica | `deepseek/deepseek-coder` | - |
| `rapido` | Respostas curtas | `mistralai/mistral-small` | - |

### Prompts de Sistema

```javascript
const PROMPTS = {
  normal: "Você é um assistente virtual útil e versátil. Responda de forma clara, objetiva, neutra e educada. Use Português de Portugal.",
  
  pensante: "Modo Pensante Ativado. Adote uma postura analítica e filosófica. Examine as questões com profundidade, considere múltiplas perspectivas e dê atenção meticulosa aos detalhes.",
  
  engenheiro: "Modo Engenheiro Ativado. Use terminologia técnica, foque em arquitetura de sistemas, código e soluções lógicas. Seja pragmático e tecnicamente preciso.",
  
  rapido: "Modo Rápido: ON. Linguagem informal e emojis. Respostas curtas, diretas. Max 2 frases."
};
```

---

## 🔌 API Reference

### POST /api/chat

Endpoint principal para comunicação com IA.

#### Request

```http
POST /api/chat HTTP/1.1
Content-Type: application/json

{
  "message": "string",    // Mensagem do utilizador (obrigatório)
  "mode": "string",       // normal|pensante|engenheiro|rapido (obrigatório)
  "model": "string?"      // Override de modelo (opcional)
}
```

#### Response (Sucesso)

```json
{
  "id": "gen-xxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Resposta da IA..."
      },
      "finish_reason": "stop"
    }
  ],
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

#### Response (Erro)

```json
{
  "error": {
    "message": "Descrição do erro",
    "code": 401
  }
}
```

#### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Parâmetros inválidos |
| 401 | API Key não configurada |
| 500 | Erro interno do servidor |

---

## 📱 PWA Features

### Manifest (manifest.json)

```json
{
  "name": "NeX IA - Inteligência Artificial",
  "short_name": "NeX IA",
  "display": "standalone",
  "background_color": "#050505",
  "theme_color": "#00d2ff",
  "orientation": "portrait-primary"
}
```

### Service Worker Features

- **Cache First**: Assets estáticos em cache
- **Network First**: API calls priorizam rede
- **Offline Fallback**: Página offline quando sem conexão

### Instalação

O banner de instalação aparece automaticamente após 5 segundos se:
- Dispositivo móvel ou desktop
- App ainda não instalado
- Utilizador não dispensou anteriormente

```javascript
// Trigger manual de instalação
window.addEventListener('beforeinstallprompt', (e) => {
  e.prompt();
});
```

---

## 🔍 SEO & Metadados

### Meta Tags Implementadas

```html
<!-- Primary -->
<title>NeX IA - Inteligência Artificial | Powered by IAHub360°</title>
<meta name="description" content="Terminal de IA multi-modelo...">
<meta name="keywords" content="NeX IA, Inteligência Artificial, IAHub360...">

<!-- Open Graph -->
<meta property="og:title" content="NeX IA - Inteligência Artificial">
<meta property="og:image" content="/og-image.png">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">

<!-- PWA -->
<meta name="theme-color" content="#00d2ff">
<link rel="manifest" href="/manifest.json">
```

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NeX IA",
  "applicationCategory": "UtilitiesApplication",
  "author": {
    "@type": "Organization",
    "name": "IAHub360°"
  }
}
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configuração Vercel

O projeto está otimizado para **Zero Config** na Vercel:

- ✅ `output: "standalone"` configurado
- ✅ Sem middleware customizado
- ✅ Variáveis de ambiente no dashboard
- ✅ Edge Functions ready

### Variáveis no Vercel Dashboard

1. Settings → Environment Variables
2. Adicione todas as variáveis do `.env.local`
3. Redeploy

### Domínio Customizado

1. Settings → Domains
2. Adicione `nexia.iahub360.com`
3. Configure DNS (CNAME → cname.vercel-dns.com)

---

## 📁 Estrutura de Ficheiros

```
nex-ia/
├── .env.local                 # Variáveis de ambiente (gitignored)
├── next.config.ts            # Configuração Next.js
├── package.json              # Dependências
├── tsconfig.json             # TypeScript config
├── README.md                 # Documentação
│
├── public/
│   ├── nex.html              # Frontend principal (HTML estático)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   ├── icon-192.png          # Ícone PWA 192x192
│   ├── icon-512.png          # Ícone PWA 512x512
│   ├── icon.svg              # Logo vetorial
│   ├── og-image.png          # Open Graph image
│   ├── robots.txt            # SEO robots
│   ├── sitemap.xml           # SEO sitemap
│   └── logo.svg              # Logo original
│
└── src/
    └── app/
        ├── page.tsx          # Redirect para /nex.html
        ├── layout.tsx        # Layout Next.js
        ├── globals.css       # Estilos globais
        └── api/
            ├── route.ts      # API base
            └── chat/
                └── route.ts  # Endpoint /api/chat
```

---

## 🔒 Segurança

### API Keys

- **Nunca** expor API keys no cliente
- Keys armazenadas apenas em `process.env` server-side
- Validação de modelos permitidos via `ALLOWED_MODELS`

### Headers de Segurança

```typescript
// Configurar em next.config.ts se necessário
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' }
      ]
    }];
  }
};
```

### Validação de Input

```typescript
// Validação no endpoint /api/chat
if (!message || typeof message !== 'string') {
  return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
}

if (!ALLOWED_MODELS.includes(model)) {
  return NextResponse.json({ error: 'Modelo não permitido' }, { status: 400 });
}
```

---

## ⚡ Performance

### Otimizações Implementadas

| Área | Otimização |
|------|------------|
| **Images** | Formato WebP, lazy loading |
| **Fonts** | Google Fonts com display=swap |
| **JS** | Mínimo JavaScript, sem frameworks pesados |
| **CSS** | Critical CSS inline, animações GPU |
| **3D** | 20k partículas em mobile, 45k em desktop |
| **Cache** | Service Worker com estratégias otimizadas |

### Lighthouse Scores (Estimado)

| Métrica | Score |
|---------|-------|
| Performance | 90+ |
| Accessibility | 85+ |
| Best Practices | 95+ |
| SEO | 100 |
| PWA | ✅ |

### Web Vitals Targets

| Métrica | Target |
|---------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

---

## 🧪 Testing

### Testar API Localmente

```bash
# Teste endpoint /api/chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá","mode":"normal"}'
```

### Testar PWA

1. Chrome DevTools → Application → Manifest
2. Chrome DevTools → Application → Service Workers
3. Lighthouse → Generate Report (PWA)

---

## 🐛 Troubleshooting

### Problemas Comuns

#### "API Key não configurada"
```
Solução: Verifique se OPENROUTER_API_KEY está definida em .env.local
```

#### "Service Worker não registra"
```
Solução: Use HTTPS em produção. SW requer contexto seguro.
```

#### "PWA não instala"
```
Solução: Verifique se manifest.json está acessível e válido.
```

#### "Partículas lentas em mobile"
```
Solução: O sistema automaticamente usa 20k partículas em mobile.
```

---

## 📊 Monitorização

### Logs Recomendados

```typescript
// Adicionar em produção
console.log('[NeX IA] Request:', { mode, model, tokens });
console.log('[NeX IA] Error:', error.message);
```

### Analytics (Opcional)

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

---

## 🔄 Changelog

### v1.0.0 (2025-02-14)
- Release inicial
- Backend proxy OpenRouter
- 4 modos de operação
- PWA completo
- SEO otimizado
- Footer "Powered by IAHub360°"

---

## 👥 Contribuição

Este é um projeto proprietário da IAHub360 Ltd. Para contribuições, contacte a equipa de desenvolvimento.

---

## 📞 Suporte

- **Email**: suporte@iahub360.com
- **Website**: https://iahub360.com
- **Documentação**: https://docs.iahub360.com/nex-ia

---

## 📜 Licença

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                    LICENÇA COMERCIAL                              ║
║                       IAHub360 Ltd                                ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

Copyright © 2025 IAHub360 Ltd. Todos os direitos reservados.

Este software e toda a documentação associada ("Software") são propriedade 
exclusiva da IAHub360 Ltd e são protegidos por leis de direito autoral e 
propriedade intelectual.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    TERMOS DE LICENÇA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CONCESSÃO DE LICENÇA

   A IAHub360 Ltd concede ao Licenciado uma licença não exclusiva, 
   intransferível e revogável para utilizar o Software exclusivamente 
   para fins comerciais autorizados pela IAHub360 Ltd.

2. RESTRIÇÕES

   O Licenciado NÃO pode:
   
   a) Copiar, modificar, distribuir ou criar obras derivadas do Software
      sem autorização expressa por escrito da IAHub360 Ltd;
   
   b) Realizar engenharia reversa, descompilar ou desmontar o Software;
   
   c) Alugar, arrendar, emprestar ou sublicenciar o Software;
   
   d) Remover ou alterar quaisquer avisos de direitos autorais;
   
   e) Utilizar o Software para fins ilegais ou não autorizados;
   
   f) Transferir ou ceder esta licença a terceiros.

3. PROPRIEDADE INTELECTUAL

   O Software é protegido por leis de direitos autorais e tratados 
   internacionais. A IAHub360 Ltd mantém todos os direitos, títulos e 
   interesses sobre o Software, incluindo todas as cópias e modificações.

4. MARCAS REGISTADAS

   "NeX IA", "IAHub360", "IAHub360°" e respetivos logos são marcas 
   registadas da IAHub360 Ltd. A utilização destas marcas requer 
   autorização prévia por escrito.

5. GARANTIA

   O SOFTWARE É FORNECIDO "TAL COMO ESTÁ", SEM GARANTIAS DE QUALQUER 
   TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, SEM LIMITAÇÃO, GARANTIAS 
   DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM FIM ESPECÍFICO E NÃO VIOLAÇÃO.

   A IAHUB360 LTD NÃO SE RESPONSABILIZA POR QUAISQUER DANOS DIRETOS, 
   INDIRETOS, INCIDENTAIS, ESPECIAIS OU CONSEQUENCIAIS RESULTANTES 
   DA UTILIZAÇÃO OU INCAPACIDADE DE UTILIZAÇÃO DO SOFTWARE.

6. LIMITAÇÃO DE RESPONSABILIDADE

   Em nenhum caso a responsabilidade total da IAHub360 Ltd excederá 
   o valor da licença paga pelo Licenciado.

7. TERMINAÇÃO

   Esta licença é válida enquanto o Licenciado cumprir os termos 
   aqui estabelecidos. Em caso de violação, a IAHub360 Ltd pode 
   terminar esta licença imediatamente, sem aviso prévio.

8. LEI APLICÁVEL

   Esta licença é regida pelas leis de Portugal. Qualquer litígio 
   será submetido à jurisdição exclusiva dos tribunais portugueses.

9. CONTACTO

   Para questões de licenciamento:
   
   IAHub360 Ltd
   Email: legal@iahub360.com
   Web: https://iahub360.com/legal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ao utilizar este Software, o Licenciado concorda com todos os termos 
acima descritos.

© 2025 IAHub360 Ltd. Todos os direitos reservados.
```

---

<p align="center">
  <strong>NeX IA</strong><br>
  <em>Powered by IAHub360°</em><br><br>
  <a href="https://iahub360.com">Website</a> •
  <a href="https://docs.iahub360.com">Documentação</a> •
  <a href="mailto:suporte@iahub360.com">Suporte</a>
</p>
