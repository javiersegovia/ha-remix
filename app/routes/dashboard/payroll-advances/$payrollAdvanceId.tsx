import { json } from '@remix-run/server-runtime'
import { badRequest, notFound, unauthorized } from 'remix-utils'
import {
  getPayrollAdvanceById,
  updatePayrollAdvanceStatus,
} from '~/services/payroll-advance/payroll-advance.server'
import { requireEmployee } from '~/session.server'

import type {
  LoaderFunction,
  MetaFunction,
  ActionFunction,
} from '@remix-run/server-runtime'
import { useLoaderData } from '@remix-run/react'
import { PayrollAdvanceDetails } from '~/containers/dashboard/PayrollAdvanceDetails'
import {
  PayrollAdvanceStatus,
  PayrollAdvanceHistoryActor,
} from '@prisma/client'

type LoaderData = {
  payrollAdvance: NonNullable<Awaited<ReturnType<typeof getPayrollAdvanceById>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const employee = await requireEmployee(request)
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

  if (employee.id !== payrollAdvance.employeeId) {
    return unauthorized({ message: 'No estás autorizado' })
  }

  return json<LoaderData>({
    payrollAdvance,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
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
  const { payrollAdvance } = useLoaderData<LoaderData>()

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

      <PayrollAdvanceDetails
        payrollAdvance={payrollAdvance}
        company={payrollAdvance.company}
        employee={payrollAdvance.employee}
        user={payrollAdvance.employee?.user}
      />
    </>
  )
}
