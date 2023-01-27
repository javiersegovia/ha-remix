import type { LoaderFunction } from '@remix-run/server-runtime'
import type { TableRowProps } from '~/components/Lists/Table'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { HiPlus } from 'react-icons/hi'
import { badRequest } from 'remix-utils'

import { Table } from '~/components/Lists/Table'
import { Button } from '~/components/Button'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { getBenefitSubproductsByBenefitId } from '~/services/benefit-subproduct/benefit-subproduct.server'

type BenefitSubproductsIndexLoaderData = {
  subproducts: Awaited<ReturnType<typeof getBenefitSubproductsByBenefitId>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  const subproducts = await getBenefitSubproductsByBenefitId(+benefitId)

  return json<BenefitSubproductsIndexLoaderData>({
    subproducts,
  })
}

const BenefitSubproductIndexRoute = () => {
  const { subproducts } = useLoaderData<BenefitSubproductsIndexLoaderData>()

  const rows: TableRowProps[] = subproducts.map((subproduct) => ({
    href: subproduct.id.toString(),
    items: [subproduct.name, subproduct.discount || '-', subproduct.id],
    key: `${subproduct.id}_${subproduct.name}}`,
  }))

  return (
    <>
      <TitleWithActions
        title="Subproductos"
        actions={[
          <Button
            key="create-subproduct"
            href="create"
            className="flex items-center px-4"
          >
            <HiPlus className="mr-3" />
            Crear subproducto
          </Button>,
        ]}
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
