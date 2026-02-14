import { NextRequest, NextResponse } from "next/server";

// Prompts para cada modo
const PROMPTS: Record<string, string> = {
  normal: "Você é um assistente virtual útil e versátil, similar ao comportamento padrão do Gemini. Responda de forma clara, objetiva, neutra e educada. Use Português de Portugal.",
  pensante: "Modo Pensante Ativado. Adote uma postura analítica e filosófica. Não tenha pressa. Examine as questões com profundidade, considere múltiplas perspectivas e dê atenção meticulosa aos detalhes e nuances. Suas respostas devem ser reflexivas e bem fundamentadas.",
  engenheiro: "Modo Engenheiro Ativado. Sua persona é uma fusão de cientista de dados e hacker techno. Use terminologia técnica, foque em 'how-to', arquitetura de sistemas, código e soluções lógicas. Seja pragmático, cético e tecnicamente preciso.",
  rapido: "Modo Rápido: ON. Fala como um jovem da Gen Z! Usa gírias, linguagem informal e emojis 😎. Respostas curtas, diretas e sem enrolação. Max 2 frases. Vai direto ao assunto! ⚡🚀",
  pesquisa: "Você é um assistente de pesquisa web. Sua função é analisar resultados de busca e apresentar informações de forma clara e organizada. SEMPRE cite as fontes usando [1], [2], etc. quando usar informações dos resultados. Seja preciso e objetivo. Use Português de Portugal."
};

// Mapa de modos para variáveis de ambiente
const MODE_TO_ENV: Record<string, string> = {
  normal: "MODEL_NORMAL",
  pensante: "MODEL_PENSANTE",
  engenheiro: "MODEL_ENGENHEIRO",
  rapido: "MODEL_RAPIDO",
  pesquisa: "MODEL_PESQUISA"
};

// Modelos padrão caso ENV não esteja definida
const DEFAULT_MODELS: Record<string, string> = {
  normal: "openai/gpt-4o-mini",
  pensante: "openai/gpt-4.1",
  engenheiro: "deepseek/deepseek-coder",
  rapido: "mistralai/mistral-small",
  pesquisa: "openai/gpt-4o-mini"
};

interface ChatRequest {
  message: string;
  mode: string;
  model?: string;
  searchResults?: string; // Contexto de pesquisa
}

// Indicadores de que precisa pesquisar
const SEARCH_INDICATORS = [
  // Tempo/atual
  'hoje', 'agora', 'atual', 'recente', 'último', 'última', 'ontem',
  // Notícias
  'notícia', 'noticias', 'jornal', 'falando sobre', 'saiu sobre',
  // Preços/mercado
  'preço', 'valor', 'cotação', 'mercado', 'ação', 'ações', 'bolsa',
  // Eventos
  'quando', 'onde', 'quem ganhou', 'resultado', 'placar',
  // Comparação temporal
  'este ano', 'este mês', 'esta semana', 'em 2024', 'em 2025',
  // Internet
  'pesquise', 'busque', 'procure', 'encontre na web', 'na internet',
  // Verificação de fatos
  'é verdade', 'confirme', 'verifique', 'fake news',
  // Eventos específicos
  'jogos olímpicos', 'copa do mundo', 'eleição', 'eleições'
];

function shouldSearchWeb(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SEARCH_INDICATORS.some(indicator => lowerMessage.includes(indicator));
}

async function performSearch(query: string): Promise<{ answer?: string; context: string; results: Array<{ title: string; url: string; content: string }> }> {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    return { context: "", results: [] };
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      console.error("Tavily API error:", response.status);
      return { context: "", results: [] };
    }

    const data = await response.json();
    
    // Formatar contexto
    let context = '';
    if (data.answer) {
      context += `RESUMO: ${data.answer}\n\n`;
    }
    
    if (data.results && data.results.length > 0) {
      context += 'FONTES:\n';
      data.results.forEach((result: { title: string; url: string; content: string }, index: number) => {
        context += `\n[${index + 1}] ${result.title}\n${result.content?.substring(0, 300) || ''}\n`;
      });
    }

    return {
      answer: data.answer,
      context,
      results: data.results || []
    };
  } catch (error) {
    console.error("Search error:", error);
    return { context: "", results: [] };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, mode, model: overrideModel, searchResults } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (!mode) {
      return NextResponse.json(
        { error: "Modo é obrigatório" },
        { status: 400 }
      );
    }

    // Determinar o modelo a usar
    let selectedModel: string;

    if (overrideModel) {
      const allowedModels = process.env.ALLOWED_MODELS?.split(",") || [];
      if (allowedModels.length > 0 && !allowedModels.includes(overrideModel)) {
        return NextResponse.json(
          { error: "Modelo não permitido" },
          { status: 400 }
        );
      }
      selectedModel = overrideModel;
    } else {
      const modeLower = mode.toLowerCase();
      const envKey = MODE_TO_ENV[modeLower];

      if (envKey) {
        selectedModel = process.env[envKey] || DEFAULT_MODELS[modeLower] || process.env.DEFAULT_MODEL || "openai/gpt-4o-mini";
      } else {
        selectedModel = process.env.DEFAULT_MODEL || "openai/gpt-4o-mini";
      }
    }

    // Obter prompt do modo
    const modeLower = mode.toLowerCase();
    let systemPrompt = PROMPTS[modeLower] || PROMPTS.normal;

    // Preparar mensagem do usuário
    let userMessage = message;
    let searchContext = searchResults || "";

    // Se modo pesquisa ou detectou necessidade, realizar busca
    const needsSearch = modeLower === 'pesquisa' || shouldSearchWeb(message);
    
    if (needsSearch && !searchResults && process.env.TAVILY_API_KEY) {
      const searchResult = await performSearch(message);
      searchContext = searchResult.context;
      
      if (searchResult.answer) {
        // Se temos resposta do Tavily, podemos usá-la diretamente
        systemPrompt += `\n\nVocê tem acesso a resultados de pesquisa em tempo real. Use estas informações para responder. Cite as fontes quando relevante.\n\n${searchContext}`;
      }
    }

    if (searchContext) {
      userMessage = `Contexto de pesquisa:\n${searchContext}\n\nPergunta do usuário: ${message}`;
    }

    // Obter API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: "API Key não configurada no servidor", code: 401 } },
        { status: 401 }
      );
    }

    // Construir URL do site para header HTTP-Referer
    const siteUrl = request.headers.get("host")
      ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`
      : "http://localhost:3000";

    // Chamar OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": "NeX IA Terminal",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await openRouterResponse.json();

    // Adicionar metadados de pesquisa se houve busca
    if (needsSearch && searchContext) {
      data._searchPerformed = true;
    }

    // Retornar resposta RAW do OpenRouter
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro no proxy:", error);
    return NextResponse.json(
      { error: { message: "Erro interno do servidor", code: 500 } },
      { status: 500 }
    );
  }
}
