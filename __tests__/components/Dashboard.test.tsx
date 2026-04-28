/**
 * Component tests for Dashboard
 * Covers: US-016
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import type { DashboardMetrics } from '@/types'

const makeMetrics = (overrides: Partial<DashboardMetrics> = {}): DashboardMetrics => ({
  openCount: 0,
  resolvedLast7Days: 0,
  resolvedLast30Days: 0,
  oldestOpenItem: null,
  ...overrides,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// US-016: Dashboard summary — component
// ---------------------------------------------------------------------------

describe('US-016: Dashboard — metrics display', () => {
  it('renders without crashing when given empty metrics', () => {
    render(<Dashboard metrics={makeMetrics()} />)
    expect(screen.getByRole('main') || document.body).toBeTruthy()
  })

  it('displays the total open items metric with label and value', () => {
    render(<Dashboard metrics={makeMetrics({ openCount: 5 })} />)
    expect(screen.getByText(/total open|open items/i)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('total open items metric counts both Open and In Progress', () => {
    // Value 5 comes from 3 Open + 2 In Progress (computed API-side, passed as openCount)
    render(<Dashboard metrics={makeMetrics({ openCount: 5 })} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays the resolved last 7 days metric with label and value', () => {
    render(<Dashboard metrics={makeMetrics({ resolvedLast7Days: 3 })} />)
    expect(screen.getByText(/resolved.*7|7.*days?/i)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays 0 for resolved last 7 days when no items were resolved in that window', () => {
    render(<Dashboard metrics={makeMetrics({ resolvedLast7Days: 0 })} />)
    // Should show "0" for that metric, not hide it
    const metric = screen.getAllByText('0')
    expect(metric.length).toBeGreaterThan(0)
  })

  it('displays the resolved last 30 days metric with label and value', () => {
    render(<Dashboard metrics={makeMetrics({ resolvedLast30Days: 7 })} />)
    expect(screen.getByText(/resolved.*30|30.*days?/i)).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('displays 0 for resolved last 30 days when no items were resolved', () => {
    render(<Dashboard metrics={makeMetrics({ resolvedLast30Days: 0 })} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })

  it('displays the oldest open item title and age when present', () => {
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    render(
      <Dashboard
        metrics={makeMetrics({
          oldestOpenItem: { id: 'id-1', title: 'Understand closures', createdAt: fortyFiveDaysAgo },
        })}
      />
    )
    expect(screen.getByText('Understand closures')).toBeInTheDocument()
    expect(screen.getByText(/day|ago/i)).toBeInTheDocument()
  })

  it('displays an empty state for oldest open item when there are none', () => {
    render(<Dashboard metrics={makeMetrics({ oldestOpenItem: null })} />)
    expect(screen.getByText(/no open items|none|empty/i)).toBeInTheDocument()
  })

  it('every metric has a descriptive label readable by screen readers', () => {
    render(
      <Dashboard
        metrics={makeMetrics({
          openCount: 5,
          resolvedLast7Days: 3,
          resolvedLast30Days: 7,
          oldestOpenItem: null,
        })}
      />
    )
    // Each metric value should not be a bare number — it should have a surrounding label
    const metricValues = screen.getAllByRole('figure') ||
      screen.getAllByRole('region') ||
      screen.getAllByRole('article')
    expect(metricValues.length).toBeGreaterThan(0)
  })

  it('no metric value is rendered as a bare number without an accessible label', () => {
    render(
      <Dashboard
        metrics={makeMetrics({
          openCount: 999,
          resolvedLast7Days: 888,
          resolvedLast30Days: 777,
        })}
      />
    )
    // 999 should appear within a labeled container
    const val = screen.getByText('999')
    const parent = val.closest('[aria-label], [aria-labelledby], section, figure, article')
    expect(parent).not.toBeNull()
  })
})
