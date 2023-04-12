import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'
import { BenefitList } from '~/components/Lists/BenefitList'
import { Container } from '~/components/Layout/Container'
import { getBenefits } from '~/services/benefit/benefit.server'
import { requireAdminUserId } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Beneficios | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return json({
    benefits: await getBenefits(),
  })
}

export default function BenefitIndexRoute() {
  const { benefits } = useLoaderData<typeof loader>()

  return (
    <>
      <Container>
        <>
          <TitleWithActions
            title="Beneficios"
            className="mb-10"
            actions={
              <Button
                href="/admin/dashboard/benefits/create"
                className="flex items-center px-4"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear beneficio
              </Button>
            }
          />

          {benefits?.length > 0 ? (
            <BenefitList benefits={benefits} />
          ) : (
            <p>No se han encontrado beneficios</p>
          )}
        </>
      </Container>
    </>
  )
}
