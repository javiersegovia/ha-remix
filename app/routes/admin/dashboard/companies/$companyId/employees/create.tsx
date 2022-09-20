import { useLoaderData } from '@remix-run/react'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'
import { FormActions } from '~/components/FormFields/FormActions'
import { AdminEmployeeForm } from '~/components/Forms/AdminEmployeeForm'
import { Title } from '~/components/Typography/Title'
import { employeeValidator } from '~/services/employee/employee.schema'
import {
  getBankAccountTypes,
  getBanks,
  getIdentityDocumentTypes,
  validateBankAccount,
} from '~/services/bank/bank.server'
import { requireCompany } from '~/services/company/company.server'
import { getCountries } from '~/services/country/country.server'
import { getCryptocurrencies } from '~/services/crypto-currency/crypto-currency.server'
import { getCryptoNetworks } from '~/services/crypto-network/crypto-network.server'
import { getCurrencies } from '~/services/currency/currency.server'
import { getGenders } from '~/services/gender/gender.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { requireAdminUserId } from '~/session.server'
import { createEmployee } from '~/services/employee/employee.server'

type LoaderData = {
  countries: Awaited<ReturnType<typeof getCountries>>
  jobPositions: Awaited<ReturnType<typeof getJobPositions>>
  jobDepartments: Awaited<ReturnType<typeof getJobDepartments>>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  genders: Awaited<ReturnType<typeof getGenders>>
  currencies: Awaited<ReturnType<typeof getCurrencies>>
  cryptoNetworks: Awaited<ReturnType<typeof getCryptoNetworks>>
  cryptocurrencies: Awaited<ReturnType<typeof getCryptocurrencies>>
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUserId(request)

  // todo: test Promise.all with remix-utils utility to improve load times
  return json<LoaderData>({
    countries: await getCountries(),
    jobPositions: await getJobPositions(),
    jobDepartments: await getJobDepartments(),
    banks: await getBanks(),
    bankAccountTypes: await getBankAccountTypes(),
    identityDocumentTypes: await getIdentityDocumentTypes(),
    genders: await getGenders(),
    currencies: await getCurrencies(),
    cryptoNetworks: await getCryptoNetworks(),
    cryptocurrencies: await getCryptocurrencies(),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear colaborador | HoyAdelantas',
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { data, submittedData, error, formId } =
    await employeeValidator.validate(await request.formData())

  if (error) {
    return validationError(error, submittedData)
  }

  const { bankAccount } = data || {}
  if (bankAccount) {
    validateBankAccount(bankAccount, formId)
  }

  const { companyId } = params
  const company = await requireCompany({ where: { id: companyId } })

  const { fieldErrors } = await createEmployee(data, company.id)

  if (fieldErrors) {
    return validationError(
      {
        fieldErrors,
        formId,
      },
      submittedData
    )
  }

  return redirect(`/admin/dashboard/companies/${company.id}/employees`, 301)
}

export default function AdminDashboardCompanyCreateEmployeeRoute() {
  const {
    countries,
    jobPositions,
    jobDepartments,
    banks,
    bankAccountTypes,
    identityDocumentTypes,
    genders,
    currencies,
    cryptocurrencies,
    cryptoNetworks,
  } = useLoaderData<LoaderData>()

  return (
    <section className="mx-auto w-full max-w-screen-lg pb-10">
      <Title>Crear nuevo colaborador</Title>

      <div className="mt-5">
        <AdminEmployeeForm
          {...{
            countries,
            jobPositions,
            jobDepartments,
            banks,
            bankAccountTypes,
            identityDocumentTypes,
            genders,
            currencies,
            cryptocurrencies,
            cryptoNetworks,
          }}
          validator={employeeValidator}
          actions={<FormActions title="Crear" />}
        />
      </div>
    </section>
  )
}
