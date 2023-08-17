import { PermissionCode } from '@prisma/client'

// This list will be used as the main source of truth for permissions
// in the application. It will be used to create the permissions in the
// database, using the "code" enums as the unique identifiers.
// This way, we can use the permissions and make sure that they are always
// consistent with the database.

export const defaultPermissions = [
  {
    code: PermissionCode.MANAGE_COMPANY,
    name: 'Editar información de la empresa',
  },
  {
    code: PermissionCode.MANAGE_BENEFIT,
    name: 'Crear, editar o eliminar beneficios asociados a la empresa',
  },
  {
    code: PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION,
    name: 'Crear, consultar o editar la información principal de los colaboradores',
  },
  {
    code: PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION,
    name: 'Crear, consultar o editar la información financiera de los colaboradores',
  },
  {
    code: PermissionCode.MANAGE_EMPLOYEE_GROUP,
    name: 'Crear, consultar o editar grupos de colaboradores',
  },
  {
    code: PermissionCode.VIEW_INDICATOR_ACTIVITY,
    name: 'Ver actividades existentes en los indicadores',
  },
  {
    code: PermissionCode.MANAGE_INDICATOR_ACTIVITY,
    name: 'Crear, editar o eliminar actividades en los indicadores',
  },
] as const
