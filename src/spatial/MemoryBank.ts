// Our DIY vector database using basic arrays
export class MemoryBank {
  private memories: Array<{
    id: string,
    data: Float32Array,
    timestamp: number
  }>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.memories = [];
    this.maxSize = maxSize;
  }

  store(data: Float32Array): string {
    const id = Math.random().toString(36).substring(7);
    
    if (this.memories.length >= this.maxSize) {
      // FIFO when we hit memory limits
      this.memories.shift();
    }
    
    this.memories.push({
      id,
      data,
      timestamp: Date.now()
    });
    
    return id;
  }

  recall(id: string) {
    return this.memories.find(m => m.id === id)?.data;
  }

  // Basic similarity search - we'll optimize later
  findSimilar(data: Float32Array, limit: number = 5) {
    return this.memories
      .map(m => ({
        id: m.id,
        similarity: this.cosineSimilarity(data, m.data)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
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