// ========================================
// HUGGING FACE API CLIENT
// Modelo: Stable Diffusion XL
// ========================================

const HF_API_URL = "https://api-inference.huggingface.co/models";
const SDXL_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const TIMEOUT_MS = 40000;

export interface HuggingFaceResponse {
  success: boolean;
  image?: string; // base64
  error?: string;
  loading?: boolean;
}

export async function generateImage(
  prompt: string,
  negativePrompt?: string
): Promise<HuggingFaceResponse> {
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Chave da API Hugging Face não configurada",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${HF_API_URL}/${SDXL_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt || "blurry, bad quality, distorted",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Modelo carregando (erro 503)
    if (response.status === 503) {
      const data = await response.json();
      const estimatedTime = data.estimated_time || 20;

      return {
        success: false,
        loading: true,
        error: `O modelo está carregando. Tente novamente em ${Math.ceil(estimatedTime)} segundos.`,
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[HF] Erro:", response.status, errorText);

      return {
        success: false,
        error: "Não foi possível gerar a imagem. Tente novamente.",
      };
    }

    // Resposta é uma imagem binária
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    return {
      success: true,
      image: `data:image/png;base64,${base64Image}`,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: "Tempo limite excedido. Tente novamente.",
      };
    }

    console.error("[HF] Erro:", error);

    return {
      success: false,
      error: "Erro ao conectar com o serviço de geração.",
    };
  }
}

// ========================================
// FUNÇÃO PARA HASH DO PROMPT
// ========================================

export async function hashPrompt(prompt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(prompt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
