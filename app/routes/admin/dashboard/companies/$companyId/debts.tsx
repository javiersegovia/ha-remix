import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { CompanyDebtList } from '~/components/Lists/CompanyDebtList'
import { getCompanyDebtsByCompanyId } from '~/services/company/company-debt.server'
import { requireCompany } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'

type LoaderData = {
  debts: Awaited<ReturnType<typeof getCompanyDebtsByCompanyId>>
  companyName: string
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
    debts: await getCompanyDebtsByCompanyId(company.id),
    companyName: company.name,
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Error | HoyAdelantas',
    }
  }

  const { companyName } = data as LoaderData

  return {
    title: `[Admin] Novedades de ${companyName}`,
  }
}

export default function AdminDashboardCompanyDebtsIndexRoute() {
  const { debts } = useLoaderData<LoaderData>()
  return <CompanyDebtList debts={debts} />
}
