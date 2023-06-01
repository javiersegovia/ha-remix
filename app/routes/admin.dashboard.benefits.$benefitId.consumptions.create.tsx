import type { LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData, useTransition } from '@remix-run/react'
import { json } from '@remix-run/node'
import { badRequest } from '~/utils/responses'

import { requireAdminUserId } from '~/session.server'
import { Modal } from '~/components/Dialog/Modal'
import { Title } from '~/components/Typography/Title'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Button } from '~/components/Button'
import { Label } from '~/components/FormFields/Label'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del beneficio',
      redirect: '/admin/dashboard/benefits',
    })
  }

  return json({
    benefitId,
  })
}

export default function BenefitConsumptionCreateRoute() {
  const { benefitId } = useLoaderData<typeof loader>()
  const onCloseRedirectTo = `/admin/dashboard/benefits/${benefitId}/consumptions`
  const transition = useTransition()
  const isLoading = transition.state !== 'idle'

  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
          <Title>Subir consumos</Title>

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
                disabled={isLoading}
              />
            </Label>
            <Button
              type="submit"
              className="mt-10"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Guardar
            </Button>
          </form>
        </RightPanel>
      </Modal>
    </>
  )
}
