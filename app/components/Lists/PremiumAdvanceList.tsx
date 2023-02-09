import type { Company, User, PremiumAdvance } from '@prisma/client'

import { Link } from '@remix-run/react'
import { formatDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '../FormFields/CurrencyInput'
import { AdvanceStatusPill } from '../Pills/AdvanceStatusPill'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

export interface PremiumAdvanceListProps {
  premiumAdvances: (Pick<
    PremiumAdvance,
    'id' | 'status' | 'requestedAmount' | 'totalAmount'
  > & {
    createdAt: string | Date
    company: Pick<Company, 'name'>
    employee?: {
      user: Pick<User, 'firstName' | 'lastName'> | null
    } | null
  })[]
  isAdmin?: boolean
  hideColumns?: {
    status: boolean
  }
}

interface EmployeeNameProps {
  employee: any
  companyName: string
}

const EmployeeNameTitle = ({ employee, companyName }: EmployeeNameProps) => {
  return (
    <>
      {(employee.user.firstName || employee.user.lastName) && (
        <div className="text-sm font-medium text-cyan-600 underline hover:text-cyan-800">
          {`${employee.user.firstName} ${employee.user.lastName}`.trim()}
        </div>
      )}
      <div className="text-sm text-gray-500">{employee.user.email}</div>
      <div className="text-sm font-medium text-gray-500">{companyName}</div>
    </>
  )
}

export const PremiumAdvanceList = ({
  premiumAdvances,
  hideColumns,
  isAdmin = false,
}: PremiumAdvanceListProps) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Colaborador" />
                  <TableHeading title="Dinero solicitado" isCentered />
                  <TableHeading title="Total solicitado" isCentered />
                  <TableHeading title="Fecha de solicitud" isCentered />

                  {!hideColumns?.status && (
                    <TableHeading title="Estado" isCentered />
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {premiumAdvances.map(
                  ({
                    employee,
                    company,
                    requestedAmount,
                    totalAmount,
                    ...premiumAdvance
                  }) => (
                    <tr key={premiumAdvance.id} className="hover:bg-gray-100">
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          to={
                            isAdmin
                              ? `/admin/dashboard/premium-advances/${premiumAdvance.id}`
                              : `/dashboard/premium-advances/${premiumAdvance.id}`
                          }
                        >
                          {isAdmin && employee ? (
                            <>
                              <EmployeeNameTitle
                                employee={employee}
                                companyName={company.name}
                              />
                            </>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
                              {`Solicitud de adelanto`}
                            </div>
                          )}
                        </Link>
                      </td>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {requestedAmount
                            ? formatMoney(requestedAmount, CurrencySymbol.COP)
                            : '-'}
                        </div>
                      </TableData>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {totalAmount
                            ? formatMoney(totalAmount, CurrencySymbol.COP)
                            : '-'}
                        </div>
                      </TableData>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {formatDate(
                            new Date(Date.parse(`${premiumAdvance.createdAt}`))
                          )}
                        </div>
                      </TableData>

                      {!hideColumns?.status && (
                        <TableData isCentered>
                          <AdvanceStatusPill status={premiumAdvance.status} />
                        </TableData>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
