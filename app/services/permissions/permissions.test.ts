import { prisma } from '~/db.server'
import {
  BenefitFactory,
  CompanyBenefitFactory,
} from '../benefit/benefit.factory'
import { getEmployeeEnabledBenefits } from './permissions.server'

/** In the following tests cases, we are testing the implementation (we make sure that we call the prisma.benefit.findMany function with the ids that we want)
 *
 * Ideally, we should have an e2e test that covers this behaviour.
 */

describe('getEmployeeEnabledBenefits', () => {
  it('calls the findMany function with an empty array when the company do not have enabled benefits', async () => {
    const benefits = BenefitFactory.buildList(2)

    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce([])

    await getEmployeeEnabledBenefits({
      companyBenefits: [],
      employeeBenefits: benefits,
      employeeGroupsBenefits: benefits,
      membershipBenefits: benefits,
    })

    expect(prisma.benefit.findMany).toHaveBeenCalledOnceWith(
      expect.objectContaining({
        where: {
          id: {
            in: [],
          },
        },
      })
    )
  })

  it('calls the findMany function with benefits enabled via membership and company', async () => {
    const membershipBenefits = BenefitFactory.buildList(2)
    const companyBenefits = BenefitFactory.buildList(2)

    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce([])

    await getEmployeeEnabledBenefits({
      companyBenefits: [...companyBenefits, membershipBenefits[1]],
      membershipBenefits,
      employeeBenefits: [],
      employeeGroupsBenefits: [],
    })

    expect(prisma.benefit.findMany).toHaveBeenCalledOnceWith(
      expect.objectContaining({
        where: {
          id: {
            in: [membershipBenefits[1].id],
          },
        },
      })
    )
  })

  it('calls the findMany function with benefits enabled via employee, employeeGroups and company', async () => {
    const employeeBenefits = BenefitFactory.buildList(2)
    const employeeGroupsBenefits = BenefitFactory.buildList(2)
    const companyBenefits = BenefitFactory.buildList(2)

    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce([])

    await getEmployeeEnabledBenefits({
      companyBenefits: [
        ...companyBenefits,
        ...employeeGroupsBenefits,
        employeeBenefits[1],
      ],
      membershipBenefits: [],
      employeeBenefits,
      employeeGroupsBenefits,
    })

    expect(prisma.benefit.findMany).toHaveBeenCalledOnceWith(
      expect.objectContaining({
        where: {
          id: {
            in: [
              employeeBenefits[1].id,
              ...employeeGroupsBenefits.map((b) => b.id),
            ],
          },
        },
      })
    )
  })

  it('calls the findMany function with benefits created by the company, assigned to employee and employeeGroups, without taking into account the enabled benefits for the company', async () => {
    const employeeBenefits = BenefitFactory.buildList(2, undefined, {
      associations: {
        companyBenefit: CompanyBenefitFactory.build(),
      },
    })
    const employeeGroupsBenefits = BenefitFactory.buildList(2, undefined, {
      associations: {
        companyBenefit: CompanyBenefitFactory.build(),
      },
    })

    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce([])

    await getEmployeeEnabledBenefits({
      employeeBenefits,
      employeeGroupsBenefits,
      companyBenefits: [],
      membershipBenefits: [],
    })

    expect(prisma.benefit.findMany).toHaveBeenCalledOnceWith(
      expect.objectContaining({
        where: {
          id: {
            in: [
              ...employeeBenefits.map((b) => b.id),
              ...employeeGroupsBenefits.map((b) => b.id),
            ],
          },
        },
      })
    )
  })
})
