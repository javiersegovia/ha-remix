import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'
import { useLoaderData, useOutlet } from '@remix-run/react'

import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { requireEmployee } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'

import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'

import { AnimatePresence } from 'framer-motion'
import { getIndicators } from '~/services/indicator/indicator.server'
import { getIndicatorActivitiesByCompanyId } from '~/services/indicator-activity/indicator-activity.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Actividad | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.VIEW_INDICATOR_ACTIVITY
  )

  // const searchResult = getSearchParams(request, employeeSearchSchema)

  // if (!searchResult.success) {
  //   throw badRequest({
  //     message: 'Se ha recibido un formato de búsqueda incorrecto',
  //     redirect: null,
  //   })
  // }

  // const { keywords, jobDepartmentId, ageRangeId, salaryRangeId } =
  //   searchResult.data

  // const employeeFilters = await buildEmployeeFilters({
  //   keywords,
  //   jobDepartmentId,
  //   ageRangeId,
  //   salaryRangeId,
  //   companyId: employee.companyId,
  // })

  // const employeeCount = await prisma.employee.count({
  //   where: {
  //     AND: employeeFilters,
  //   },
  // })

  // const { take, skip, pagination } = getPaginationOptions({
  //   request,
  //   itemsCount: employeeCount,
  // })

  const indicatorActivities = await getIndicatorActivitiesByCompanyId(
    employee.companyId
  )

  const indicators = await getIndicators()

  return json({
    indicators,
    indicatorActivities,
  })
}

export default function DashboardEmployeesIndexRoute() {
  const { indicatorActivities } = useLoaderData<typeof loader>()

  const outlet = useOutlet()

  return (
    <>
      <Container className="w-full pb-10">
        {/* {canManageEmployeeGroup && (
          <Tabs items={employeeTabPaths} className="mb-8 mt-10" />
        )} */}

        {indicatorActivities?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Actividad de indicadores"
              actions={
                <>
                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    size="SM"
                    href="/activity/upload"
                    variant={ButtonColorVariants.SECONDARY}
                    icon={ButtonIconVariants.UPLOAD}
                  >
                    Cargar
                  </Button>

                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    href="/activity/create"
                    size="SM"
                    icon={ButtonIconVariants.CREATE}
                  >
                    Crear actividad
                  </Button>
                </>
              }
            />

            <DataTable
              columns={columns}
              data={indicatorActivities}
              // pagination={pagination}
              // tableActions={(table) => (
              //   <TableActions table={table} indicators={indicators} />
              // )}
            />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ninguna actividad registrada"
            description="¿Qué esperas para añadir la primera?"
            actions={
              <Button
                href="/activity/create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear actividad
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}
