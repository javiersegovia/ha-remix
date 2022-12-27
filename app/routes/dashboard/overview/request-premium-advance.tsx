import type { ActionArgs, MetaFunction } from '@remix-run/server-runtime'

import { redirect } from '@remix-run/node'
import { Form, useTransition } from '@remix-run/react'
import { Button } from '~/components/Button'
import { Modal } from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { requireEmployee } from '~/session.server'
import { createPremiumAdvance } from '~/services/premium-advance/premium-advance.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Confirmar solicitud de adelanto de prima | HoyAdelantas',
  }
}

export async function action({ request }: ActionArgs) {
  const employee = await requireEmployee(request)

  const premiumAdvance = await createPremiumAdvance({
    user: employee.user,
    companyId: employee.companyId,
    employeeId: employee.id,
  })

  return redirect(`/dashboard/premium-advances/${premiumAdvance.id}`)
}

export default function RequestPremiumAdvanceModalRoute() {
  const transition = useTransition()

  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg">
        <Box className="space-y-5 p-5 text-center">
          <>
            <Title>Adelanta tu prima</Title>
            <p>
              Recibe rápidamente el dinero de tu prima, sin importar el mes del
              año.
            </p>
            <Form method="post" className="flex flex-col gap-4">
              <Button type="submit" disabled={transition.state !== 'idle'}>
                Solicitar
              </Button>

              <Button
                variant="LIGHT"
                href="/dashboard/overview"
                disabled={transition.state !== 'idle'}
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
