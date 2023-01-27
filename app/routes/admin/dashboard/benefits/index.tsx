import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { HiPlus } from 'react-icons/hi'
import { Button } from '~/components/Button'
import { Title } from '~/components/Typography/Title'
import { BenefitList } from '~/components/Lists/BenefitList'
import { Container } from '~/components/Layout/Container'
import { getBenefits } from '~/services/benefit/benefit.server'
import { requireAdminUserId } from '~/session.server'

export type BenefitLoader = {
  benefits: Awaited<ReturnType<typeof getBenefits>>
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Beneficios | HoyAdelantas',
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  return json<BenefitLoader>({
    benefits: await getBenefits(),
  })
}

export default function BenefitIndexRoute() {
  const { benefits } = useLoaderData<BenefitLoader>()

  return (
    <>
      <Container>
        <>
          <div className="mb-8 mt-2 flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
            <Title>Beneficios</Title>
            <ManagementButtons />
          </div>

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

const ManagementButtons = () => {
  return (
    <div className="mt-4 flex w-full items-center justify-center gap-4 md:w-auto lg:mt-0">
      <Button
        href="/admin/dashboard/benefits/create"
        className="flex items-center px-4"
      >
        <HiPlus className="mr-3" />
        Crear beneficio
      </Button>
    </div>
  )
}
