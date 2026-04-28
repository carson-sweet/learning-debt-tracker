import { execSync } from 'child_process'
import { beforeAll } from 'vitest'
import '@testing-library/jest-dom'

beforeAll(() => {
  process.env.DATABASE_URL = 'file::memory:?cache=shared'
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: 'file::memory:?cache=shared' },
    stdio: 'pipe',
  })
})
