import type {
  MetaFunction,
  LoaderArgs,
  ActionArgs,
} from '@remix-run/server-runtime'

import {
  PayrollAdvanceStatus,
  PayrollAdvanceHistoryActor,
} from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { badRequest, notFound, unauthorized } from 'remix-utils'
import {
  getPayrollAdvanceById,
  updatePayrollAdvanceStatus,
} from '~/services/payroll-advance/payroll-advance.server'
import { requireEmployee } from '~/session.server'

import { PayrollAdvanceDetails } from '~/containers/dashboard/PayrollAdvanceDetails'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    throw notFound({
      message: 'No se ha encontrado el ID del adelanto de nómina',
    })
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance) {
    throw notFound({
      message: 'No se ha encontrado información sobre el adelanto de nómina',
    })
  }

  if (employee.id !== payrollAdvance.employeeId) {
    throw unauthorized({ message: 'No estás autorizado' })
  }

  return json({
    payrollAdvance,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  const employee = await requireEmployee(request)
  const formData = await request.formData()
  const subaction = formData.get('subaction') as PayrollAdvanceStatus

  const { payrollAdvanceId } = params

  if (!payrollAdvanceId) {
    throw badRequest('No se ha encontrado el ID del adelanto de nómina')
  }

  const payrollAdvance = await getPayrollAdvanceById(
    parseFloat(payrollAdvanceId)
  )

  if (!payrollAdvance) {
    throw badRequest('No se ha encontrado el ID del adelanto de nómina')
  }

  if (employee.id !== payrollAdvance.employeeId) {
    throw unauthorized({
      message: 'No tienes permisos para ejecutar esta acción',
    })
  }

  if (subaction === PayrollAdvanceStatus.CANCELLED) {
    await updatePayrollAdvanceStatus({
      employee,
      payrollAdvance,
      actor: PayrollAdvanceHistoryActor.EMPLOYEE,
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

export default function PayrollAdvanceDetailsRoute() {
  const { payrollAdvance } = useLoaderData<typeof loader>()

  return (
    <>
      <PayrollAdvanceDetails
        payrollAdvance={payrollAdvance}
        company={payrollAdvance.company}
        employee={payrollAdvance.employee}
        user={payrollAdvance.employee?.user}
      />
    </>
  )
}
