/**
 * Component tests for CaptureForm
 * Covers: US-001, US-002, US-003, US-004, US-005
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CaptureForm } from '@/components/CaptureForm'

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// US-001: Capture a debt item with title only — UI behavior
// ---------------------------------------------------------------------------

describe('US-001: CaptureForm — capture input visibility and default focus', () => {
  it('renders a text input for capturing a new item', () => {
    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    expect(input).toBeInTheDocument()
  })

  it('auto-focuses the capture input on mount without user interaction', () => {
    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    expect(document.activeElement).toBe(input)
  })

  it('clears the input after successful submission', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: '1', title: 'Understand transformer attention mechanism', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    )

    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    await user.type(input, 'Understand transformer attention mechanism')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('restores focus to the capture input after successful submission', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: '1', title: 'Test', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    )

    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    await user.type(input, 'Test')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(document.activeElement).toBe(input)
    })
  })

  it('does not submit and keeps input focused when title is empty', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    await user.keyboard('{Enter}')

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(input)
  })

  it('does not submit when title is whitespace-only', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows an error and does not submit when title exceeds 300 characters', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(<CaptureForm onSuccess={() => {}} />)
    const input = screen.getByRole('textbox', { name: /title|capture/i })
    await user.type(input, 'a'.repeat(301))
    await user.keyboard('{Enter}')

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.getByText(/too long|300|character/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// US-002: Set priority at capture — UI behavior
// ---------------------------------------------------------------------------

describe('US-002: CaptureForm — priority selector', () => {
  it('renders a priority selector with options P1, P2, and P3', () => {
    render(<CaptureForm onSuccess={() => {}} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
    expect(screen.getByText('P3')).toBeInTheDocument()
  })

  it('submits with P1 when P1 is selected', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> = {}
    vi.spyOn(global, 'fetch').mockImplementationOnce(async (_url, opts) => {
      capturedBody = JSON.parse((opts?.body as string) ?? '{}')
      return new Response(
        JSON.stringify({ id: '1', title: 'Learn about monads', priority: 'P1', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    })

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Learn about monads')

    // Select P1 — could be radio, button, or select; use accessible name
    const p1Option = screen.getByRole('radio', { name: /P1/i }) ||
      screen.getByRole('button', { name: /P1/i }) ||
      screen.getByLabelText(/P1/i)
    await user.click(p1Option)
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(capturedBody.priority).toBe('P1')
    })
  })

  it('submits with P2 when no priority is selected (default)', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> = {}
    vi.spyOn(global, 'fetch').mockImplementationOnce(async (_url, opts) => {
      capturedBody = JSON.parse((opts?.body as string) ?? '{}')
      return new Response(
        JSON.stringify({ id: '1', title: 'Learn about monads', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    })

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Learn about monads')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(capturedBody.priority === 'P2' || capturedBody.priority == null).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// US-003: Add source context at capture — UI behavior
// ---------------------------------------------------------------------------

describe('US-003: CaptureForm — source field', () => {
  it('renders a source or context text field', () => {
    render(<CaptureForm onSuccess={() => {}} />)
    const sourceField = screen.getByRole('textbox', { name: /source|context/i })
    expect(sourceField).toBeInTheDocument()
  })

  it('submits with source text when source is entered', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> = {}
    vi.spyOn(global, 'fetch').mockImplementationOnce(async (_url, opts) => {
      capturedBody = JSON.parse((opts?.body as string) ?? '{}')
      return new Response(
        JSON.stringify({ id: '1', title: 'Understand RAFT consensus', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    })

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Understand RAFT consensus')
    await user.type(screen.getByRole('textbox', { name: /source|context/i }), 'Came up in the distributed systems chapter of Designing Data-Intensive Applications')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(capturedBody.source).toBe(
        'Came up in the distributed systems chapter of Designing Data-Intensive Applications'
      )
    })
  })

  it('submits successfully with no source entered', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: '1', title: 'Understand RAFT consensus', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    )

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Understand RAFT consensus')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })
  })

  it('source field has a maxlength of 500 characters', () => {
    render(<CaptureForm onSuccess={() => {}} />)
    const sourceField = screen.getByRole('textbox', { name: /source|context/i })
    expect(sourceField).toHaveAttribute('maxlength', '500')
  })
})

// ---------------------------------------------------------------------------
// US-004: Keyboard-first capture — UI behavior
// ---------------------------------------------------------------------------

describe('US-004: CaptureForm — keyboard-first capture', () => {
  it('Tab from title input moves focus to source field', async () => {
    const user = userEvent.setup()
    render(<CaptureForm onSuccess={() => {}} />)
    const titleInput = screen.getByRole('textbox', { name: /title|capture/i })
    titleInput.focus()
    await user.keyboard('{Tab}')
    const sourceField = screen.getByRole('textbox', { name: /source|context/i })
    expect(document.activeElement).toBe(sourceField)
  })

  it('Tab from source field moves focus to priority selector', async () => {
    const user = userEvent.setup()
    render(<CaptureForm onSuccess={() => {}} />)
    const sourceField = screen.getByRole('textbox', { name: /source|context/i })
    sourceField.focus()
    await user.keyboard('{Tab}')
    // Priority selector should have focus after Tab from source
    const focused = document.activeElement
    expect(focused).not.toBe(sourceField)
    // Verify the focused element is within the priority selector area
    expect(focused?.closest('[data-testid="priority-selector"]') !== null ||
      focused?.getAttribute('name') === 'priority' ||
      focused?.getAttribute('role') === 'radiogroup' ||
      (focused as HTMLElement)?.dataset?.priority !== undefined ||
      screen.getByRole('group', { name: /priority/i }).contains(focused as Element)
    ).toBe(true)
  })

  it('pressing Enter from title field submits when title is non-empty', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ id: '1', title: 'Understand CAP theorem', priority: 'P2', status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
        { status: 201 }
      )
    )

    render(<CaptureForm onSuccess={() => {}} />)
    const titleInput = screen.getByRole('textbox', { name: /title|capture/i })
    titleInput.focus()
    await user.type(titleInput, 'Understand CAP theorem')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })
  })

  it('pressing Enter from title field does not submit when title is empty', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(<CaptureForm onSuccess={() => {}} />)
    const titleInput = screen.getByRole('textbox', { name: /title|capture/i })
    titleInput.focus()
    await user.keyboard('{Enter}')

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// US-005: Capture confirmation — error state preservation
// ---------------------------------------------------------------------------

describe('US-005: CaptureForm — error handling', () => {
  it('shows an error message when the API returns an error', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
    )

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Understand event sourcing')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByRole('alert') || screen.getByText(/error|failed|could not/i)).toBeInTheDocument()
    })
  })

  it('preserves the title input value after a save failure', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
    )

    render(<CaptureForm onSuccess={() => {}} />)
    const titleInput = screen.getByRole('textbox', { name: /title|capture/i })
    await user.type(titleInput, 'Understand event sourcing')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(titleInput).toHaveValue('Understand event sourcing')
    })
  })

  it('preserves the source field value after a save failure', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
    )

    render(<CaptureForm onSuccess={() => {}} />)
    await user.type(screen.getByRole('textbox', { name: /title|capture/i }), 'Understand event sourcing')
    const sourceField = screen.getByRole('textbox', { name: /source|context/i })
    await user.type(sourceField, 'Came up in a podcast episode')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(sourceField).toHaveValue('Came up in a podcast episode')
    })
  })
})
