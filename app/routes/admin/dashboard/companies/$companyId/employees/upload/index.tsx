import { useLoaderData, useTransition } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { badRequest } from 'remix-utils'
import { Button } from '~/components/Button'
import { requireAdminUserId } from '~/session.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUserId(request)
  const { companyId } = params

  if (!companyId) {
    throw badRequest({ message: 'No se ha encontrado el ID de la compañía' })
  }

  return json({ companyId })
}

export default function AdminDashboardEmployeesUploadRoute() {
  const { companyId } = useLoaderData()
  const transition = useTransition()
  const inProcess =
    transition.state === 'submitting' || transition.state === 'loading'

  return (
    <section>
      <form
        method="post"
        encType="multipart/form-data"
        action={`/admin/dashboard/companies/${companyId}/employees/upload/csv`}
        noValidate
      >
        <input
          type="file"
          name="csvFile"
          accept=".csv"
          className="my-3 mx-auto block text-center"
          disabled={inProcess}
        />
        <Button
          type="submit"
          className="mx-auto mt-10 max-w-xs"
          disabled={inProcess}
        >
          Cargar
        </Button>
      </form>
    </section>
  )
}
