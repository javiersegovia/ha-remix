import type { Country, State } from '@prisma/client'
import type { loader as cityLoader } from '~/routes/__api/_api.cities'
import type { loader as stateLoader } from '~/routes/__api/states'

import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'
import { useControlField } from 'remix-validated-form'
import { useCleanForm } from './useCleanForm'

interface UseLocationSyncProps {
  formId: string
  countryId?: Country['id'] | null
  stateId?: State['id'] | null
}

// todo: remove fetcher.type in Remix V2 https://remix.run/docs/en/main/pages/v2#usefetcher

export const useLocationSync = ({
  formId,
  countryId,
  stateId,
}: UseLocationSyncProps) => {
  const [countryIdValue] = useControlField<number | undefined>(
    'countryId',
    formId
  )
  const [stateIdValue, setStateIdValue] = useControlField<number | undefined>(
    'stateId',
    formId
  )
  const [cityIdValue, setCityIdValue] = useControlField<number | undefined>(
    'cityId',
    formId
  )

  const stateFetcher = useFetcher<typeof stateLoader>()
  const cityFetcher = useFetcher<typeof cityLoader>()

  useEffect(() => {
    if (stateFetcher.type !== 'init') return

    stateFetcher.load(`/states?countryId=${countryId}`)
  }, [stateFetcher, countryId, countryIdValue])

  useEffect(() => {
    if (cityFetcher.type !== 'init') return

    cityFetcher.load(`/cities?stateId=${stateId}`)
  }, [cityFetcher, stateId])

  useCleanForm({
    isReady: stateFetcher.type === 'done',
    options: stateFetcher.data?.states,
    value: stateIdValue,
    setValue: setStateIdValue,
  })

  useCleanForm({
    isReady: stateFetcher.type === 'done' && cityFetcher.type === 'done',
    shouldClean:
      stateFetcher.data?.states?.length === 0 ||
      cityFetcher.data?.cities?.length === 0,
    options: cityFetcher.data?.cities,
    value: cityIdValue,
    setValue: setCityIdValue,
  })

  return { stateFetcher, cityFetcher }
}
