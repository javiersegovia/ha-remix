import type { LoaderArgs, MetaFunction } from '@remix-run/node'

import { Title } from '~/components/Typography/Title'
import { json } from '@remix-run/node'
import { badRequest } from '~/utils/responses'
import { requireEmployee } from '~/session.server'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'
import { useLoaderData } from '@remix-run/react'
import { getEmployeeById } from '~/services/employee/employee.server'
import { EmployeeStatusPill } from '~/components/Pills/EmployeeStatusPill'
import React from 'react'
import { formatDate } from '~/utils/formatDate'
import { AnimatedRightPanel } from '~/components/Animations/AnimatedRightPanel'

const onCloseRedirectTo = '/people'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: 'Colaborador no encontrado | HoyTrabajas Beneficios',
    }
  }

  const { employee } = data

  return {
    title: `${employee?.user.firstName} ${employee?.user.lastName} | HoyTrabajas Beneficios`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentEmployee = await requireEmployee(request)

  await requirePermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const { employeeId } = params

  if (!employeeId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del colaborador',
      redirect: `/people`,
    })
  }

  const employee = await getEmployeeById(employeeId)

  if (!employee) {
    throw badRequest({
      message: 'No pudimos encontrar el colaborador',
      redirect: `/people`,
    })
  }

  const canManageFinancialInformation = await hasPermissionByUserId(
    currentEmployee.userId,
    PermissionCode.MANAGE_EMPLOYEE_FINANCIAL_INFORMATION
  )

  return json({ employee, canManageFinancialInformation })
}

const EmployeeDetailsRoute = () => {
  const { employee, canManageFinancialInformation } =
    useLoaderData<typeof loader>() || {}

  if (!employee) return null

  return (
    <AnimatedRightPanel
      title="Detalles de colaborador"
      onEditRedirectTo={`/people/${employee.id}/account`}
      onCloseRedirectTo={onCloseRedirectTo}
    >
      <div className="h-full pr-4 text-sm">
        <Title as="h4" className="mb-4 text-steelBlue-600">
          Cuenta de usuario
        </Title>

        <InformationWrapper>
          <InformationItem title="Nombre" value={employee.user?.firstName} />
          <InformationItem title="Apellido" value={employee.user?.lastName} />
          <InformationItem
            title="Correo electrónico"
            value={employee.user?.email}
          />
          <InformationItem
            title="Estado"
            value={<EmployeeStatusPill employeeStatus={employee.status} />}
          />
          <InformationItem
            title="Fecha de ingreso"
            value={
              employee.startedAt && formatDate(Date.parse(employee.startedAt))
            }
          />
          <InformationItem
            title="Grupos"
            value={employee.employeeGroups
              .map((group) => group.name)
              .join(', ')}
          />
        </InformationWrapper>

        <div className=" my-5 h-[2px] w-full bg-gray-200" />

        <Title as="h4" className="mb-4 text-steelBlue-600">
          Información complementaria
        </Title>

        <InformationWrapper>
          <InformationItem title="Cargo" value={employee.jobPosition?.name} />
          <InformationItem title="Área" value={employee.jobDepartment?.name} />
          <InformationItem title="País" value={employee.country?.name} />
          <InformationItem title="Departamento" value={employee.state?.name} />
          <InformationItem title="Ciudad" value={employee.city?.name} />
          <InformationItem title="Dirección" value={employee.address} />
          <InformationItem title="Número de celular" value={employee.phone} />
          <InformationItem title="Género" value={employee.gender?.name} />
          <InformationItem
            title="Fecha de nacimiento"
            value={
              employee.birthDay && formatDate(Date.parse(employee.birthDay))
            }
          />
          <InformationItem
            title="Fecha de expedición documento"
            value={
              employee.documentIssueDate &&
              formatDate(Date.parse(employee.documentIssueDate))
            }
          />
          <InformationItem
            title="Cantidad de hijos"
            value={employee.numberOfChildren}
          />
        </InformationWrapper>

        {canManageFinancialInformation && (
          <>
            <div className=" my-5 h-[2px] w-full bg-gray-200" />

            <Title as="h4" className="mb-4 text-steelBlue-600">
              Cuenta bancaria
            </Title>
            <InformationWrapper>
              <InformationItem
                title="Banco"
                value={employee.bankAccount?.bank?.name}
              />
              <InformationItem
                title="Tipo de cuenta"
                value={employee.bankAccount?.accountType?.name}
              />
              <InformationItem
                title="Número de cuenta"
                value={employee.bankAccount?.accountNumber}
              />
              <InformationItem
                title="Tipo de documento"
                value={
                  employee.bankAccount?.identityDocument?.documentType?.name
                }
              />
              <InformationItem
                title="Documento de identidad"
                value={employee.bankAccount?.identityDocument?.value}
              />
            </InformationWrapper>
          </>
        )}
      </div>
    </AnimatedRightPanel>
  )
}

const InformationWrapper = ({ children }: { children: React.ReactNode }) => (
  <section className="grid grid-cols-[40%_60%] gap-3">{children}</section>
)

const InformationItem = ({
  title,
  value,
}: {
  title: string
  value?: string | number | null | JSX.Element
}) => (
  <>
    <div className="font-bold text-steelBlue-800">{title}</div>
    <div className="whitespace-pre-wrap text-gray-500">
      <p className="break-words">{value || '-'}</p>
    </div>
  </>
)

export default EmployeeDetailsRoute
