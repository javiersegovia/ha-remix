import type {
  AgeRange,
  City,
  Country,
  Gender,
  JobDepartment,
  SalaryRange,
  State,
} from '@prisma/client'

import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Box } from '~/components/Layout/Box'
import { formatAgeRange } from '~/utils/formatAgeRange'
import { formatSalaryRange } from '~/utils/formatSalaryRange'

interface FilterSummaryProps {
  country?: Pick<Country, 'name'> | null
  state?: Pick<State, 'name'> | null
  city?: Pick<City, 'name'> | null
  gender?: Pick<Gender, 'name'> | null
  jobDepartment?: Pick<JobDepartment, 'name'> | null
  ageRange?: Pick<AgeRange, 'minAge' | 'maxAge'> | null
  salaryRange?: Pick<SalaryRange, 'minValue' | 'maxValue'> | null
  options?: {
    hasColumns: boolean
  }
  className?: string
}

export const FilterSummary = ({
  country,
  state,
  city,
  gender,
  ageRange,
  salaryRange,
  jobDepartment,
  options,
  className,
}: FilterSummaryProps) => {
  return (
    <Box
      className={twMerge(
        clsx(
          'flex-col items-center gap-6 border border-steelBlue-100 p-5 md:inline-flex lg:flex-row',
          className
        )
      )}
    >
      <p className="mb-4 font-medium text-steelBlue-500 md:mb-0">
        Filtros del grupo:
      </p>

      <ul
        className={twMerge(
          clsx(
            'grid list-none auto-cols-auto gap-x-5 gap-y-3 sm:ml-3 sm:pl-3 md:ml-0',
            options?.hasColumns && 'sm:grid-cols-2'
          )
        )}
      >
        {country && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> País:
            </span>{' '}
            {country.name}
          </li>
        )}

        {state && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Estado:
            </span>{' '}
            {state.name}
          </li>
        )}

        {city && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Ciudad:
            </span>{' '}
            {city.name}
          </li>
        )}

        {gender && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Género:
            </span>{' '}
            {gender.name}
          </li>
        )}

        {jobDepartment && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Área:
            </span>{' '}
            {jobDepartment.name}
          </li>
        )}

        {ageRange && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Edad:
            </span>{' '}
            {formatAgeRange(ageRange.minAge, ageRange.maxAge)}
          </li>
        )}

        {salaryRange && (
          <li>
            <span className="relative -left-1 font-medium">
              <strong>·</strong> Salario:
            </span>{' '}
            {formatSalaryRange({
              minValue: salaryRange.minValue,
              maxValue: salaryRange.maxValue,
            })}
          </li>
        )}
      </ul>
    </Box>
  )
}
