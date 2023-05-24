import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

import { Link } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { requireCompany } from '~/services/company/company.server'
import { getEmployeesByCompanyId } from '~/services/employee/employee.server'
import { requireAdminUserId } from '~/session.server'

import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { constants } from '~/config/constants'
import { prisma } from '~/db.server'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { formatMoney } from '~/utils/formatMoney'
import { CurrencySymbol } from '~/components/FormFields/CurrencyInput'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
  })

  const employeeCount = await prisma.employee.count({
    where: {
      companyId: company.id,
    },
  })
  const { itemsPerPage } = constants
  // {
  //   take: itemsPerPage,
  //   skip: (currentPage - 1) * itemsPerPage || 0,
  // }
  return json({
    employees: await getEmployeesByCompanyId(company.id),
    // pagination: {
    //   currentPage,
    //   totalPages: Math.ceil(employeeCount / itemsPerPage),
    // },
    companyName: company.name,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada | HoyTrabajas Beneficios',
    }
  }

  const { companyName } = data

  return {
    title: `[Admin] Colaboradores de ${companyName} | HoyTrabajas Beneficios`,
  }
}

export default function AdminDashboardCompanyEmployees() {
  const { employees } = useLoaderData<typeof loader>()

  const headings = [
    'Nombre completo',
    'Cupo aprobado',
    'Cupo disponible',
    'Membresía',
    'Estado',
  ]

  const rows: TableRowProps[] = employees?.map(
    ({
      id,
      user,
      advanceAvailableAmount,
      advanceMaxAmount,
      membership,
      status,
    }) => ({
      rowId: id,
      href: `${id}`,
      items: [
        <>
          <span
            className="whitespace-pre-wrap hover:underline"
            key={`${id}_name`}
          >
            {`${user.firstName} ${user.lastName}`}
          </span>
          <div className="text-sm text-gray-500">{user.email}</div>
        </>,

        advanceMaxAmount ? (
          <span className="whitespace-pre-wrap" key={`${id}_advanceMaxAmount`}>
            {formatMoney(advanceMaxAmount, CurrencySymbol.COP)}
          </span>
        ) : (
          '-'
        ),
        advanceAvailableAmount ? (
          <span
            className="whitespace-pre-wrap"
            key={`${id}_advanceAvailableAmount`}
          >
            {formatMoney(advanceAvailableAmount, CurrencySymbol.COP)}
          </span>
        ) : (
          '-'
        ),
        membership ? (
          <span className="whitespace-pre-wrap" key={`${id}_membership`}>
            {membership.name}
          </span>
        ) : (
          '-'
        ),
        <span className="whitespace-pre-wrap" key={`${id}_status`}>
          <EmployeeStatusPill employeeStatus={status} />
        </span>,
      ],
    })
  )

  return (
    <>
      <>
        <TitleWithActions
          title="Colaboradores"
          className="my-10"
          actions={
            <>
              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                href="create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Nuevo colaborador
              </Button>

              <Link to="download" reloadDocument>
                <Button
                  className="flex w-full items-center whitespace-nowrap sm:w-auto"
                  size="SM"
                  variant={ButtonColorVariants.SECONDARY}
                  icon={ButtonIconVariants.DOWNLOAD}
                >
                  Descargar colaboradores
                </Button>
              </Link>

              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                size="SM"
                variant={ButtonColorVariants.SECONDARY}
                icon={ButtonIconVariants.UPLOAD}
              >
                Cargar colaboradores
              </Button>
            </>
          }
        />

        {employees?.length > 0 ? (
          <Table headings={headings} rows={rows} />
        ) : (
          <p className="text-lg">La lista de colaboradores está vacía.</p>
        )}
      </>
    </>
  )
}
