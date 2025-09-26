import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params

    const job = await prisma.generationJob.findFirst({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Generation job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching generation job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generation job' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const body = await request.json()
    const { status, progress, error } = body

    const job = await prisma.generationJob.findFirst({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Generation job not found' },
        { status: 404 }
      )
    }

    const updatedJob = await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status,
        progress,
        error,
      },
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating generation job:', error)
    return NextResponse.json(
      { error: 'Failed to update generation job' },
      { status: 500 }
    )
  }
}
