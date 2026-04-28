export type Priority = 'P1' | 'P2' | 'P3'
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface DebtItem {
  id: string
  title: string
  priority: Priority
  status: Status
  source?: string
  notes?: string
  resourceLink?: string
  resolution?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface CreateItemRequest {
  title: string
  priority?: Priority
  source?: string
}

export interface UpdateItemRequest {
  title?: string
  priority?: Priority
  status?: 'OPEN' | 'IN_PROGRESS'
  source?: string
  notes?: string
  resourceLink?: string
}

export interface ResolveItemRequest {
  resolution: string
}

export interface DashboardMetrics {
  openCount: number
  resolvedLast7Days: number
  resolvedLast30Days: number
  oldestOpenItem: { id: string; title: string; createdAt: string } | null
}
