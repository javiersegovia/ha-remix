import type {
  MetaFunction,
  LoaderArgs,
  ActionArgs,
} from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'
import { Link, useLoaderData } from '@remix-run/react'

import { TeamForm } from '~/components/Forms/TeamForm'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { ButtonColorVariants, ButtonElement } from '~/components/Button'
import { createTeam } from '~/services/team/team.server'
import { teamValidator } from '~/services/team/team.schema'
import { requireAdminUserId } from '~/session.server'
import { SubmitButton } from '~/components/SubmitButton'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear equipo | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  return json({
    companyId,
  })
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  const formData = await request.formData()

  const { data, submittedData, error } = await teamValidator.validate(formData)

  if (error) {
    return validationError(error, submittedData)
  }

  await createTeam(data, companyId)

  return redirect(`/admin/dashboard/companies/${companyId}/teams`)
}

export default function TeamCreateRoute() {
  const { companyId } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="mx-auto w-full">
        <Title className="pl-2 pt-5">Crear equipo</Title>

        <TeamForm
          actions={
            <div className="mt-6 flex items-center justify-end gap-4">
              <Link to={`/admin/dashboard/companies/${companyId}/teams`}>
                <ButtonElement
                  variant={ButtonColorVariants.SECONDARY}
                  className="sm:w-auto"
                >
                  Cancelar
                </ButtonElement>
              </Link>
              <SubmitButton className="w-full sm:w-auto">Guardar</SubmitButton>
            </div>
          }
          buttonText="Crear"
        />
      </Container>
    </>
  )
}
