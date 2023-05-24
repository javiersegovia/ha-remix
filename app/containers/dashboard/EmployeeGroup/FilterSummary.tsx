import {
  AgeRange,
  City,
  Country,
  EmployeeGroup,
  Gender,
  SalaryRange,
  State,
} from '@prisma/client'
import clsx from 'clsx'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Box } from '~/components/Layout/Box'
import { formatAgeRange } from '~/utils/formatAgeRange'
import { formatSalaryRange } from '~/utils/formatSalaryRange'

interface FilterSummaryProps {
  country?: Pick<Country, 'name'> | null
  state?: Pick<State, 'name'> | null
  city?: Pick<City, 'name'> | null
  gender?: Pick<Gender, 'name'> | null
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
  options,
  className,
}: FilterSummaryProps) => {
  return (
    <Box className={twMerge(clsx('items-center gap-6 p-5 md:inline-flex border border-steelBlue-100', className))}>
      <p className="mb-4 font-medium text-steelBlue-500 md:mb-0">
        Filtros del grupo:
      </p>

      <ul
        className={twMerge(
          clsx(
            'ml-3 grid list-none auto-cols-auto pl-3 md:ml-0',
            options?.hasColumns && 'sm:grid-cols-2'
          )
        )}
      >
        {country && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> País:</span>{' '}
            {country.name}
          </li>
        )}

        {state && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> Estado:</span>{' '}
            {state.name}
          </li>
        )}

        {city && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> Ciudad:</span>{' '}
            {city.name}
          </li>
        )}

        {gender && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> Género:</span>{' '}
            {gender.name}
          </li>
        )}

        {ageRange && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> Edad:</span>{' '}
            {formatAgeRange(ageRange.minAge, ageRange.maxAge)}
          </li>
        )}

        {salaryRange && (
          <li>
            <span className="relative -left-1 font-medium"><strong>·</strong> Salario:</span>{' '}
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
