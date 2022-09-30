import type { LoaderFunction, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { HiPlus } from 'react-icons/hi'

import { getCompanies } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'
import { Title } from '~/components/Typography/Title'
import { Button } from '~/components/Button'
import { CompanyList } from '~/components/Lists/CompanyList'

type LoaderData = {
  companies: Awaited<ReturnType<typeof getCompanies>>
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Lista de compañías | HoyAdelantas',
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  return json<LoaderData>({
    companies: await getCompanies(),
  })
}

export default function CompanyIndexRoute() {
  const { companies } = useLoaderData<LoaderData>()

  return (
    <>
      {companies?.length > 0 ? (
        <>
          <div className="mb-8 mt-2 flex flex-col items-center px-2 sm:items-start lg:flex-row lg:items-center lg:justify-between">
            <Title>Listado de compañías</Title>
            <ManagementButtons />
          </div>

          <CompanyList companies={companies} />
        </>
      ) : (
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-medium">
            La lista de compañías está vacía
          </h2>
          <div className="mt-4">
            <ManagementButtons />
          </div>
        </div>
      )}
    </>
  )
}

const ManagementButtons = () => {
  return (
    <div className="mt-4 flex items-center justify-center gap-4 lg:mt-0">
      <Button
        href="/admin/dashboard/companies/create"
        className="flex items-center px-4"
      >
        <HiPlus className="mr-3" />
        Nueva compañía
      </Button>
    </div>
  )
}
