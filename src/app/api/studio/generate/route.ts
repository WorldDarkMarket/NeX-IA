import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { incrementStudioUsage, getStudioUsage, getCachedImage, cacheImage, MAX_GENERATIONS_PER_DAY } from "@/lib/redis";
import { generateImage, hashPrompt } from "@/lib/huggingface";
import { validatePrompt } from "@/lib/promptEngine";

export async function POST(request: NextRequest) {
  try {
    // Obter sessão
    const session = await getSession();

    // Verificar limite de uso
    const usage = await getStudioUsage(session.id);

    if (usage.remaining <= 0) {
      return NextResponse.json(
        {
          error: "Limite diário atingido",
          message: `Você já usou suas ${MAX_GENERATIONS_PER_DAY} gerações de hoje. Tente novamente amanhã.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Parse do body
    const body = await request.json();
    const { prompt, negativePrompt, skipCache } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    // Validar prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Verificar cache
    const promptHash = await hashPrompt(prompt);

    if (!skipCache) {
      const cachedImage = await getCachedImage(promptHash);
      if (cachedImage) {
        return NextResponse.json({
          success: true,
          image: cachedImage,
          cached: true,
          remaining: usage.remaining,
        });
      }
    }

    // Gerar imagem
    const result = await generateImage(prompt, negativePrompt);

    if (!result.success) {
      // Incrementar uso mesmo em falha para evitar abuso
      await incrementStudioUsage(session.id);

      return NextResponse.json(
        {
          error: result.error,
          loading: result.loading,
          remaining: usage.remaining - 1,
        },
        { status: result.loading ? 202 : 500 }
      );
    }

    // Incrementar uso
    const newUsage = await incrementStudioUsage(session.id);

    // Cachear imagem
    if (result.image) {
      await cacheImage(promptHash, result.image);
    }

    return NextResponse.json({
      success: true,
      image: result.image,
      cached: false,
      remaining: Math.max(0, MAX_GENERATIONS_PER_DAY - newUsage.count),
    });
  } catch (error) {
    console.error("[API/generate] Erro:", error);

    return NextResponse.json(
      { error: "Erro ao gerar imagem. Tente novamente." },
      { status: 500 }
    );
  }
}

// Endpoint para verificar uso
export async function GET() {
  try {
    const session = await getSession();
    const usage = await getStudioUsage(session.id);

    return NextResponse.json({
      sessionId: session.id,
      used: usage.count,
      remaining: usage.remaining,
      limit: MAX_GENERATIONS_PER_DAY,
    });
  } catch (error) {
    console.error("[API/generate] Erro ao verificar uso:", error);

    return NextResponse.json(
      { error: "Erro ao verificar uso" },
      { status: 500 }
    );
  }
}
