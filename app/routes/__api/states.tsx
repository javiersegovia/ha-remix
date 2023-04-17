import type { LoaderArgs } from '@remix-run/server-runtime'

import { json } from '@remix-run/server-runtime'
import { getStatesByCountryId } from '~/services/state/state.server'

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const countryId = url.searchParams.get('countryId')

  return json({
    states:
      countryId && countryId !== 'undefined' && countryId !== 'null' // This is needed just in case we send and empty key
        ? await getStatesByCountryId(parseFloat(countryId))
        : [],
  })
}
