import type { ActionArgs, LoaderFunction, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { validationError } from 'remix-validated-form'

import { requireAdminUserId } from '~/session.server'
import { Title } from '~/components/Typography/Title'
import { CompanyForm } from '~/components/Forms/CompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { useLoaderData } from '@remix-run/react'
import { getCompanyCategories } from '~/services/company-category/company-category.server'
import { getCountries } from '~/services/country/country.server'
import { createCompany } from '~/services/company/company.server'
import { validator } from '~/services/company/company.schema'

type LoaderData = {
  companyCategories: Awaited<ReturnType<typeof getCompanyCategories>>
  countries: Awaited<ReturnType<typeof getCountries>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)
  return json<LoaderData>({
    companyCategories: await getCompanyCategories(),
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

  const { data, submittedData, error } = await validator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

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

  return redirect(`/admin/dashboard/companies/${company.id}?index`)
}

export default function AdminDashboardCompaniesCreateRoute() {
  const { countries, companyCategories } = useLoaderData<LoaderData>()

  return (
    <section className="mx-auto w-full max-w-screen-lg px-2 pb-10 sm:px-8">
      <Title>Crear nueva compañía</Title>

      <div className="mt-5">
        <CompanyForm
          countries={countries}
          companyCategories={companyCategories}
          validator={validator}
          actions={<FormActions title="Crear" />}
        />
      </div>
    </section>
  )
}
