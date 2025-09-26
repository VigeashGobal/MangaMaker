import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, format } = body

    if (!projectId || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get all pages with selected images
    const pages = await prisma.page.findMany({
      where: { 
        projectId,
        selectedImage: { not: null }
      },
      orderBy: { order: 'asc' },
    })

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages with selected images found' },
        { status: 400 }
      )
    }

    if (format === 'pdf') {
      // For PDF export, we'll return the data and let the frontend handle PDF generation
      return NextResponse.json({
        success: true,
        format: 'pdf',
        pages: pages.map(page => ({
          id: page.id,
          type: page.pageType,
          imageUrl: page.selectedImage,
          order: page.order,
        })),
        pageCount: pages.length,
      })
    } else if (format === 'zip') {
      // For ZIP export, we'll return the data and let the frontend handle ZIP generation
      return NextResponse.json({
        success: true,
        format: 'zip',
        pages: pages.map(page => ({
          id: page.id,
          type: page.pageType,
          imageUrl: page.selectedImage,
          order: page.order,
        })),
        pageCount: pages.length,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error exporting:', error)
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    )
  }
}
