import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

import { Link } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
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

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
  })

  const employees = await getEmployeesByCompanyId(company.id)

  return json({
    employees,
    companyName: company.name,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada | HoyAdelantas',
    }
  }

  const { companyName } = data

  return {
    title: `[Admin] Colaboradores de ${companyName} | HoyAdelantas`,
  }
}

export default function AdminDashboardCompanyEmployees() {
  const { employees } = useLoaderData<typeof loader>()

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
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Nuevo colaborador
              </Button>

              <Link to="download" reloadDocument>
                <Button
                  className="flex w-full items-center whitespace-nowrap sm:w-auto"
                  size="SM"
                  variant={ButtonColorVariants.SECONDARY}
                  icon={ButtonIconVariants.DOWNLOAD}
                >
                  Descargar colaboradores
                </Button>
              </Link>

              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                size="SM"
                variant={ButtonColorVariants.SECONDARY}
                icon={ButtonIconVariants.UPLOAD}
              >
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
