import type {
  MetaFunction,
  LoaderArgs,
  ActionArgs,
} from '@remix-run/server-runtime'
import type { PayrollAdvanceStatus } from '@prisma/client'
import type { ExtractRemixResponse } from '~/utils/type-helpers'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound, unauthorized } from '~/utils/responses'
import {
  PremiumAdvanceStatus,
  PremiumAdvanceHistoryActor,
} from '@prisma/client'

import { requireEmployee } from '~/session.server'
import {
  getPremiumAdvanceById,
  updatePremiumAdvanceStatus,
} from '~/services/premium-advance/premium-advance.server'
import { PremiumAdvanceDetails } from '~/components/PremiumAdvance/PremiumAdvanceDetails'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw notFound({
      message: 'No se ha encontrado el ID del adelanto de prima',
      redirect: '/dashboard/premium-advances',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    throw notFound({
      message: 'No se ha encontrado información sobre el adelanto de prima',
      redirect: '/dashboard/premium-advances',
    })
  }

  if (employee.id !== premiumAdvance.employeeId) {
    throw unauthorized({
      message: 'No estás autorizado',
      redirect: '/dashboard/premium-advances',
    })
  }

  return json({
    premiumAdvance,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PayrollAdvanceStatus

  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de prima',
      redirect: '/dashboard/premium-advances',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de prima',
      redirect: '/dashboard/premium-advances',
    })
  }

  if (employee.id !== premiumAdvance.employeeId) {
    throw unauthorized({
      message: 'No tienes permisos para ejecutar esta acción',
      redirect: '/dashboard/premium-advances',
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

  throw badRequest({
    message:
      'Ha ocurrido un error en los datos subministrados dentro del formulario.',
    redirect: '/dashboard/premium-advances',
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Detalles de solicitud | HoyAdelantas',
  }
}

export default function PremiumAdvanceDetailsRoute() {
  const { premiumAdvance } = useLoaderData<typeof loader>()

  return (
    <>
      <PremiumAdvanceDetails
        premiumAdvance={
          premiumAdvance as unknown as ExtractRemixResponse<
            typeof loader
          >['premiumAdvance']
        }
        company={premiumAdvance.company}
        employee={premiumAdvance.employee}
        user={premiumAdvance.employee?.user}
      />
    </>
  )
}
