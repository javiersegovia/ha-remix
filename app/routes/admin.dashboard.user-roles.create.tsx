import { Link } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'

import { redirect } from '@remix-run/server-runtime'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { validationError } from 'remix-validated-form'

import { UserRoleForm } from '~/components/Forms/UserRoleForm'
import { Container } from '~/components/Layout/Container'
import { Title } from '~/components/Typography/Title'
import { userRoleValidator } from '~/services/user-role/user-role.schema'
import { createUserRole } from '~/services/user-role/user-role.server'
import { requireAdminUserId } from '~/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)
  return null
}

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Crear Rol de Usuario | HoyTrabajas Beneficios',
  }
}

export const action = async ({ request }: ActionArgs) => {
  await requireAdminUserId(request)

  const formData = await request.formData()

  const { data, submittedData, error } = await userRoleValidator.validate(
    formData
  )

  if (error) {
    return validationError(error, submittedData)
  }

  await createUserRole(data)

  return redirect('/admin/dashboard/user-roles')
}

export default function UserRoleCreateRoute() {
  return (
    <Container className="xl:max-w-2xl">
      <Link
        to="/admin/dashboard/user-roles"
        className="mb-10 ml-auto flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>
      <Title className="mb-10">Crear rol de usuario</Title>

      <UserRoleForm buttonText="Crear" />
    </Container>
  )
}
