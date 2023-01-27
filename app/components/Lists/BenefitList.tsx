import { Link } from '@remix-run/react'
import type { getBenefits } from '~/services/benefit/benefit.server'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

interface BenefitListProps {
  benefits: Awaited<ReturnType<typeof getBenefits>>
}

export function BenefitList({ benefits }: BenefitListProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Nombre" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {benefits.map((benefit) => (
                  <tr key={benefit.id} className="hover:bg-gray-100">
                    <TableData>
                      <Link
                        to={`/admin/dashboard/benefits/${benefit.id}/details`}
                        className="text-sm font-medium text-gray-900 underline hover:text-cyan-600"
                      >
                        {benefit.name}
                      </Link>
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
