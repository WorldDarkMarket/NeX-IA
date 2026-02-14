import { NextRequest, NextResponse } from "next/server";
import {
  tavilySearch,
  formatSearchResultsForContext,
  shouldSearchWeb,
  extractSearchQuery,
  TavilySearchOptions
} from "@/lib/tavily";

interface SearchRequest {
  query: string;
  searchDepth?: 'basic' | 'advanced';
  topic?: 'general' | 'news';
  maxResults?: number;
  includeAnswer?: boolean;
}

/**
 * GET - Verificar status da API
 */
export async function GET() {
  const hasApiKey = !!process.env.TAVILY_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'ready' : 'not_configured',
    message: hasApiKey 
      ? 'Tavily Search API está configurada e pronta'
      : 'TAVILY_API_KEY não configurada',
    provider: 'Tavily',
    features: ['web_search', 'news_search', 'ai_answer']
  });
}

/**
 * POST - Realizar pesquisa
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, searchDepth, topic, maxResults, includeAnswer } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se a API key está configurada
    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json(
        { 
          error: "TAVILY_API_KEY não configurada",
          hint: "Adicione TAVILY_API_KEY ao seu .env.local"
        },
        { status: 503 }
      );
    }

    // Preparar opções de busca
    const searchOptions: TavilySearchOptions = {
      query: query.trim(),
      searchDepth: searchDepth || 'basic',
      topic: topic || 'general',
      maxResults: maxResults || 5,
      includeAnswer: includeAnswer !== false,
      includeImages: false,
      includeRawContent: false
    };

    // Detectar se é uma busca de notícias
    const newsKeywords = ['notícia', 'news', 'jornal', 'última hora', 'breaking'];
    const isNewsSearch = newsKeywords.some(kw => query.toLowerCase().includes(kw));
    
    if (isNewsSearch) {
      searchOptions.topic = 'news';
      searchOptions.searchDepth = 'advanced';
    }

    // Realizar a busca
    const startTime = Date.now();
    const searchResponse = await tavilySearch(searchOptions);
    const responseTime = Date.now() - startTime;

    // Formatar contexto para IA
    const formattedContext = formatSearchResultsForContext(
      searchResponse.results,
      searchResponse.answer
    );

    return NextResponse.json({
      success: true,
      query: searchResponse.query,
      answer: searchResponse.answer,
      results: searchResponse.results.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      })),
      context: formattedContext,
      meta: {
        responseTime,
        resultCount: searchResponse.results.length,
        topic: searchOptions.topic,
        depth: searchOptions.searchDepth
      }
    });

  } catch (error) {
    console.error("Erro na pesquisa Tavily:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    return NextResponse.json(
      { 
        error: "Erro ao realizar pesquisa",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * Detecta se uma mensagem precisa de pesquisa
 * Endpoint auxiliar para o chat decidir se deve pesquisar
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    const needsSearch = shouldSearchWeb(message);
    const extractedQuery = needsSearch ? extractSearchQuery(message) : null;

    return NextResponse.json({
      needsSearch,
      query: extractedQuery,
      reason: needsSearch 
        ? "Mensagem contém indicadores de tempo real ou atualidades"
        : "Mensagem não requer pesquisa na web"
    });

  } catch (error) {
    console.error("Erro ao detectar necessidade de pesquisa:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
