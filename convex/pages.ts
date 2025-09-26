import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generatePageOptions = mutation({
  args: {
    projectId: v.id("projects"),
    pageType: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current page count to set the order
    const existingPages = await ctx.db
      .query("pages")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
    
    const order = existingPages.length;

    // Create page record
    const pageId = await ctx.db.insert("pages", {
      projectId: args.projectId,
      pageType: args.pageType,
      description: args.description,
      generatedOptions: [],
      order,
      createdAt: Date.now(),
    });

    // Start generation job
    await ctx.db.insert("generationJobs", {
      projectId: args.projectId,
      pageId,
      status: "pending",
      progress: 0,
    });

    // Trigger background generation
    await ctx.scheduler.runAfter(0, api.pages.generateImages, {
      pageId,
      description: args.description,
      pageType: args.pageType,
    });

    return pageId;
  },
});

export const generateImages = action({
  args: {
    pageId: v.id("pages"),
    description: v.string(),
    pageType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Update job status
      await ctx.runMutation(api.pages.updateJobStatus, {
        pageId: args.pageId,
        status: "generating",
        progress: 25,
      });

      // Generate 3 variations using AI API
      const variations = await generateMangaPageVariations(
        args.description,
        args.pageType
      );

      // Update job status
      await ctx.runMutation(api.pages.updateJobStatus, {
        pageId: args.pageId,
        status: "generating",
        progress: 75,
      });

      // Store generated options
      await ctx.runMutation(api.pages.updateGeneratedOptions, {
        pageId: args.pageId,
        options: variations,
      });

      // Complete job
      await ctx.runMutation(api.pages.updateJobStatus, {
        pageId: args.pageId,
        status: "completed",
        progress: 100,
      });
    } catch (error) {
      // Handle error
      await ctx.runMutation(api.pages.updateJobStatus, {
        pageId: args.pageId,
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

export const updateJobStatus = mutation({
  args: {
    pageId: v.id("pages"),
    status: v.string(),
    progress: v.number(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("generationJobs")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (job) {
      await ctx.db.patch(job._id, {
        status: args.status,
        progress: args.progress,
        error: args.error,
      });
    }
  },
});

export const updateGeneratedOptions = mutation({
  args: {
    pageId: v.id("pages"),
    options: v.array(v.object({
      imageUrl: v.string(),
      prompt: v.string(),
      selected: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.pageId, {
      generatedOptions: args.options,
    });
  },
});

export const selectOption = mutation({
  args: {
    pageId: v.id("pages"),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId);
    if (!page) return;

    const updatedOptions = page.generatedOptions.map((option, index) => ({
      ...option,
      selected: index === args.optionIndex,
    }));

    const selectedImage = page.generatedOptions[args.optionIndex]?.imageUrl;

    await ctx.db.patch(args.pageId, {
      generatedOptions: updatedOptions,
      selectedImage,
    });
  },
});

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pages")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .order("asc")
      .collect();
  },
});

export const getGenerationStatus = query({
  args: { pageId: v.id("pages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generationJobs")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
  },
});

// AI image generation function
async function generateMangaPageVariations(
  description: string,
  pageType: string
): Promise<Array<{ imageUrl: string; prompt: string; selected: boolean }>> {
  try {
    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.warn("OpenAI API key not found, using mock images");
      return generateMockVariations(description, pageType);
    }

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const basePrompt = `Create a manga ${pageType} page: ${description}. Style: black and white manga art, detailed linework, dynamic composition, professional manga illustration.`;
    
    const variations = [];
    
    // Generate 3 variations with different styles
    const styleVariations = [
      "in a classic shonen manga style",
      "in a modern manga style with detailed backgrounds",
      "in a dramatic manga style with strong contrast"
    ];

    for (let i = 0; i < 3; i++) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: `${basePrompt} ${styleVariations[i]}`,
          n: 1,
          size: "1024x1792", // Manga page aspect ratio
          quality: "standard",
        });

        if (response.data && response.data[0]?.url) {
          variations.push({
            imageUrl: response.data[0].url,
            prompt: `${basePrompt} ${styleVariations[i]}`,
            selected: false,
          });
        }
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
        // Fallback to mock image
        variations.push({
          imageUrl: `https://picsum.photos/800/1200?random=${i + 1}&text=${encodeURIComponent(basePrompt + " - Style " + (i + 1))}`,
          prompt: `${basePrompt} ${styleVariations[i]}`,
          selected: false,
        });
      }
    }

    return variations;
  } catch (error) {
    console.error("AI generation failed, using mock images:", error);
    return generateMockVariations(description, pageType);
  }
}

// Fallback mock function
function generateMockVariations(
  description: string,
  pageType: string
): Array<{ imageUrl: string; prompt: string; selected: boolean }> {
  const basePrompt = `Manga ${pageType} page: ${description}`;
  
  return [
    {
      imageUrl: `https://picsum.photos/800/1200?random=1&text=${encodeURIComponent(basePrompt + " - Style 1")}`,
      prompt: basePrompt + " - Style 1",
      selected: false,
    },
    {
      imageUrl: `https://picsum.photos/800/1200?random=2&text=${encodeURIComponent(basePrompt + " - Style 2")}`,
      prompt: basePrompt + " - Style 2",
      selected: false,
    },
    {
      imageUrl: `https://picsum.photos/800/1200?random=3&text=${encodeURIComponent(basePrompt + " - Style 3")}`,
      prompt: basePrompt + " - Style 3",
      selected: false,
    },
  ];
}
