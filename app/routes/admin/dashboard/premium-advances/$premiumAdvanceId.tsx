import type { PremiumAdvanceStatus } from '@prisma/client'
import { PremiumAdvanceHistoryActor } from '@prisma/client'
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound } from 'remix-utils'
import { requireAdminUser, requireAdminUserId } from '~/session.server'
import { PremiumAdvanceDetails } from '~/components/PremiumAdvance/PremiumAdvanceDetails'
import {
  getPremiumAdvanceById,
  updatePremiumAdvanceStatus,
} from '~/services/premium-advance/premium-advance.server'

type LoaderData = {
  premiumAdvance: NonNullable<Awaited<ReturnType<typeof getPremiumAdvanceById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    return badRequest({
      message: 'No se ha encontrado el ID del adelanto de nómina',
    })
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance) {
    return notFound({
      message: 'No se ha encontrado información sobre el adelanto de nómina',
    })
  }

  return json<LoaderData>({
    premiumAdvance,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const adminUser = await requireAdminUser(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PremiumAdvanceStatus

  const { premiumAdvanceId } = params

  if (!premiumAdvanceId) {
    throw badRequest('No se ha encontrado el ID del adelanto de nómina')
  }

  const premiumAdvance = await getPremiumAdvanceById(premiumAdvanceId)

  if (!premiumAdvance || !premiumAdvance?.employee?.user) {
    throw badRequest({
      message: 'No se han encontrado todos los datos del adelanto de nómina',
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

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyAdelantas',
    }
  }

  const { premiumAdvance } = data as LoaderData

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
  const { premiumAdvance } = useLoaderData<LoaderData>()

  return (
    <PremiumAdvanceDetails
      isAdmin
      premiumAdvance={premiumAdvance}
      company={premiumAdvance.company}
      employee={premiumAdvance.employee}
      user={premiumAdvance.employee?.user}
    />
  )
}
