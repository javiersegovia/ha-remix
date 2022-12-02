import type {
  Benefit,
  Company,
  CompanyCategory,
  CompanyContactPerson,
  Country,
} from '@prisma/client'
import type {
  ActionArgs,
  LoaderFunction,
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

type LoaderData = {
  company: Company & {
    benefits: Pick<Benefit, 'id'>[]
    country: Pick<Country, 'id'>
    categories: Pick<CompanyCategory, 'id'>[]
    contactPerson: Pick<
      CompanyContactPerson,
      'firstName' | 'lastName' | 'phone'
    >
  }
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
  countries: Awaited<ReturnType<typeof getCountries>>
  benefits: Awaited<ReturnType<typeof getBenefits>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyId } = params

  // todo: refactor function to avoid assert when whe refactor the return types of requireCompany
  const company = (await requireCompany({
    where: { id: companyId },
    include: {
      benefits: true,
      categories: true,
      country: true,
      contactPerson: true,
    },
  })) as LoaderData['company']

  return json<LoaderData>({
    company,
    companyCategories: await getCompanyCategories(),
    countries: await getCountries(),
    benefits: await getBenefits(),
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada | HoyAdelantas',
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
  const { company, countries, benefits, companyCategories } =
    useLoaderData<LoaderData>()

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
