import { NextRequest, NextResponse } from "next/server";

// Prompts para cada modo
const PROMPTS: Record<string, string> = {
  normal: "Você é um assistente virtual útil e versátil, similar ao comportamento padrão de outras IA como Gemini, ChatGPT e outras. Responda de forma clara, objetiva, neutra e educada. Use Português do Brasil.",
  pensante: "Modo Pensante Ativado. Adote uma postura analítica e filosófica. Não tenha pressa. Examine as questões com profundidade, considere múltiplas perspectivas e dê atenção meticulosa aos detalhes e nuances. Suas respostas devem ser reflexivas e bem fundamentadas. Use Português do Brasil.",
  engenheiro: "Modo Engenheiro Ativado. Sua persona é uma fusão de cientista de dados e hacker techno. Use terminologia técnica, foque em 'how-to', arquitetura de sistemas, código e soluções lógicas. Seja pragmático, cético e tecnicamente preciso. Use Português do Brasil.",
  rapido: "Modo Rápido: ON. Fala como um jovem da Gen Z! Usa gírias, linguagem informal e emojis 😎. Respostas curtas, diretas e sem enrolação. Max 2 frases. Vai direto ao assunto! ⚡🚀 Use Português do Brasil."
};

// Mapa de modos para variáveis de ambiente
const MODE_TO_ENV: Record<string, string> = {
  normal: "MODEL_NORMAL",
  pensante: "MODEL_PENSANTE",
  engenheiro: "MODEL_ENGENHEIRO",
  rapido: "MODEL_RAPIDO"
};

// Modelos padrão caso ENV não esteja definida
const DEFAULT_MODELS: Record<string, string> = {
  normal: "openai/gpt-4o-mini",
  pensante: "openai/gpt-4.1",
  engenheiro: "deepseek/deepseek-coder",
  rapido: "mistralai/mistral-small"
};

interface ChatRequest {
  message: string;
  mode: string;
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, mode, model: overrideModel } = body;

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
      // Se modelo foi especificado, verificar se está na lista permitida
      const allowedModels = process.env.ALLOWED_MODELS?.split(",") || [];
      if (allowedModels.length > 0 && !allowedModels.includes(overrideModel)) {
        return NextResponse.json(
          { error: "Modelo não permitido" },
          { status: 400 }
        );
      }
      selectedModel = overrideModel;
    } else {
      // Mapear modo para modelo
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
    const systemPrompt = PROMPTS[modeLower] || PROMPTS.normal;

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
          { role: "user", content: message }
        ]
      })
    });

    const data = await openRouterResponse.json();

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
