/**
 * API integration tests for /api/items
 * Covers: US-001, US-002, US-003, US-006, US-007, US-009, US-010, US-011
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/items/route'
import { GET as getById, PATCH, DELETE } from '@/app/api/items/[id]/route'
import { POST as resolve } from '@/app/api/items/[id]/resolve/route'
import { prisma } from '@/lib/prisma'

beforeEach(async () => {
  await prisma.debtItem.deleteMany()
})

// ---------------------------------------------------------------------------
// US-001: Capture a debt item with title only
// ---------------------------------------------------------------------------

describe('US-001: Capture a debt item with title only', () => {
  it('creates an item with only a title and returns 201', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand transformer attention mechanism' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('Understand transformer attention mechanism')
  })

  it('defaults priority to P2 when not provided', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand transformer attention mechanism' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.priority).toBe('P2')
  })

  it('defaults status to OPEN when not provided', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand transformer attention mechanism' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.status).toBe('OPEN')
  })

  it('includes a createdAt timestamp on the created item', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand transformer attention mechanism' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.createdAt).toBeDefined()
    expect(new Date(body.createdAt).getTime()).not.toBeNaN()
  })

  it('returns 400 when title is empty string', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when title is whitespace-only', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when title is missing from the body', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when title exceeds 300 characters', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'a'.repeat(301) }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/title|long|character/i)
  })

  it('accepts a title of exactly 300 characters', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'a'.repeat(300) }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('GET /api/items returns the newly created item in the list', async () => {
    const postReq = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand transformer attention mechanism' }),
    })
    await POST(postReq)

    const getReq = new Request('http://localhost/api/items')
    const res = await GET(getReq)
    expect(res.status).toBe(200)
    const items = await res.json()
    expect(Array.isArray(items)).toBe(true)
    expect(items.some((i: { title: string }) => i.title === 'Understand transformer attention mechanism')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// US-002: Set priority at capture
// ---------------------------------------------------------------------------

describe('US-002: Set priority at capture', () => {
  it('saves the item with priority P1 when P1 is specified', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Learn about monads', priority: 'P1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.priority).toBe('P1')
  })

  it('saves the item with priority P2 when P2 is specified', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Learn about monads', priority: 'P2' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.priority).toBe('P2')
  })

  it('saves the item with priority P3 when P3 is specified', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Learn about monads', priority: 'P3' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.priority).toBe('P3')
  })

  it('creates item successfully when priority selector is not interacted with (no priority field)', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Learn about monads' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})

// ---------------------------------------------------------------------------
// US-003: Add source context at capture
// ---------------------------------------------------------------------------

describe('US-003: Add source context at capture', () => {
  it('creates item with source text when source is provided', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Understand RAFT consensus',
        source: 'Came up in the distributed systems chapter of Designing Data-Intensive Applications',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.source).toBe(
      'Came up in the distributed systems chapter of Designing Data-Intensive Applications'
    )
  })

  it('creates item with no source when source is omitted', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Understand RAFT consensus' }),
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.source == null || body.source === '').toBe(true)
  })

  it('accepts a source of exactly 500 characters', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Understand RAFT consensus',
        source: 'x'.repeat(500),
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('returns 400 when source exceeds 500 characters', async () => {
    const req = new Request('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Understand RAFT consensus',
        source: 'x'.repeat(501),
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// US-006: View backlog sorted by priority and age
// ---------------------------------------------------------------------------

describe('US-006: View backlog sorted by priority and age', () => {
  it('GET /api/items returns only OPEN items by default', async () => {
    const now = Date.now()
    await prisma.debtItem.createMany({
      data: [
        { title: 'Open item', status: 'OPEN', priority: 'P2' },
        { title: 'In Progress item', status: 'IN_PROGRESS', priority: 'P2' },
        { title: 'Resolved item', status: 'RESOLVED', priority: 'P2' },
      ],
    })

    const req = new Request('http://localhost/api/items')
    const res = await GET(req)
    const items = await res.json()
    const statuses = items.map((i: { status: string }) => i.status)
    expect(statuses.every((s: string) => s === 'OPEN')).toBe(true)
    expect(statuses).not.toContain('RESOLVED')
  })

  it('P1 items appear before P2 items in the response', async () => {
    await prisma.debtItem.create({
      data: { title: 'P2 item', priority: 'P2', status: 'OPEN', createdAt: new Date('2026-01-01') },
    })
    await prisma.debtItem.create({
      data: { title: 'P1 item', priority: 'P1', status: 'OPEN', createdAt: new Date('2026-01-02') },
    })

    const req = new Request('http://localhost/api/items')
    const res = await GET(req)
    const items = await res.json()
    const p1Index = items.findIndex((i: { priority: string }) => i.priority === 'P1')
    const p2Index = items.findIndex((i: { priority: string }) => i.priority === 'P2')
    expect(p1Index).toBeLessThan(p2Index)
  })

  it('P2 items appear before P3 items in the response', async () => {
    await prisma.debtItem.create({
      data: { title: 'P3 item', priority: 'P3', status: 'OPEN', createdAt: new Date('2026-01-01') },
    })
    await prisma.debtItem.create({
      data: { title: 'P2 item', priority: 'P2', status: 'OPEN', createdAt: new Date('2026-01-02') },
    })

    const req = new Request('http://localhost/api/items')
    const res = await GET(req)
    const items = await res.json()
    const p2Index = items.findIndex((i: { priority: string }) => i.priority === 'P2')
    const p3Index = items.findIndex((i: { priority: string }) => i.priority === 'P3')
    expect(p2Index).toBeLessThan(p3Index)
  })

  it('within the same priority, older items appear first', async () => {
    await prisma.debtItem.create({
      data: { title: 'Understand UDP', priority: 'P2', status: 'OPEN', createdAt: new Date('2026-02-01') },
    })
    await prisma.debtItem.create({
      data: { title: 'Understand TCP handshake', priority: 'P2', status: 'OPEN', createdAt: new Date('2026-01-01') },
    })

    const req = new Request('http://localhost/api/items')
    const res = await GET(req)
    const items = await res.json()
    const tcpIndex = items.findIndex((i: { title: string }) => i.title === 'Understand TCP handshake')
    const udpIndex = items.findIndex((i: { title: string }) => i.title === 'Understand UDP')
    expect(tcpIndex).toBeLessThan(udpIndex)
  })
})

// ---------------------------------------------------------------------------
// US-007: Filter backlog by status
// ---------------------------------------------------------------------------

describe('US-007: Filter backlog by status', () => {
  beforeEach(async () => {
    await prisma.debtItem.createMany({
      data: [
        { title: 'Open item A', status: 'OPEN', priority: 'P2' },
        { title: 'In Progress item B', status: 'IN_PROGRESS', priority: 'P2' },
        { title: 'Resolved item C', status: 'RESOLVED', priority: 'P2' },
      ],
    })
  })

  it('GET /api/items?status=OPEN returns only open items', async () => {
    const req = new Request('http://localhost/api/items?status=OPEN')
    const res = await GET(req)
    const items = await res.json()
    expect(items.every((i: { status: string }) => i.status === 'OPEN')).toBe(true)
  })

  it('GET /api/items?status=IN_PROGRESS returns only in-progress items', async () => {
    const req = new Request('http://localhost/api/items?status=IN_PROGRESS')
    const res = await GET(req)
    const items = await res.json()
    expect(items.every((i: { status: string }) => i.status === 'IN_PROGRESS')).toBe(true)
  })

  it('GET /api/items?status=RESOLVED returns only resolved items', async () => {
    const req = new Request('http://localhost/api/items?status=RESOLVED')
    const res = await GET(req)
    const items = await res.json()
    expect(items.every((i: { status: string }) => i.status === 'RESOLVED')).toBe(true)
  })

  it('GET /api/items?status=ALL returns items of all statuses', async () => {
    const req = new Request('http://localhost/api/items?status=ALL')
    const res = await GET(req)
    const items = await res.json()
    const statuses = new Set(items.map((i: { status: string }) => i.status))
    expect(statuses.has('OPEN')).toBe(true)
    expect(statuses.has('IN_PROGRESS')).toBe(true)
    expect(statuses.has('RESOLVED')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// US-009: Change item priority
// ---------------------------------------------------------------------------

describe('US-009: Change item priority', () => {
  it('PATCH /api/items/:id updates priority and persists it', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand memoization', priority: 'P3', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'P1' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.priority).toBe('P1')
  })

  it('PATCH priority to P2 persists P2', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand memoization', priority: 'P3', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'P2' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.priority).toBe('P2')
  })

  it('PATCH priority to P3 persists P3', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand memoization', priority: 'P2', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'P3' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.priority).toBe('P3')
  })

  it('returns 404 when patching a non-existent item', async () => {
    const req = new Request('http://localhost/api/items/nonexistent-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: 'P1' }),
    })
    const res = await PATCH(req, { params: { id: 'nonexistent-id' } })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// US-010: Add or edit notes on an item
// ---------------------------------------------------------------------------

describe('US-010: Add or edit notes on an item', () => {
  it('PATCH /api/items/:id saves notes text', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand futures and promises', priority: 'P2', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Promises are eager, futures are lazy in many implementations' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.notes).toBe('Promises are eager, futures are lazy in many implementations')
  })

  it('GET /api/items/:id returns existing notes', async () => {
    const item = await prisma.debtItem.create({
      data: {
        title: 'Understand futures and promises',
        priority: 'P2',
        status: 'OPEN',
        notes: 'Already read MDN article on Promises',
      },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`)
    const res = await getById(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.notes).toBe('Already read MDN article on Promises')
  })

  it('saves notes with multi-line text exactly as entered', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand futures and promises', priority: 'P2', status: 'OPEN' },
    })
    const multilineNote = 'Line one\nLine two\nhttps://example.com\nSpecial chars: <>&"'

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: multilineNote }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.notes).toBe(multilineNote)
  })
})

// ---------------------------------------------------------------------------
// US-011: Mark an item as in-progress
// ---------------------------------------------------------------------------

describe('US-011: Mark an item as in-progress', () => {
  it('PATCH /api/items/:id with status=IN_PROGRESS changes status', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand WebSockets', priority: 'P2', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('IN_PROGRESS')
  })

  it('PATCH /api/items/:id records a status_changed_at or updatedAt timestamp when marking in progress', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand WebSockets', priority: 'P2', status: 'OPEN' },
    })
    const before = new Date()

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    const body = await res.json()
    const updatedAt = new Date(body.updatedAt)
    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('PATCH /api/items/:id can move IN_PROGRESS item back to OPEN', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand WebSockets', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'OPEN' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('OPEN')
  })

  it('PATCH status to RESOLVED is not allowed via the general update endpoint', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand WebSockets', priority: 'P2', status: 'OPEN' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// US-012: Add a resource link to an in-progress item
// ---------------------------------------------------------------------------

describe('US-012: Add a resource link to an in-progress item', () => {
  it('saves a valid https URL as resource link', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resourceLink).toBe('https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API')
  })

  it('saves item with no resource link when field is omitted', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'some note' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resourceLink == null || body.resourceLink === '').toBe(true)
  })

  it('accepts http:// URLs', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'http://example.com/path?query=value' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
  })

  it('accepts URLs with fragments', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'https://docs.example.org/page#section' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
  })

  it('returns 400 for a URL without protocol (bare domain)', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'example.com' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })

  it('returns 400 for an ftp:// URL', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'ftp://example.com' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })

  it('returns 400 for a plain string that is not a URL', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand service workers', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceLink: 'not a url at all' }),
    })
    const res = await PATCH(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// US-013: Write a self-explanation to resolve an item
// ---------------------------------------------------------------------------

describe('US-013: Write a self-explanation to resolve an item', () => {
  it('POST /api/items/:id/resolve with valid explanation sets status to RESOLVED', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolution: 'The event loop processes the call stack and task queue in alternating cycles',
      }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('RESOLVED')
  })

  it('POST /api/items/:id/resolve records a resolvedAt timestamp', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })
    const before = new Date()

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resolution: 'The event loop processes the call stack and task queue',
      }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.resolvedAt).toBeDefined()
    expect(new Date(body.resolvedAt).getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('POST /api/items/:id/resolve saves the resolution text', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })
    const explanationText =
      'The event loop processes the call stack and task queue in alternating cycles'

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: explanationText }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.resolution).toBe(explanationText)
  })

  it('accepts a single-character resolution', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: 'x' }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('RESOLVED')
  })

  it('accepts a multi-paragraph resolution', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })
    const longExplanation = 'Paragraph one.\n\nParagraph two with more detail.\n\nParagraph three conclusion.'

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: longExplanation }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('RESOLVED')
  })

  it('returns 400 when resolution is empty string', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: '' }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })

  it('returns 400 when resolution is whitespace-only', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: '   \n\t  ' }),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })

  it('does not change status when resolution is empty (force-submit attempt)', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: '' }),
    })
    await resolve(req, { params: { id: item.id } })

    const unchanged = await prisma.debtItem.findUnique({ where: { id: item.id } })
    expect(unchanged?.status).toBe('IN_PROGRESS')
  })

  it('returns 400 when resolution field is missing', async () => {
    const item = await prisma.debtItem.create({
      data: { title: 'Understand event loop', priority: 'P2', status: 'IN_PROGRESS' },
    })

    const req = new Request(`http://localhost/api/items/${item.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await resolve(req, { params: { id: item.id } })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// US-014: View a resolution explanation after closing an item
// ---------------------------------------------------------------------------

describe('US-014: View a resolution explanation after closing an item', () => {
  it('GET /api/items/:id returns the resolution text for a resolved item', async () => {
    const resolvedAt = new Date('2026-04-25T14:30:00Z')
    const item = await prisma.debtItem.create({
      data: {
        title: 'Understand event loop',
        priority: 'P2',
        status: 'RESOLVED',
        resolution:
          'The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles',
        resolvedAt,
      },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`)
    const res = await getById(req, { params: { id: item.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resolution).toBe(
      'The event loop processes the call stack and the task queue in alternating microtask and macrotask cycles'
    )
  })

  it('GET /api/items/:id returns the resolvedAt timestamp for a resolved item', async () => {
    const resolvedAt = new Date('2026-04-25T14:30:00Z')
    const item = await prisma.debtItem.create({
      data: {
        title: 'Understand event loop',
        priority: 'P2',
        status: 'RESOLVED',
        resolution: 'Some explanation',
        resolvedAt,
      },
    })

    const req = new Request(`http://localhost/api/items/${item.id}`)
    const res = await getById(req, { params: { id: item.id } })
    const body = await res.json()
    expect(body.resolvedAt).toBeDefined()
    expect(new Date(body.resolvedAt).toISOString()).toBe(resolvedAt.toISOString())
  })
})
