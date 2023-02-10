import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import {
  redirect,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { badRequest, notFound } from 'remix-utils'

import { CompanyForm } from '~/components/Forms/CompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { validator } from '~/services/company/company.schema'
import { getCompanyCategories } from '~/services/company-category/company-category.server'
import {
  getCompanyById,
  updateCompanyById,
} from '~/services/company/company.server'
import { getCountries } from '~/services/country/country.server'
import { requireAdminUserId } from '~/session.server'
import { getBenefits } from '~/services/benefit/benefit.server'
import { uploadHandler } from '~/services/aws/s3.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID de la compañía',
    })
  }

  const company = await getCompanyById(companyId)

  if (!company) {
    throw notFound({
      message: 'No se ha encontrado información sobre la compañía',
    })
  }

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

  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const { data, submittedData, error } = await validator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  const imageFormData = await parseMultipartFormData(request, uploadHandler)
  const logoImageNewKey = imageFormData.get('logoImage')

  data.logoImageKey =
    typeof logoImageNewKey === 'string' ? logoImageNewKey : data.logoImageKey

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
