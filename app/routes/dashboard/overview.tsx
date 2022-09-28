import type { Gender, User } from '@prisma/client'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { Button } from '~/components/Button'
import { Box } from '~/components/Layout/Box'
import { Title } from '~/components/Typography/Title'
import { prisma } from '~/db.server'
import { logout, requireUserId } from '~/session.server'

type LoaderData = {
  gender: Pick<Gender, 'name'> | null
  user: Pick<User, 'firstName'>
}

export const loader: LoaderFunction = async ({ request }) => {
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

  return json<LoaderData>({
    gender: data.gender,
    user: data.user,
  })
}

// todo: add Hotjar script

export default function DashboardIndexRoute() {
  const { gender, user } = useLoaderData<LoaderData>()

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

      <section className="mx-auto mt-10 w-full max-w-screen-lg px-2 pb-10  sm:px-10">
        <Title as="h1">
          ¡Hola, {user.firstName}!{' '}
          {gender?.name === 'Femenino' ? 'Bienvenida' : 'Bienvenido'} a
          HoyAdelantas, una nueva alternativa para ti
        </Title>
        <section className="mt-10 flex flex-col items-center gap-5 lg:flex-row lg:items-stretch">
          <Box className="flex w-full max-w-xs flex-col justify-between space-y-5 p-5">
            <Title as="h4">Adelantos de Nómina</Title>
            <Button href="/dashboard/payroll-advances/new">Solicitar</Button>
          </Box>
          <Box className="flex w-full max-w-xs flex-col justify-between space-y-5 p-5">
            <Title as="h4">Adelantos de Prima</Title>
            <Button href="request-premium-advance" className="mt-auto">
              Solicitar
            </Button>
          </Box>
          <Box className="flex w-full max-w-xs flex-col justify-between space-y-5 p-5">
            <Title as="h4">Haz realidad tus viajes</Title>
            <a
              className="block"
              href="https://umany.co/tu-paseo/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Button type="button">Conocer más</Button>
            </a>
          </Box>
        </section>
        <Outlet />
      </section>
    </>
  )
}
