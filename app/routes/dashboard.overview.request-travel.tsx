import type { MetaFunction } from '@remix-run/server-runtime'

import { Form, useNavigation } from '@remix-run/react'
import { Button, ButtonColorVariants } from '~/components/Button'
import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'

export const meta: MetaFunction = () => {
  return {
    title: 'Confirmar solicitud de viaje | HoyAdelantas',
  }
}

export default function RequestPremiumAdvanceModalRoute() {
  const { state } = useNavigation()

  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg">
        <Box className="space-y-5 p-5 text-center">
          <>
            <Title>Confirmar solicitud</Title>
            <p>
              Si estás interesado en conocer más sobre el servicio de viajes,
              por favor haz click en el siguiente botón y comunícate con
              nosotros vía WhatsApp.
            </p>
            <Form method="post" className="flex flex-col gap-4">
              <a href="https://bit.ly/arma_tu_viaje" rel="noopener noreferrer">
                <Button>Ir a WhatsApp</Button>
              </a>

              <Button
                variant={ButtonColorVariants.SECONDARY}
                href="/dashboard/overview"
                disabled={state !== 'idle'}
              >
                Cancelar
              </Button>
            </Form>
          </>
        </Box>
      </div>
    </Modal>
  )
}
