import { json } from '@remix-run/server-runtime'
import { badRequest, notFound, unauthorized } from 'remix-utils'

import { requireEmployee } from '~/session.server'

import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import type { PayrollAdvanceStatus } from '@prisma/client'
import { PremiumAdvanceHistoryActor } from '@prisma/client'
import { PremiumAdvanceStatus } from '@prisma/client'
import {
  getPremiumAdvanceById,
  updatePremiumAdvanceStatus,
} from '~/services/premium-advance/premium-advance.server'
import { PremiumAdvanceDetails } from '~/components/PremiumAdvance/PremiumAdvanceDetails'

type LoaderData = {
  premiumAdvance: NonNullable<Awaited<ReturnType<typeof getPremiumAdvanceById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const employee = await requireEmployee(request)
  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    return badRequest({
      message: 'No se ha encontrado el ID del adelanto de prima',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    return notFound({
      message: 'No se ha encontrado información sobre el adelanto de prima',
    })
  }

  if (employee.id !== premiumAdvance.employeeId) {
    return unauthorized({ message: 'No estás autorizado' })
  }

  return json<LoaderData>({
    premiumAdvance,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const employee = await requireEmployee(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PayrollAdvanceStatus

  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw badRequest('No se ha encontrado el ID del adelanto de prima')
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    throw badRequest('No se ha encontrado el ID del adelanto de prima')
  }

  if (employee.id !== premiumAdvance.employeeId) {
    throw unauthorized({
      message: 'No tienes permisos para ejecutar esta acción',
    })
  }

  if (subaction === PremiumAdvanceStatus.CANCELLED) {
    await updatePremiumAdvanceStatus({
      employee,
      premiumAdvance,
      actor: PremiumAdvanceHistoryActor.EMPLOYEE,
      toStatus: subaction,
      user: employee.user,
    })

    // We don't need to return anything here. By returning null,
    // Remix will automatically update all the route loaders.
    return null
  }

  throw badRequest(
    'Ha ocurrido un error en los datos subministrados dentro del formulario.'
  )
}

export const meta: MetaFunction = () => {
  return {
    title: 'Detalles de solicitud | HoyAdelantas',
  }
}

export default function PremiumAdvanceDetailsRoute() {
  const { premiumAdvance } = useLoaderData<LoaderData>()

  // todo: premiumAdvance details

  return (
    <>
      {typeof document !== 'undefined' && (
        <script
          async
          id="hotjar"
          dangerouslySetInnerHTML={{
            __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:3148054,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
          }}
        />
      )}

      <PremiumAdvanceDetails
        premiumAdvance={premiumAdvance}
        company={premiumAdvance.company}
        employee={premiumAdvance.employee}
        user={premiumAdvance.employee?.user}
      />
    </>
  )
}
