import type { Company } from '@prisma/client'
import { Outlet, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { CompanyNavigation } from '~/containers/admin/dashboard/companies/CompanyNavigation'
import { requireCompany } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  company: Pick<Company, 'id' | 'name'>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
    },
  })

  return json<LoaderData>({
    company,
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada',
    }
  }

  const { company } = data as LoaderData

  return {
    title: `[Admin] ${company.name}`,
  }
}

export default function AdminDashboardCompanyDetailsIndexRoute() {
  const { company } = useLoaderData<LoaderData>()

  return (
    <CompanyNavigation company={company}>
      <Outlet />
    </CompanyNavigation>
  )
}
