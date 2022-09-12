import type {
  CompanyDebt,
  CompanyCryptoDebt,
  CompanyFiatDebt,
} from '@prisma/client'
import { Link } from '@remix-run/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatRelativeDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '../FormFields/CurrencyInput'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'

interface CompanyDebtListProps {
  debts: (Pick<CompanyDebt, 'id' | 'month' | 'year'> & {
    updatedAt: string
    cryptoDebt?:
      | (Pick<CompanyCryptoDebt, 'amount' | 'currentAmount'> & {
          _count: {
            payrollAdvances: number
          }
        })
      | null
    fiatDebt?:
      | (Pick<CompanyFiatDebt, 'amount' | 'currentAmount'> & {
          _count: {
            payrollAdvances: number
          }
        })
      | null
  })[]
}

export function CompanyDebtList({ debts }: CompanyDebtListProps) {
  return debts?.length ? (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto xl:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle xl:px-8">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeading title="Mes" />
                  <TableHeading title="Monto total" isCentered />
                  <TableHeading title="Monto actual" isCentered />

                  <TableHeading title="Cantidad de adelantos" isCentered />
                  <TableHeading title="Última actualización" isCentered />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {debts.map(
                  ({ id, fiatDebt, cryptoDebt, month, year, updatedAt }) => (
                    <tr key={id}>
                      <TableData>
                        <Link to={`/debts/${id}`}>
                          <div className="text-sm font-medium text-gray-900 underline hover:text-cyan-600">
                            Novedades de{' '}
                            {format(new Date(year, month), 'MMMM', {
                              locale: es,
                            })}
                          </div>
                        </Link>
                      </TableData>

                      <TableData isCentered>
                        {fiatDebt && (
                          <div className="text-sm text-gray-900">
                            {formatMoney(fiatDebt.amount, CurrencySymbol.COP)}
                          </div>
                        )}
                        {cryptoDebt && (
                          <div className="text-sm text-gray-900">
                            {formatMoney(
                              cryptoDebt.amount,
                              CurrencySymbol.BUSD
                            )}
                          </div>
                        )}
                      </TableData>

                      <TableData isCentered>
                        {fiatDebt && (
                          <div className="text-sm text-gray-900">
                            {fiatDebt.currentAmount
                              ? formatMoney(
                                  fiatDebt.currentAmount,
                                  CurrencySymbol.COP
                                )
                              : '-'}
                          </div>
                        )}

                        {cryptoDebt && (
                          <div className="text-sm text-gray-900">
                            {cryptoDebt.currentAmount
                              ? formatMoney(
                                  cryptoDebt.currentAmount,
                                  CurrencySymbol.BUSD
                                )
                              : '-'}
                          </div>
                        )}
                      </TableData>

                      <TableData isCentered>
                        {fiatDebt && (
                          <div className="text-sm text-gray-900">
                            {fiatDebt._count.payrollAdvances}
                          </div>
                        )}
                        {cryptoDebt && (
                          <div className="text-sm text-gray-900">
                            {cryptoDebt._count.payrollAdvances}
                          </div>
                        )}
                      </TableData>

                      <TableData isCentered>
                        <div className="text-sm text-gray-900">
                          {/* todo: get latest date between fiat and crypto */}
                          {formatRelativeDate(new Date(Date.parse(updatedAt)))}
                        </div>
                      </TableData>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col rounded-[15px] border border-gray-300 py-6">
      <p className="my-6 text-center font-medium text-gray-700">
        La lista de novedades está vacía
      </p>
    </div>
  )
}
