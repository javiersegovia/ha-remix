import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/server-runtime'
import type { PayrollAdvanceStatus } from '@prisma/client'

import { PayrollAdvanceHistoryActor } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound } from 'remix-utils'
import { PayrollAdvanceDetails } from '~/containers/dashboard/PayrollAdvanceDetails'
import {
  getPayrollAdvanceById,
  updatePayrollAdvanceStatus,
} from '~/services/payroll-advance/payroll-advance.server'
import { requireAdminUser, requireAdminUserId } from '~/session.server'

type LoaderData = {
  payrollAdvance: NonNullable<Awaited<ReturnType<typeof getPayrollAdvanceById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    return badRequest({
      message: 'No se ha encontrado el ID del adelanto de nómina',
    })
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance) {
    return notFound({
      message: 'No se ha encontrado información sobre el adelanto de nómina',
    })
  }

  return json<LoaderData>({
    payrollAdvance,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  const adminUser = await requireAdminUser(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PayrollAdvanceStatus

  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de nómina',
    })
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance || !payrollAdvance?.employee?.user) {
    throw badRequest({
      message: 'No se han encontrado todos los datos del adelanto de nómina',
    })
  }

  await updatePayrollAdvanceStatus({
    employee: payrollAdvance.employee,
    payrollAdvance,
    actor: PayrollAdvanceHistoryActor.ADMIN,
    adminUser,
    toStatus: subaction,
    user: payrollAdvance.employee.user,
  })

  // We don't need to return anything here. By returning null,
  // Remix will automatically update all the route loaders.
  return json(null)
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyAdelantas',
    }
  }

  const { payrollAdvance } = data as LoaderData

  const { employee } = payrollAdvance
  const { user } = employee || {}
  const { firstName, lastName } = user || {}

  if (firstName || lastName) {
    return {
      title: `Solicitud de ${`${firstName} ${lastName}`.trim()} | HoyAdelantas`,
    }
  }

  return {
    title: `Solicitud de ${payrollAdvance.totalAmount} | HoyAdelantas`,
  }
}

export default function AdminPayrollAdvanceDetailsRoute() {
  const { payrollAdvance } = useLoaderData<LoaderData>()

  return (
    <PayrollAdvanceDetails
      isAdmin
      payrollAdvance={payrollAdvance}
      company={payrollAdvance.company}
      employee={payrollAdvance.employee}
      user={payrollAdvance.employee?.user}
    />
  )
}
