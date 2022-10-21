import type { PremiumAdvanceHistoryItemProps } from '~/containers/dashboard/AdvanceHistoryItem'
import type {
  Company,
  Employee,
  PremiumAdvance,
  PremiumAdvanceHistory,
  User,
} from '@prisma/client'

import { PremiumAdvanceHistoryActor } from '@prisma/client'

import { Link } from '@remix-run/react'
import { HiOutlineOfficeBuilding } from 'react-icons/hi'
import { FaUserTie } from 'react-icons/fa'

import { Title } from '~/components/Typography/Title'
import { AdvanceHistoryItem } from '~/containers/dashboard/AdvanceHistoryItem'
import { PremiumAdvanceSummary } from '~/containers/dashboard/PremiumAdvanceSummary'
import { AdminManagementButtons } from '~/containers/dashboard/PremiumAdvance/AdminManagementButtons'
import { EmployeeManagementButtons } from '~/containers/dashboard/PremiumAdvance/EmployeeManagementButtons'

interface PremiumAdvanceDetailsProps {
  premiumAdvance: Pick<
    PremiumAdvance,
    'id' | 'companyId' | 'employeeId' | 'status'
  > & {
    history: (PremiumAdvanceHistoryItemProps['history'] &
      Pick<PremiumAdvanceHistory, 'id' | 'actor'>)[]
    createdAt: string | Date
  }

  company: Pick<Company, 'id' | 'name'>
  employee?: Pick<Employee, 'id'> | null
  user?: Pick<User, 'firstName' | 'lastName'> | null
  isAdmin?: boolean
}

export const PremiumAdvanceDetails = ({
  premiumAdvance,
  company,
  employee,
  user,
  isAdmin = false,
}: PremiumAdvanceDetailsProps) => {
  const { history } = premiumAdvance

  const employeeFullName =
    user?.firstName && user?.lastName && `${user.firstName} ${user.lastName}`

  const formatHistoryActorName = (actor: PremiumAdvanceHistoryActor) =>
    actor === PremiumAdvanceHistoryActor.ADMIN
      ? 'El administrador'
      : employeeFullName || 'El colaborador'

  return (
    <div className="mx-auto mt-8 flex w-full justify-center gap-10 px-2 sm:px-8">
      <div className="mx-auto w-full max-w-4xl lg:flex">
        <div className="mx-auto w-full max-w-xl">
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

          <PremiumAdvanceSummary
            premiumAdvance={premiumAdvance}
            isAdmin={isAdmin}
          />

          <div className="pb-4" />

          <div className="ml-auto flex gap-4">
            {isAdmin ? (
              <AdminManagementButtons premiumAdvance={premiumAdvance} />
            ) : (
              <EmployeeManagementButtons premiumAdvance={premiumAdvance} />
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-xl lg:ml-4 lg:mt-0">
          <Title className="pb-8">Historial</Title>

          <div className="space-y-3">
            {history.map((historyItem) => (
              <AdvanceHistoryItem
                key={historyItem.id}
                type="PREMIUM_ADVANCE"
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
