import type { PayrollAdvanceStatus } from '@prisma/client'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { PayrollAdvanceHistoryActor } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound } from '~/utils/responses'
import { PayrollAdvanceDetails } from '~/containers/dashboard/PayrollAdvanceDetails'
import {
  getPayrollAdvanceById,
  updatePayrollAdvanceStatus,
} from '~/services/payroll-advance/payroll-advance.server'
import { requireAdminUser, requireAdminUserId } from '~/session.server'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    throw notFound({
      message: 'No se ha encontrado el ID del adelanto de nómina',
      redirect: '/admin/dashboard/payroll-advances',
    })
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance) {
    throw notFound({
      message: 'No se ha encontrado información sobre el adelanto de nómina',
      redirect: '/admin/dashboard/payroll-advances',
    })
  }

  return json({
    payrollAdvance,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const adminUser = await requireAdminUser(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PayrollAdvanceStatus

  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    throw badRequest({
      message: 'No se ha encontrado el ID del adelanto de nómina',
      redirect: '/admin/dashboard/payroll-advances',
    })
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance || !payrollAdvance?.employee?.user) {
    throw badRequest({
      message: 'No se han encontrado todos los datos del adelanto de nómina',
      redirect: '/admin/dashboard/payroll-advances',
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
  return null
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Ha ocurrido un error | HoyAdelantas',
    }
  }

  const { payrollAdvance } = data

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
  const { payrollAdvance } = useLoaderData<typeof loader>()

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
