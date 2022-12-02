import type { getMemberships } from '~/services/membership/membership.server'

import { Link } from '@remix-run/react'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

interface MembershipListProps {
  memberships: Awaited<ReturnType<typeof getMemberships>>
}

export function MembershipList({ memberships }: MembershipListProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Nombre" />
                  <TableHeading title="Beneficios asociados" isCentered />
                  <TableHeading title="Colaboradores asociados" isCentered />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {memberships.map((membership) => (
                  <tr key={membership.id} className="hover:bg-gray-100">
                    <TableData>
                      <Link
                        to={`/admin/dashboard/memberships/${membership.id}`}
                        className="text-sm font-medium text-gray-900 underline hover:text-cyan-600"
                      >
                        {membership.name}
                      </Link>
                    </TableData>

                    <TableData isCentered>
                      {membership._count.benefits}
                    </TableData>
                    <TableData isCentered>
                      {membership._count.employees}
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
