import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Button } from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { getCompanyBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import { requireEmployee } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'
import { Tabs } from '~/components/Tabs/Tabs'
import { requirePermissionByUserId } from '~/services/permissions/permissions.server'
import { useToastError } from '~/hooks/useToastError'
import { prisma } from '~/db.server'
import { constants } from '~/config/constants'
import { Table } from '~/components/Lists/Table'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { FaStar } from 'react-icons/fa'

export const meta: MetaFunction = () => {
  return {
    title: 'Beneficios | HoyTrabajas Beneficios',
  }
}

export const manageBenefitPaths = [
  {
    title: 'Beneficios',
    path: '/dashboard/manage/benefits',
  },
  {
    title: 'Categorías de beneficios',
    path: '/dashboard/manage/benefit-categories',
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_BENEFIT
  )

  const benefitsCount = await prisma.companyBenefit.count({
    where: {
      companyId: employee.companyId,
    },
  })
  const { itemsPerPage } = constants

  return json({
    benefits: await getCompanyBenefitsByCompanyId(employee.companyId, {
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(benefitsCount / itemsPerPage),
    },
  })
}

export default function BenefitIndexRoute() {
  const { benefits, pagination } = useLoaderData<typeof loader>()

  const headings = ['Nombre', '']

  const rows: TableRowProps[] = benefits?.map(
    ({ id, name, isHighlighted }) => ({
      rowId: id,
      href: `${id}/details`,
      items: [
        <>
          <span className="whitespace-pre-wrap" key={`${id}_name`}>
            {`${name}`}
          </span>
        </>,
        isHighlighted ? (
          <p className="inline-flex items-center gap-2 rounded-md bg-indigo-200 px-2 py-1 text-sm font-semibold leading-5 text-indigo-600">
            <FaStar className="mb-[2px] text-xs" />
            <span>Destacado</span>
          </p>
        ) : (
          <></>
        ),
      ],
    })
  )

  return (
    <>
      <Container className="w-full pb-10">
        <Tabs items={manageBenefitPaths} className="mb-8 mt-10" />

        {benefits?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Beneficios"
              actions={
                <Button
                  href="/dashboard/manage/benefits/create"
                  size="SM"
                  icon={ButtonIconVariants.CREATE}
                >
                  Crear beneficio
                </Button>
              }
            />
            <Table headings={headings} rows={rows} pagination={pagination} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún beneficio"
            description="¿Qué esperas para añadir un beneficio?"
            actions={
              <Button
                href="/dashboard/manage/benefits/create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear beneficio
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>
      <Outlet />
    </>
  )
}

export const CatchBoundary = () => {
  useToastError()
  return null
}
