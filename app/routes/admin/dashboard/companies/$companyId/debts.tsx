import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { CompanyDebtList } from '~/components/Lists/CompanyDebtList'
import { getCompanyDebtsByCompanyId } from '~/services/company-debt/company-debt.server'
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
    debts: await getCompanyDebtsByCompanyId(company.id),
    companyName: company.name,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Error | HoyAdelantas',
    }
  }

  const { companyName } = data

  return {
    title: `[Admin] Novedades de ${companyName}`,
  }
}

export default function AdminDashboardCompanyDebtsIndexRoute() {
  const { debts } = useLoaderData<typeof loader>()

  return <CompanyDebtList debts={debts} />
}
