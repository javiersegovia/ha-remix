import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { json, redirect } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { badRequest } from 'remix-utils'
import { validationError, ValidatedForm } from 'remix-validated-form'

import { requireAdminUserId } from '~/session.server'
import { Title } from '~/components/Typography/Title'
import {
  deleteUserRoleById,
  getUserRoleById,
  updateUserRoleById,
  updateUserRolePermissionsById,
} from '~/services/user-role/user-role.server'
import { userRoleValidator } from '~/services/user-role/user-role.schema'
import { UserRoleForm } from '~/components/Forms/UserRoleForm'
import { Container } from '~/components/Layout/Container'
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { findOrCreateManyPermissions } from '~/services/permissions/permissions.server'
import type { TableRowProps } from '~/components/Lists/Table'
import { Table } from '~/components/Lists/Table'
import { userRolePermissionsValidator } from '~/services/user-role/role-permissions.schema'
import { RepeteableCheckbox } from '~/components/FormFields/RepeteableCheckbox'
import { SubmitButton } from '~/components/SubmitButton'

export const meta: MetaFunction = () => {
  return {
    title: '[Admin] Actualizar Roles y Permisos | HoyTrabajas Beneficios',
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { userRoleId } = params

  if (!userRoleId) {
    throw badRequest('No se encontró el ID del rol de usuario')
  }

  const userRole = await getUserRoleById(userRoleId)

  if (!userRole) {
    throw badRequest('No se encontró el ID del rol de usuario')
  }

  const permissions = await findOrCreateManyPermissions()

  return json({ userRole, permissions })
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
  } else if (request.method === 'PUT') {
    const formData = await request.formData()

    const { data, submittedData, error } =
      await userRolePermissionsValidator.validate(formData)

    if (error) {
      return validationError(error, submittedData)
    }

    await updateUserRolePermissionsById(userRoleId, data.permissions)

    return redirect('/admin/dashboard/user-roles')
  } else if (request.method === 'DELETE') {
    await deleteUserRoleById(userRoleId)
  }

  return redirect('/admin/dashboard/user-roles')
}

export default function UserRoleUpdateRoute() {
  const { userRole, permissions } = useLoaderData<typeof loader>()

  const permissionRows: TableRowProps[] = permissions.map((permission) => {
    const { name, description } = permission

    return {
      rowId: permission.id,
      items: [
        <div
          key={`${permission.id}${name}`}
          className="max-w-xs whitespace-pre-wrap"
        >
          <div className="text-sm text-steelBlue-700">{name}</div>
          <div className="mt-1 text-xs italic text-gray-400">{description}</div>
        </div>,
        <RepeteableCheckbox
          key={`${permission.id}_checkbox`}
          name="permissions"
          value={permission.code}
        />,
      ],
    }
  })

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

      <Title className="my-6">Permisos asociados</Title>

      <ValidatedForm
        id="RolePermissionsForm"
        validator={userRolePermissionsValidator}
        defaultValues={{
          permissions: userRole.permissions.map((p) => p.code),
        }}
        method="put"
      >
        <Table headings={['Descripción', '']} rows={permissionRows} />

        <SubmitButton className="mt-5">Actualizar permisos</SubmitButton>
      </ValidatedForm>
    </Container>
  )
}
