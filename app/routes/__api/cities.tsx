import type { LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getCitiesByStateId } from '~/services/city/city.server'

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url)
  const stateId = url.searchParams.get('stateId')

  return json({
    cities:
      stateId && stateId !== 'undefined' && stateId !== 'null'
        ? await getCitiesByStateId(parseFloat(stateId))
        : [],
  })
}
