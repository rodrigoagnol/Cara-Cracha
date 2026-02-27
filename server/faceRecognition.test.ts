import { describe, expect, it } from "vitest";
import {
  euclideanDistance,
  calculateSimilarity,
  isFaceMatch,
  findBestMatch,
  isValidEmbedding,
} from "./faceRecognition";

describe("Face Recognition Utilities", () => {
  // Embeddings de exemplo (normalmente teriam 128 dimensões)
  const embedding1 = [0.1, 0.2, 0.3, 0.4, 0.5];
  const embedding2 = [0.1, 0.2, 0.3, 0.4, 0.5]; // Idêntico
  const embedding3 = [0.5, 0.4, 0.3, 0.2, 0.1]; // Bem diferente

  describe("euclideanDistance", () => {
    it("deve retornar 0 para embeddings idênticos", () => {
      const distance = euclideanDistance(embedding1, embedding2);
      expect(distance).toBe(0);
    });

    it("deve calcular distância corretamente", () => {
      const distance = euclideanDistance(embedding1, embedding3);
      expect(distance).toBeGreaterThan(0);
    });

    it("deve lançar erro para embeddings com tamanhos diferentes", () => {
      expect(() => {
        euclideanDistance(embedding1, [0.1, 0.2]);
      }).toThrow();
    });
  });

  describe("calculateSimilarity", () => {
    it("deve retornar 1 para embeddings idênticos", () => {
      const similarity = calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBe(1);
    });

    it("deve retornar valor entre 0 e 1", () => {
      const similarity = calculateSimilarity(embedding1, embedding3);
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it("embeddings idênticos devem ter maior similaridade que diferentes", () => {
      const sim1 = calculateSimilarity(embedding1, embedding2);
      const sim2 = calculateSimilarity(embedding1, embedding3);
      expect(sim1).toBeGreaterThan(sim2);
    });
  });

  describe("isFaceMatch", () => {
    it("deve retornar match true para embeddings idênticos", () => {
      const result = isFaceMatch(embedding1, embedding2);
      expect(result.isMatch).toBe(true);
      expect(result.confidence).toBe(1);
    });

    it("deve respeitar o threshold", () => {
      const result = isFaceMatch(embedding1, embedding3, 0.9);
      expect(result.isMatch).toBe(false);
      expect(result.confidence).toBeLessThan(0.9);
    });

    it("deve usar threshold padrão de 0.6", () => {
      const result = isFaceMatch(embedding1, embedding3);
      expect(result.confidence).toBeDefined();
    });
  });

  describe("findBestMatch", () => {
    it("deve encontrar o melhor match", () => {
      const candidates = [
        { id: 1, embedding: embedding3 },
        { id: 2, embedding: embedding1 }, // Melhor match
        { id: 3, embedding: embedding3 },
      ];

      const result = findBestMatch(embedding1, candidates, 0.5);
      expect(result?.id).toBe(2);
      expect(result?.confidence).toBeGreaterThan(0.9);
    });

    it("deve retornar null se nenhum match atender ao threshold", () => {
      const candidates = [
        { id: 1, embedding: embedding3 },
        { id: 2, embedding: embedding3 },
      ];

      const result = findBestMatch(embedding1, candidates, 0.99);
      expect(result).toBeNull();
    });

    it("deve retornar null para lista vazia", () => {
      const result = findBestMatch(embedding1, [], 0.6);
      expect(result).toBeNull();
    });
  });

  describe("isValidEmbedding", () => {
    it("deve validar embedding válido", () => {
      expect(isValidEmbedding([0.1, 0.2, 0.3])).toBe(true);
    });

    it("deve rejeitar array vazio", () => {
      expect(isValidEmbedding([])).toBe(false);
    });

    it("deve rejeitar valores não numéricos", () => {
      expect(isValidEmbedding([0.1, "0.2", 0.3])).toBe(false);
    });

    it("deve rejeitar valores infinitos", () => {
      expect(isValidEmbedding([0.1, Infinity, 0.3])).toBe(false);
    });

    it("deve rejeitar valores NaN", () => {
      expect(isValidEmbedding([0.1, NaN, 0.3])).toBe(false);
    });

    it("deve rejeitar não-array", () => {
      expect(isValidEmbedding("not an array")).toBe(false);
      expect(isValidEmbedding(null)).toBe(false);
      expect(isValidEmbedding(undefined)).toBe(false);
    });
  });
});
