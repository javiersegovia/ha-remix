import type { Employee, User } from '@prisma/client'
import type { Validator } from 'remix-validated-form'
import type { getEmployeeGroupsByCompanyId } from '~/services/employee-group/employee-group.server'
import type { getAvailableBenefitsByCompanyId } from '~/services/benefit/benefit.server'
import type { EmployeeAccountSchemaInput } from '~/services/employee/employee.schema'
import type { EnumOption } from '~/schemas/helpers'

import type { getUserRoles } from '~/services/user-role/user-role.server'

import { EmployeeStatus } from '@prisma/client'
import { ValidatedForm } from 'remix-validated-form'

import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { Input } from '../../FormFields/Input'
import { Select } from '~/components/FormFields/Select'

const employeeStatusList: EnumOption[] = [
  { name: 'Activo', value: EmployeeStatus.ACTIVE },
  { name: 'Inactivo', value: EmployeeStatus.INACTIVE },
]

interface EmployeePeopleAccountFormProps<T = EmployeeAccountSchemaInput> {
  actions: JSX.Element
  userRoles: Awaited<ReturnType<typeof getUserRoles>>
  benefits: Awaited<ReturnType<typeof getAvailableBenefitsByCompanyId>>
  employeeGroups: Awaited<ReturnType<typeof getEmployeeGroupsByCompanyId>>
  validator: Validator<T>
  defaultValues?: Pick<Employee, 'status'> & {
    user: Pick<User, 'email' | 'firstName' | 'lastName' | 'roleId'>
  }
}

export const EmployeePeopleAccountForm = ({
  defaultValues,
  actions,
  validator,

  userRoles,
}: EmployeePeopleAccountFormProps) => {
  const { status, user } = defaultValues || {}

  return (
    <ValidatedForm
      id="EmployeePeopleAccountForm"
      validator={validator}
      method="post"
      defaultValues={{
        status: status || EmployeeStatus.INACTIVE,
        user: {
          firstName: user?.firstName || '',
          email: user?.email || '',
          lastName: user?.lastName || '',
          roleId: user?.roleId || '',
        },
      }}
    >
      <FormGridWrapper>
        <FormGridItem>
          <Input
            name="user.firstName"
            type="text"
            label="Nombre"
            placeholder="Nombre del colaborador"
            required
          />
        </FormGridItem>

        <FormGridItem>
          <Input
            name="user.lastName"
            type="text"
            label="Apellido"
            placeholder="Apellido del colaborador"
            required
          />
        </FormGridItem>

        <FormGridItem>
          <Input
            name="user.email"
            type="text"
            label="Correo electrónico"
            placeholder="Correo electrónico del colaborador"
            required
          />
        </FormGridItem>

        <FormGridItem>
          <Select
            name="status"
            label="Estado"
            placeholder="Estado"
            options={employeeStatusList}
          />
        </FormGridItem>

        <FormGridItem>
          <Select
            name="user.roleId"
            label="Rol"
            placeholder="Rol de usuario"
            options={userRoles}
            isClearable
          />
        </FormGridItem>

        {/* <FormGridItem isFullWidth>
            <SelectMultiple
              name="employeeGroupsIds"
              label="Grupo de colaboradores"
              placeholder="Seleccione uno o más grupos de colaboradores"
              options={employeeGroups}
              defaultValue={currentEmployeeGroups}
            />
          </FormGridItem> */}
      </FormGridWrapper>

      {actions}
    </ValidatedForm>
  )
}
