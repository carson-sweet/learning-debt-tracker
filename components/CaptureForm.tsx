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
    <form onSubmit={handleSubmit} noValidate className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
      {error && <div role="alert" className="text-red-400 text-sm mb-3">{error}</div>}
      <div className="mb-3">
        <label htmlFor="capture-title" className="sr-only">Title</label>
        <input
          id="capture-title"
          ref={titleRef}
          aria-label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="What do you need to understand?"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
        />
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <label htmlFor="capture-source" className="sr-only">Source or context</label>
          <input
            id="capture-source"
            aria-label="Source or context"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            maxLength={500}
            placeholder="Source or context"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
          />
        </div>
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">Priority</legend>
          <div className="flex rounded-md overflow-hidden border border-zinc-700">
            {(['P1', 'P2', 'P3'] as const).map((p, i) => (
              <label
                key={p}
                className={`relative cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${i > 0 ? 'border-l border-zinc-700' : ''} ${priority === p ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  aria-label={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="sr-only"
                />
                {p}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </form>
  )
}
