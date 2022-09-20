import { Form, useActionData, useTransition } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { Button } from '~/components/Button'
import Modal from '~/components/Dialog/Modal'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { sendPremiumAdvanceNotificationToAdmin } from '~/services/email/email.server'
import { requireEmployee } from '~/session.server'

import type { ActionArgs, MetaFunction } from '@remix-run/server-runtime'

export const meta: MetaFunction = () => {
  return {
    title: 'Confirmar solicitud de adelanto de prima | HoyAdelantas',
  }
}

export async function action({ request }: ActionArgs) {
  const employee = await requireEmployee(request)

  try {
    await sendPremiumAdvanceNotificationToAdmin({
      employeeFullName: `${employee.user.firstName} ${employee.user.lastName}`,
      companyId: employee.companyId,
      employeeId: employee.id,
    })
  } catch (e) {
    throw badRequest({ message: 'Ha ocurrido un error' })
  }

  return json<boolean>(true)
}

export default function RequestPremiumAdvanceModalRoute() {
  const actionData = useActionData<boolean>()
  const transition = useTransition()

  return (
    <Modal onCloseRedirectTo="/dashboard/overview">
      <div className="m-auto w-full max-w-lg">
        <Box className="space-y-5 p-5">
          {!actionData ? (
            <>
              <Title>Confirmar solicitud</Title>
              <p>
                Si estás interesado en solicitar un adelanto de prima, por favor
                haz click en el siguiente botón y nos comunicaremos contigo.
              </p>
              <Form method="post">
                <Button
                  type="submit"
                  disabled={
                    transition.state === 'submitting' ||
                    transition.state === 'loading'
                  }
                >
                  Solicitar adelanto de prima
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Title>Solicitud realizada</Title>

              <p>
                ¡Gracias por realizar tu solicitud!
                <br />
                Nos comunicaremos contigo lo más pronto posible vía WhatsApp
              </p>

              <Button className="mt-5" href="/dashboard/overview">
                Cerrar
              </Button>
            </>
          )}
        </Box>
      </div>
    </Modal>
  )
}
