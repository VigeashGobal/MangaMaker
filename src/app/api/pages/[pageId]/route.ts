import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const body = await request.json()
    const { generatedOptions, selectedImage } = body

    const updateData: { generatedOptions?: Array<{ imageUrl: string; prompt: string; selected: boolean }>; selectedImage?: string } = {}
    if (generatedOptions !== undefined) {
      updateData.generatedOptions = generatedOptions
    }
    if (selectedImage !== undefined) {
      updateData.selectedImage = selectedImage
    }

    const page = await prisma.page.update({
      where: { id: pageId },
      data: updateData,
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params

    const page = await prisma.page.findUnique({
      where: { id: pageId },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}
