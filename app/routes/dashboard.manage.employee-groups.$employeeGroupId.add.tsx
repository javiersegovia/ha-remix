import { PermissionCode } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { LoaderArgs, json } from '@remix-run/server-runtime'
import { Modal } from '~/components/Dialog/Modal'
import { Container } from '~/components/Layout/Container'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Table, TableRowProps } from '~/components/Lists/Table'
import { FilterSummary } from '~/containers/dashboard/EmployeeGroup/FilterSummary'
import { getEmployeeGroupById } from '~/services/employee-group/employee-group.server'
import { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { badRequest } from '~/utils/responses'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const { employeeGroupId } = params

  if (!employeeGroupId) {
    throw badRequest({
      message: 'No se encontró el ID del grupo de colaboradores',
      redirect: '/dashboard/manage/employee-groups',
    })
  }

  const employeeGroup = await getEmployeeGroupById(employeeGroupId)

  if (!employeeGroup) {
    throw badRequest({
      message: 'No se encontró el grupo de colaboradores',
      redirect: '/dashboard/manage/employee-groups',
    })
  }

  const employees = await getEmployeesByCompanyId(employee.companyId)

  return json({ employeeGroup, employees })
}

export default function CreateEmployeeGroupRoute() {
  const { employeeGroup, employees } = useLoaderData<typeof loader>()

  const onCloseRedirectTo = `/dashboard/manage/employee-groups/${employeeGroup.id}`

  const { country, state, city, gender, ageRange, salaryRange } = employeeGroup

  const rows: TableRowProps[] = employees?.map((employee) => ({
    rowId: employee.id,
    items: [
      <div>
        <span>{employee.user?.firstName}</span>
        <p>{employee.user?.email}</p>
      </div>,
    ],
  }))

  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <RightPanel
          onCloseRedirectTo={onCloseRedirectTo}
          title="Colaboradores disponibles"
        >
          {/* <Container className="mx-auto w-full"> */}
          {(country || gender || ageRange || salaryRange) && (
            <FilterSummary
              country={country}
              state={state}
              city={city}
              gender={gender}
              ageRange={ageRange}
              salaryRange={salaryRange}
              className="text-sm"
              options={{ hasColumns: true }}
            />
          )}

          <p className="text-sm">
            Selecciona a los colaboradores que formaran parte de este grupo
          </p>

          <div className="overflow-y-auto">
            <Table
              headings={['Seleccionar todos']}
              rows={rows}
              classNames={{ heading: 'text-black text-base' }}
            />
          </div>
        </RightPanel>
      </Modal>
    </>
  )
}
