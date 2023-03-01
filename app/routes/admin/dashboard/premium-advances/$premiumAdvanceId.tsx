import type { PremiumAdvanceStatus } from '@prisma/client'
import type { ExtractRemixResponse } from '~/utils/type-helpers'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { PremiumAdvanceHistoryActor } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound } from '~/utils/responses'
import { requireAdminUser, requireAdminUserId } from '~/session.server'
import { PremiumAdvanceDetails } from '~/components/PremiumAdvance/PremiumAdvanceDetails'
import {
  getPremiumAdvanceById,
  updatePremiumAdvanceStatus,
} from '~/services/premium-advance/premium-advance.server'

// type LoaderData = {
//   premiumAdvance: NonNullable<Awaited<ReturnType<typeof getPremiumAdvanceById>>>
// }

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw notFound({
      message: 'No se ha encontrado el ID del adelanto de prima',
      redirect: '/admin/dashboard/premium-advances',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    throw notFound({
      message: 'No se ha encontrado información sobre el adelanto de prima',
      redirect: '/admin/dashboard/premium-advances',
    })
  }

  return json({
    premiumAdvance,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const adminUser = await requireAdminUser(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PremiumAdvanceStatus

  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de prima',
      redirect: '/admin/dashboard/premium-advances',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance || !premiumAdvance?.employee?.user) {
    throw badRequest({
      message: 'No se han encontrado todos los datos del adelanto de prima',
      redirect: '/admin/dashboard/premium-advances',
    })
  }

  await updatePremiumAdvanceStatus({
    premiumAdvance,
    employee: premiumAdvance.employee,
    actor: PremiumAdvanceHistoryActor.ADMIN,
    adminUser,
    toStatus: subaction,
    user: premiumAdvance.employee.user,
  })

  // We don't need to return anything here. By returning null,
  // Remix will automatically update all the route loaders.
  return null
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyAdelantas',
    }
  }

  const { premiumAdvance } = data

  const { employee } = premiumAdvance
  const { user } = employee || {}
  const { firstName, lastName } = user || {}

  if (firstName || lastName) {
    return {
      title: `Solicitud de ${`${firstName} ${lastName}`.trim()} | HoyAdelantas`,
    }
  }

  return {
    title: `Solicitud de adelanto | HoyAdelantas`,
  }
}

export default function AdminPremiumAdvanceDetailsRoute() {
  const { premiumAdvance } = useLoaderData<typeof loader>()

  return (
    <PremiumAdvanceDetails
      isAdmin
      premiumAdvance={
        premiumAdvance as unknown as ExtractRemixResponse<
          typeof loader
        >['premiumAdvance']
      }
      company={premiumAdvance.company}
      employee={premiumAdvance.employee}
      user={premiumAdvance.employee?.user}
    />
  )
}
