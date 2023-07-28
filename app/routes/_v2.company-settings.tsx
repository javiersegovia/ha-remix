import { PermissionCode } from '@prisma/client'
import { Link, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import {
  redirect,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/server-runtime'

import { validationError } from 'remix-validated-form'

import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { CompanyForm } from '~/components/Forms/Companies/CompanyForm'
import { Container } from '~/components/Layout/Container'
import { SubmitButton } from '~/components/SubmitButton'
import {
  getCompanyById,
  updateCompanyByCompanyManagementForm,
} from '~/services/company/company.server'
import { getCountries } from '~/services/country/country.server'
import { getCompanyCategories } from '~/services/company-category/company-category.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { companyManagementValidator } from '~/services/company/company.schema'
import { requireEmployee } from '~/session.server'
import { notFound } from '~/utils/responses'
import { uploadHandler } from '~/services/aws/s3.server'
import { getBenefits } from '~/services/benefit/benefit.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Compañía no encontrada | HoyTrabajas Beneficios',
    }
  }

  const { company } = data

  return {
    title: `${company.name}`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_COMPANY
  )

  const [company, benefits, companyCategories, countries] = await Promise.all([
    getCompanyById(currentEmployee.companyId),
    getBenefits(),
    getCompanyCategories(),
    getCountries(),
  ])

  if (!company) {
    throw notFound({
      message: 'No se ha encontrado información sobre la compañía',
      redirect: '/home',
    })
  }

  return json({
    company,
    benefits,
    companyCategories,
    countries,
  })
}

export async function action({ request, params }: ActionArgs) {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_COMPANY
  )

  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()

  const { data, submittedData, error } =
    await companyManagementValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  const imageFormData = await parseMultipartFormData(request, uploadHandler)
  const logoImageNewKey = imageFormData.get('logoImage')

  data.logoImageKey =
    typeof logoImageNewKey === 'string' ? logoImageNewKey : data.logoImageKey

  const { company, error: companyError } =
    await updateCompanyByCompanyManagementForm(currentEmployee.companyId, data)

  if (companyError || !company) {
    return json(
      {
        submittedData,
        companyError,
      },
      { status: 400 }
    )
  }

  return redirect('/home')
}

export default function DashboardManageCompanyIndexRoute() {
  const { company, countries, benefits, companyCategories } =
    useLoaderData<typeof loader>()

  return (
    <Container className="mx-auto w-full">
      <CompanyForm
        defaultValues={company}
        countries={countries}
        benefits={benefits}
        companyCategories={companyCategories}
        validator={companyManagementValidator}
        actions={
          <div className="mt-10 flex flex-col items-center justify-end gap-4 md:flex-row">
            <Link to="/home" className="w-full md:w-auto">
              <ButtonElement
                variant={ButtonColorVariants.SECONDARY}
                className="w-full md:w-auto"
              >
                Cancelar
              </ButtonElement>
            </Link>

            <SubmitButton className="w-full md:w-auto">Guardar</SubmitButton>
          </div>
        }
      />
    </Container>
  )
}
