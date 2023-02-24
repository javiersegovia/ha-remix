import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { badRequest } from 'remix-utils'
import { validationError } from 'remix-validated-form'

import { requireAdminUserId } from '~/session.server'
import { Title } from '~/components/Typography/Title'
import {
  deleteUserRoleById,
  getUserRoleById,
  updateUserRoleById,
} from '~/services/user-role/user-role.server'
import { userRoleValidator } from '~/services/user-role/user-role.schema'
import { UserRoleForm } from '~/components/Forms/UserRoleForm'
import { Container } from '~/components/Layout/Container'
import { AiOutlineArrowLeft } from 'react-icons/ai'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { userRoleId } = params
  // inventos mios xd

  if (!userRoleId) {
    throw badRequest('No se encontró el ID del rol de usuario')
  }

  const userRole = await getUserRoleById(userRoleId)

  if (!userRole) {
    throw badRequest('No se encontró el ID del rol de usuario')
  }
  return json({ userRole })

  // if (!userRoleId || isNaN(Number(userRoleId))) {
  //   throw badRequest('No se encontró el ID del rol de usuario')
  // }

  // const userRole = await getUserRoleById(userRoleId)
}

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUserId(request)

  const { userRoleId } = params

  if (!userRoleId) {
    throw badRequest('No se encontró el ID del rol de usuario')
  }

  if (request.method === 'POST') {
    const formData = await request.formData()

    const { data, submittedData, error } = await userRoleValidator.validate(
      formData
    )

    if (error) {
      return validationError(error, submittedData)
    }

    await updateUserRoleById(userRoleId, data)
  } else if (request.method === 'DELETE') {
    await deleteUserRoleById(userRoleId)
  }

  return redirect('/admin/dashboard/user-roles')
}

export default function UserRoleUpdateRoute() {
  const { userRole } = useLoaderData<typeof loader>()
  // otro invento
  if (!userRole) {
    throw badRequest('error')
  }
  // cierre del invento
  return (
    <Container className="xl:max-w-2xl">
      <Link
        to="/admin/dashboard/user-roles"
        className="ml-auto mb-10 flex gap-3 font-medium text-cyan-600"
      >
        <AiOutlineArrowLeft className="text-2xl" />
        <span className="tracking-widest">Regresar</span>
      </Link>
      <Title className="mb-6">Actualizar rol de usuario</Title>

      <UserRoleForm
        buttonText="Guardar"
        defaultValues={{ name: userRole.name }}
        showDeleteButton
      />
    </Container>
  )
}
