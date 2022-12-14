import type { Gender, User } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/server-runtime'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { logout, requireUserId } from '~/session.server'
import { prisma } from '~/db.server'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { BenefitCard } from '~/components/Cards/BenefitCard'

export type DashboardIndexLoaderData = {
  gender: Pick<Gender, 'name'> | null
  user: Pick<User, 'firstName'>
  benefits: Awaited<ReturnType<typeof prisma.benefit.findMany>>
}

export const loader: LoaderFunction = async ({ request, context: ctx }) => {
  const userId = await requireUserId(request)
  const data = await prisma.employee.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
    select: {
      gender: { select: { name: true } },
      user: { select: { firstName: true } },
    },
  })

  const benefits = await prisma.benefit.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  if (!data) throw await logout(request)

  return json<DashboardIndexLoaderData>({
    gender: data.gender,
    user: data.user,
    benefits,
  })
}

// const benefits: BenefitCardProps[] = [
//   {
//     title: 'Adelantos de Nómina',
//     imageUrl: '/images/icon/icon_benefit_dollar.svg',
//     button: {
//       text: 'Solicitar',
//       href: '/dashboard/payroll-advances/new',
//     },
//   },
//   {
//     title: 'Adelantos de Prima',
//     imageUrl: '/images/icon/icon_benefit_savings.svg',
//     button: {
//       text: 'Solicitar',
//       href: 'request-premium-advance',
//     },
//   },
//   {
//     title: 'Haz realidad tus viajes',
//     imageUrl: '/images/icon/icon_benefit_travel.svg',
//     button: {
//       text: 'Solicitar',
//       href: 'request-travel',
//     },
//   },
//   {
//     title: 'Educación financiera',
//     imageUrl: '/images/icon/icon_benefit_study.svg',
//     button: {
//       // text: 'Visitar',
//       // href: '/dashboard/education',
//       text: 'Visitar',
//       href: 'https://tu.hoyadelantas.com/edfinanciera',
//       external: true,
//     },
//   },
//   {
//     title: 'Mercado de Frutas y Verduras',
//     imageUrl: '/images/icon/icon_benefit_groceries.svg',
//     button: {
//       text: 'Ir a la tienda',
//       href: '/dashboard/overview/visit-groceries',
//     },
//   },
//   {
//     title: 'Salud',
//     imageUrl: '/images/icon/icon_benefit_health.svg',
//     button: {
//       text: 'Próximamente',
//     },
//   },
//   {
//     title: 'Seguros',
//     imageUrl: '/images/icon/icon_benefit_insurance.svg',
//     button: {
//       text: 'Próximamente',
//     },
//   },
//   {
//     title: 'Descuentos',
//     imageUrl: '/images/icon/icon_benefit_discount.svg',
//     button: {
//       text: 'Próximamente',
//     },
//   },
// ]

export default function DashboardIndexRoute() {
  const { gender, user, benefits } = useLoaderData<DashboardIndexLoaderData>()

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
                ¡Hola, {user.firstName}!
              </Title>
              <p className="mt-2 text-xl font-medium text-steelBlue-900">
                {gender?.name === 'Femenino' ? 'Bienvenida' : 'Bienvenido'} a
                HoyAdelantas, una nueva alternativa para ti
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
