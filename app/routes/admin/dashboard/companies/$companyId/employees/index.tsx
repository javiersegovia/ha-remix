import { json } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { HiPlus } from 'react-icons/hi'

import { Button } from '~/components/Button'
import { requireCompany } from '~/services/company/company.server'
import { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { requireAdminUserId } from '~/session.server'
import { EmployeeList } from '~/components/Lists/EmployeeList'

type LoaderData = {
  employees: Awaited<ReturnType<typeof getEmployeesByCompanyId>>
  companyName: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
  })

  const employees = await getEmployeesByCompanyId(company.id)

  return json<LoaderData>({
    employees,
    companyName: company.name,
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada',
    }
  }

  const { companyName } = data as LoaderData

  return {
    title: `[Admin] Colaboradores de ${companyName}`,
  }
}

export default function AdminDashboardCompanyEmployees() {
  const { employees } = useLoaderData<LoaderData>()

  return (
    <>
      {employees?.length > 0 ? (
        <>
          <ManagementButtons />
          <EmployeeList employees={employees} />
        </>
      ) : (
        <>
          <div className="flex flex-col rounded-md border border-gray-300 py-6">
            <p className="mb-6 text-center font-medium text-gray-700">
              La lista de colaboradores está vacía
            </p>
            <div className="mx-auto">
              <ManagementButtons />
            </div>
          </div>
        </>
      )}
    </>
  )
}

const ManagementButtons = () => {
  return (
    <div className="mb-8 mt-2 flex flex-col items-center px-2 sm:items-start lg:flex-row lg:justify-end">
      <div className="mt-4 flex items-center justify-end gap-4 lg:mt-0">
        <Button
          size="SM"
          className="flex items-center whitespace-nowrap px-4"
          href="create"
        >
          <HiPlus className="mr-3" />
          Nuevo colaborador
        </Button>

        <Button
          size="SM"
          className="flex items-center whitespace-nowrap px-4"
          href="upload"
          variant="LIGHT"
        >
          <HiPlus className="mr-3" />
          Cargar colaboradores
        </Button>
      </div>
    </div>
  )
}
