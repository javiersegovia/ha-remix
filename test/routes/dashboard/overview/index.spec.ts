import type { DashboardIndexLoaderData } from '~/routes/dashboard/overview'

import { truncateDB } from 'test/helpers/truncateDB'
import { createMockEmployee, MOCK_USER } from 'test/setup-test-env'
import { loader as dashboardOverviewLoader } from '~/routes/dashboard/overview'
import { vi } from 'vitest'
import { prisma } from '~/db.server'
import { MembershipFactory } from '~/services/membership/membership.factory'
import { BenefitFactory } from '~/services/benefit/benefit.factory'

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

/** Here we generate Benefits and Memberships:
 *  "Lite" Benefits, that will belong to both a "Lite" and "Premium" Membership
 *  "Premium" Benefits, that will belong to a "Premium" Membership only
 *
 *  Based on that, we will assign some benefits to a company, and one membership to an employee
 *  And the combination of both inputs should give us different results
 */

const createBenefitsAndMemberships = async () => {
  const [benefitLite_1, benefitLite_2, benefitPremium_1, benefitPremium_2] =
    await Promise.all([
      BenefitFactory.create({
        name: 'A1_Travel_Lite',
      }),
      BenefitFactory.create({
        name: 'B1_Health_Lite',
      }),
      BenefitFactory.create({
        name: 'A2_Insurance_Premium',
      }),
      BenefitFactory.create({
        name: 'B2_Discount_Premium',
      }),
    ])

  const [membershipPremium, membershipLite] = await Promise.all([
    MembershipFactory.create(
      {
        name: 'Membership_Premium',
      },
      {
        associations: {
          benefits: [
            benefitLite_1,
            benefitLite_2,
            benefitPremium_1,
            benefitPremium_2,
          ],
        },
      }
    ),
    MembershipFactory.create(
      {
        name: 'Membership_Lite',
      },
      {
        associations: {
          benefits: [benefitLite_1, benefitLite_2],
        },
      }
    ),
  ])

  return {
    benefitLite_1,
    benefitLite_2,
    benefitPremium_1,
    benefitPremium_2,
    membershipPremium,
    membershipLite,
  }
}

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
      benefits: [],
    })
  })

  test(`When the company has both "Lite" and "Premium" benefits
        When the employee has a "Lite" membership
        Should return only the "Lite" benefits that belong to the company`, async () => {
    const employee = await createMockEmployee()

    const { benefitLite_1, benefitPremium_1, membershipLite } =
      await createBenefitsAndMemberships()

    const updateCompany = prisma.company.update({
      where: {
        id: employee.companyId,
      },
      data: {
        benefits: {
          connect: [{ id: benefitLite_1.id }, { id: benefitPremium_1.id }],
        },
      },
    })

    const updateEmployee = prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        membership: {
          connect: { id: membershipLite.id },
        },
      },
    })

    await Promise.all([updateCompany, updateEmployee])

    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toBe(200)

    const data = await response.json()

    expect(data.benefits).toMatchObject<DashboardIndexLoaderData['benefits']>([
      {
        id: benefitLite_1.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        name: benefitLite_1.name,
        buttonHref: benefitLite_1.buttonHref,
        buttonText: benefitLite_1.buttonText,
        imageUrl: benefitLite_1.imageUrl,
      },
    ])
  })

  test(`When the company has both "Lite" and "Premium" benefits
        When the employee has a "Premium" membership
        Should return only the "Lite" and "Premium" benefits that belong to the company`, async () => {
    const employee = await createMockEmployee()

    const { benefitLite_2, benefitPremium_2, membershipPremium } =
      await createBenefitsAndMemberships()

    const updateCompany = prisma.company.update({
      where: {
        id: employee.companyId,
      },
      data: {
        benefits: {
          connect: [{ id: benefitLite_2.id }, { id: benefitPremium_2.id }],
        },
      },
    })

    const updateEmployee = prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        membership: {
          connect: { id: membershipPremium.id },
        },
      },
    })

    await Promise.all([updateCompany, updateEmployee])

    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toBe(200)

    const data = await response.json()

    expect(data.benefits).toMatchObject<DashboardIndexLoaderData['benefits']>([
      {
        id: benefitLite_2.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        name: benefitLite_2.name,
        buttonHref: benefitLite_2.buttonHref,
        buttonText: benefitLite_2.buttonText,
        imageUrl: benefitLite_2.imageUrl,
      },
      {
        id: benefitPremium_2.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        name: benefitPremium_2.name,
        buttonHref: benefitPremium_2.buttonHref,
        buttonText: benefitPremium_2.buttonText,
        imageUrl: benefitPremium_2.imageUrl,
      },
    ])
  })
})
