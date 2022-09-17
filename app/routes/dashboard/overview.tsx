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
          <Title as="h4">Beneficios para ti y tu familia</Title>

          <a
            className="block"
            href="http://umany.hoytrabajas.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button type="button">Conocer más</Button>
          </a>
        </Box>
      </section>

      <Outlet />
    </section>
  )
}
