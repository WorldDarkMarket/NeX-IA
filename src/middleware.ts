import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "nex_session_id";
const SESSION_DURATION_DAYS = 30;

// Gerar UUID v4 simples
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Verificar se já existe cookie de sessão
  const existingSession = request.cookies.get(SESSION_COOKIE_NAME);

  if (!existingSession) {
    // Criar nova sessão
    const sessionId = generateUUID();

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: false, // Precisamos acessar no frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Aplicar a todas as rotas exceto assets estáticos
    "/((?!_next/static|_next/image|favicon.ico|icon|og-image|sw.js|manifest.json).*)",
  ],
};
