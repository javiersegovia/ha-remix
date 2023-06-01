import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getMemberships } from '~/services/membership/membership.server'
import { requireAdminUserId } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { constants } from '~/config/constants'
import { prisma } from '~/db.server'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Membresías | HoyAdelantas',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const membershipCount = await prisma.membership.count()
  const { itemsPerPage } = constants
  return json({
    memberships: await getMemberships({
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage || 0,
    }),
    pagination: {
      currentPage,
      totalPages: Math.ceil(membershipCount / itemsPerPage),
    },
  })
}

export default function MembershipsIndexRoute() {
  const { memberships, pagination } = useLoaderData<typeof loader>()

  const headings = ['Nombre', 'Beneficios asociados', 'Colaboradores asociados']

  const rows: TableRowProps[] = memberships?.map(({ id, name, _count }) => ({
    rowId: id,
    href: `${id}`,
    items: [
      <>
        <span
          className="hover:text-cyan-600whitespace-pre-wrap text-sm font-medium text-gray-900 underline"
          key={`${id}_name`}
        >
          {name}
        </span>
      </>,
      _count.benefits ? (
        <div>{_count.benefits}</div>
      ) : (
        <p className=" text-gray-400">-</p>
      ),
      _count.employees ? (
        <div>{_count.employees}</div>
      ) : (
        <p className=" text-gray-400">-</p>
      ),
    ],
  }))

  return (
    <>
      <Container>
        <>
          <TitleWithActions
            title="Membresías"
            className="mb-10"
            actions={
              <Button
                href="/admin/dashboard/memberships/create"
                className="flex items-center px-4"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear membresía
              </Button>
            }
          />

          {memberships?.length > 0 ? (
            <Table headings={headings} rows={rows} pagination={pagination} />
          ) : (
            <p>No se han encontrado membresías</p>
          )}
        </>
      </Container>

      <Outlet />
    </>
  )
}
