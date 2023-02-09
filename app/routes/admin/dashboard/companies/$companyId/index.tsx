import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { CompanyForm } from '~/components/Forms/CompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { validator } from '~/services/company/company.schema'
import { getCompanyCategories } from '~/services/company-category/company-category.server'
import {
  requireCompany,
  updateCompanyById,
} from '~/services/company/company.server'
import { getCountries } from '~/services/country/country.server'
import { requireAdminUserId } from '~/session.server'
import { getBenefits } from '~/services/benefit/benefit.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  // todo: refactor function to avoid assert when whe refactor the return types of requireCompany
  const company = await requireCompany({
    where: { id: companyId },
    include: {
      benefits: true,
      categories: true,
      country: true,
      contactPerson: true,
    },
  })

  return json({
    company,
    companyCategories: await getCompanyCategories(),
    countries: await getCountries(),
    benefits: await getBenefits(),
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
    title: `[Admin] Detalles de ${company.name}`,
  }
}

export async function action({ request, params }: ActionArgs) {
  await requireAdminUserId(request)
  const { companyId } = params

  if (!companyId) {
    throw json(
      { error: 'El ID de la compañía no ha sido encontrado' },
      { status: 400 }
    )
  }

  const { data, submittedData, error } = await validator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  const { company, error: companyError } = await updateCompanyById(
    companyId,
    data
  )

  if (companyError || !company) {
    return json(
      {
        submittedData,
        companyError,
      },
      { status: 400 }
    )
  }

  return redirect('/admin/dashboard/companies')
}

export default function AdminDashboardCompanyDetailsRoute() {
  const { company, countries, benefits, companyCategories } =
    useLoaderData<typeof loader>()

  return (
    <CompanyForm
      defaultValues={company}
      benefits={benefits}
      countries={countries}
      companyCategories={companyCategories}
      validator={validator}
      actions={<FormActions title="Guardar" />}
    />
  )
}
