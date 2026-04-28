'use client'

import { useRef, useState } from 'react'

interface Props {
  onSuccess: () => void
}

export function CaptureForm({ onSuccess }: Props) {
  const titleRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (): string | null => {
    if (!title.trim()) return null
    if (title.length > 300) return 'Title too long (max 300 characters)'
    return null
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title.trim() || loading) return

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), source: source || undefined, priority }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Failed to save item')
        return
      }
      setTitle('')
      setSource('')
      setPriority('P2')
      onSuccess()
      titleRef.current?.focus()
    } catch {
      setError('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div role="alert">{error}</div>}
      <div>
        <label htmlFor="capture-title">Title</label>
        <input
          id="capture-title"
          ref={titleRef}
          aria-label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="capture-source">Source or context</label>
        <input
          id="capture-source"
          aria-label="Source or context"
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          maxLength={500}
        />
      </div>
      <fieldset>
        <legend>Priority</legend>
        {(['P1', 'P2', 'P3'] as const).map((p) => (
          <label key={p}>
            <input
              type="radio"
              name="priority"
              value={p}
              aria-label={p}
              checked={priority === p}
              onChange={() => setPriority(p)}
            />
            {p}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={loading}>
        Add
      </button>
    </form>
  )
}
