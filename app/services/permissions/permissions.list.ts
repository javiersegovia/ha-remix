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
    description: 'Nombre, logo, descripción, teléfono, dirección...',
  },
  {
    code: PermissionCode.MANAGE_BENEFIT_CATEGORY,
    name: 'Crear, editar o eliminar categorías de beneficios',
  },
  {
    code: PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION,
    name: 'Crear, consultar o editar la información principal de los colaboradores',
    description:
      'Nombre, apellido, fecha de nacimiento, género, teléfono, correo electrónico...',
  },
  {
    code: PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION,
    name: 'Crear, consultar o editar la información financiera de los colaboradores',
    description:
      'Banco, tipo de cuenta, tipo de documento, documento de identidad...',
  },
] as const
