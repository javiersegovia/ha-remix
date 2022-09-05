import type { ActionArgs, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { requireAdminUserId } from '~/session.server'
import { json } from '@remix-run/node'
import { Title } from '~/components/Typography/Title'
import { CompanyForm } from '~/components/Forms/CompanyForm'
import { FormActions } from '~/components/FormFields/FormActions'
import { useLoaderData, useTransition } from '@remix-run/react'
import { getCompanyCategories } from '~/services/company/company-category.server'
import { getCountries } from '~/services/country/country.server'
import type { CreateCompanySchemaInput } from '~/schemas/createCompany.schema'
import { createCompanySchema } from '~/schemas/createCompany.schema'
import { validateSchema } from '~/utils/validation'
import { createCompany } from '~/services/company/company.server'

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

export async function action({ request }: ActionArgs) {
  const { formData, errors } = await validateSchema<CreateCompanySchemaInput>({
    request,
    schema: createCompanySchema,
  })

  if (errors) {
    return json({ formData, errors }, { status: 400 })
  }

  const { company, error } = await createCompany(formData)

  if (error) {
    return json(
      {
        formData,
      },
      { status: 400 }
    )
  }

  // todo: redirect to createdCompany

  return redirect('/admin/dashboard/companies')
}

export default function AdminDashboardCompaniesCreateRoute() {
  const { countries, companyCategories } = useLoaderData<LoaderData>()
  const transition = useTransition()

  return (
    <section className="mx-auto w-full max-w-screen-lg px-2 pb-10 sm:px-10">
      <Title>Crear nueva compañía</Title>

      <div className="mt-5">
        <CompanyForm
          countries={countries}
          companyCategories={companyCategories}
          schema={createCompanySchema}
          actions={
            <FormActions
              title="Crear"
              inProgress={transition.state === 'submitting'}
            />
          }
        />
      </div>
    </section>
  )
}
