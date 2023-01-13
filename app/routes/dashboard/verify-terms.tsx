import type { LoaderFunction } from '@remix-run/server-runtime'

import { useLoaderData } from '@remix-run/react'
import { redirect } from '@remix-run/server-runtime'
import React from 'react'
import { Button } from '~/components/Button'
import { Box } from '~/components/Layout/Box'
import {
  getZapsignDocumentByEmployeeId,
  hasSignedTerms,
} from '~/services/signature/signature.server'
import { requireEmployee } from '~/session.server'
import { serverError } from 'remix-utils'
import { json } from '@remix-run/node'

type VerifyTermsLoaderData = {
  signerToken: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const employee = await requireEmployee(request)
  const employeeHasSignedTerms = await hasSignedTerms(employee.id)

  if (employeeHasSignedTerms) {
    return redirect('/dashboard/overview')
  }

  const zapsignDocument = await getZapsignDocumentByEmployeeId(employee.id)

  if (!zapsignDocument) {
    throw serverError('Ha ocurrido un error inesperado al buscar el documento')
  }

  return json<VerifyTermsLoaderData>({
    signerToken: zapsignDocument.signerToken,
  })
}

const DashboardVerifyTermsRoute = () => {
  const { signerToken } = useLoaderData<VerifyTermsLoaderData>()
  return (
    <>
      <div className="mx-auto mt-10 w-full max-w-screen-lg px-2 sm:px-8">
        <section className="flex flex-col gap-6 xl:flex-row">
          <div className="mx-auto w-full max-w-lg">
            <Box className="mt-8 block p-6">
              <h1 className="mb-4 text-center text-3xl font-semibold text-steelBlue-600">
                Términos y Condiciones
              </h1>

              <div className="mx-auto mb-6 max-w-xl">
                <p className="text-center text-sm">
                  Para obtener acceso al beneficio de adelantos, por favor haz
                  click en el siguiente link para acceder a la firma de los
                  Términos y Condiciones.
                </p>
              </div>

              <Button
                href={`https://app.zapsign.co/verificar/${signerToken}`}
                external
                targetBlank
              >
                Verificar documento
              </Button>
            </Box>
          </div>
        </section>
      </div>
    </>
  )
}

export default DashboardVerifyTermsRoute
