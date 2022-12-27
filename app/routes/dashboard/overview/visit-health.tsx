import { Button } from '~/components/Button'
import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'

export default function VisitGroceriesModalRoute() {
  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg text-center">
        <Box className="space-y-5 p-5">
          <>
            <Title>¡Tu salud nos importa!</Title>

            <p>
              Cuida de ti y tu familia con Sekure, tu nuevo apoyo en consultas
              digitales.
            </p>

            <p className="text-sm italic">
              *Sekure es un aliado de HoyTrabajas con el que atiendes tu salud.
            </p>

            <div className="flex flex-col gap-4">
              <Button
                href="https://sekure.medismart.live/account/loginpaciente?ReturnUrl=%2F"
                external
              >
                Ir a Sekure
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
