import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

interface MemoryNode {
  id: string;
  data: Float32Array;
  metadata: {
    timestamp: number;
    context: string;
    importance: number;
    connections: Set<string>;
  };
}

export class MemoryVault extends EventEmitter {
  private memories: Map<string, MemoryNode>;
  private readonly dimensions: number;
  private readonly agentId: string;

  constructor(agentId: string, dimensions: number = 1536) {
    super();
    this.memories = new Map();
    this.dimensions = dimensions;
    this.agentId = agentId;
  }

  async store(data: Float32Array, context: string, importance: number = 0.5): Promise<string> {
    const id = `mem-${nanoid()}`;
    const memory: MemoryNode = {
      id,
      data,
      metadata: {
        timestamp: Date.now(),
        context,
        importance,
        connections: new Set()
      }
    };

    this.memories.set(id, memory);
    await this.connectRelatedMemories(id, data);
    return id;
  }

  async recall(query: Float32Array, limit: number = 5) {
    const similarities = Array.from(this.memories.values())
      .map(memory => ({
        ...memory,
        similarity: this.cosineSimilarity(query, memory.data)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }

  private async connectRelatedMemories(id: string, vector: Float32Array) {
    const related = await this.recall(vector, 3);
    const memory = this.memories.get(id);
    if (memory) {
      related.forEach(rel => memory.metadata.connections.add(rel.id));
    }
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