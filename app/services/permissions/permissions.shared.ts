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
      if ('companyBenefit' in item && item.companyBenefit) {
        return [...total, item]
      }

      if (companyBenefitsIds?.includes(item.id)) {
        return [...total, item]
      }

      return total
    },
    []
  )

  return benefits
}
