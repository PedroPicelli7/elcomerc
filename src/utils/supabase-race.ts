// src/utils/supabase-race.ts

/**
 * Executa uma Promise (ex: query do Supabase) com um tempo limite (timeout).
 * Se o timeout estourar antes da query responder, a função rejeita com um erro de timeout,
 * permitindo que o front-end exiba fallbacks/skeletons imediatamente em vez de travar a UI.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 3000 // 3 segundos padrão para e-commerce ágil
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("SUPABASE_TIMEOUT_COLD_START"));
    }, timeoutMs);
  });

  try {
    // Corre entre a query real e o cronômetro de timeout
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}