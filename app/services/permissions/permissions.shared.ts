import type { Benefit, CompanyBenefit } from '@prisma/client'

type BenefitWithCompanyBenefit = Pick<Benefit, 'id'> & {
  companyBenefit: Pick<CompanyBenefit, 'id'> | null
}

export interface FilterEmployeeEnabledBenefitsArgs {
  companyBenefitsIds: Benefit['id'][] | undefined
  employeeBenefits: BenefitWithCompanyBenefit[] | undefined

  membershipBenefits:
    | (Pick<Benefit, 'id'> & {
        companyBenefit?: Pick<CompanyBenefit, 'id'> | null
      })[]
    | undefined
  employeeGroupsBenefits: BenefitWithCompanyBenefit[] | undefined
}

export const filterEmployeeEnabledBenefits = ({
  employeeBenefits,
  membershipBenefits,
  employeeGroupsBenefits,
  companyBenefitsIds,
}: FilterEmployeeEnabledBenefitsArgs & {}) => {
  const unfilteredBenefits = [
    ...(membershipBenefits || []),
    ...(employeeBenefits || []),
    ...(employeeGroupsBenefits || []),
  ]

  const benefits = unfilteredBenefits.reduce<Pick<Benefit, 'id'>[]>(
    (total, item) => {
      /** If the benefit belong to a company, it should be enabled */
      if ('companyBenefit' in item && item.companyBenefit) {
        return [...total, item]
      }

      /** If the benefit is on the company enabled benefit list, it should be enabled */
      if (companyBenefitsIds?.includes(item.id)) {
        return [...total, item]
      }

      /** Else, it should not be enabled */
      return total
    },
    []
  )

  return benefits
}
