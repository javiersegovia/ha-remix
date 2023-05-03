import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, unstable_parseMultipartFormData } from '@remix-run/node'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { requireAdminUserId } from '~/session.server'

import { getCountries } from '~/services/country/country.server'
import { createCompany } from '~/services/company/company.server'
import { getBenefits } from '~/services/benefit/benefit.server'
import { validator } from '~/services/company/company.schema'
import { getCompanyCategories } from '~/services/company-category/company-category.server'

import { AdminCompanyForm } from '~/components/Forms/AdminCompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { Title } from '~/components/Typography/Title'
import { uploadHandler } from '~/services/aws/s3.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  return json({
    companyCategories: await getCompanyCategories(),
    benefits: await getBenefits(),
    countries: await getCountries(),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear compañía | HoyAdelantas',
  }
}

export async function action({ request }: ActionArgs) {
  await requireAdminUserId(request)

  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const { data, submittedData, error } = await validator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  const imageFormData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  )
  const logoImageNewKey = imageFormData.get('logoImage')
  data.logoImageKey =
    typeof logoImageNewKey === 'string' ? logoImageNewKey : data.logoImageKey

  const { company, error: companyError } = await createCompany(data)

  if (companyError || !company) {
    return json(
      {
        submittedData,
        companyError,
      },
      { status: 400 }
    )
  }

  return redirect(`/admin/dashboard/companies`)
}

export default function AdminDashboardCompaniesCreateRoute() {
  const { countries, companyCategories, benefits } =
    useLoaderData<typeof loader>()

  return (
    <section className="mx-auto w-full max-w-screen-lg px-2 pb-10 sm:px-8">
      <Title>Crear nueva compañía</Title>

      <div className="mt-5">
        <AdminCompanyForm
          countries={countries}
          benefits={benefits}
          companyCategories={companyCategories}
          validator={validator}
          actions={<FormActions title="Crear" />}
        />
      </div>
    </section>
  )
}
