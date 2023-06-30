import type { MetaFunction, LoaderArgs } from '@remix-run/server-runtime'

import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import {
  Button,
  ButtonColorVariants,
  ButtonIconVariants,
} from '~/components/Button'
import {
  buildEmployeeFilters,
  getCompanyEmployeesByCompanyId,
} from '~/services/employee/employee.server'
import { requireAdminUserId } from '~/session.server'

import { TitleWithActions } from '~/components/Layout/TitleWithActions'

import { useToastError } from '~/hooks/useToastError'
import { badRequest } from '~/utils/responses'
import { getSearchParams } from 'remix-params-helper'
import { employeeSearchSchema } from '~/services/employee/employee-search.schema'
import { getPaginationOptions } from '~/utils/getPaginationOptions'
import { prisma } from '~/db.server'
import { getJobDepartments } from '~/services/job-department/job-department.server'
import { getSalaryRanges } from '~/services/salary-range/salary-range.server'
import { getAgeRanges } from '~/services/age-range/age-range.server'
import { DataTable } from '~/components/Table/DataTable'
import { columns } from './table-columns'
import { TableActions } from './table-actions'
import { filterEmployeeEnabledBenefits } from '~/services/permissions/permissions.shared'

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUserId(request)

  const { companyId } = params

  if (!companyId) {
    throw badRequest({
      message: 'No se ha encontrado el ID de la compañía',
      redirect: '/admin/dashboard/companies',
    })
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
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
      message: 'No se ha encontrado información de la compañía',
      redirect: '/admin/dashboard/companies',
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
    companyId: company.id,
  })

  const totalResultsCount = await prisma.employee.count({
    where: {
      AND: employeeFilters,
    },
  })

  const { take, skip, pagination } = getPaginationOptions({
    request,
    itemsCount: totalResultsCount,
  })

  const [employees, jobDepartments, salaryRanges, ageRanges] =
    await Promise.all([
      getCompanyEmployeesByCompanyId(company.id, {
        take,
        skip,
        where: {
          AND: employeeFilters,
        },
      }),
      getJobDepartments(),
      getSalaryRanges(),
      getAgeRanges(),
    ])

  const formattedEmployees = employees.map((e) => {
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

  return json({
    employees: formattedEmployees,
    jobDepartments,
    salaryRanges,
    ageRanges,
    pagination,
    companyName: company.name,
    totalEmployeeCount: company._count.employees,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: '[Admin] Compañía no encontrada | HoyTrabajas Beneficios',
    }
  }

  const { companyName } = data

  return {
    title: `[Admin] Colaboradores de ${companyName} | HoyTrabajas Beneficios`,
  }
}

export default function AdminDashboardCompanyEmployees() {
  const {
    employees,
    jobDepartments,
    salaryRanges,
    ageRanges,
    pagination,
    totalEmployeeCount,
  } = useLoaderData<typeof loader>()

  return (
    <>
      <>
        <TitleWithActions
          title="Colaboradores"
          className="my-10"
          actions={
            <>
              <Link to="download" reloadDocument>
                <Button
                  className="flex w-full items-center whitespace-nowrap sm:w-auto"
                  size="SM"
                  variant={ButtonColorVariants.SECONDARY}
                  icon={ButtonIconVariants.DOWNLOAD}
                >
                  Descargar
                </Button>
              </Link>

              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                size="SM"
                href="upload"
                variant={ButtonColorVariants.SECONDARY}
                icon={ButtonIconVariants.UPLOAD}
              >
                Cargar
              </Button>

              <Button
                className="flex w-full items-center whitespace-nowrap sm:w-auto"
                href="create"
                size="SM"
                icon={ButtonIconVariants.CREATE}
              >
                Crear colaborador
              </Button>
            </>
          }
        />

        {totalEmployeeCount > 0 ? (
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
        ) : (
          <p className="text-lg">La lista de colaboradores está vacía.</p>
        )}
      </>
    </>
  )
}

export const ErrorBoundary = () => {
  useToastError()
  return null
}
