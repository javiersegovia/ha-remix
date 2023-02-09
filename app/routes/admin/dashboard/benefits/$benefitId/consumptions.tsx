import type { LoaderArgs } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from 'remix-utils'

import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { requireAdminUserId } from '~/session.server'

import { getBenefitConsumptionsByBenefitId } from '~/services/benefit-consumption/benefit-consumption.server'
import { Table } from '~/components/Lists/Table'
import { formatDate } from '~/utils/formatDate'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const consumptions = await getBenefitConsumptionsByBenefitId(
    Number(benefitId)
  )

  return json({
    consumptions,
  })
}

export default function BenefitConsumptionIndexRoute() {
  const { consumptions } = useLoaderData<typeof loader>()

  const rows: TableRowProps[] = consumptions.map((consumption) => ({
    rowId: consumption.id,
    items: [
      consumption.employee.user.email,
      consumption.benefitSubproduct?.name || '-',
      formatDate(Date.parse(consumption.consumedAt)),
      consumption.value,
    ],
  }))

  return (
    <>
      <TitleWithActions
        title="Consumos"
        className="my-10"
        actions={
          <Button
            key="create-consumption"
            href="create"
            icon={ButtonIconVariants.UPLOAD}
            size="SM"
          >
            Subir consumos
          </Button>
        }
      />

      {consumptions?.length > 0 ? (
        <Table
          headings={[
            'Correo del Colaborador',
            'Subproducto',
            'Fecha de Consumo',
            'Valor del Consumo',
          ]}
          rows={rows}
        />
      ) : (
        <p>No se han registrado consumos.</p>
      )}

      <Outlet />
    </>
  )
}
