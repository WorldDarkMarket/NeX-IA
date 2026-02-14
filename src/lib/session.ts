// ========================================
// SESSÃO ANÔNIMA - Leitura do cookie
// (Cookie é criado via middleware)
// ========================================

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "nex_session_id";

export interface SessionData {
  id: string;
  exists: boolean;
}

// Obter sessão atual (leitura apenas)
export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    return {
      id: sessionCookie.value,
      exists: true,
    };
  }

  // Se não existe, retorna ID temporário
  // O middleware criará o cookie na próxima request
  return {
    id: "pending",
    exists: false,
  };
}

// Obter ID da sessão atual (para uso no cliente)
export function getSessionIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((c) =>
    c.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
  );

  if (!sessionCookie) return null;

  return sessionCookie.split("=")[1].trim();
}

// Verificar se sessão é válida
export function isValidSession(sessionId: string | null | undefined): boolean {
  if (!sessionId) return false;

  // UUID v4 formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(sessionId);
}
