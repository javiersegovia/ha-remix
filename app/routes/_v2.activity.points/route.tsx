import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { AnimatePresence } from 'framer-motion'
import { json } from '@remix-run/node'

import { requireEmployee } from '~/session.server'
import {
  getCompanyPointMetricsByCompanyId,
  getPointsTransactionsByCompanyId,
} from '~/services/company-points/company-points.server'
import { PointMetrics } from '~/containers/home/PointMetrics'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

export const meta: MetaFunction = () => {
  return {
    title: 'Actividad de Puntos | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_COMPANY_POINTS
  )

  const pointMetrics = await getCompanyPointMetricsByCompanyId(
    employee.companyId
  )
  const pointTransactions = await getPointsTransactionsByCompanyId(
    employee.companyId
  )

  return json({
    pointMetrics,
    pointTransactions,
  })
}

export default function ActivityPointsIndexRoute() {
  const { pointMetrics, pointTransactions } = useLoaderData<typeof loader>()

  const { estimatedBudget, currentBudget, circulatingPoints, spentPoints } =
    pointMetrics

  const outlet = useOutlet()

  return (
    <>
      <div className="mt-10" />

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
                {/* <Button
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
                </Button> */}
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
          title="Aún no existe ninguna transacción registrada"
          description="Aquí se reflejarán todas las operaciones relacionadas al movimiento de puntos dentro de tu empresa"
          // actions={}
          className="mt-10"
        />
      )}

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
