/**
 * Utilitários para reconhecimento facial
 * Nota: A biblioteca face-api.js é usada no frontend
 * Este arquivo contém funções auxiliares para processamento de embeddings
 */

/**
 * Calcula a distância euclidiana entre dois embeddings
 * Quanto menor a distância, mais similares são os rostos
 */
export function euclideanDistance(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same length");
  }

  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calcula a similaridade entre dois embeddings (0-1)
 * 1 = idêntico, 0 = completamente diferente
 */
export function calculateSimilarity(embedding1: number[], embedding2: number[]): number {
  const distance = euclideanDistance(embedding1, embedding2);
  // Normalizar a distância para uma escala de 0-1
  // Valores típicos de distância para rostos diferentes: 0.6-1.0
  // Valores típicos para o mesmo rosto: 0.0-0.3
  const maxDistance = 1.0;
  const similarity = Math.max(0, 1 - distance / maxDistance);
  return Math.min(1, similarity);
}

/**
 * Verifica se dois embeddings correspondem ao mesmo rosto
 * Usa um threshold de confiança configurável
 */
export function isFaceMatch(
  embedding1: number[],
  embedding2: number[],
  threshold: number = 0.6
): { isMatch: boolean; confidence: number } {
  const confidence = calculateSimilarity(embedding1, embedding2);
  return {
    isMatch: confidence >= threshold,
    confidence,
  };
}

/**
 * Encontra o melhor match em uma lista de embeddings
 */
export function findBestMatch(
  targetEmbedding: number[],
  candidates: Array<{ id: number; embedding: number[] }>,
  threshold: number = 0.6
): { id: number; confidence: number } | null {
  let bestMatch = null;
  let bestConfidence = 0;

  for (const candidate of candidates) {
    const confidence = calculateSimilarity(targetEmbedding, candidate.embedding);
    if (confidence >= threshold && confidence > bestConfidence) {
      bestMatch = candidate.id;
      bestConfidence = confidence;
    }
  }

  return bestMatch ? { id: bestMatch, confidence: bestConfidence } : null;
}

/**
 * Valida se um embedding é válido
 */
export function isValidEmbedding(embedding: unknown): embedding is number[] {
  return (
    Array.isArray(embedding) &&
    embedding.length > 0 &&
    embedding.every((val) => typeof val === "number" && isFinite(val))
  );
}
