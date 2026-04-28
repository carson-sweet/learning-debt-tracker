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
    <article>
      <button type="button" onClick={onClose}>Close</button>
      <h2>{item.title}</h2>

      <label>
        Priority
        <select
          aria-label="Priority"
          value={item.priority}
          onChange={(e) => handlePriorityChange(e.target.value)}
        >
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </label>

      <div>
        <label htmlFor="item-source">Source or context</label>
        <p id="item-source" aria-label="Source or context">{item.source ?? ''}</p>
      </div>

      <section>
        <label htmlFor="item-notes">Notes</label>
        <textarea
          id="item-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesSave}
        />
        {item.status === 'OPEN' && (
          <button type="button" onClick={handleNotesSave}>Save</button>
        )}
      </section>

      {item.status === 'OPEN' && (
        <button type="button" aria-label="Mark as In Progress" onClick={handleMarkInProgress}>
          Mark as In Progress
        </button>
      )}

      {item.status === 'IN_PROGRESS' && (
        <button type="button" aria-label="Move back to Open" onClick={handleMoveToOpen}>
          Move back to Open
        </button>
      )}

      {item.status === 'IN_PROGRESS' && (
        <section>
          <label htmlFor="resource-link">Resource link</label>
          <input
            id="resource-link"
            type="text"
            value={resourceLink}
            onChange={(e) => setResourceLink(e.target.value)}
          />
          {linkError && <span>{linkError}</span>}
          {item.resourceLink && (
            <a href={item.resourceLink} target="_blank" rel="noopener noreferrer">
              {item.resourceLink}
            </a>
          )}
          <button type="button" onClick={handleResourceLinkSave}>Save</button>
        </section>
      )}

      {(item.status === 'OPEN' || item.status === 'IN_PROGRESS') && !resolveOpen && (
        <button type="button" onClick={() => setResolveOpen(true)}>Resolve</button>
      )}

      {resolveOpen && (
        <section aria-label="Resolution">
          {resolveError && <div role="alert">{resolveError}</div>}
          <label htmlFor="resolution-text">
            Resolution
          </label>
          <textarea
            id="resolution-text"
            aria-label="Resolution"
            placeholder="What do you understand now that you didn't when you captured this?"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <button
            type="button"
            aria-label="Submit resolution"
            aria-disabled={!resolution.trim() || resolveLoading}
            disabled={!resolution.trim() || resolveLoading}
            onClick={handleResolve}
          >
            Submit resolution
          </button>
        </section>
      )}

      {item.status === 'RESOLVED' && (
        <section aria-label="Resolution">
          <p>{item.resolution}</p>
          {item.resolvedAt && <time dateTime={item.resolvedAt}>{formatDate(item.resolvedAt)}</time>}
        </section>
      )}
    </article>
  )
}
