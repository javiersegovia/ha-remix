import React from 'react'
import { Button } from '~/components/Button'
import Modal from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'

export default function VisitGroceriesModalRoute() {
  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg">
        <Box className="space-y-5 p-5">
          <>
            <Title>¡Disfruta lo mejor del campo colombiano aquí!</Title>
            <p>
              A partir de este momento vas a disfrutar de la experiencia de
              nuestro aliado TocToc.
            </p>
            <p>No olvides activar tu cuenta e iniciar sesión.</p>

            <div className="flex flex-col gap-4">
              <Button href="https://bit.ly/beneficiomercadohoyad" external>
                Ir a la tienda de TocToc
              </Button>

              <Button variant="LIGHT" href="/dashboard/overview">
                Cancelar
              </Button>
            </div>
          </>
        </Box>
      </div>
    </Modal>
  )
}
