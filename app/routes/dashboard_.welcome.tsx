import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect, json } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { validationError } from 'remix-validated-form'

import { WelcomeForm } from '~/components/Forms/WelcomeForm'
import { getCountries } from '~/services/country/country.server'
import { getGenders } from '~/services/gender/gender.server'
import { requireEmployee } from '~/session.server'
import { updateEmployeeByWelcomeForm } from '~/services/employee/employee.server'
import { getBanks } from '~/services/bank/bank.server'
import { welcomeValidator } from '~/schemas/welcome.schema'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { parseISOLocalNullable } from '~/utils/formatDate'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  return json({
    employee,
    countries: await getCountries(),
    genders: await getGenders(),
    banks: await getBanks(),
    bankAccountTypes: await getBankAccountTypes(),
    identityDocumentTypes: await getIdentityDocumentTypes(),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Bienvenido | HoyTrabajas Beneficios',
  }
}

export const action = async ({ request }: ActionArgs) => {
  const employee = await requireEmployee(request)

  const { data, submittedData, error } = await welcomeValidator.validate(
    await request.formData()
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await updateEmployeeByWelcomeForm(data, employee.id)

  return redirect('/dashboard/overview')
}

export default function DashboardWelcomeRoute() {
  const {
    genders,
    countries,
    employee,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
  } = useLoaderData<typeof loader>()

  return (
    <section className="min-h-screen bg-steelBlue-700 py-20">
      <div className="container mx-auto px-0 sm:px-4">
        <img
          className="mx-auto block object-contain"
          src="/images/logos/logo_umany_benefits_white_green.png"
          alt="Logo Umany"
          width="200"
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
                birthDay: parseISOLocalNullable(employee.birthDay),
                documentIssueDate: parseISOLocalNullable(
                  employee.documentIssueDate
                ),
              }}
            />
          </>
        </div>
      </div>
    </section>
  )
}
