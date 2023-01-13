import type { Company, Gender, User } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/server-runtime'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { logout, requireUserId } from '~/session.server'
import { prisma } from '~/db.server'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { BenefitCard } from '~/components/Cards/BenefitCard'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'

export type DashboardIndexLoaderData = {
  gender: Pick<Gender, 'name'> | null
  user: Pick<User, 'firstName'>
  benefits: Awaited<ReturnType<typeof prisma.benefit.findMany>>
  company: Pick<Company, 'name'>
}

export const loader: LoaderFunction = async ({ request, context: ctx }) => {
  const userId = await requireUserId(request)
  const employeeData = await prisma.employee.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
    select: {
      company: {
        select: {
          name: true,
          benefits: {
            select: {
              id: true,
            },
          },
        },
      },
      membership: {
        select: { id: true, name: true, benefits: { select: { id: true } } },
      },
      gender: { select: { name: true } },
      user: { select: { firstName: true } },
    },
  })

  const benefits = await getEmployeeEnabledBenefits(
    employeeData?.membership?.benefits,
    employeeData?.company.benefits
  )

  if (!employeeData) throw await logout(request)

  return json<DashboardIndexLoaderData>({
    gender: employeeData.gender,
    user: employeeData.user,
    benefits,
    company: employeeData.company,
  })
}

export default function DashboardIndexRoute() {
  const { gender, user, benefits, company } =
    useLoaderData<DashboardIndexLoaderData>()

  return (
    <>
      <div className="relative w-full flex-1">
        <img
          className="absolute top-0 left-0 opacity-[15%]"
          src="/images/block_dashboard_overview_yellow.png"
          alt="Bloque Amarillo"
        />
        <img
          className="absolute bottom-0 right-0 opacity-[15%]"
          src="/images/block_dashboard_overview_green.png"
          alt="Bloque Verde"
        />

        <section className="relative z-10 mx-auto mt-10 w-full max-w-screen-lg px-2 pb-10 sm:px-10 md:mt-28">
          <Box className="flex items-center gap-5 px-10 py-10 shadow-xl md:px-10 xl:px-40">
            <div>
              <Title as="h1" className="!font-semibold">
                Hola, {user.firstName}
              </Title>
              <p className="mt-2 text-xl font-medium text-steelBlue-900">
                ¡Tu eres {gender?.name === 'Femenino' ? 'valiosa' : 'valioso'}{' '}
                para {company.name}! Así que disfruta de todo lo bueno que{' '}
                {company.name} tiene que ofrecerte.
              </p>
            </div>

            <img
              className="w-20"
              src="/images/bito/bito_1.png"
              alt="Robot BitO"
            />
          </Box>

          <section className="mt-10 grid grid-cols-2 items-center gap-4 text-center md:gap-5 lg:grid-cols-3 lg:items-stretch">
            {benefits.map(({ name, buttonHref, buttonText, imageUrl }) => (
              <BenefitCard
                key={name}
                title={name}
                buttonText={buttonText}
                buttonHref={buttonHref}
                imageUrl={imageUrl}
              />
            ))}
          </section>
          <Outlet />
        </section>
      </div>
    </>
  )
}
