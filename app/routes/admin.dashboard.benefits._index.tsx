import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button, ButtonIconVariants } from '~/components/Button'

import { Container } from '~/components/Layout/Container'
import { requireAdminUserId } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { constants } from '~/config/constants'
import { prisma } from '~/db.server'
import { Table } from '~/components/Lists/Table'
import { FaStar } from 'react-icons/fa'
import { getBenefits } from '~/services/benefit/benefit.server'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Beneficios | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')
  const benefitsCount = await prisma.benefit.count({
    where: {
      companyBenefit: null,
    },
  })
  const { itemsPerPage } = constants

  return json({
    benefits: await getBenefits({
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
          <span
            className="whitespace-pre-wrap hover:underline"
            key={`${id}_name`}
          >
            {name}
          </span>
        </>,
        isHighlighted ? (
          <div className="text-right">
            <p className="flex-end inline-flex items-center gap-2 rounded-md bg-indigo-200 px-2 py-1 text-right text-sm font-semibold leading-5 text-indigo-600">
              <FaStar className="mb-[2px] text-xs" />
              <span className="text-right">Destacado</span>
            </p>
          </div>
        ) : (
          <></>
        ),
      ],
    })
  )

  return (
    <>
      <Container className="w-full pb-10">
        <TitleWithActions
          className="mb-10"
          title="Beneficios"
          actions={
            <Button
              href="/admin/dashboard/benefits/create"
              size="SM"
              icon={ButtonIconVariants.CREATE}
            >
              Crear beneficio
            </Button>
          }
        />
        {benefits?.length > 0 ? (
          <Table headings={headings} rows={rows} pagination={pagination} />
        ) : (
          <p>No se han encontrado beneficios</p>
        )}
      </Container>
    </>
  )
}
