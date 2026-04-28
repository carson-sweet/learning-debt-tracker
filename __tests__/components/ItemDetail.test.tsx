/**
 * Component tests for ItemDetail
 * Covers: US-009, US-010, US-011, US-012, US-013, US-014, US-015
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemDetail } from '@/components/ItemDetail'
import type { DebtItem } from '@/types'

const makeItem = (overrides: Partial<DebtItem> = {}): DebtItem => ({
  id: 'test-item-id',
  title: 'Understand futures and promises',
  priority: 'P2',
  status: 'OPEN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// US-009: Change item priority — detail view
// ---------------------------------------------------------------------------

describe('US-009: ItemDetail — change priority', () => {
  it('renders a priority selector with all three options', () => {
    render(<ItemDetail item={makeItem()} onUpdate={() => {}} onClose={() => {}} />)
    const selector = screen.getByRole('combobox', { name: /priority/i }) ||
      screen.getByLabelText(/priority/i)
    expect(selector).toBeInTheDocument()
    expect(screen.getAllByText(/P1/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/P2/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/P3/i).length).toBeGreaterThan(0)
  })

  it('saves the priority change without a separate save button', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...makeItem(), priority: 'P1' }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem({ priority: 'P3' })} onUpdate={onUpdate} onClose={() => {}} />)
    const selector = screen.getByRole('combobox', { name: /priority/i }) ||
      screen.getByLabelText(/priority/i)
    await user.selectOptions(selector as HTMLSelectElement, 'P1')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ priority: 'P1' }))
    })
  })
})

// ---------------------------------------------------------------------------
// US-010: Add or edit notes on an item
// ---------------------------------------------------------------------------

describe('US-010: ItemDetail — notes field', () => {
  it('renders a notes text field on the detail view', () => {
    render(<ItemDetail item={makeItem()} onUpdate={() => {}} onClose={() => {}} />)
    const notesField = screen.getByRole('textbox', { name: /notes/i }) ||
      screen.getByLabelText(/notes/i)
    expect(notesField).toBeInTheDocument()
  })

  it('displays existing notes in the notes field when item is opened', () => {
    const item = makeItem({ notes: 'Already read MDN article on Promises' })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    const notesField = screen.getByRole('textbox', { name: /notes/i }) ||
      screen.getByLabelText(/notes/i)
    expect(notesField).toHaveValue('Already read MDN article on Promises')
  })

  it('notes and source fields are separate labeled fields', () => {
    render(<ItemDetail item={makeItem()} onUpdate={() => {}} onClose={() => {}} />)
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/source|context/i)).toBeInTheDocument()
  })

  it('saves notes when focus leaves the notes field (onBlur)', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...makeItem(), notes: 'Promises are eager, futures are lazy in many implementations' }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem()} onUpdate={onUpdate} onClose={() => {}} />)
    const notesField = screen.getByLabelText(/notes/i)
    await user.type(notesField, 'Promises are eager, futures are lazy in many implementations')
    await user.tab() // blur

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Promises are eager, futures are lazy in many implementations' })
      )
    })
  })

  it('does not save notes while the user is still typing (no auto-save mid-type)', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(global, 'fetch')

    render(<ItemDetail item={makeItem()} onUpdate={() => {}} onClose={() => {}} />)
    const notesField = screen.getByLabelText(/notes/i)
    await user.type(notesField, 'partial note in progress')
    // Note: we have NOT blurred or pressed save

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('saves notes when the save action is pressed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...makeItem(), notes: 'Promises are eager, futures are lazy in many implementations' }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem()} onUpdate={onUpdate} onClose={() => {}} />)
    const notesField = screen.getByLabelText(/notes/i)
    await user.type(notesField, 'Promises are eager, futures are lazy in many implementations')
    const saveBtn = screen.getByRole('button', { name: /save/i })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Promises are eager, futures are lazy in many implementations' })
      )
    })
  })
})

// ---------------------------------------------------------------------------
// US-011: Mark in-progress — detail view
// ---------------------------------------------------------------------------

describe('US-011: ItemDetail — mark in-progress control', () => {
  it('shows a Mark as In Progress control on an OPEN item', () => {
    render(<ItemDetail item={makeItem({ status: 'OPEN' })} onUpdate={() => {}} onClose={() => {}} />)
    expect(
      screen.getByRole('button', { name: /in.progress|mark.*progress/i })
    ).toBeInTheDocument()
  })

  it('the in-progress control is keyboard-operable via Enter', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...makeItem(), status: 'IN_PROGRESS' }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem({ title: 'Understand WebSockets', status: 'OPEN' })} onUpdate={onUpdate} onClose={() => {}} />)
    const btn = screen.getByRole('button', { name: /in.progress|mark.*progress/i })
    btn.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'IN_PROGRESS' }))
    })
  })

  it('shows a Move back to Open control on an IN_PROGRESS item', () => {
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    expect(
      screen.getByRole('button', { name: /\bopen\b|move.*open|back.*open/i })
    ).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// US-012: Add a resource link — detail view
// ---------------------------------------------------------------------------

describe('US-012: ItemDetail — resource link field', () => {
  it('shows a resource link field for IN_PROGRESS items', () => {
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    const linkField = screen.getByRole('textbox', { name: /resource|link|url/i }) ||
      screen.getByLabelText(/resource|link|url/i)
    expect(linkField).toBeInTheDocument()
  })

  it('does not show the resource link field for OPEN items', () => {
    render(<ItemDetail item={makeItem({ status: 'OPEN' })} onUpdate={() => {}} onClose={() => {}} />)
    expect(screen.queryByRole('textbox', { name: /resource.*link|link.*url/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/resource.*link/i)).not.toBeInTheDocument()
  })

  it('does not show the resource link field for RESOLVED items', () => {
    render(<ItemDetail item={makeItem({ status: 'RESOLVED' })} onUpdate={() => {}} onClose={() => {}} />)
    expect(screen.queryByRole('textbox', { name: /resource.*link|link.*url/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/resource.*link/i)).not.toBeInTheDocument()
  })

  it('displays a saved URL as a clickable hyperlink', () => {
    const item = makeItem({
      status: 'IN_PROGRESS',
      resourceLink: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    const link = screen.getByRole('link', { name: /developer\.mozilla\.org|service.*worker/i }) ||
      screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API')
  })

  it('resource link opens in a new tab (target="_blank")', () => {
    const item = makeItem({
      status: 'IN_PROGRESS',
      resourceLink: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('resource link has rel="noopener noreferrer" for security', () => {
    const item = makeItem({
      status: 'IN_PROGRESS',
      resourceLink: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    const link = screen.getByRole('link')
    const rel = link.getAttribute('rel') ?? ''
    expect(rel).toContain('noopener')
    expect(rel).toContain('noreferrer')
  })

  it('shows a validation error for invalid URL input (bare domain)', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    const linkField = screen.getByLabelText(/resource|link|url/i)
    await user.type(linkField, 'example.com')
    const saveBtn = screen.getByRole('button', { name: /save/i })
    await user.click(saveBtn)

    expect(screen.getByText(/invalid|url|http/i)).toBeInTheDocument()
  })

  it('shows a validation error for ftp:// URLs', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    const linkField = screen.getByLabelText(/resource|link|url/i)
    await user.type(linkField, 'ftp://example.com')
    const saveBtn = screen.getByRole('button', { name: /save/i })
    await user.click(saveBtn)

    expect(screen.getByText(/invalid|url|http/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// US-013 + US-015: Resolve with self-explanation + cannot resolve without one
// ---------------------------------------------------------------------------

describe('US-013 + US-015: ItemDetail — resolve flow', () => {
  it('shows a Resolve action control on an IN_PROGRESS item', () => {
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument()
  })

  it('activating Resolve reveals a resolution textarea', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    expect(screen.getByRole('textbox', { name: /resolution|explanation/i }) ||
      screen.getByPlaceholderText(/what do you understand now/i)
    ).toBeInTheDocument()
  })

  it('resolution textarea has the correct placeholder text', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    expect(
      screen.getByPlaceholderText(/what do you understand now that you didn.t when you captured this/i)
    ).toBeInTheDocument()
  })

  it('Submit resolution button is disabled (aria-disabled=true) when textarea is empty', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true')
  })

  it('Submit resolution button is disabled when textarea contains only spaces', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, '     ')
    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true')
  })

  it('Submit resolution button is disabled when textarea contains only newlines', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, '{Enter}{Enter}{Enter}')
    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true')
  })

  it('Submit resolution button is disabled when textarea contains only tabs', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, '\t\t\t')
    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true')
  })

  it('Submit resolution button becomes enabled when at least one non-whitespace character is entered', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'a')
    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn.getAttribute('aria-disabled')).not.toBe('true')
  })

  it('Submit resolution button transitions back to disabled when text is cleared', async () => {
    const user = userEvent.setup()
    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'I now understand')
    // Verify enabled first
    expect(screen.getByRole('button', { name: /submit.resolution/i }).getAttribute('aria-disabled')).not.toBe('true')
    // Clear
    await user.clear(textarea)
    expect(screen.getByRole('button', { name: /submit.resolution/i }).getAttribute('aria-disabled')).toBe('true')
  })

  it('submitting a valid resolution calls onUpdate with RESOLVED status', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...makeItem({ status: 'IN_PROGRESS' }),
          status: 'RESOLVED',
          resolution: 'The event loop processes the call stack and task queue in alternating cycles',
          resolvedAt: new Date().toISOString(),
        }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={onUpdate} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'The event loop processes the call stack and task queue in alternating cycles')
    await user.click(screen.getByRole('button', { name: /submit.resolution/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'RESOLVED' })
      )
    })
  })

  it('accepts a single-character resolution', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...makeItem(), status: 'RESOLVED', resolution: 'x', resolvedAt: new Date().toISOString() }),
        { status: 200 }
      )
    )

    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={onUpdate} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'x')
    await user.click(screen.getByRole('button', { name: /submit.resolution/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'RESOLVED' }))
    })
  })

  it('disables the submit button while a resolve request is in flight', async () => {
    const user = userEvent.setup()
    let resolveRequest!: (value: Response) => void
    vi.spyOn(global, 'fetch').mockImplementationOnce(
      () => new Promise<Response>((res) => { resolveRequest = res })
    )

    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'Some explanation')
    await user.click(screen.getByRole('button', { name: /submit.resolution/i }))

    const submitBtn = screen.getByRole('button', { name: /submit.resolution/i })
    expect(submitBtn).toBeDisabled()

    resolveRequest(
      new Response(
        JSON.stringify({ ...makeItem(), status: 'RESOLVED', resolution: 'Some explanation', resolvedAt: new Date().toISOString() }),
        { status: 200 }
      )
    )
  })

  it('shows an error message when the resolve API call fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
    )

    render(<ItemDetail item={makeItem({ status: 'IN_PROGRESS' })} onUpdate={() => {}} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /resolve/i }))
    const textarea = screen.getByPlaceholderText(/what do you understand now/i)
    await user.type(textarea, 'Some explanation')
    await user.click(screen.getByRole('button', { name: /submit.resolution/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert') || screen.getByText(/error|failed|could not/i)).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// US-014: View resolution after closing
// ---------------------------------------------------------------------------

describe('US-014: ItemDetail — view resolution on resolved item', () => {
  it('displays the resolution explanation for a resolved item', () => {
    const item = makeItem({
      status: 'RESOLVED',
      resolution: 'The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles',
      resolvedAt: '2026-04-25T14:30:00Z',
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    expect(
      screen.getByText(
        'The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles'
      )
    ).toBeInTheDocument()
  })

  it('the resolution explanation is read-only (not an editable input)', () => {
    const item = makeItem({
      status: 'RESOLVED',
      resolution: 'Some explanation',
      resolvedAt: new Date().toISOString(),
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    // Resolution should be displayed in a non-editable element
    const explanationEl = screen.getByText('Some explanation')
    expect(
      explanationEl.tagName !== 'INPUT' &&
      explanationEl.tagName !== 'TEXTAREA' &&
      explanationEl.getAttribute('contenteditable') !== 'true'
    ).toBe(true)
  })

  it('displays the resolvedAt timestamp near the resolution explanation', () => {
    const item = makeItem({
      status: 'RESOLVED',
      resolution: 'Some explanation',
      resolvedAt: '2026-04-25T14:30:00Z',
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    // Timestamp should be visible somewhere on the page
    expect(screen.getByText(/2026|apr|april|25/i)).toBeInTheDocument()
  })

  it('resolution explanation and notes are displayed as separate sections', () => {
    const item = makeItem({
      status: 'RESOLVED',
      resolution: 'The resolution text here',
      notes: 'Read the MDN event loop article',
      resolvedAt: new Date().toISOString(),
    })
    render(<ItemDetail item={item} onUpdate={() => {}} onClose={() => {}} />)
    expect(screen.getByText('The resolution text here')).toBeInTheDocument()
    expect(screen.getByText('Read the MDN event loop article')).toBeInTheDocument()
    // They should be in separate containers
    const resolutionEl = screen.getByText('The resolution text here')
    const notesEl = screen.getByText('Read the MDN event loop article')
    expect(resolutionEl).not.toBe(notesEl)
    expect(resolutionEl.closest('section, div, article')).not.toBe(
      notesEl.closest('section, div, article')
    )
  })
})
