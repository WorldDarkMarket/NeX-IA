// ========================================
// PROMPT ENGINE - Otimização para SDXL
// ========================================

import ZAI from "z-ai-web-dev-sdk";

// Template de sistema para melhorar prompts
const PROMPT_IMPROVER_SYSTEM = `Você é um especialista em prompt engineering para Stable Diffusion XL.

Sua tarefa é transformar descrições simples em prompts otimizados para geração de imagens de alta qualidade.

REGRAS:
1. Manter o conceito original do usuário
2. Adicionar detalhes de qualidade: lighting, composition, style
3. Incluir termos técnicos de arte digital quando apropriado
4. Formato: descrição principal, seguida de modificadores separados por vírgula
5. Máximo 150 palavras
6. Sempre em inglês (SDXL funciona melhor em inglês)
7. NÃO usar aspas no prompt final
8. NÃO explicar, apenas retorne o prompt otimizado

EXEMPLOS:

Input: "um gato fofo"
Output: adorable fluffy cat with large expressive eyes, soft fur texture, warm ambient lighting, shallow depth of field, professional pet photography, 8k resolution, highly detailed, cinematic composition

Input: "paisagem futurista"
Output: futuristic cyberpunk cityscape, neon lights reflecting on wet streets, flying vehicles, towering skyscrapers, atmospheric fog, volumetric lighting, blade runner inspired, ultra detailed, 8k render, concept art style

Input: "uma flor bonita"
Output: exquisite blooming flower with delicate petals, morning dew drops, soft natural lighting, macro photography, shallow depth of field, vibrant colors, botanical illustration style, highly detailed, 8k quality`;

// Modificadores de qualidade padrão
const QUALITY_MODIFIERS = [
  "highly detailed",
  "8k resolution",
  "professional quality",
  "sharp focus",
  "masterpiece",
];

const NEGATIVE_PROMPT = `
blurry, low quality, distorted, deformed, ugly, bad anatomy,
watermark, signature, text, logo, cropped, out of frame,
worst quality, low resolution, jpeg artifacts, duplicate,
morbid, mutilated, extra fingers, poorly drawn hands,
poorly drawn face, mutation, mutated, extra limbs
`.replace(/\s+/g, " ").trim();

export interface ImprovedPrompt {
  original: string;
  optimized: string;
  negativePrompt: string;
}

export async function improvePrompt(userIdea: string): Promise<ImprovedPrompt> {
  try {
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: PROMPT_IMPROVER_SYSTEM },
        { role: "user", content: userIdea },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const optimizedPrompt = completion.choices?.[0]?.message?.content || userIdea;

    // Garantir que modificadores de qualidade estão presentes
    let finalPrompt = optimizedPrompt;

    // Adicionar modificadores se não estiverem presentes
    const hasQualityMod = QUALITY_MODIFIERS.some((mod) =>
      finalPrompt.toLowerCase().includes(mod.toLowerCase())
    );

    if (!hasQualityMod) {
      finalPrompt = `${optimizedPrompt}, highly detailed, 8k resolution, professional quality`;
    }

    return {
      original: userIdea,
      optimized: finalPrompt,
      negativePrompt: NEGATIVE_PROMPT,
    };
  } catch (error) {
    console.error("[PromptEngine] Erro:", error);

    // Fallback: retornar prompt básico com modificadores
    return {
      original: userIdea,
      optimized: `${userIdea}, highly detailed, 8k resolution, professional quality, cinematic lighting`,
      negativePrompt: NEGATIVE_PROMPT,
    };
  }
}

// ========================================
// VALIDAÇÃO DE PROMPT
// ========================================

export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length < 3) {
    return { valid: false, error: "Descreva sua ideia com mais detalhes" };
  }

  if (prompt.length > 500) {
    return { valid: false, error: "Descrição muito longa. Seja mais conciso." };
  }

  // Palavras bloqueadas (conteúdo sensível)
  const blockedWords = ["nsfw", "nude", "porn", "explicit", "adult content"];
  const lowerPrompt = prompt.toLowerCase();

  for (const word of blockedWords) {
    if (lowerPrompt.includes(word)) {
      return { valid: false, error: "Conteúdo não permitido" };
    }
  }

  return { valid: true };
}
