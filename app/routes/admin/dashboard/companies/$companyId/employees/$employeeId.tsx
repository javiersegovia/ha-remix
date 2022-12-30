import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { validationError } from 'remix-validated-form'
import { FormActions } from '~/components/FormFields/FormActions'
import { AdminEmployeeForm } from '~/components/Forms/AdminEmployeeForm'
import { Title } from '~/components/Typography/Title'
import { employeeValidator } from '~/services/employee/employee.schema'
import { getBanks, validateBankAccount } from '~/services/bank/bank.server'
import { getCountries } from '~/services/country/country.server'
import { getCryptocurrencies } from '~/services/crypto-currency/crypto-currency.server'
import { getCryptoNetworks } from '~/services/crypto-network/crypto-network.server'
import { getCurrencies } from '~/services/currency/currency.server'
import { getGenders } from '~/services/gender/gender.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getJobPositions } from '~/services/job-position/job-position.server'
import { requireAdminUserId } from '~/session.server'
import {
  getEmployeeById,
  updateEmployeeById,
} from '~/services/employee/employee.server'
import { getMemberships } from '~/services/membership/membership.server'
import { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import { prisma } from '~/db.server'

type LoaderData = {
  employee: Awaited<ReturnType<typeof getEmployeeById>>
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
  memberships: Awaited<ReturnType<typeof getMemberships>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { employeeId } = params

  if (!employeeId) {
    throw badRequest('No pudimos encontrar el ID del empleado')
  }
  const employeExists = prisma.employee.findUnique({
    where: { id: employeeId },
  })
  if (!employeExists) {
    throw badRequest('No pudimos encontrar el ID del empleado')
  }

  // todo: test Promise.all with remix-utils utility to improve load times
  return json<LoaderData>({
    employee: await getEmployeeById(employeeId),
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
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Colaborador no encontrado | HoyAdelantas',
    }
  }

  const { employee } = data as LoaderData

  return {
    title: `[Admin] ${employee?.user.firstName} ${employee?.user.lastName}`,
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

  const { companyId, employeeId } = params

  if (!employeeId || !companyId) {
    throw badRequest({
      message: 'No se ha encontrado la ID de la compañía o el colaborador',
    })
  }

  await updateEmployeeById(data, employeeId)

  return redirect(`/admin/dashboard/companies/${companyId}/employees`, 301)
}

export default function AdminDashboardCompanyUpdateEmployeeRoute() {
  const {
    employee,
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
    memberships,
  } = useLoaderData<LoaderData>()

  return (
    <section className="mx-auto w-full max-w-screen-lg pb-10">
      <Title>Actualizar colaborador</Title>

      {employee ? (
        <div className="mt-5">
          <AdminEmployeeForm
            defaultValues={{
              ...employee,
              inactivatedAt: employee.inactivatedAt
                ? new Date(employee.inactivatedAt)
                : null,
              birthDay: employee.birthDay ? new Date(employee.birthDay) : null,
              documentIssueDate: employee.documentIssueDate
                ? new Date(employee.documentIssueDate)
                : null,
            }}
            countries={countries}
            jobPositions={jobPositions}
            jobDepartments={jobDepartments}
            banks={banks}
            memberships={memberships}
            bankAccountTypes={bankAccountTypes}
            identityDocumentTypes={identityDocumentTypes}
            genders={genders}
            currencies={currencies}
            cryptocurrencies={cryptocurrencies}
            cryptoNetworks={cryptoNetworks}
            validator={employeeValidator}
            actions={<FormActions title="Guardar" />}
          />
        </div>
      ) : (
        <p>Ha ocurrido un error.</p>
      )}
    </section>
  )
}
