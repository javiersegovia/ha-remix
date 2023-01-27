import type { LoaderFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from 'remix-utils'

import { requireAdminUserId } from '~/session.server'
import { Modal } from '~/components/Dialog/Modal'
import { Title } from '~/components/Typography/Title'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Button } from '~/components/Button'
import { Label } from '~/components/FormFields/Label'

type LoaderData = {
  benefitId: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest(null, {
      statusText: 'No se ha encontrado el ID del beneficio',
    })
  }

  return json<LoaderData>({
    benefitId,
  })
}

export default function BenefitConsumptionCreateRoute() {
  const { benefitId } = useLoaderData<LoaderData>()
  const onCloseRedirectTo = `/admin/dashboard/benefits/${benefitId}/consumptions`

  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
          <Title>Cargar consumos</Title>

          <form
            method="post"
            encType="multipart/form-data"
            action={`/admin/dashboard/benefits/${benefitId}/consumptions/csv`}
            noValidate
          >
            <Label description="Archivo CSV" htmlFor="csvFile">
              <input
                id="csvFile"
                type="file"
                name="csvFile"
                accept=".csv"
                className="my-3 block"
                // disabled={inProcess}
              />
            </Label>
            <Button
              type="submit"
              className="mt-10"
              // disabled={inProcess}
            >
              Cargar
            </Button>
          </form>
        </RightPanel>
      </Modal>
    </>
  )
}
