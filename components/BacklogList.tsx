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

function priorityClass(p: string): string {
  if (p === 'P1') return 'bg-red-950 text-red-400 border border-red-900'
  if (p === 'P2') return 'bg-amber-950 text-amber-400 border border-amber-900'
  return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
}

function statusClass(status: string): string {
  if (status === 'IN_PROGRESS') return 'text-amber-400'
  if (status === 'RESOLVED') return 'text-emerald-400'
  return 'text-zinc-500'
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

  const filterBtnClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm transition-colors ${active ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`

  return (
    <div>
      <div role="group" aria-label="Filter by status" className="flex gap-2 mb-4">
        {hasOpen && (
          <button
            type="button"
            aria-label="Open"
            aria-pressed={activeFilter === 'OPEN'}
            onClick={() => setActiveFilter('OPEN')}
            className={filterBtnClass(activeFilter === 'OPEN')}
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
            className={filterBtnClass(activeFilter === 'IN_PROGRESS')}
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
            className={filterBtnClass(activeFilter === 'RESOLVED')}
          >
            ●
          </button>
        )}
        <button
          type="button"
          aria-label="All"
          aria-pressed={activeFilter === 'ALL'}
          onClick={() => setActiveFilter('ALL')}
          className={filterBtnClass(activeFilter === 'ALL')}
        >
          All
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-zinc-500 text-center py-12">
          {activeFilter === 'RESOLVED'
            ? 'No resolved items yet'
            : 'No items'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => (
            <li key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-zinc-700 transition-colors">
              {onItemClick ? (
                <button type="button" onClick={() => onItemClick(item)} className="flex-1 text-left text-zinc-50 hover:text-violet-400 font-medium text-sm truncate transition-colors">{item.title}</button>
              ) : (
                <span className="flex-1 text-zinc-50 font-medium text-sm truncate">{item.title}</span>
              )}
              <span data-testid="priority-badge" className={`text-xs font-mono px-2 py-0.5 rounded-full ${priorityClass(item.priority)}`}>{item.priority}</span>
              <span data-testid="status-badge" className={`text-xs px-2 py-0.5 rounded-full ${statusClass(item.status)}`}>{statusBadgeContent(item)}</span>
              <span className="text-xs text-zinc-600">{ageLabel(item.createdAt)}</span>
              {item.source && <span data-testid="item-source" className="text-xs text-zinc-600 truncate max-w-[120px]">{item.source}</span>}
              <label className="flex items-center gap-1">
                <span className="sr-only">Priority</span>
                <select
                  aria-label="Priority"
                  value={item.priority}
                  onChange={(e) => handlePriorityChange(item, e.target.value)}
                  className="bg-zinc-800 border-none text-zinc-400 text-xs rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-600"
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
                  className="text-zinc-500 hover:text-amber-400 transition-colors"
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
