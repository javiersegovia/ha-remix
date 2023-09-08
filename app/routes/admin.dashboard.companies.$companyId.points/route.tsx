import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { Link, useLoaderData, useOutlet } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from 'remix-utils'
import { AnimatePresence } from 'framer-motion'
import { $path } from 'remix-routes'

import { requireAdminUserId } from '~/session.server'
import {
  getCompanyPointMetricsByCompanyId,
  getPointsTransactionsByCompanyId,
} from '~/services/company-points/company-points.server'
import { PointMetrics } from '~/containers/home/PointMetrics'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button, ButtonIconVariants } from '~/components/Button'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { MdOutlineModeEditOutline } from 'react-icons/md'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Puntos | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  const pointMetrics = await getCompanyPointMetricsByCompanyId(companyId)
  const pointTransactions = await getPointsTransactionsByCompanyId(companyId)

  return json({ pointMetrics, pointTransactions, companyId })
}

export default function CompanyPointsIndexRoute() {
  const { pointMetrics, pointTransactions, companyId } =
    useLoaderData<typeof loader>()

  const { estimatedBudget, currentBudget, circulatingPoints, spentPoints } =
    pointMetrics

  const outlet = useOutlet()

  return (
    <>
      <Link
        to={$path(
          '/admin/dashboard/companies/:companyId/points/budget/update',
          { companyId }
        )}
        className="mb-4 ml-auto flex w-10 gap-3 rounded-full border border-steelBlue-200 bg-steelBlue-100 p-2 text-steelBlue-800"
      >
        <MdOutlineModeEditOutline className="text-2xl" />
      </Link>

      <PointMetrics
        estimatedBudget={estimatedBudget}
        currentBudget={currentBudget}
        circulatingPoints={circulatingPoints}
        spentPoints={spentPoints}
      />

      {/* <Title className="mt-10">Transacciones</Title> */}

      {pointTransactions?.length > 0 ? (
        <>
          <TitleWithActions
            className="my-10"
            title="Transacciones"
            actions={
              <>
                <Button
                  className="flex w-full items-center whitespace-nowrap sm:w-auto"
                  href={$path(
                    '/admin/dashboard/companies/:companyId/points/transactions/create',
                    {
                      companyId,
                    }
                  )}
                  size="SM"
                  icon={ButtonIconVariants.CREATE}
                >
                  Crear transacción
                </Button>
              </>
            }
          />

          <DataTable
            columns={columns}
            data={pointTransactions}
            // pagination={pagination}
            // tableActions={(table) => (
            //   <TableActions table={table} indicators={indicators} />
            // )}
          />
        </>
      ) : (
        <TableIsEmpty
          title="Aún no tienes ninguna transacción registrada"
          description="¿Qué esperas para añadir la primera?"
          actions={
            <Button
              href={$path(
                '/admin/dashboard/companies/:companyId/points/transactions/create',
                {
                  companyId,
                }
              )}
              size="SM"
              icon={ButtonIconVariants.CREATE}
            >
              Crear transacción
            </Button>
          }
          className="mt-10"
        />
      )}

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
