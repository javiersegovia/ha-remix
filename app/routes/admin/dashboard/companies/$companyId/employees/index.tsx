import { json } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { HiPlus } from 'react-icons/hi'
import { MdOutlineUploadFile } from 'react-icons/md'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { requireCompany } from '~/services/company/company.server'
import { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { requireAdminUserId } from '~/session.server'
import { EmployeeList } from '~/components/Lists/EmployeeList'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'

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
      title: '[Admin] Compañía no encontrada | HoyAdelantas',
    }
  }

  const { companyName } = data as LoaderData

  return {
    title: `[Admin] Colaboradores de ${companyName} | HoyAdelantas`,
  }
}

export default function AdminDashboardCompanyEmployees() {
  const { employees } = useLoaderData<LoaderData>()

  return (
    <>
      <>
        <TitleWithActions
          title="Colaboradores"
          className="my-10"
          actions={
            <>
              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                href="create"
                key="create-employee"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                {/* <HiPlus className="mr-3" /> */}
                Nuevo colaborador
              </Button>

              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                href="upload"
                size="SM"
                variant={ButtonColorVariants.SECONDARY}
                icon={ButtonIconVariants.UPLOAD}
              >
                {/* <MdOutlineUploadFile className="mr-3" /> */}
                Cargar colaboradores
              </Button>
            </>
          }
        />

        {employees?.length > 0 ? (
          <EmployeeList employees={employees} />
        ) : (
          <p className="text-lg">La lista de colaboradores está vacía.</p>
        )}
      </>
    </>
  )
}
