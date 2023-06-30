import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'

import { PermissionCode } from '@prisma/client'
import { json } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import { Container } from '~/components/Layout/Container'
import { requireEmployee } from '~/session.server'
import { TitleWithActions } from '~/components/Layout/TitleWithActions'
import { Tabs } from '~/components/Tabs/Tabs'
import {
  hasPermissionByUserId,
  requirePermissionByUserId,
} from '~/services/permissions/permissions.server'
import { useToastError } from '~/hooks/useToastError'
import {
  buildEmployeeFilters,
  getCompanyEmployeesByCompanyId,
} from '~/services/employee/employee.server'
import { TableIsEmpty } from '~/components/Lists/TableIsEmpty'
import { prisma } from '~/db.server'
import { filterEmployeeEnabledBenefits } from '../../services/permissions/permissions.shared'
import { badRequest } from '~/utils/responses'
import { getPaginationOptions } from '~/utils/getPaginationOptions'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { TableActions } from './table-actions'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { getSearchParams } from 'remix-params-helper'
import { employeeSearchSchema } from '~/services/employee/employee-search.schema'

export const meta: MetaFunction = () => {
  return {
    title: 'Colaboradores | HoyTrabajas Beneficios',
  }
}

export const employeeTabPaths = [
  {
    title: 'Colaboradores',
    path: '/dashboard/manage/employees',
  },
  {
    title: 'Grupos de colaboradores',
    path: '/dashboard/manage/employee-groups',
  },
]

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  await requirePermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_MAIN_INFORMATION
  )

  const canManageEmployeeGroup = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_EMPLOYEE_GROUP
  )

  const company = await prisma.company.findUnique({
    where: {
      id: employee.companyId,
    },
    select: {
      benefits: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
  })

  if (!company) {
    throw badRequest({
      message: 'No pudimos encontrar el ID de la compañía',
      redirect: `/dashboard/overview`,
    })
  }

  const searchResult = getSearchParams(request, employeeSearchSchema)

  if (!searchResult.success) {
    throw badRequest({
      message: 'Se ha recibido un formato de búsqueda incorrecto',
      redirect: null,
    })
  }

  const { keywords, jobDepartmentId, ageRangeId, salaryRangeId } =
    searchResult.data

  const employeeFilters = await buildEmployeeFilters({
    keywords,
    jobDepartmentId,
    ageRangeId,
    salaryRangeId,
    companyId: employee.companyId,
  })

  const employeeCount = await prisma.employee.count({
    where: {
      AND: employeeFilters,
    },
  })

  const { take, skip, pagination } = getPaginationOptions({
    request,
    itemsCount: employeeCount,
  })

  const employees = await getCompanyEmployeesByCompanyId(employee.companyId, {
    take,
    skip,
    where: {
      AND: employeeFilters,
    },
  })

  const employeesWithEnabledBenefitsPromise = employees.map((e) => {
    const filteredBenefits = filterEmployeeEnabledBenefits({
      employeeBenefits: e?.benefits,
      membershipBenefits: e?.membership?.benefits,
      companyBenefitsIds: company.benefits?.map((b) => b.id),
      employeeGroupsBenefits: e?.employeeGroups
        ?.map((eGroup) => eGroup.benefits)
        .flat(),
    })

    return {
      ...e,
      email: e.user.email,
      fullName: `${e.user.firstName} ${e.user.lastName}`,
      enabledBenefits: filteredBenefits.size,
      employeeGroups: e.employeeGroups?.length,
    }
  })

  const [jobDepartments, salaryRanges, ageRanges] = await Promise.all([
    getJobDepartments(),
    getSalaryRanges(),
    getAgeRanges(),
  ])

  return json({
    totalEmployeesCount: company._count.employees,
    employees: employeesWithEnabledBenefitsPromise,
    jobDepartments,
    salaryRanges,
    ageRanges,
    pagination,
    companyBenefitsIds: employee.company.benefits?.map((b) => b.id),
    canManageEmployeeGroup,
  })
}

export default function DashboardEmployeesIndexRoute() {
  const {
    totalEmployeesCount,
    employees,
    pagination,
    canManageEmployeeGroup,
    jobDepartments,
    salaryRanges,
    ageRanges,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <Container className="w-full pb-10">
        {canManageEmployeeGroup && (
          <Tabs items={employeeTabPaths} className="mb-8 mt-10" />
        )}

        {totalEmployeesCount > 0 ? (
          <>
            <TitleWithActions
              className="mb-10"
              title="Colaboradores"
              actions={
                <>
                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    size="SM"
                    href="/dashboard/manage/employees/upload"
                    variant={ButtonColorVariants.SECONDARY}
                    icon={ButtonIconVariants.UPLOAD}
                  >
                    Cargar
                  </Button>

                  <Button
                    className="flex w-full items-center whitespace-nowrap sm:w-auto"
                    href="/dashboard/manage/employees/create"
                    size="SM"
                    icon={ButtonIconVariants.CREATE}
                  >
                    Crear colaborador
                  </Button>
                </>
              }
            />
            <DataTable
              columns={columns}
              data={employees}
              pagination={pagination}
              tableActions={(table) => (
                <TableActions
                  table={table}
                  jobDepartments={jobDepartments}
                  salaryRanges={salaryRanges}
                  ageRanges={ageRanges}
                />
              )}
            />
          </>
        ) : (
          <TableIsEmpty
            title="Aún no tienes ningún colaborador"
            description="¿Qué esperas para añadir el primero?"
            actions={
              <Button
                href="/dashboard/manage/employees/create/account"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear colaborador
              </Button>
            }
            className="mt-10"
          />
        )}
      </Container>
      <Outlet />
    </>
  )
}

export const ErrorBoundary = () => {
  useToastError()
  return null
}
