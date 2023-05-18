import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'

import { Container } from '~/components/Layout/Container'
import { requireAdminUserId } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { ButtonIconVariants } from '~/components/Button'
import { constants } from '~/config/constants'
import { prisma } from '~/db.server'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { FaStar } from 'react-icons/fa'

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
  const benefitsCount = await prisma.benefit.count()
  const cBenefitCount = await prisma.companyBenefit.count()
  const dataCount = benefitsCount - cBenefitCount
  const { itemsPerPage } = constants

  const benefits = await prisma.benefit.findMany({
    where: {
      companyBenefit: null,
    },
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage || 0,
    select: {
      id: true,
      name: true,
      benefitHighlight: {
        select: { isActive: true },
      },
    },
  })
  return json({
    benefits,
    pagination: {
      currentPage,
      totalPages: Math.ceil(dataCount / itemsPerPage),
    },
  })
}

export default function BenefitIndexRoute() {
  const { benefits, pagination } = useLoaderData<typeof loader>()

  const headings = ['Nombre', '']

  const rows: TableRowProps[] = benefits?.map(
    ({ id, name, benefitHighlight }) => ({
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
        benefitHighlight?.isActive ? (
          <div className="text-right">
            <p className="flex-end inline-flex items-center gap-2 rounded-md bg-indigo-200 px-2 py-1 text-right text-sm font-semibold leading-5 text-indigo-600">
              <FaStar className="mb-[2px] text-xs" />
              <span className="text-right">Destacado</span>
            </p>
          </div>
        ) : (
          <p className="text-right text-gray-400">-</p>
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
// export default function BenefitIndexRoute() {
//   const { benefits } = useLoaderData<typeof loader>()

//   return (
//     <>
//       <Container>
//         <>
//           <TitleWithActions
//             title="Beneficios"
//             className="mb-10"
//             actions={
//               <Button
//                 href="/admin/dashboard/benefits/create"
//                 className="flex items-center px-4"
//                 size="SM"
//                 icon={ButtonIconVariants.CREATE}
//               >
//                 Crear beneficio
//               </Button>
//             }
//           />

//           {benefits?.length > 0 ? (
//             <BenefitList benefits={benefits} />
//           ) : (
//             <p>No se han encontrado beneficios</p>
//           )}
//         </>
//       </Container>
//     </>
//   )
// }
