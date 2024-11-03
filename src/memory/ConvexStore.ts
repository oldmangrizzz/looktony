import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

interface MemoryVector {
  id: string;
  vector: Float32Array;
  metadata: {
    type: string;
    context: string;
    timestamp: number;
    importance: number;
  };
}

export class ConvexStore extends EventEmitter {
  private dimensions: number;
  private memories: Map<string, MemoryVector>;

  constructor(dimensions: number = 1536) {
    super();
    this.dimensions = dimensions;
    this.memories = new Map();
  }

  async storeVector(vector: Float32Array, metadata: MemoryVector['metadata']): Promise<string> {
    if (vector.length !== this.dimensions) {
      throw new Error(`Vector must have ${this.dimensions} dimensions`);
    }

    const id = `mem-${nanoid()}`;
    const memory: MemoryVector = {
      id,
      vector,
      metadata
    };

    this.memories.set(id, memory);
    return id;
  }

  async findSimilar(vector: Float32Array, limit: number = 5): Promise<MemoryVector[]> {
    const memories = Array.from(this.memories.values());
    const withSimilarity = memories.map(memory => ({
      ...memory,
      similarity: this.cosineSimilarity(vector, memory.vector)
    }));

    return withSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async getMemory(id: string): Promise<MemoryVector | null> {
    return this.memories.get(id) || null;
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}