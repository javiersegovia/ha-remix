import type { SerializeFrom } from '@remix-run/server-runtime'
import type { loader as benefitIdLoader } from './dashboard.benefits.$benefitId'

import { useMatchesData } from '~/utils/utils'

export default function BenefitDetailsInstructionsRoute() {
  const data = useMatchesData(
    'routes/dashboard.benefits.$benefitId'
  ) as SerializeFrom<typeof benefitIdLoader>

  if (!data || !data.benefit) {
    return null
  }

  const {
    benefit: { instructions },
  } = data

  return (
    <div className="mt-10 overflow-hidden">
      <ul className="space-y-8 whitespace-pre-wrap break-words text-justify">
        {instructions?.map((instruction, index) => (
          <li className="flex items-start gap-4" key={index}>
            <span className="text-3xl font-bold text-steelBlue-700">
              {index + 1}
            </span>

            <p>{instruction}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
