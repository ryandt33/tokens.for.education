import * as umap from "umap-js";

export const euclideanDistance = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  return Math.sqrt(
    a.reduce((acc, curr, idx) => acc + Math.pow(curr - b[idx], 2), 0)
  );
};

export const cosineSimilarity = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  const dotProduct = a.reduce((acc, curr, idx) => acc + curr * b[idx], 0);
  const normA = Math.sqrt(a.reduce((acc, curr) => acc + Math.pow(curr, 2), 0));
  const normB = Math.sqrt(b.reduce((acc, curr) => acc + Math.pow(curr, 2), 0));
  return dotProduct / (normA * normB);
};

export const dotProduct = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  return a.reduce((acc, curr, idx) => acc + curr * b[idx], 0);
};

export const manhattanDistance = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  return a.reduce((acc, curr, idx) => acc + Math.abs(curr - b[idx]), 0);
};

export const chebyshevDistance = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  return a.reduce(
    (acc, curr, idx) => Math.max(acc, Math.abs(curr - b[idx])),
    0
  );
};

export const jaccardDistance = (a: number[], b: number[]) => {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of the same length");
  }
  const intersection = a.reduce(
    (acc, curr, idx) => acc + (curr && b[idx] ? 1 : 0),
    0
  );
  const union = a.reduce((acc, curr, idx) => acc + (curr || b[idx] ? 1 : 0), 0);
  return 1 - intersection / union;
};

function randomFromSeed(seed: number) {
  return () => {
    // Use the seed to generate a pseudorandom number
    seed = (seed * 9301 + 49297) % 233280; // Simple linear congruential generator
    return seed / 233280; // Normalize to range [0, 1)
  };
}

// Use 42 as the seed

export const reduceEmbeddingsTo2D = (
  embeddings: number[][],
  umapOptions: any = {}
): number[][] | null => {
  if (
    !Array.isArray(embeddings) ||
    embeddings.length === 0 ||
    !Array.isArray(embeddings[0])
  ) {
    console.error(
      "Invalid input: embeddings must be a non-empty array of arrays."
    );
    return null;
  }

  for (const embedding of embeddings) {
    if (
      !Array.isArray(embedding) ||
      embedding.length === 0 ||
      typeof embedding[0] !== "number"
    ) {
      console.error(
        "Invalid input: all embeddings must be a non-empty array of numbers."
      );
      return null;
    }
  }

  try {
    const randomFunction = randomFromSeed(42);
    const umapInstance = new umap.UMAP({
      ...umapOptions,
      random: randomFunction,
    });

    umapInstance.fit(embeddings);

    const reducedEmbeddings = umapInstance.transform(embeddings);

    return reducedEmbeddings;
  } catch (error) {
    console.error("UMAP Error:", error);
    throw error;
  }
};
