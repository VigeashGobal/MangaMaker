import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateMangaPageVariations(
  description: string,
  pageType: string
): Promise<Array<{ imageUrl: string; prompt: string; selected: boolean }>> {
  try {
    console.log('Generating variations for:', pageType, description)
    
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using mock images')
      return generateMockVariations(description, pageType)
    }

    const basePrompt = `Create a manga ${pageType}: ${description}. Style: black and white manga art, detailed linework, dynamic composition, professional manga illustration.`
    
    const styleVariations = [
      'in a classic shonen manga style',
      'in a modern manga style with detailed backgrounds',
      'in a dramatic manga style with strong contrast'
    ]

    const variations = []

    for (let i = 0; i < 3; i++) {
      try {
        console.log(`Generating variation ${i + 1} with prompt:`, `${basePrompt} ${styleVariations[i]}`)
        
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: `${basePrompt} ${styleVariations[i]}`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })

        console.log(`Variation ${i + 1} response:`, response)

        if (response.data && response.data[0]?.url) {
          console.log(`Variation ${i + 1} success, URL:`, response.data[0].url)
          variations.push({
            imageUrl: response.data[0].url,
            prompt: `${basePrompt} ${styleVariations[i]}`,
            selected: false,
          })
        } else {
          console.log(`Variation ${i + 1} failed - no URL in response`)
          throw new Error('No URL in response')
        }
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error)
        // Add mock variation as fallback
        variations.push({
          imageUrl: `https://via.placeholder.com/400x600/6366f1/ffffff?text=Variation+${i + 1}`,
          prompt: `${basePrompt} ${styleVariations[i]}`,
          selected: false,
        })
      }
    }

    return variations
  } catch (error) {
    console.error('AI generation failed, using mock images:', error)
    return generateMockVariations(description, pageType)
  }
}

function generateMockVariations(
  description: string,
  pageType: string
): Array<{ imageUrl: string; prompt: string; selected: boolean }> {
  return [
    {
      imageUrl: `https://via.placeholder.com/400x600/6366f1/ffffff?text=Title+Page+1`,
      prompt: `Mock ${pageType}: ${description} - Classic Style`,
      selected: false,
    },
    {
      imageUrl: `https://via.placeholder.com/400x600/8b5cf6/ffffff?text=Title+Page+2`,
      prompt: `Mock ${pageType}: ${description} - Modern Style`,
      selected: false,
    },
    {
      imageUrl: `https://via.placeholder.com/400x600/a855f7/ffffff?text=Title+Page+3`,
      prompt: `Mock ${pageType}: ${description} - Dramatic Style`,
      selected: false,
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, description, pageType } = body

    if (!pageId || !description || !pageType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update job status to generating
    await prisma.generationJob.updateMany({
      where: { pageId },
      data: { status: 'generating', progress: 25 },
    })

    // Generate variations
    const variations = await generateMangaPageVariations(description, pageType)

    // Update job status to 75%
    await prisma.generationJob.updateMany({
      where: { pageId },
      data: { status: 'generating', progress: 75 },
    })

    // Store generated options
    await prisma.page.update({
      where: { id: pageId },
      data: { generatedOptions: variations },
    })

    // Update job status to completed
    await prisma.generationJob.updateMany({
      where: { pageId },
      data: { status: 'completed', progress: 100 },
    })

    return NextResponse.json({ success: true, variations })
  } catch (error) {
    console.error('Error generating images:', error)
    
    // Try to update job status to failed if we have pageId
    try {
      const body = await request.json()
      const { pageId } = body
      if (pageId) {
        await prisma.generationJob.updateMany({
          where: { pageId },
          data: { 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          },
        })
      }
    } catch (updateError) {
      console.error('Error updating job status:', updateError)
    }

    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
