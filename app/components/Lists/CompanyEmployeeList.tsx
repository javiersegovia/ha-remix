import type { getEmployeesByCompanyId } from '~/services/employee/employee.server'

import { Link } from '@remix-run/react'
import { TableHeading } from './TableHeading'
import { TableData } from './TableData'
import { EmployeeStatusPill } from '../Pills/EmployeeStatusPill'

interface CompanyEmployeeListProps {
  employees: Awaited<ReturnType<typeof getEmployeesByCompanyId>>
}

export function CompanyEmployeeList({ employees }: CompanyEmployeeListProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Nombre" />
                  <TableHeading title="Ciudad" isCentered />
                  <TableHeading title="Área" isCentered />
                  <TableHeading title="Grupos asignados" isCentered />
                  <TableHeading title="Beneficios asignados" isCentered />
                  <TableHeading title="Estado" isCentered />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((employee) => (
                  <tr key={employee.user.email} className="hover:bg-gray-100">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link to={`${employee.id}/details`}>
                        <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
                          {`${employee.user.firstName} ${employee.user.lastName}`}
                        </div>

                        <div className="text-sm text-gray-500">
                          {employee.user.email}
                        </div>
                      </Link>
                    </td>

                    <TableData isCentered>{employee.city?.name}</TableData>

                    <TableData isCentered>
                      {employee.jobDepartment?.name}
                    </TableData>

                    <TableData isCentered>
                      {employee.employeeGroups?.length}
                    </TableData>

                    <TableData isCentered>
                      {employee.benefits?.length}
                    </TableData>

                    <TableData isCentered>
                      <EmployeeStatusPill employeeStatus={employee.status} />
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
