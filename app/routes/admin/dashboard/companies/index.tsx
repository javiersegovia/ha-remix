import type { LoaderArgs, MetaFunction } from '@remix-run/node'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getCompanies } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'
import { Button, ButtonIconVariants } from '~/components/Button'
import { CompanyList } from '~/components/Lists/CompanyList'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Container } from '~/components/Layout/Container'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Lista de compañías | HoyAdelantas',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  return json({
    companies: await getCompanies(),
  })
}

export default function CompanyIndexRoute() {
  const { companies } = useLoaderData<typeof loader>()

  return (
    <Container>
      <TitleWithActions
        title="Compañías"
        className="mb-10"
        actions={
          <Button
            href="/admin/dashboard/companies/create"
            className="flex items-center px-4"
            size="SM"
            icon={ButtonIconVariants.CREATE}
          >
            Crear compañía
          </Button>
        }
      />

      {companies?.length > 0 ? (
        <CompanyList companies={companies} />
      ) : (
        <p>No se han encontrado compañías</p>
      )}
    </Container>
  )
}
