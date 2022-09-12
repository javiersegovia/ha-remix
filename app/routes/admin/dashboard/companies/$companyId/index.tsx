import type {
  ActionArgs,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'

import { CompanyForm } from '~/components/Forms/CompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { validator } from '~/services/company/company.schema'
import { getCompanyCategories } from '~/services/company/company-category.server'
import {
  requireCompany,
  updateCompanyById,
} from '~/services/company/company.server'
import { getCountries } from '~/services/country/country.server'
import { requireAdminUserId } from '~/session.server'
import { validationError } from 'remix-validated-form'

type LoaderData = {
  company: Awaited<ReturnType<typeof requireCompany>>
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
  countries: Awaited<ReturnType<typeof getCountries>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
    include: {
      country: true,
      categories: true,
      contactPerson: true,
    },
  })

  return json<LoaderData>({
    company,
    companyCategories: await getCompanyCategories(),
    countries: await getCountries(),
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
  const { company, countries, companyCategories } = useLoaderData<LoaderData>()

  return (
    <CompanyForm
      defaultValues={company}
      countries={countries}
      companyCategories={companyCategories}
      validator={validator}
      actions={<FormActions title="Guardar" />}
    />
  )
}
