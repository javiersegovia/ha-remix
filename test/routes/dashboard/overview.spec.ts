import type { DashboardIndexLoaderData } from '~/routes/dashboard/overview'

import { truncateDB } from 'test/helpers/truncateDB'
import { createMockEmployee, MOCK_USER } from 'test/setup-test-env'
import { loader as dashboardOverviewLoader } from '~/routes/dashboard/overview'
import { vi } from 'vitest'

vi.mock('~/session.server', () => {
  return {
    requireUserId: () => MOCK_USER.id,
  }
})

beforeEach(async () => {
  await truncateDB()
})

afterAll(() => {
  vi.clearAllMocks()
})

describe('LOADER /dashboard/overview', () => {
  test('should return user and gender data', async () => {
    const employee = await createMockEmployee()
    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toBe(200)

    const data = await response.json()

    expect(data).toMatchObject<DashboardIndexLoaderData>({
      gender: null,
      user: {
        firstName: employee.user.firstName,
      },
    })
  })
})
