import type { SerializeFrom } from '@remix-run/server-runtime'
import type { loader as benefitIdLoader } from './dashboard.benefits.$benefitId'

import { useMatchesData } from '~/utils/utils'

export default function BenefitDetailsDescriptionRoute() {
  const data = useMatchesData(
    'routes/dashboard.benefits.$benefitId'
  ) as SerializeFrom<typeof benefitIdLoader>

  if (!data || !data.benefit) {
    return null
  }

  const {
    benefit: { description },
  } = data

  return (
    <div>
      <p className="mt-10 whitespace-pre-wrap break-words text-justify">
        {description ? description : <>No hay descripción disponible</>}
      </p>
    </div>
  )
}
