import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { Table, type TableRowProps } from '~/components/Lists/Table'

import { getTeamsByCompanyId } from '~/services/team/team.server'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireAdminUserId } from '~/session.server'
import { badRequest } from 'remix-utils'
import { Container } from '~/components/Layout/Container'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Equipos | HoyTrabajas Beneficios',
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

  // const company = await getCompanyById(companyId)

  // if (!company) {
  //   throw notFound({
  //     message: 'No se ha encontrado información sobre la compañía',
  //     redirect: '/admin/dashboard/companies',
  //   })
  // }
  const teams = await getTeamsByCompanyId(companyId)

  return json({ teams, companyId })
}

export default function TeamIndexRoute() {
  const { teams, companyId } = useLoaderData<typeof loader>()

  const headings = ['Nombre del equipo', 'Miembros', 'Líder']

  const rows: TableRowProps[] = teams.map(({ id, name, members, _count }) => ({
    rowId: id,
    href: `${id}`,
    items: [
      <span className="whitespace-pre-wrap" key={`${id}_name`}>
        {name}
      </span>,
      // employees?.length > 0 ? (
      //   <span className="whitespace-pre-wrap" key={`${id}_employee`}>
      //     {employees?.length}
      //   </span>
      // ) : (
      //   '-'
      // ),
      _count.members > 0 ? (
        <span className="whitespace-pre-wrap" key={`${id}_employee`}>
          {_count.members}
        </span>
      ) : (
        '-'
      ),
      // employees ? (
      //   <span className="whitespace-pre-wrap" key={`${id}_employee`}>
      //     {employees}
      //   </span>
      // ) : (
      //   '-'
      // ),
    ],
  }))

  return (
    <>
      <Container className="w-full pb-10">
        {teams?.length > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Equipos"
              actions={
                <Button
                  href={`/admin/dashboard/companies/${companyId}/teams/create`}
                  size="SM"
                  icon={ButtonIconVariants.CREATE}
                >
                  Crear equipo
                </Button>
              }
            />
            <Table headings={headings} rows={rows} />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún equipo"
            description="¿Qué esperas para añadir un equipo?"
            actions={
              <Button
                href={`/admin/dashboard/companies/${companyId}/teams/create`}
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear equipo
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
