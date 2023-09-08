import type { Company } from '@prisma/client'

import { useEffect, useMemo } from 'react'
import { useFetcher } from '@remix-run/react'
import debounce from 'lodash.debounce'

import type { loader as employeesLoader } from '~/routes/_api.employees'

interface UseSelectEmployeeProps {
  currentEmail?: string
  companyId?: Company['id']
}

export const useSelectEmployee = ({
  currentEmail,
  companyId,
}: UseSelectEmployeeProps) => {
  const fetcher = useFetcher<typeof employeesLoader>()

  const options = useMemo(() => {
    return fetcher?.data?.employees
      ? fetcher.data.employees.map((e) => ({
          id: e.id,
          name: `${e.user.fullName} (${e.user.email})`,
        }))
      : null
  }, [fetcher])

  useEffect(() => {
    if (fetcher.type !== 'init') return
    fetcher.load(`/employees?query=${currentEmail}`)
  }, [fetcher, currentEmail])

  const handleSelectChange = debounce((keywords) => {
    if (keywords) {
      const q = `/employees?query=${keywords}`

      if (companyId) {
        fetcher.load(q.concat(`&companyId=${companyId}`))
      } else {
        fetcher.load(q)
      }
    }
  }, 300)

  return { handleSelectChange, options, fetcher }
}
