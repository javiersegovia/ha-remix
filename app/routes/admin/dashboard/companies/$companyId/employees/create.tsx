import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { validationError } from 'remix-validated-form'

import { FormActions } from '~/components/FormFields/FormActions'
import { AdminEmployeeForm } from '~/components/Forms/AdminEmployeeForm'
import { Title } from '~/components/Typography/Title'
import {
  employeeValidatorClient,
  employeeValidatorServer,
} from '~/services/employee/employee.schema'
import { getBanks, validateBankAccount } from '~/services/bank/bank.server'
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
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { getMemberships } from '~/services/membership/membership.server'
import { getUserRoles } from '~/services/user-role/user-role.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  // todo: test Promise.all with remix-utils utility to improve load times
  return json({
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
    memberships: await getMemberships(),
    userRoles: await getUserRoles(),
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear colaborador | HoyAdelantas',
  }
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { data, submittedData, error, formId } =
    await employeeValidatorServer.validate(await request.formData())

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
    memberships,
    currencies,
    cryptocurrencies,
    cryptoNetworks,
    userRoles,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <Title>Crear nuevo colaborador</Title>

      <div className="mt-10">
        <AdminEmployeeForm
          {...{
            countries,
            jobPositions,
            jobDepartments,
            banks,
            memberships,
            bankAccountTypes,
            identityDocumentTypes,
            genders,
            currencies,
            cryptocurrencies,
            cryptoNetworks,
            userRoles,
          }}
          validator={employeeValidatorClient}
          actions={<FormActions title="Crear" />}
        />
      </div>
    </>
  )
}
