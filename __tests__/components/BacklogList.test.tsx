/**
 * Component tests for BacklogList
 * Covers: US-006, US-007, US-008, US-009, US-011
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BacklogList } from '@/components/BacklogList'
import type { DebtItem } from '@/types'

const makeItem = (overrides: Partial<DebtItem> = {}): DebtItem => ({
  id: 'id-' + Math.random().toString(36).slice(2),
  title: 'Default item title',
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
// US-008: See item details in backlog
// ---------------------------------------------------------------------------

describe('US-008: BacklogList — item details in backlog rows', () => {
  it('displays the item title in the backlog row', () => {
    const items = [makeItem({ title: 'Understand garbage collection' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText('Understand garbage collection')).toBeInTheDocument()
  })

  it('displays a priority badge labeled with the priority value', () => {
    const items = [makeItem({ priority: 'P1' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
  })

  it('displays a status badge for each item', () => {
    const items = [makeItem({ status: 'OPEN' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText(/open/i)).toBeInTheDocument()
  })

  it('displays the source when source is present', () => {
    const items = [makeItem({ source: 'SICP chapter 4' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText('SICP chapter 4')).toBeInTheDocument()
  })

  it('does not display a source section when source is absent', () => {
    const items = [makeItem({ source: undefined })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.queryByTestId('item-source')).not.toBeInTheDocument()
  })

  it('displays an age indicator for items', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    const items = [makeItem({ title: 'Aged item', createdAt: threeDaysAgo })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText(/day|ago/i)).toBeInTheDocument()
  })

  it('IN_PROGRESS items have a visual distinction marker in the row', () => {
    const items = [
      makeItem({ title: 'Open item', status: 'OPEN' }),
      makeItem({ title: 'In Progress item', status: 'IN_PROGRESS' }),
    ]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    // IN_PROGRESS items must have a text label or icon — not color only
    expect(screen.getByText(/in.progress|in progress/i)).toBeInTheDocument()
  })

  it('RESOLVED items display a text label or icon indicating resolution', () => {
    const items = [makeItem({ title: 'Done item', status: 'RESOLVED' })]
    render(<BacklogList items={items} filter="ALL" onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText(/resolv/i)).toBeInTheDocument()
  })

  it('priority badges use text labels not relying on color alone', () => {
    const items = [
      makeItem({ priority: 'P1' }),
      makeItem({ priority: 'P2' }),
      makeItem({ priority: 'P3' }),
    ]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText('P1')).toBeInTheDocument()
    expect(screen.getByText('P2')).toBeInTheDocument()
    expect(screen.getByText('P3')).toBeInTheDocument()
  })

  it('status badges display readable text labels', () => {
    const items = [
      makeItem({ status: 'OPEN' }),
      makeItem({ status: 'IN_PROGRESS' }),
    ]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByText(/\bopen\b/i)).toBeInTheDocument()
    expect(screen.getByText(/in.progress/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// US-007: Filter backlog by status — component behavior
// ---------------------------------------------------------------------------

describe('US-007: BacklogList — filter controls', () => {
  const allItems = [
    makeItem({ title: 'Open item', status: 'OPEN' }),
    makeItem({ title: 'In Progress item', status: 'IN_PROGRESS' }),
    makeItem({ title: 'Resolved item', status: 'RESOLVED' }),
  ]

  it('renders filter controls for Open, In Progress, Resolved, and All', () => {
    render(<BacklogList items={allItems} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(screen.getByRole('button', { name: /\bopen\b/i }) ||
      screen.getByRole('radio', { name: /\bopen\b/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /in.progress/i }) ||
      screen.getByRole('radio', { name: /in.progress/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resolved/i }) ||
      screen.getByRole('radio', { name: /resolved/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /all/i }) ||
      screen.getByRole('radio', { name: /all/i })).toBeInTheDocument()
  })

  it('the active filter control has aria-pressed="true" or aria-selected="true"', async () => {
    const user = userEvent.setup()
    render(<BacklogList items={allItems} onStatusChange={() => {}} onPriorityChange={() => {}} />)

    const inProgressFilter = screen.getByRole('button', { name: /in.progress/i }) ||
      screen.getByRole('radio', { name: /in.progress/i })
    await user.click(inProgressFilter)

    await waitFor(() => {
      const active = screen.getByRole('button', { name: /in.progress/i }) ||
        screen.getByRole('radio', { name: /in.progress/i })
      const pressed = active.getAttribute('aria-pressed')
      const selected = active.getAttribute('aria-selected')
      expect(pressed === 'true' || selected === 'true').toBe(true)
    })
  })

  it('filter controls are operable by keyboard (Tab to reach)', async () => {
    const user = userEvent.setup()
    render(<BacklogList items={allItems} onStatusChange={() => {}} onPriorityChange={() => {}} />)

    await user.tab()
    // At least one filter control should be reachable by Tab
    const focused = document.activeElement
    expect(focused?.getAttribute('role') === 'button' ||
      focused?.getAttribute('role') === 'radio' ||
      focused?.tagName === 'BUTTON').toBe(true)
  })

  it('pressing Enter activates the In Progress filter', async () => {
    const user = userEvent.setup()
    render(<BacklogList items={allItems} onStatusChange={() => {}} onPriorityChange={() => {}} />)

    const inProgressFilter = screen.getByRole('button', { name: /in.progress/i })
    inProgressFilter.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      const active = screen.getByRole('button', { name: /in.progress/i })
      expect(active.getAttribute('aria-pressed') === 'true' ||
        active.getAttribute('aria-selected') === 'true').toBe(true)
    })
  })

  it('pressing Space activates the Resolved filter', async () => {
    const user = userEvent.setup()
    render(<BacklogList items={allItems} onStatusChange={() => {}} onPriorityChange={() => {}} />)

    const resolvedFilter = screen.getByRole('button', { name: /resolved/i })
    resolvedFilter.focus()
    await user.keyboard(' ')

    await waitFor(() => {
      const active = screen.getByRole('button', { name: /resolved/i })
      expect(active.getAttribute('aria-pressed') === 'true' ||
        active.getAttribute('aria-selected') === 'true').toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// US-006 + US-009: Sort order + inline priority change
// ---------------------------------------------------------------------------

describe('US-006 + US-009: BacklogList — sort and priority change', () => {
  it('P1 items appear above P2 items in the rendered list', () => {
    const items = [
      makeItem({ title: 'P2 item', priority: 'P2' }),
      makeItem({ title: 'P1 item', priority: 'P1' }),
    ]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    const rows = screen.getAllByRole('listitem') || screen.getAllByRole('row')
    const p1Row = rows.find(r => within(r).queryByText('P1'))
    const p2Row = rows.find(r => within(r).queryByText('P2'))
    expect(p1Row).toBeDefined()
    expect(p2Row).toBeDefined()
    // P1 row should come before P2 row in the DOM
    expect(p1Row!.compareDocumentPosition(p2Row!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('within same priority, older item appears first', () => {
    const olderDate = new Date('2026-01-01').toISOString()
    const newerDate = new Date('2026-02-01').toISOString()
    const items = [
      makeItem({ title: 'Newer P2', priority: 'P2', createdAt: newerDate }),
      makeItem({ title: 'Older P2', priority: 'P2', createdAt: olderDate }),
    ]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    const rows = screen.getAllByRole('listitem') || screen.getAllByRole('row')
    const olderRow = rows.find(r => within(r).queryByText('Older P2'))
    const newerRow = rows.find(r => within(r).queryByText('Newer P2'))
    expect(olderRow!.compareDocumentPosition(newerRow!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('inline priority selector is present for each backlog row', () => {
    const items = [makeItem({ title: 'Understand memoization', priority: 'P3' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    // There should be a priority selector / combobox in the row
    const selector = screen.getByRole('combobox', { name: /priority/i }) ||
      screen.getByRole('listbox', { name: /priority/i }) ||
      screen.getByLabelText(/priority/i)
    expect(selector).toBeInTheDocument()
  })

  it('calls onPriorityChange when inline priority is changed', async () => {
    const user = userEvent.setup()
    const onPriorityChange = vi.fn()
    const item = makeItem({ title: 'Understand memoization', priority: 'P3', id: 'item-1' })
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...item, priority: 'P1' }),
        { status: 200 }
      )
    )

    render(<BacklogList items={[item]} onStatusChange={() => {}} onPriorityChange={onPriorityChange} />)
    const selector = screen.getByRole('combobox', { name: /priority/i }) ||
      screen.getByLabelText(/priority/i)
    await user.selectOptions(selector as HTMLSelectElement, 'P1')

    await waitFor(() => {
      expect(onPriorityChange).toHaveBeenCalledWith('item-1', 'P1')
    })
  })

  it('priority selector is keyboard-focusable', async () => {
    const user = userEvent.setup()
    const item = makeItem({ title: 'Understand memoization', priority: 'P3' })
    render(<BacklogList items={[item]} onStatusChange={() => {}} onPriorityChange={() => {}} />)

    // Tab into the list
    await user.tab()
    let focused = document.activeElement
    let found = false
    for (let i = 0; i < 10; i++) {
      if (
        focused?.getAttribute('name') === 'priority' ||
        focused?.getAttribute('aria-label')?.toLowerCase().includes('priority') ||
        focused?.tagName === 'SELECT'
      ) {
        found = true
        break
      }
      await user.tab()
      focused = document.activeElement
    }
    expect(found).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// US-011: Mark in-progress — inline backlog action
// ---------------------------------------------------------------------------

describe('US-011: BacklogList — inline mark in-progress action', () => {
  it('shows an inline action to mark an OPEN item as In Progress', () => {
    const items = [makeItem({ title: 'Understand WebSockets', status: 'OPEN' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    expect(
      screen.getByRole('button', { name: /in.progress|mark.*progress/i })
    ).toBeInTheDocument()
  })

  it('the in-progress control has an aria-label or visible label', () => {
    const items = [makeItem({ title: 'Understand WebSockets', status: 'OPEN' })]
    render(<BacklogList items={items} onStatusChange={() => {}} onPriorityChange={() => {}} />)
    const btn = screen.getByRole('button', { name: /in.progress|mark.*progress/i })
    expect(
      btn.getAttribute('aria-label') !== null ||
      btn.textContent?.trim() !== ''
    ).toBe(true)
  })

  it('calls onStatusChange with IN_PROGRESS when the inline button is pressed with Enter', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    const item = makeItem({ title: 'Understand WebSockets', status: 'OPEN', id: 'ws-1' })
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...item, status: 'IN_PROGRESS' }),
        { status: 200 }
      )
    )

    render(<BacklogList items={[item]} onStatusChange={onStatusChange} onPriorityChange={() => {}} />)
    const btn = screen.getByRole('button', { name: /in.progress|mark.*progress/i })
    btn.focus()
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('ws-1', 'IN_PROGRESS')
    })
  })
})
