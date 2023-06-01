import type { ExtractRemixResponse } from '~/utils/type-helpers'

import { vi } from 'vitest'
import { truncateDB } from 'test/helpers/truncateDB'
import { createMockEmployee, MOCK_USER } from 'test/setup-test-env'

import { loader as dashboardOverviewLoader } from '~/routes/dashboard.overview'
import { prisma } from '~/db.server'
import { MembershipFactory } from '~/services/membership/membership.factory'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import { connect } from '~/utils/relationships'
import { requireEmployee } from '~/session.server'

vi.mock('~/session.server', () => {
  return {
    requireUserId: () => MOCK_USER.id,
    requireEmployee,
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

type DashboardOverviewLoaderResponse = ExtractRemixResponse<
  typeof dashboardOverviewLoader
>

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
  it('returns all data needed for dashboard overview route', async () => {
    const employee = await createMockEmployee()
    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toEqual(200)

    const data = await response.json()

    expect(data).toEqual<DashboardOverviewLoaderResponse>({
      benefits: [],
      company: {
        id: employee.companyId,
        name: employee.company.name,
        description: null,
        logoImage: null,
      },
      benefitHighlights: [],
      benefitCategories: [],
      availablePoints: 0,
      firstName: employee.user.firstName,
    })
  })

  test(`if the company has both "Lite" and "Premium" benefits && the Employee has a "Lite" membership
        return only the "Lite" benefits that belong to the company`, async () => {
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

    const [company] = await Promise.all([updateCompany, updateEmployee])

    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toEqual(200)

    const data = await response.json()

    expect(data).toEqual<DashboardOverviewLoaderResponse>({
      benefits: [
        {
          id: benefitLite_1.id,
          name: benefitLite_1.name,
          buttonHref: benefitLite_1.buttonHref,
          buttonText: benefitLite_1.buttonText,
          slug: benefitLite_1.slug,
          mainImage: null,
          benefitCategory: null,
          benefitHighlight: null,
        },
      ],
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        logoImage: null,
      },
      benefitCategories: [],
      benefitHighlights: [],
      availablePoints: 0,
      firstName: employee.user.firstName,
    })
  })

  test(`if the company has both "Lite" and "Premium" benefits, and the employee has a "Premium" membership,
        returns only the "Lite" and "Premium" benefits that belong to the company`, async () => {
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
        membership: connect(membershipPremium.id),
      },
    })

    await Promise.all([updateCompany, updateEmployee])

    const response: Response = await dashboardOverviewLoader({
      request: new Request(`http://localhost:3000/dashboard/overview`),
      params: {},
      context: {},
    })
    expect(response.status).toEqual(200)

    const data = await response.json()

    expect(data.benefits).toEqual<DashboardOverviewLoaderResponse['benefits']>([
      {
        id: benefitLite_2.id,
        name: benefitLite_2.name,
        buttonHref: benefitLite_2.buttonHref,
        buttonText: benefitLite_2.buttonText,
        slug: benefitLite_2.slug,
        mainImage: null,
        benefitCategory: null,
        benefitHighlight: null,
      },
      {
        id: benefitPremium_2.id,
        name: benefitPremium_2.name,
        buttonHref: benefitPremium_2.buttonHref,
        buttonText: benefitPremium_2.buttonText,
        slug: benefitPremium_2.slug,
        mainImage: null,
        benefitCategory: null,
        benefitHighlight: null,
      },
    ])
  })
})
