import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    storySummary: v.string(),
    genre: v.optional(v.string()),
    style: v.optional(v.string()),
    createdAt: v.number(),
    userId: v.string(),
  }),

  pages: defineTable({
    projectId: v.id("projects"),
    pageType: v.string(), // 'title', 'chapter', 'action', 'dialogue', 'ending'
    description: v.string(),
    generatedOptions: v.array(v.object({
      imageUrl: v.string(),
      prompt: v.string(),
      selected: v.boolean(),
    })),
    selectedImage: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }),

  generationJobs: defineTable({
    projectId: v.id("projects"),
    pageId: v.id("pages"),
    status: v.string(), // 'pending', 'generating', 'completed', 'failed'
    progress: v.number(),
    error: v.optional(v.string()),
  }),
});
