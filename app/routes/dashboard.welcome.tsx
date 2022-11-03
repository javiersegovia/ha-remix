import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { WelcomeForm } from '~/components/Forms/WelcomeForm'
import { getCountries } from '~/services/country/country.server'
import { getGenders } from '~/services/gender/gender.server'
import { logout, requireUser } from '~/session.server'
import {
  getEmployeeById,
  updateEmployeeByWelcomeForm,
} from '~/services/employee/employee.server'
import { getBanks } from '~/services/bank/bank.server'
import { welcomeValidator } from '~/schemas/welcome.schema'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'

type LoaderData = {
  employee: Awaited<ReturnType<typeof getEmployeeById>>
  countries: Awaited<ReturnType<typeof getCountries>>
  genders: Awaited<ReturnType<typeof getGenders>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const { employee } = await requireUser(request)

  if (!employee) {
    throw logout(request)
  }

  const employeeData = await getEmployeeById(employee.id)

  return json<LoaderData>({
    employee: employeeData,
    countries: await getCountries(),
    genders: await getGenders(),
    banks: await getBanks(),
    bankAccountTypes: await getBankAccountTypes(),
    identityDocumentTypes: await getIdentityDocumentTypes(),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Bienvenido | HoyAdelantas',
  }
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request)

  const { data, submittedData, error } = await welcomeValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  if (!user.employee?.id) {
    throw logout(request)
  }

  const signerToken = await updateEmployeeByWelcomeForm(data, user.employee.id)
  return redirect(`/dashboard/verify-signature?token=${signerToken}`, 301)
}

export default function DashboardWelcomeRoute() {
  const {
    genders,
    countries,
    employee,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
  } = useLoaderData<LoaderData>()

  if (!employee) {
    return redirect('/logout')
  }

  return (
    <section className="min-h-screen bg-steelBlue-900 py-20">
      <div className="container mx-auto px-0 sm:px-4">
        <img
          className="mx-auto block"
          src="/logo/logo_hoyadelantas_white_over_blue.png"
          alt="Logo HoyAdelantas"
          width="256"
          height="44.2"
        />

        <div className="mx-auto mb-6 mt-6 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-6/12 2xl:w-5/12">
          <>
            <h1 className="mb-4 text-center text-3xl font-semibold text-steelBlue-600">
              ¡Bienvenido!
            </h1>
            <div className="mx-auto max-w-xl">
              <p className="mb-2 text-center text-sm">
                Antes de ingresar, por favor verifica que la siguiente
                información sea correcta, y completa los campos que falten.
              </p>
              <p className="mb-8 text-center text-sm">
                En caso de que algún dato sea incorrecto, por favor comúnicate
                con nuestro soporte a través de WhatsApp.
              </p>
            </div>

            <WelcomeForm
              countries={countries}
              genders={genders}
              banks={banks}
              bankAccountTypes={bankAccountTypes}
              identityDocumentTypes={identityDocumentTypes}
              defaultValues={{
                ...employee,
                birthDay: employee.birthDay
                  ? new Date(employee.birthDay)
                  : null,
                documentIssueDate: employee.documentIssueDate
                  ? new Date(employee.documentIssueDate)
                  : null,
              }}
            />
          </>
        </div>
      </div>
    </section>
  )
}
