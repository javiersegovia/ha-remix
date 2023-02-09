import type { LoaderArgs } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from 'remix-utils'

import { Table } from '~/components/Lists/Table'
import { Button, ButtonIconVariants } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { getBenefitSubproductsByBenefitId } from '~/services/benefit-subproduct/benefit-subproduct.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const subproducts = await getBenefitSubproductsByBenefitId(+benefitId)

  return json({
    subproducts,
  })
}

const BenefitSubproductIndexRoute = () => {
  const { subproducts } = useLoaderData<typeof loader>()

  const rows: TableRowProps[] = subproducts.map((subproduct) => ({
    href: subproduct.id.toString(),
    items: [subproduct.name, subproduct.discount || '-', subproduct.id],
    rowId: `${subproduct.id}_${subproduct.name}}`,
  }))

  return (
    <>
      <TitleWithActions
        title="Subproductos"
        actions={
          <Button
            key="create-subproduct"
            href="create"
            size="SM"
            className="flex items-center px-4"
            icon={ButtonIconVariants.CREATE}
          >
            Crear subproducto
          </Button>
        }
        className="my-10"
      />

      {rows?.length > 0 ? (
        <Table headings={['Nombre', 'Descuento', 'ID']} rows={rows} />
      ) : (
        <p>No se han encontrado subproductos.</p>
      )}

      <Outlet />
    </>
  )
}

export default BenefitSubproductIndexRoute
