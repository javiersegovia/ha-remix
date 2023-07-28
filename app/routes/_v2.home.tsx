import type { LoaderArgs } from '@remix-run/server-runtime'

import { useLoaderData, useOutlet } from '@remix-run/react'
import { requireEmployee } from '~/session.server'
import { AnimatePresence } from 'framer-motion'
import { Title } from '~/components/Typography/Title'
import { Text } from '~/components/Typography/Text'
import { ChallengeCard } from '~/components/Cards/ChallengeCard'
import { getChallengesByCompanyId } from '~/services/challenge/challenge.server'
import { json } from '@remix-run/server-runtime'
import { Button } from '~/components/Button'
import { HiStar, HiMiniUserGroup } from 'react-icons/hi2'
import { TeamSimpleCard } from '~/components/Cards/TeamSimpleCard'
import { HiOutlinePencil } from 'react-icons/hi'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const challenges = await getChallengesByCompanyId(employee.companyId)

  const teams = [
    {
      id: '1',
      name: 'Ventas',
      teamMembersCount: 12,
    },
    {
      id: '2',
      name: 'Comerciales',
      teamMembersCount: 8,
    },
    {
      id: '3',
      name: 'Producto',
      teamMembersCount: 5,
    },
    {
      id: '4',
      name: 'Marketing',
      teamMembersCount: 15,
    },
  ]

  return json({
    challenges,
    teams,
  })
}

const HomeRoute = () => {
  const { challenges, teams } = useLoaderData<typeof loader>()
  const outlet = useOutlet()

  return (
    <>
      <div className="gap-10 pb-16 md:grid md:grid-cols-12">
        <section className="col-span-12 space-y-6 md:col-span-8">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electricYellow-300">
              <HiStar className="text-lg text-electricYellow-700" />
            </div>

            <Title>Retos</Title>
          </div>

          {challenges?.length > 0 ? (
            <>
              <Text>
                A continuación se encuentra la lista de retos disponibles para
                tus colaboradores.
              </Text>

              <div className="max-w-2xl space-y-4">
                {challenges.map(
                  ({
                    title,
                    id,
                    description,
                    startDate,
                    finishDate,
                    goalDescription,
                    measurerDescription,
                    rewardDescription,
                  }) => {
                    return (
                      <ChallengeCard
                        key={id}
                        id={id}
                        title={title}
                        description={description}
                        startDate={startDate}
                        finishDate={finishDate}
                        goalDescription={goalDescription}
                        measurerDescription={measurerDescription}
                        rewardDescription={rewardDescription}
                      />
                    )
                  }
                )}
              </div>
            </>
          ) : (
            <>
              <Text>
                Aquí mostraremos los retos disponibles para tus colaboradores.
              </Text>

              <Button
                href="/home/create-challenge"
                className="mt-6 w-auto"
                size="SM"
              >
                Crear tu primer reto
              </Button>
            </>
          )}
        </section>

        <section className="col-span-4 hidden md:block">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-200">
              <HiMiniUserGroup className="text-lg text-teal-700" />
            </div>

            <Title>Equipos</Title>
          </div>

          <div className="mt-6 space-y-3">
            {teams.map((team) => (
              <TeamSimpleCard
                key={team.id}
                id={team.id}
                name={team.name}
                teamMembersCount={team.teamMembersCount}
              />
            ))}
          </div>
        </section>
      </div>

      <Button
        href="/home/create-challenge"
        className="fixed bottom-6 right-6 z-10 ml-auto w-auto gap-2 lg:hidden"
        size="XS"
      >
        <HiOutlinePencil />
        Crear reto
      </Button>

      <AnimatePresence mode="wait">{outlet}</AnimatePresence>
    </>
  )
}

export default HomeRoute
