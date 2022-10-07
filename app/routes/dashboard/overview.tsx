import type { Gender, User } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { BiDollarCircle } from 'react-icons/bi'
import { MdOutlineSavings } from 'react-icons/md'
import { IoAirplaneOutline } from 'react-icons/io5'

import { Button } from '~/components/Button'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { prisma } from '~/db.server'
import { logout, requireUserId } from '~/session.server'

export type DashboardIndexLoaderData = {
  gender: Pick<Gender, 'name'> | null
  user: Pick<User, 'firstName'>
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

  if (!data) throw await logout(request)

  return json<DashboardIndexLoaderData>({
    gender: data.gender,
    user: data.user,
  })
}

export default function DashboardIndexRoute() {
  const { gender, user } = useLoaderData<DashboardIndexLoaderData>()

  return (
    <>
      <script
        async
        id="hotjar"
        dangerouslySetInnerHTML={{
          __html: `
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:3148054,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
        }}
      />

      <div className="relative w-full flex-1">
        <img
          className="absolute top-0 left-0"
          src="/images/block_dashboard_overview_yellow.png"
          alt="Bloque Verde"
        />
        <img
          className="absolute bottom-0 right-0"
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

            <img className="w-20" src="/images/bito.png" alt="Robot BitO" />
          </Box>

          <section className="mt-10 grid grid-cols-2 items-center gap-4 text-center md:gap-5 lg:grid-cols-3 lg:items-stretch">
            <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
              <Title as="h4">Adelantos de Nómina</Title>
              <BiDollarCircle className="mx-auto text-8xl text-steelBlue-800" />
              <Button href="/dashboard/payroll-advances/new">Solicitar</Button>
            </Box>

            <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
              <Title as="h4">Adelantos de Prima</Title>
              <MdOutlineSavings className="mx-auto text-8xl text-steelBlue-800" />

              <Button href="request-premium-advance" className="mt-auto">
                Solicitar
              </Button>
            </Box>

            <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
              <Title as="h4">Haz realidad tus viajes</Title>
              <IoAirplaneOutline className="mx-auto text-8xl text-steelBlue-800" />
              <a
                className="block"
                href="https://umany.co/tu-paseo/"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Button type="button">Solicitar</Button>
              </a>
            </Box>
          </section>
          <Outlet />
        </section>
      </div>
    </>
  )
}
