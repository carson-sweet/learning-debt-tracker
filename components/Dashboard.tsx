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
    <main>
      <section aria-label="Total open items">
        <h2>Total open items</h2>
        <figure aria-label="Total open items count">
          <p>{openCount}</p>
        </figure>
      </section>

      <section aria-label="Resolved last 7 days">
        <h2>Resolved (7)</h2>
        <figure aria-label="Resolved last 7 days count">
          <p>{resolvedLast7Days}</p>
        </figure>
      </section>

      <section aria-label="Resolved last 30 days">
        <h2>Resolved (30)</h2>
        <figure aria-label="Resolved last 30 days count">
          <p>{resolvedLast30Days}</p>
        </figure>
      </section>

      <section aria-label="Oldest open item">
        <h2>Oldest open item</h2>
        {oldestOpenItem ? (
          <figure aria-label="Oldest open item">
            <p>{oldestOpenItem.title}</p>
            <figcaption>{ageLabel(oldestOpenItem.createdAt)}</figcaption>
          </figure>
        ) : (
          <p>None</p>
        )}
      </section>
    </main>
  )
}
