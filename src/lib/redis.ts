import { Redis } from "@upstash/redis";

// Cliente Redis Singleton
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn("[Redis] Credenciais não configuradas - modo offline");
      // Retornar cliente mock para desenvolvimento
      return createMockRedis();
    }

    redis = new Redis({ url, token });
  }

  return redis;
}

// Mock Redis para desenvolvimento sem credenciais
function createMockRedis(): Redis {
  const store = new Map<string, { value: unknown; expires?: number }>();

  return {
    async get<T>(key: string): Promise<T | null> {
      const item = store.get(key);
      if (!item) return null;
      if (item.expires && Date.now() > item.expires) {
        store.delete(key);
        return null;
      }
      return item.value as T;
    },

    async set(key: string, value: unknown, options?: { ex?: number }): Promise<"OK"> {
      const expires = options?.ex ? Date.now() + options.ex * 1000 : undefined;
      store.set(key, { value, expires });
      return "OK";
    },

    async del(key: string): Promise<number> {
      return store.delete(key) ? 1 : 0;
    },

    async exists(key: string): Promise<number> {
      const item = store.get(key);
      if (!item) return 0;
      if (item.expires && Date.now() > item.expires) {
        store.delete(key);
        return 0;
      }
      return 1;
    },

    async expire(key: string, seconds: number): Promise<number> {
      const item = store.get(key);
      if (!item) return 0;
      item.expires = Date.now() + seconds * 1000;
      return 1;
    },

    async incr(key: string): Promise<number> {
      const item = store.get(key);
      const newValue = ((item?.value as number) || 0) + 1;
      store.set(key, { value: newValue, expires: item?.expires });
      return newValue;
    },

    async lpush(key: string, ...values: unknown[]): Promise<number> {
      let item = store.get(key);
      if (!item) {
        item = { value: [] };
        store.set(key, item);
      }
      const list = item.value as unknown[];
      list.unshift(...values);
      return list.length;
    },

    async lrange(key: string, start: number, stop: number): Promise<unknown[]> {
      const item = store.get(key);
      if (!item) return [];
      const list = item.value as unknown[];
      return list.slice(start, stop === -1 ? undefined : stop + 1);
    },

    async ltrim(key: string, start: number, stop: number): Promise<"OK"> {
      const item = store.get(key);
      if (!item) return "OK";
      const list = item.value as unknown[];
      const trimmed = list.slice(start, stop + 1);
      store.set(key, { value: trimmed, expires: item.expires });
      return "OK";
    },

    async llen(key: string): Promise<number> {
      const item = store.get(key);
      if (!item) return 0;
      return (item.value as unknown[]).length;
    },
  } as unknown as Redis;
}

// ========================================
// KEYS HELPERS
// ========================================

export const RedisKeys = {
  // Chat memory - últimas 10 mensagens, TTL 30min
  chatMemory: (sessionId: string) => `memory:chat:${sessionId}`,

  // Studio usage - contador diário, TTL 24h
  studioUsage: (sessionId: string) => `studio:usage:${sessionId}`,

  // Studio image cache, TTL 6h
  studioImage: (promptHash: string) => `studio:image:${promptHash}`,

  // Session data, TTL 30 dias
  session: (sessionId: string) => `session:${sessionId}`,
};

// ========================================
// CHAT MEMORY FUNCTIONS
// ========================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  mode: string;
  timestamp: number;
}

export async function saveChatMessage(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  const redis = getRedis();
  const key = RedisKeys.chatMemory(sessionId);

  // Adicionar mensagem
  await redis.lpush(key, JSON.stringify(message));

  // Manter apenas últimas 10
  await redis.ltrim(key, 0, 9);

  // TTL 30 minutos
  await redis.expire(key, 1800);
}

export async function getChatHistory(
  sessionId: string
): Promise<ChatMessage[]> {
  const redis = getRedis();
  const key = RedisKeys.chatMemory(sessionId);

  const messages = await redis.lrange(key, 0, -1);

  return messages
    .reverse()
    .map((m) => (typeof m === "string" ? JSON.parse(m) : m)) as ChatMessage[];
}

// ========================================
// STUDIO USAGE FUNCTIONS
// ========================================

const MAX_GENERATIONS_PER_DAY = 2;

export async function incrementStudioUsage(
  sessionId: string
): Promise<{ count: number; limitReached: boolean }> {
  const redis = getRedis();
  const key = RedisKeys.studioUsage(sessionId);

  const count = await redis.incr(key);

  // TTL 24h na primeira vez
  if (count === 1) {
    await redis.expire(key, 86400);
  }

  return {
    count,
    limitReached: count > MAX_GENERATIONS_PER_DAY,
  };
}

export async function getStudioUsage(
  sessionId: string
): Promise<{ count: number; remaining: number }> {
  const redis = getRedis();
  const key = RedisKeys.studioUsage(sessionId);

  const count = (await redis.get<number>(key)) || 0;

  return {
    count,
    remaining: Math.max(0, MAX_GENERATIONS_PER_DAY - count),
  };
}

// ========================================
// IMAGE CACHE FUNCTIONS
// ========================================

export async function cacheImage(
  promptHash: string,
  imageData: string
): Promise<void> {
  const redis = getRedis();
  const key = RedisKeys.studioImage(promptHash);

  // TTL 6 horas
  await redis.set(key, imageData, { ex: 21600 });
}

export async function getCachedImage(
  promptHash: string
): Promise<string | null> {
  const redis = getRedis();
  const key = RedisKeys.studioImage(promptHash);

  return redis.get<string>(key);
}
