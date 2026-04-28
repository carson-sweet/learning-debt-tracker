import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const item = await prisma.debtItem.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const existing = await prisma.debtItem.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { priority, status, notes, resourceLink } = body as Record<string, string | undefined>

  if (status !== undefined && existing.status === 'RESOLVED') {
    return NextResponse.json({ error: 'Cannot change status of a resolved item' }, { status: 422 })
  }
  if (status === 'RESOLVED') {
    return NextResponse.json({ error: 'Use the resolve endpoint to resolve an item' }, { status: 422 })
  }
  if (status !== undefined && !['OPEN', 'IN_PROGRESS'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 422 })
  }
  if (priority !== undefined && !['P1', 'P2', 'P3'].includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority value' }, { status: 422 })
  }
  if (notes !== undefined && notes.length > 10000) {
    return NextResponse.json({ error: 'Notes too long (max 10000 characters)' }, { status: 422 })
  }
  if (resourceLink !== undefined && resourceLink !== null && resourceLink !== '') {
    if (!resourceLink.startsWith('http://') && !resourceLink.startsWith('https://')) {
      return NextResponse.json({ error: 'Resource link must start with http:// or https://' }, { status: 422 })
    }
    if (resourceLink.length > 2048) {
      return NextResponse.json({ error: 'Resource link too long (max 2048 characters)' }, { status: 422 })
    }
  }

  const data: Record<string, unknown> = {}
  if (priority !== undefined) data.priority = priority
  if (status !== undefined) data.status = status
  if (notes !== undefined) data.notes = notes
  if (resourceLink !== undefined) data.resourceLink = resourceLink

  const item = await prisma.debtItem.update({ where: { id: params.id }, data })
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const existing = await prisma.debtItem.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.debtItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
