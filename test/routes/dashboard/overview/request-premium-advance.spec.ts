import { createMockEmployee, MOCK_EMPLOYEE } from 'test/setup-test-env'
import { vi } from 'vitest'
import { truncateDB } from 'test/helpers/truncateDB'
import { action as requestPremiumAdvanceAction } from '~/routes/dashboard/overview/request-premium-advance'
import { prisma } from '~/db.server'
import type { PremiumAdvance } from '@prisma/client'
import { PremiumAdvanceStatus } from '@prisma/client'

vi.mock('~/session.server', async () => {
  return {
    requireEmployee: () => MOCK_EMPLOYEE,
  }
})

beforeEach(async () => {
  await truncateDB()
})

afterAll(() => {
  vi.clearAllMocks()
})

describe('ACTION /dashboard/request-premium-advance', () => {
  test('should create a PremiumAdvance and send an email notification', async () => {
    const employee = await createMockEmployee()
    const response: Response = await requestPremiumAdvanceAction({
      request: new Request(
        `http://localhost:3000/dashboard/overview/request-premium-advance`,
        {
          method: 'POST',
        }
      ),
      params: {},
      context: {},
    })

    const premiumAdvance = await prisma.premiumAdvance.findFirst({
      where: {
        employeeId: employee.id,
      },
    })

    expect(premiumAdvance).toBeDefined()
    expect(response.status).toEqual(302)
    expect(response.headers.get('Location')).toEqual(
      `/dashboard/premium-advances/${premiumAdvance!.id}`
    )

    expect(premiumAdvance).toMatchObject<Partial<PremiumAdvance>>({
      status: PremiumAdvanceStatus.REQUESTED,
      employeeId: employee.id,
      companyId: employee.companyId,
    })
  })
})
