import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ALL']
const PRIORITY_ORDER: Record<string, number> = { P1: 0, P2: 1, P3: 2 }

export async function GET(req: Request) {
  const url = new URL(req.url)
  const statusParam = url.searchParams.get('status') ?? 'OPEN'

  if (!VALID_STATUSES.includes(statusParam)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
  }

  const where = statusParam === 'ALL' ? {} : { status: statusParam }

  const items = await prisma.debtItem.findMany({ where })

  items.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 1
    const pb = PRIORITY_ORDER[b.priority] ?? 1
    if (pa !== pb) return pa - pb
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = body.title
  const priority = (body.priority as string) || 'P2'
  const source = body.source as string | undefined

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 422 })
  }
  if (title.length > 300) {
    return NextResponse.json({ error: 'Title too long (max 300 characters)' }, { status: 422 })
  }
  if (!['P1', 'P2', 'P3'].includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority value' }, { status: 422 })
  }
  if (source && source.length > 500) {
    return NextResponse.json({ error: 'Source too long (max 500 characters)' }, { status: 422 })
  }

  const item = await prisma.debtItem.create({
    data: {
      title: title.trim(),
      priority,
      source: source || null,
      status: 'OPEN',
    },
  })

  return NextResponse.json(item, { status: 201 })
}
