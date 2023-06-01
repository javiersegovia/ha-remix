import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import { badRequest } from '~/utils/responses'
import { validationError } from 'remix-validated-form'
import { FormActions } from '~/components/FormFields/FormActions'
import { AdminEmployeeForm } from '~/components/Forms/AdminEmployeeForm'
import { Title } from '~/components/Typography/Title'
import { employeeValidatorClient } from '~/services/employee/employee.schema'
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
import { getUserRoles } from '~/services/user-role/user-role.server'
import { parseISOLocalNullable } from '~/utils/formatDate'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { employeeId, companyId } = params

  if (!employeeId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del empleado',
      redirect: `/admin/dashboard/companies/${companyId}/employees`,
    })
  }
  const employeeExists = prisma.employee.findUnique({
    where: { id: employeeId },
  })
  if (!employeeExists) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del empleado',
      redirect: `/admin/dashboard/companies/${companyId}/employees`,
    })
  }

  // todo: test Promise.all with remix-utils utility to improve load times
  return json({
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
    userRoles: await getUserRoles(),
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Colaborador no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { employee } = data

  return {
    title: `[Admin] ${employee?.user.firstName} ${employee?.user.lastName}`,
  }
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { data, submittedData, error, formId } =
    await employeeValidatorClient.validate(await request.formData())

  if (error) {
    return validationError(error, submittedData)
  }

  const { bankAccount } = data || {}
  if (bankAccount) {
    validateBankAccount(bankAccount, formId)
  }

  const { companyId, employeeId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado la ID de la compañía',
      redirect: `/admin/dashboard/companies`,
    })
  }

  if (!employeeId) {
    throw badRequest({
      message: 'No se ha encontrado la ID del colaborador',
      redirect: `/admin/dashboard/companies/${companyId}/employees`,
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
    userRoles,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <Title>Actualizar colaborador</Title>

      {employee ? (
        <div className="mt-10">
          <AdminEmployeeForm
            defaultValues={{
              ...employee,

              birthDay: parseISOLocalNullable(employee.birthDay),
              documentIssueDate: parseISOLocalNullable(
                employee.documentIssueDate
              ),
              startedAt: parseISOLocalNullable(employee.startedAt),
              inactivatedAt: parseISOLocalNullable(employee.inactivatedAt),
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
            userRoles={userRoles}
            validator={employeeValidatorClient}
            actions={<FormActions title="Guardar" />}
          />
        </div>
      ) : (
        <p>Ha ocurrido un error.</p>
      )}
    </>
  )
}
