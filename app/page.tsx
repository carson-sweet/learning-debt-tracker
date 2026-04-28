'use client'

import { useState, useEffect, useCallback } from 'react'
import { CaptureForm } from '@/components/CaptureForm'
import { BacklogList } from '@/components/BacklogList'
import { Dashboard } from '@/components/Dashboard'
import { ItemDetail } from '@/components/ItemDetail'
import type { DebtItem, DashboardMetrics } from '@/types'

export default function Home() {
  const [items, setItems] = useState<DebtItem[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [selectedItem, setSelectedItem] = useState<DebtItem | null>(null)

  const loadItems = useCallback(async () => {
    const res = await fetch('/api/items?status=ALL')
    if (res.ok) setItems(await res.json())
  }, [])

  const loadMetrics = useCallback(async () => {
    const res = await fetch('/api/dashboard')
    if (res.ok) setMetrics(await res.json())
  }, [])

  const reload = useCallback(async () => {
    await Promise.all([loadItems(), loadMetrics()])
  }, [loadItems, loadMetrics])

  useEffect(() => { reload() }, [reload])

  const handleStatusChange = useCallback((id: string, status: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    loadMetrics()
  }, [loadMetrics])

  const handlePriorityChange = useCallback((id: string, priority: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, priority } : i))
  }, [])

  const handleUpdate = useCallback((updated: DebtItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelectedItem(prev => prev?.id === updated.id ? updated : prev)
    loadMetrics()
  }, [loadMetrics])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-zinc-50 tracking-tight">Learning Debt</h1>
      </div>
      {metrics && <Dashboard metrics={metrics} />}
      <CaptureForm onSuccess={reload} />
      {selectedItem ? (
        <ItemDetail
          item={selectedItem}
          onUpdate={handleUpdate}
          onClose={() => setSelectedItem(null)}
        />
      ) : (
        <BacklogList
          items={items}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onItemClick={setSelectedItem}
        />
      )}
    </div>
  )
}
