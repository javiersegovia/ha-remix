import type { LoaderFunction } from '@remix-run/node'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { badRequest } from 'remix-utils'
import { Button } from '~/components/Button'
import { Modal } from '~/components/Dialog/Modal'
import { Label } from '~/components/FormFields/Label'
import { RightPanel } from '~/components/Layout/RightPanel'
import { Title } from '~/components/Typography/Title'
import { requireAdminUserId } from '~/session.server'

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

export default function BenefitImageCreateRoute() {
  const { benefitId } = useLoaderData<LoaderData>()
  const onCloseRedirectTo = `/admin/dashboard/benefits/${benefitId}/images`

  return (
    <>
      <Modal onCloseRedirectTo={onCloseRedirectTo}>
        <RightPanel onCloseRedirectTo={onCloseRedirectTo}>
          <Title>Subir imagen de beneficio</Title>

          <form
            method="post"
            encType="multipart/form-data"
            action={`/admin/dashboard/benefits/${benefitId}/consumptions/csv`}
            noValidate
          >
            <Label description="Seleccionar imagen" htmlFor="imageInput">
              <input
                id="imageInput"
                type="file"
                name="image"
                accept=".png,.jpeg,.jpg"
                className="my-3 block"
                // disabled={inProcess}
              />
            </Label>
            <Button
              type="submit"
              className="mt-10"
              // disabled={inProcess}
            >
              Guardar
            </Button>
          </form>
        </RightPanel>
      </Modal>
    </>
  )
}
