import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

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
import { useEffect } from 'react'

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
  const { employees, companyName } = useLoaderData<typeof loader>()

  const downloadEmptyCSV = () => {
    if (employees && employees.length > 0) {
      const csvContent =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(getCsvContent())
      const link = document.createElement('a')
      link.setAttribute('href', csvContent)
      link.setAttribute('download', `colaboradores_${company?.id}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getCsvContent = () => {
    const headers = ['nombre', 'correo_electronico' /* otros campos */].join(
      ','
    )
    const rows = employees.map((employee) => {
      const { firstName, email /* otros campos */ } = employee
      return [nombre, correo_electronico /* otros campos */].join(',')
    })
    return [headers, ...rows].join('\n')
  }

  useEffect(() => {
    if (employees && employees.length > 0) {
      setCompany(employees[0].company)
    }
  }, [employees])

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
                onClick={downloadEmptyCSV}
                key="download-employee"
                size="SM"
                variant={ButtonColorVariants.SECONDARY}
                icon={ButtonIconVariants.DOWNLOAD}
              >
                {/* <MdOutlineDownload className="mr-3" /> */}
                Descargar colaboradores
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
