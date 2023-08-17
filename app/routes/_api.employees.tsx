import type { LoaderArgs } from '@remix-run/server-runtime'

import { json } from '@remix-run/server-runtime'
import { findEmployeesByQuery } from '~/services/employee/employee.server'

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')

  return json({
    employees:
      query && query !== 'undefined' && query !== 'null'
        ? await findEmployeesByQuery(query)
        : [],
  })
}
