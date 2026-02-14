/**
 * Tavily Search Service
 * API de pesquisa otimizada para aplicações de IA
 * https://tavily.com
 */

export interface TavilySearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  answer?: string;
  images?: string[];
  follow_up_questions?: string[];
  query: string;
  response_time: number;
}

export interface TavilySearchOptions {
  query: string;
  searchDepth?: 'basic' | 'advanced';  // basic = rápido, advanced = profundo
  topic?: 'general' | 'news';           // tipo de busca
  days?: number;                        // para news, dias atrás
  maxResults?: number;                  // max 10
  includeImages?: boolean;
  includeAnswer?: boolean;              // resposta gerada por IA
  includeRawContent?: boolean;
  followUpQuestions?: boolean;
}

/**
 * Realiza uma pesquisa usando a API do Tavily
 */
export async function tavilySearch(
  options: TavilySearchOptions
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY não configurada no ambiente');
  }

  const {
    query,
    searchDepth = 'basic',
    topic = 'general',
    days = 3,
    maxResults = 5,
    includeImages = false,
    includeAnswer = true,
    includeRawContent = false,
    followUpQuestions = false
  } = options;

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: searchDepth,
      topic,
      days,
      max_results: Math.min(maxResults, 10),
      include_images: includeImages,
      include_answer: includeAnswer,
      include_raw_content: includeRawContent,
      follow_up_questions: followUpQuestions
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Formata os resultados da pesquisa para contexto do chat
 */
export function formatSearchResultsForContext(
  results: TavilySearchResult[],
  answer?: string
): string {
  let context = '';

  if (answer) {
    context += `📝 RESUMO: ${answer}\n\n`;
  }

  if (results.length > 0) {
    context += '🔍 FONTES:\n';
    results.forEach((result, index) => {
      context += `\n[${index + 1}] ${result.title}\n`;
      context += `    ${result.content.substring(0, 300)}${result.content.length > 300 ? '...' : ''}\n`;
      context += `    🔗 ${result.url}\n`;
    });
  }

  return context;
}

/**
 * Detecta se uma pergunta precisa de pesquisa na web
 */
export function shouldSearchWeb(message: string): boolean {
  const searchIndicators = [
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

  const lowerMessage = message.toLowerCase();
  
  return searchIndicators.some(indicator => lowerMessage.includes(indicator));
}

/**
 * Extrai termos de busca da mensagem
 */
export function extractSearchQuery(message: string): string {
  // Remove palavras comuns e extras
  const stopWords = ['pesquise', 'procure', 'busque', 'encontre', 'me diga', 'qual é', 'quais são', 'sobre', 'na web', 'na internet'];
  
  let query = message.toLowerCase();
  
  stopWords.forEach(word => {
    query = query.replace(new RegExp(word, 'gi'), '');
  });
  
  return query.trim();
}
