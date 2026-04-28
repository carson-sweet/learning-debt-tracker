import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

export async function POST(req: Request, { params }: Ctx) {
  const existing = await prisma.debtItem.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (existing.status === 'RESOLVED') {
    return NextResponse.json({ error: 'Item is already resolved' }, { status: 422 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const resolution = body.resolution as string | undefined

  if (!resolution || typeof resolution !== 'string' || resolution.trim().length === 0) {
    return NextResponse.json({ error: 'Resolution is required and cannot be empty' }, { status: 422 })
  }

  const item = await prisma.debtItem.update({
    where: { id: params.id },
    data: { status: 'RESOLVED', resolution: resolution.trim(), resolvedAt: new Date() },
  })

  return NextResponse.json(item)
}
