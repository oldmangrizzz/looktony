import { defineSchema, defineTable } from 'convex/schema';
import { v } from 'convex/values';

export default defineSchema({
  memories: defineTable({
    id: v.string(),
    vector: v.array(v.number()),
    metadata: v.object({
      type: v.string(),
      context: v.string(),
      timestamp: v.number(),
      importance: v.number()
    })
  })
});