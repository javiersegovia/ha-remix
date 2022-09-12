import { Link } from '@remix-run/react'
import type { getCompanies } from '~/services/company/company.server'
import { CompanyStatusPill } from '~/components/Pills/CompanyStatusPill'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

interface CompanyListProps {
  companies: Awaited<ReturnType<typeof getCompanies>>
}

export function CompanyList({ companies }: CompanyListProps) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Nombre de la empresa" />
                  <TableHeading title="Número de Empleados" isCentered />
                  <TableHeading title="Estado" isCentered />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-100">
                    <TableData>
                      <Link
                        to={`/admin/dashboard/companies/${company.id}?index`}
                        className="text-sm font-medium text-gray-900 underline hover:text-cyan-600"
                      >
                        {company.name}
                      </Link>
                    </TableData>

                    <TableData isCentered>
                      <div className="text-sm text-gray-900">
                        {company._count.employees}
                      </div>
                    </TableData>

                    <TableData isCentered>
                      <CompanyStatusPill companyStatus={company.status} />
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
