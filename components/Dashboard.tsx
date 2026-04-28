'use client'

import type { DashboardMetrics } from '@/types'

interface Props {
  metrics: DashboardMetrics
}

function ageLabel(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function Dashboard({ metrics }: Props) {
  const { openCount, resolvedLast7Days, resolvedLast30Days, oldestOpenItem } = metrics

  return (
    <main className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <section aria-label="Total open items" className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Open items</h2>
        <figure aria-label="Total open items count">
          <p className="text-3xl font-bold text-zinc-50">{openCount}</p>
        </figure>
      </section>

      <section aria-label="Resolved last 7 days" className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Resolved (7d)</h2>
        <figure aria-label="Resolved last 7 days count">
          <p className="text-3xl font-bold text-zinc-50">{resolvedLast7Days}</p>
        </figure>
      </section>

      <section aria-label="Resolved last 30 days" className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Resolved (30d)</h2>
        <figure aria-label="Resolved last 30 days count">
          <p className="text-3xl font-bold text-zinc-50">{resolvedLast30Days}</p>
        </figure>
      </section>

      <section aria-label="Oldest open item" className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Oldest open</h2>
        {oldestOpenItem ? (
          <figure aria-label="Oldest open item">
            <p className="text-sm font-medium text-zinc-50 truncate">{oldestOpenItem.title}</p>
            <figcaption className="text-xs text-zinc-400 mt-1">{ageLabel(oldestOpenItem.createdAt)}</figcaption>
          </figure>
        ) : (
          <p className="text-zinc-600 text-sm">None</p>
        )}
      </section>
    </main>
  )
}
