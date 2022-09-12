import type { LoaderFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getStatesByCountryId } from '~/services/state/state.server'

export type StateLoader = {
  states: Awaited<ReturnType<typeof getStatesByCountryId>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const countryId = url.searchParams.get('countryId')

  return json<StateLoader>({
    states:
      countryId && countryId !== 'undefined' // This is needed just in case we send and empty key
        ? await getStatesByCountryId(parseFloat(countryId))
        : [],
  })
}
