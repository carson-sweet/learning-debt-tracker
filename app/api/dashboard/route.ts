import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [openCount, resolvedLast7Days, resolvedLast30Days, oldest] = await Promise.all([
    prisma.debtItem.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.debtItem.count({ where: { status: 'RESOLVED', resolvedAt: { gte: sevenDaysAgo } } }),
    prisma.debtItem.count({ where: { status: 'RESOLVED', resolvedAt: { gte: thirtyDaysAgo } } }),
    prisma.debtItem.findFirst({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, createdAt: true },
    }),
  ])

  return NextResponse.json({
    openCount,
    resolvedLast7Days,
    resolvedLast30Days,
    oldestOpenItem: oldest
      ? { id: oldest.id, title: oldest.title, createdAt: oldest.createdAt.toISOString() }
      : null,
  })
}
