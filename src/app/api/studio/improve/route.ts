import { NextRequest, NextResponse } from "next/server";
import { improvePrompt, validatePrompt } from "@/lib/promptEngine";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // Obter sessão
    const session = await getSession();

    // Parse do body
    const body = await request.json();
    const { idea } = body;

    if (!idea) {
      return NextResponse.json(
        { error: "Descreva sua ideia para a imagem" },
        { status: 400 }
      );
    }

    // Validar prompt
    const validation = validatePrompt(idea);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Melhorar prompt
    const result = await improvePrompt(idea);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      original: result.original,
      optimized: result.optimized,
      negativePrompt: result.negativePrompt,
    });
  } catch (error) {
    console.error("[API/improve] Erro:", error);

    return NextResponse.json(
      { error: "Não foi possível processar sua ideia. Tente novamente." },
      { status: 500 }
    );
  }
}
