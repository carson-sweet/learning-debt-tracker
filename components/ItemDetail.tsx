'use client'

import { useState, useEffect } from 'react'
import type { DebtItem } from '@/types'

interface Props {
  item: DebtItem
  onUpdate: (item: DebtItem) => void
  onClose: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const inputClass = 'w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent'

export function ItemDetail({ item, onUpdate, onClose }: Props) {
  const [notes, setNotes] = useState(item.notes ?? '')
  const [resourceLink, setResourceLink] = useState(item.resourceLink ?? '')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolution, setResolution] = useState('')
  const [resolveLoading, setResolveLoading] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  useEffect(() => {
    setNotes(item.notes ?? '')
    setResourceLink(item.resourceLink ?? '')
  }, [item.id])

  const patch = async (data: Record<string, unknown>): Promise<DebtItem | null> => {
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    return res.json()
  }

  const handlePriorityChange = async (priority: string) => {
    const updated = await patch({ priority })
    if (updated) onUpdate(updated)
  }

  const handleNotesSave = async () => {
    const updated = await patch({ notes })
    if (updated) onUpdate(updated)
  }

  const handleMarkInProgress = async () => {
    const updated = await patch({ status: 'IN_PROGRESS' })
    if (updated) onUpdate(updated)
  }

  const handleMoveToOpen = async () => {
    const updated = await patch({ status: 'OPEN' })
    if (updated) onUpdate(updated)
  }

  const handleResourceLinkSave = async () => {
    if (resourceLink && !resourceLink.startsWith('http://') && !resourceLink.startsWith('https://')) {
      setLinkError('invalid URL — must start with http:// or https://')
      return
    }
    setLinkError(null)
    const updated = await patch({ resourceLink })
    if (updated) onUpdate(updated)
  }

  const handleResolve = async () => {
    if (!resolution.trim() || resolveLoading) return
    setResolveLoading(true)
    setResolveError(null)
    try {
      const res = await fetch(`/api/items/${item.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      })
      if (!res.ok) {
        const body = await res.json()
        setResolveError(body.error ?? 'Failed to resolve item')
        return
      }
      const updated = await res.json()
      onUpdate(updated)
    } finally {
      setResolveLoading(false)
    }
  }

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5">
      <div className="flex items-start gap-3">
        <h2 className="flex-1 text-xl font-semibold text-zinc-50">{item.title}</h2>
        <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
          ✕ Close
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">
          Priority
          <select
            aria-label="Priority"
            value={item.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="ml-2 bg-zinc-800 text-zinc-300 text-sm rounded px-2 py-1 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-violet-600"
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
        </label>
      </div>

      <div>
        <label htmlFor="item-source" className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Source or context</label>
        <p id="item-source" aria-label="Source or context" className="text-sm text-zinc-400">{item.source ?? ''}</p>
      </div>

      <section className="space-y-2">
        <label htmlFor="item-notes" className="block text-xs text-zinc-500 uppercase tracking-wider">Notes</label>
        <textarea
          id="item-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesSave}
          className={`${inputClass} min-h-[100px] resize-y`}
        />
        {item.status === 'OPEN' && (
          <button type="button" onClick={handleNotesSave} className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors">Save</button>
        )}
      </section>

      <div className="flex items-center gap-3">
        {item.status === 'OPEN' && (
          <button type="button" aria-label="Mark as In Progress" onClick={handleMarkInProgress} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors">
            Mark as In Progress
          </button>
        )}

        {item.status === 'IN_PROGRESS' && (
          <button type="button" aria-label="Move back to Open" onClick={handleMoveToOpen} className="text-zinc-500 hover:text-zinc-300 text-sm underline transition-colors">
            Move back to Open
          </button>
        )}
      </div>

      {item.status === 'IN_PROGRESS' && (
        <section className="space-y-2">
          <label htmlFor="resource-link" className="block text-xs text-zinc-500 uppercase tracking-wider">Resource link</label>
          <input
            id="resource-link"
            type="text"
            value={resourceLink}
            onChange={(e) => setResourceLink(e.target.value)}
            placeholder="https://"
            className={inputClass}
          />
          {linkError && <span className="text-red-400 text-sm">{linkError}</span>}
          {item.resourceLink && (
            <a href={item.resourceLink} target="_blank" rel="noopener noreferrer" className="block text-sm text-violet-400 hover:text-violet-300 truncate transition-colors">
              {item.resourceLink}
            </a>
          )}
          <button type="button" onClick={handleResourceLinkSave} className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors">Save</button>
        </section>
      )}

      {(item.status === 'OPEN' || item.status === 'IN_PROGRESS') && !resolveOpen && (
        <button type="button" onClick={() => setResolveOpen(true)} className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-md transition-colors">
          Resolve
        </button>
      )}

      {resolveOpen && (
        <section aria-label="Resolution" className="space-y-3 border-t border-zinc-800 pt-5">
          {resolveError && <div role="alert" className="text-red-400 text-sm">{resolveError}</div>}
          <label htmlFor="resolution-text" className="block text-xs text-zinc-500 uppercase tracking-wider">Resolution</label>
          <textarea
            id="resolution-text"
            aria-label="Resolution"
            placeholder="What do you understand now that you didn't when you captured this?"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className={`${inputClass} min-h-[120px] resize-y`}
          />
          <button
            type="button"
            aria-label="Submit resolution"
            aria-disabled={!resolution.trim() || resolveLoading}
            disabled={!resolution.trim() || resolveLoading}
            onClick={handleResolve}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit resolution
          </button>
        </section>
      )}

      {item.status === 'RESOLVED' && (
        <section aria-label="Resolution" className="space-y-2 border-t border-zinc-800 pt-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Resolution</p>
          <div className="bg-zinc-950 rounded-lg p-4 text-zinc-300 text-sm">{item.resolution}</div>
          {item.resolvedAt && <time dateTime={item.resolvedAt} className="text-zinc-600 text-xs">{formatDate(item.resolvedAt)}</time>}
        </section>
      )}
    </article>
  )
}
