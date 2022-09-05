import type { getMonthlyOverview } from '~/services/payroll-advance/payroll-advance.server'
import { formatDate } from '~/utils/formatDate'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { TableData } from './TableData'
import { TableHeading } from './TableHeading'
import { Title } from '../Typography/Title'

interface PaymentDayListProps {
  requestDays: Awaited<ReturnType<typeof getMonthlyOverview>>['requestDays']
}

export const PaymentDayList = ({ requestDays }: PaymentDayListProps) => {
  if (requestDays?.length === 0) {
    return (
      <p className="text-base">
        No se han realizado solicitudes durante este mes.
      </p>
    )
  }

  return (
    <>
      <Title>Solicitudes</Title>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto xl:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle xl:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <TableHeading title="Fecha" />
                    <TableHeading title="Cantidad de solicitudes" isCentered />
                    <TableHeading title="En revisión" isCentered />
                    <TableHeading title="Por desembolsar" isCentered />
                    <TableHeading title="Desembolsado" isCentered />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {requestDays.map(
                    ({ dayNumber, quantity, REQUESTED, APPROVED, PAID }) => (
                      <tr
                        key={dayNumber + quantity}
                        className="text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <TableData>
                          <div className="font-medium">
                            {formatDate(dayNumber)}
                          </div>
                        </TableData>
                        <TableData isCentered>
                          <p>{quantity}</p>
                        </TableData>
                        <TableData isCentered>
                          {REQUESTED && REQUESTED?.BANK_ACCOUNT > 0 && (
                            <div>
                              {formatMoney(
                                REQUESTED?.BANK_ACCOUNT,
                                CurrencySymbol.COP
                              )}
                            </div>
                          )}
                          {REQUESTED && REQUESTED?.WALLET > 0 && (
                            <div>
                              {formatMoney(
                                REQUESTED && REQUESTED?.WALLET,
                                CurrencySymbol.BUSD
                              )}
                            </div>
                          )}
                          {!REQUESTED?.BANK_ACCOUNT && !REQUESTED?.WALLET && (
                            <p className="font-medium text-green-600">-</p>
                          )}
                        </TableData>
                        <TableData isCentered>
                          {REQUESTED &&
                            REQUESTED?.BANK_ACCOUNT > 0 &&
                            APPROVED &&
                            APPROVED?.BANK_ACCOUNT > 0 && (
                              <div className="text-yellow-600">
                                {formatMoney(
                                  APPROVED?.BANK_ACCOUNT,
                                  CurrencySymbol.COP
                                )}
                              </div>
                            )}
                          {REQUESTED &&
                            REQUESTED?.WALLET > 0 &&
                            APPROVED &&
                            APPROVED?.WALLET > 0 && (
                              <div className="text-yellow-600">
                                {formatMoney(
                                  APPROVED.WALLET,
                                  CurrencySymbol.BUSD
                                )}
                              </div>
                            )}
                          {!APPROVED?.BANK_ACCOUNT && !APPROVED?.WALLET && (
                            <p className="font-medium text-green-600">-</p>
                          )}
                        </TableData>
                        <TableData isCentered>
                          {PAID?.BANK_ACCOUNT && (
                            <div>
                              {formatMoney(
                                PAID?.BANK_ACCOUNT,
                                CurrencySymbol.COP
                              )}
                            </div>
                          )}
                          {PAID?.WALLET && (
                            <div>
                              {formatMoney(PAID?.WALLET, CurrencySymbol.BUSD)}
                            </div>
                          )}
                          {!PAID?.BANK_ACCOUNT && !PAID?.WALLET && (
                            <p className="font-medium text-red-600">-</p>
                          )}
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
    </>
  )
}
