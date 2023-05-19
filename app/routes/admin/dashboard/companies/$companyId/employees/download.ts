import type { LoaderArgs } from '@remix-run/server-runtime'

import { stringify } from 'csv-stringify/sync'
import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'
import { requireCompany } from '~/services/company/company.server'
import { requireAdminUserId } from '~/session.server'
import { format } from 'date-fns'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)
  const { companyId } = params

  const company = await requireCompany({
    where: { id: companyId },
  })

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }
  const employees = await prisma.employee.findMany({
    where: {
      companyId,
    },
    select: {
      phone: true,
      status: true,
      jobPosition: { select: { name: true } },
      jobDepartment: { select: { name: true } },
      salaryFiat: true,
      advanceMaxAmount: true,
      advanceAvailableAmount: true,
      country: { select: { name: true } },
      startedAt: true,
      inactivatedAt: true,
      availablePoints: true,
      bankAccount: {
        select: {
          accountType: { select: { name: true } },
          accountNumber: true,
          bank: { select: { name: true } },
          identityDocument: {
            select: {
              documentType: { select: { name: true } },
              value: true,
            },
          },
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  const mapEmployees = employees.map((employee) => ({
    CORREO_ELECTRONICO: employee.user?.email,
    NOMBRE: employee.user?.firstName,
    APELLIDO: employee.user?.lastName,
    NUMERO_TELEFONICO: employee.phone,
    ESTADO: employee.status,
    CARGO: employee.jobPosition?.name,
    DEPARTAMENTO: employee.jobDepartment?.name,
    SALARIO: employee.salaryFiat,
    CUPO_APROBADO: employee.advanceMaxAmount,
    CUPO_DISPONIBLE: employee.advanceAvailableAmount,
    PAIS: employee.country?.name,
    BANCO: employee.bankAccount?.bank.name,
    TIPO_DE_CUENTA: employee.bankAccount?.accountType.name,
    NUMERO_DE_CUENTA: employee.bankAccount?.accountNumber,
    TIPO_DE_DOCUMENTO:
      employee.bankAccount?.identityDocument?.documentType.name,
    DOCUMENTO_DE_IDENTIDAD: employee.bankAccount?.identityDocument?.value,
    FECHA_DE_INGRESO: employee.startedAt
      ? format(employee.startedAt, 'dd/MM/yyyy')
      : null,
    FECHA_DE_RETIRO: employee.inactivatedAt
      ? format(employee.inactivatedAt, 'dd/MM/yyyy')
      : null,
    CELULAR: employee.phone,
    PUNTOS_DISPONIBLES: employee.availablePoints,
  }))

  const csvString = stringify(mapEmployees, {
    columns: [
      'CORREO_ELECTRONICO',
      'NOMBRE',
      'APELLIDO',
      'ESTADO',
      'CARGO',
      'DEPARTAMENTO',
      'SALARIO',
      'CUPO_APROBADO',
      'CUPO_DISPONIBLE',
      'PAIS',
      'BANCO',
      'TIPO_DE_CUENTA',
      'NUMERO_DE_CUENTA',
      'TIPO_DE_DOCUMENTO',
      'DOCUMENTO_DE_IDENTIDAD',
      'FECHA_DE_INGRESO',
      'FECHA_DE_RETIRO',
      'CELULAR',
      'PUNTOS_DISPONIBLES',
    ],
    header: true,
  })

  const headers = new Headers({
    'Content-disposition': `attachment; filename=colaboradores_${company.name}.csv`,
    'Content-Type': 'text/csv',
  })

  return new Response(csvString, {
    headers,
    status: 200,
  })
}
