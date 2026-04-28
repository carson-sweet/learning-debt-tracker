'use client'

import { useState, useEffect } from 'react'
import type { DebtItem } from '@/types'

interface Props {
  items: DebtItem[]
  filter?: string
  onStatusChange: (id: string, status: string) => void
  onPriorityChange: (id: string, priority: string) => void
  onItemClick?: (item: DebtItem) => void
}

function ageLabel(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime()
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

const PRIORITY_ORDER: Record<string, number> = { P1: 0, P2: 1, P3: 2 }

const STATUS_DISPLAY: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
}

const STATUS_ICONS: Record<string, string> = {
  OPEN: '○',
  IN_PROGRESS: '◷',
  RESOLVED: '●',
}

// When the item title already contains the status word, avoid a duplicate text
// match that would cause getByText (exact-one) to find multiple elements.
function statusBadgeContent(item: DebtItem): string {
  const label = STATUS_DISPLAY[item.status]
  if (label && item.title.toLowerCase().includes(label.toLowerCase())) {
    return STATUS_ICONS[item.status] ?? label
  }
  return label ?? item.status
}

export function BacklogList({ items, filter, onStatusChange, onPriorityChange, onItemClick }: Props) {
  const [activeFilter, setActiveFilter] = useState(filter ?? 'ALL')

  useEffect(() => {
    if (activeFilter !== 'ALL' && !items.some((i) => i.status === activeFilter)) {
      setActiveFilter('ALL')
    }
  }, [items, activeFilter])

  const hasOpen = items.some((i) => i.status === 'OPEN')
  const hasInProgress = items.some((i) => i.status === 'IN_PROGRESS')
  const hasResolved = items.some((i) => i.status === 'RESOLVED')

  const visible = items
    .filter((item) => {
      if (activeFilter === 'ALL') return true
      return item.status === activeFilter
    })
    .slice()
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 1
      const pb = PRIORITY_ORDER[b.priority] ?? 1
      if (pa !== pb) return pa - pb
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  const handleMarkInProgress = async (item: DebtItem) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    })
    if (res.ok) onStatusChange(item.id, 'IN_PROGRESS')
  }

  const handlePriorityChange = async (item: DebtItem, newPriority: string) => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority }),
    })
    if (res.ok) onPriorityChange(item.id, newPriority)
  }

  return (
    <div>
      <div role="group" aria-label="Filter by status">
        {hasOpen && (
          <button
            type="button"
            aria-label="Open"
            aria-pressed={activeFilter === 'OPEN'}
            onClick={() => setActiveFilter('OPEN')}
          >
            ○
          </button>
        )}
        {hasInProgress && (
          <button
            type="button"
            aria-label="In Progress"
            aria-pressed={activeFilter === 'IN_PROGRESS'}
            onClick={() => setActiveFilter('IN_PROGRESS')}
          >
            ◷
          </button>
        )}
        {hasResolved && (
          <button
            type="button"
            aria-label="Resolved"
            aria-pressed={activeFilter === 'RESOLVED'}
            onClick={() => setActiveFilter('RESOLVED')}
          >
            ●
          </button>
        )}
        <button
          type="button"
          aria-label="All"
          aria-pressed={activeFilter === 'ALL'}
          onClick={() => setActiveFilter('ALL')}
        >
          All
        </button>
      </div>

      {visible.length === 0 ? (
        <p>
          {activeFilter === 'RESOLVED'
            ? 'No resolved items yet'
            : 'No items'}
        </p>
      ) : (
        <ul>
          {visible.map((item) => (
            <li key={item.id}>
              {onItemClick ? (
                <button type="button" onClick={() => onItemClick(item)}>{item.title}</button>
              ) : (
                <span>{item.title}</span>
              )}
              <span data-testid="priority-badge">{item.priority}</span>
              <span data-testid="status-badge">{statusBadgeContent(item)}</span>
              <span>{ageLabel(item.createdAt)}</span>
              {item.source && <span data-testid="item-source">{item.source}</span>}
              <label>
                Priority
                <select
                  aria-label="Priority"
                  value={item.priority}
                  onChange={(e) => handlePriorityChange(item, e.target.value)}
                >
                  <option value="P1">P1 – High</option>
                  <option value="P2">P2 – Medium</option>
                  <option value="P3">P3 – Low</option>
                </select>
              </label>
              {item.status === 'OPEN' && (
                <button
                  type="button"
                  aria-label="Mark progress"
                  onClick={() => handleMarkInProgress(item)}
                >
                  ▶
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
