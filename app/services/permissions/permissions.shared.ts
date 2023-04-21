import type { Benefit, CompanyBenefit } from '@prisma/client'

export interface FilterEmployeeEnabledBenefitsArgs {
  companyBenefitsIds: Benefit['id'][] | undefined
  employeeBenefits:
    | (Pick<Benefit, 'id'> & {
        companyBenefit: Pick<CompanyBenefit, 'id'> | null
      })[]
    | undefined

  membershipBenefits: Pick<Benefit, 'id'>[] | undefined
  employeeGroupsBenefits:
    | (Pick<Benefit, 'id'> & {
        companyBenefit: Pick<CompanyBenefit, 'id'> | null
      })[]
    | undefined
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
