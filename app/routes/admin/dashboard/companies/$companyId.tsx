import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { CompanyNavigation } from '~/containers/admin/dashboard/companies/CompanyNavigation'
import { requireCompany } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
    },
  })

  return json({
    company,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada | HoyAdelantas',
    }
  }

  const { company } = data

  return {
    title: `[Admin] ${company.name} | HoyAdelantas`,
  }
}

export default function AdminDashboardCompanyDetailsIndexRoute() {
  const { company } = useLoaderData<typeof loader>()

  return (
    <CompanyNavigation company={company}>
      <Outlet />
    </CompanyNavigation>
  )
}
