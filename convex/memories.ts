import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Schema for our memory vectors
const memorySchema = {
  id: v.string(),
  vector: v.array(v.number()),
  metadata: v.object({
    type: v.string(),
    context: v.string(),
    timestamp: v.number(),
    importance: v.number()
  })
};

// Store a memory vector
export const store = mutation({
  args: memorySchema,
  handler: async (ctx, args) => {
    const { id, vector, metadata } = args;
    return await ctx.db.insert('memories', { id, vector, metadata });
  }
});

// Find similar vectors using cosine similarity
export const findSimilar = query({
  args: {
    vector: v.array(v.number()),
    limit: v.number()
  },
  handler: async (ctx, args) => {
    const { vector, limit } = args;
    
    // Get all memories
    const memories = await ctx.db.query('memories').collect();
    
    // Calculate similarities
    const withSimilarity = memories.map(memory => ({
      ...memory,
      similarity: cosineSimilarity(vector, memory.vector)
    }));
    
    // Sort by similarity and return top results
    return withSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
});

// Get a specific memory by ID
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Helper function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
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