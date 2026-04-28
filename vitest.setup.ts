import { execSync } from 'child_process'
import { afterAll } from 'vitest'
import '@testing-library/jest-dom'

// Unique file-based SQLite per worker process — in-memory doesn't survive across subprocesses
const dbPath = `/tmp/test-ldt-${process.pid}.db`
process.env.DATABASE_URL = `file:${dbPath}`

execSync('npx prisma migrate deploy', {
  env: { ...process.env },
  stdio: 'pipe',
})

afterAll(() => {
  try {
    execSync(`rm -f ${dbPath} ${dbPath}-wal ${dbPath}-shm`, { stdio: 'pipe' })
  } catch {}
})
