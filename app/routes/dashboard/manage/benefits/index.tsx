import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { BenefitList } from '~/components/Lists/BenefitList'
import { Container } from '~/components/Layout/Container'
import { getBenefits } from '~/services/benefit/benefit.server'
import { requireUserId } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'
import { Tabs } from '~/components/Tabs/Tabs'

export const meta: MetaFunction = () => {
  return {
    title: 'Beneficios | HoyTrabajas Beneficios',
  }
}

export const manageBenefitPaths = [
  {
    title: 'Beneficios',
    path: '/dashboard/manage/benefits',
  },
  {
    title: 'Categorías de beneficios',
    path: '/dashboard/manage/benefit-categories',
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  return json({
    benefits: await getBenefits(), // todo: check
  })
}

export default function BenefitIndexRoute() {
  const { benefits } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="w-full">
        <Tabs items={manageBenefitPaths} className="mt-10 mb-8" />

        <>
          <TitleWithActions
            title="Beneficios"
            className="mb-10"
            actions={
              <Button
                href="/dashboard/manage/benefits/create"
                className="flex items-center px-4"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear beneficio
              </Button>
            }
          />

          {benefits?.length > 0 ? (
            <BenefitList
              benefits={benefits}
              baseUrl="/dashboard/manage/benefits"
            />
          ) : (
            <p>No se han encontrado beneficios</p>
          )}
        </>
      </Container>
    </>
  )
}
