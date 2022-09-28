import type {
  Company,
  Employee,
  PayrollAdvance,
  PayrollAdvanceHistory,
  User,
} from '@prisma/client'
import type { PayrollAdvanceHistoryItemProps } from './PayrollAdvanceHistoryItem'
import type { PayrollAdvanceSummaryProps } from './PayrollAdvanceSummary'

import { Link } from '@remix-run/react'
import { PayrollAdvanceHistoryActor } from '@prisma/client'
import { HiOutlineOfficeBuilding } from 'react-icons/hi'
import { FaUserTie } from 'react-icons/fa'

import { Title } from '~/components/Typography/Title'
import { PayrollAdvanceSummary } from './PayrollAdvanceSummary'
import { PayrollAdvanceHistoryItem } from './PayrollAdvanceHistoryItem'
import { AdminManagementButtons } from '~/components/PayrollAdvance/AdminManagementButtons'
import { EmployeeManagementButtons } from '~/components/PayrollAdvance/EmployeeManagementButtons'

interface PayrollAdvanceDetailsProps {
  payrollAdvance: Pick<
    PayrollAdvance,
    | 'id'
    | 'companyId'
    | 'employeeId'
    | 'paymentMethod'
    | 'totalAmount'
    | 'requestedAmount'
    | 'status'
    | 'requestReasonDescription'
  > & {
    bankAccountData?:
      | PayrollAdvanceSummaryProps['payrollAdvance']['bankAccountData']
      | null
    walletData?:
      | PayrollAdvanceSummaryProps['payrollAdvance']['walletData']
      | null
    taxes: PayrollAdvanceSummaryProps['payrollAdvance']['taxes']
    history: (PayrollAdvanceHistoryItemProps['history'] &
      Pick<PayrollAdvanceHistory, 'id' | 'actor'>)[]
    transfers: PayrollAdvanceSummaryProps['payrollAdvance']['transfers']
    createdAt: string | Date
    requestReason: PayrollAdvanceSummaryProps['payrollAdvance']['requestReason']
  }

  company: Pick<Company, 'id' | 'name'>
  employee?: Pick<Employee, 'id'> | null
  user?: Pick<User, 'firstName' | 'lastName'> | null
  isAdmin?: boolean
}

export const PayrollAdvanceDetails = ({
  payrollAdvance,
  company,
  employee,
  user,
  isAdmin = false,
}: PayrollAdvanceDetailsProps) => {
  const { history } = payrollAdvance

  const employeeFullName =
    user?.firstName && user?.lastName && `${user.firstName} ${user.lastName}`

  const formatHistoryActorName = (actor: PayrollAdvanceHistoryActor) =>
    actor === PayrollAdvanceHistoryActor.ADMIN
      ? 'El administrador'
      : employeeFullName || 'El colaborador'

  return (
    <div className="mx-auto mt-8 flex w-full justify-center gap-10">
      <div className="mx-auto w-full max-w-4xl lg:flex">
        <div className="w-full max-w-xl">
          <Title>
            <span>Solicitud de </span>
            {employeeFullName || 'adelanto'}
          </Title>

          {isAdmin && (
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <Link
                to={`/admin/dashboard/companies/${company.id}?index`}
                className="flex cursor-pointer items-center gap-2 font-medium text-gray-900 underline"
              >
                <HiOutlineOfficeBuilding />
                <span>{company.name}</span>
              </Link>

              {employee && (
                <>
                  <Link
                    to={`/admin/dashboard/companies/${company.id}/employees/${employee.id}`}
                    className="flex cursor-pointer items-center gap-2 font-medium text-gray-900 underline"
                  >
                    <FaUserTie />
                    {employeeFullName || 'Colaborador sin nombre'}
                  </Link>
                </>
              )}
            </div>
          )}

          <div className="pb-8" />

          <PayrollAdvanceSummary
            payrollAdvance={payrollAdvance}
            isAdmin={isAdmin}
          />

          <div className="pb-4" />

          <div className="ml-auto flex gap-4">
            {isAdmin ? (
              <AdminManagementButtons payrollAdvance={payrollAdvance} />
            ) : (
              <EmployeeManagementButtons payrollAdvance={payrollAdvance} />
            )}
          </div>
        </div>

        <div className="ml-4 mt-10 lg:mt-0">
          <Title className="pb-8">Historial</Title>

          <div className="space-y-3">
            {history.map((historyItem) => (
              <PayrollAdvanceHistoryItem
                key={historyItem.id}
                history={historyItem}
                historyActorName={formatHistoryActorName(historyItem.actor)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
