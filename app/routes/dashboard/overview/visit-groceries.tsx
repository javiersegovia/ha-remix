import { Button, ButtonColorVariants } from '~/components/Button'
import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'

export default function VisitGroceriesModalRoute() {
  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg text-center">
        <Box className="space-y-5 p-5">
          <>
            <Title>¡Haz tu mercado en TocToc!</Title>
            <p>Del campo a tu mesa, productos frescos y al mejor precio.</p>

            <p className="text-sm italic">
              *TocToc es un aliado de HoyTrabajas con el que tienes grandes
              beneficios.
            </p>

            <div className="flex flex-col gap-4">
              <Button href="https://bit.ly/beneficiomercadohoyad" external>
                Ir a TocToc
              </Button>

              <Button
                variant={ButtonColorVariants.SECONDARY}
                href="/dashboard/overview"
              >
                Cancelar
              </Button>
            </div>
          </>
        </Box>
      </div>
    </Modal>
  )
}
