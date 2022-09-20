import type { LoaderFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getCitiesByStateId } from '~/services/city/city.server'

export type CityLoader = {
  cities: Awaited<ReturnType<typeof getCitiesByStateId>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const stateId = url.searchParams.get('stateId')

  return json<CityLoader>({
    cities:
      stateId && stateId !== 'undefined'
        ? await getCitiesByStateId(parseFloat(stateId))
        : [],
  })
}
