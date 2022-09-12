import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime'
import { ZapsignDocumentStatus } from '@prisma/client'
import { json } from '@remix-run/server-runtime'
import { prisma } from '~/db.server'
import { getSignature } from '~/services/signature/signature.server'
import { logout, requireUser } from '~/session.server'
import { redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/Button'

type LoaderData = {
  token: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { employee } = await requireUser(request)

  if (!employee) {
    throw logout(request)
  }

  const url = new URL(request.url)
  let token = url.searchParams.get('token')

  if (!token) {
    const document = await prisma.zapsignDocument.findFirst({
      where: {
        AND: [
          { employeeId: employee.id },
          {
            documentStatus: ZapsignDocumentStatus.pending,
          },
        ],
      },
    })

    if (document) {
      token = document.signerToken
      const signatureData = await getSignature(token)

      if (signatureData.status === 'signed') {
        return redirect('/dashboard')
      }
    } else {
      return redirect('/dashboard')
    }
  }

  return json<LoaderData>({
    token,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Firma de documentos',
  }
}

export default function DashboardWelcomeRoute() {
  const { token } = useLoaderData<LoaderData>()

  return (
    <>
      <section className="h-full min-h-screen bg-steelBlue-900">
        <div className="container mx-auto px-0 py-20 sm:px-4">
          <div className="mx-auto text-center">
            <img
              src="/logo/logo_hoyadelantas_white_over_blue.png"
              alt="Logo HoyAdelantas"
              width="256"
              height="44.2"
            />
          </div>
          <div className="mx-auto mb-6 mt-6 w-full rounded-none bg-white px-4 pb-6 pt-5 shadow-2xl sm:w-10/12 sm:rounded-lg sm:px-6 md:w-6/12 lg:w-5/12 xl:w-3/12">
            <>
              <h1 className="mb-4 text-center text-3xl font-semibold text-steelBlue-600">
                Términos y Condiciones
              </h1>

              <div className="mx-auto mb-6 max-w-xl">
                <p className="text-center text-sm">
                  Para obtener acceso a la plataforma, por favor haz click en el
                  siguiente link para acceder a la firma de los Términos y
                  Condiciones.
                </p>
              </div>

              <a
                href={`https://app.zapsign.co/verificar/${token}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Verificar documento</Button>
              </a>
            </>
          </div>
        </div>
      </section>
    </>
  )
}
