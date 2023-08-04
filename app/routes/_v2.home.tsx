import type { LoaderArgs } from '@remix-run/server-runtime'

import { AnimatePresence } from 'framer-motion'
import { useLoaderData, useOutlet } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { HiOutlinePencil } from 'react-icons/hi'

import { requireEmployee } from '~/session.server'
import { Title } from '~/components/Typography/Title'
import { Text } from '~/components/Typography/Text'
import { Button } from '~/components/Button'
import { ChallengeCard } from '~/components/Cards/ChallengeCard'
import { getChallengesByCompanyId } from '~/services/challenge/challenge.server'
import { HiStar, HiMiniUserGroup } from 'react-icons/hi2'
import { TeamSimpleCard } from '~/components/Cards/TeamSimpleCard'
import { getTeamsByCompanyId } from '~/services/team/team.server'
import { calculateCompanyPointMetricsByCompanyId } from '~/services/company-points/company-points.server'
import { Card } from '~/components/Cards/Card'
import { getCompanyById } from '~/services/company/company.server'

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const challenges = await getChallengesByCompanyId(employee.companyId)
  const teams = await getTeamsByCompanyId(employee.companyId)
  const company = await getCompanyById(employee.companyId)
  const pointsMetrics = await calculateCompanyPointMetricsByCompanyId(
    employee.companyId
  )

  return json({
    challenges,
    teams,
    pointsMetrics,
    company,
  })
}

const HomeRoute = () => {
  const { challenges, teams, pointsMetrics, company } =
    useLoaderData<typeof loader>()
  const { assignedPoints, consumedPoints, availablePoints } = pointsMetrics
  const outlet = useOutlet()

  return (
    <>
      {company?.logoImage?.url && (
        <img
          src={company.logoImage.url}
          alt="Company logo"
          className=" mx-auto mt-6 max-w-xs"
        />
      )}

      <section className="mb-20 mt-10 grid grid-cols-4 gap-6">
        <Card>
          <Title as="h2">{availablePoints}</Title>
          <Text>Puntos por asignar</Text>
        </Card>

        <Card>
          <Title as="h2">{assignedPoints}</Title>
          <Text>Puntos asignados</Text>
        </Card>

        <Card>
          <Title as="h2">{consumedPoints}</Title>
          <Text>Puntos consumidos</Text>
        </Card>

        <Card>
          <Title as="h2">{company?._count.employees}</Title>
          <Text>Colaboradores</Text>
        </Card>
      </section>

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
              <Text className="text-sm">
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
                    teams: currentTeams,
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
                        teams={currentTeams}
                      />
                    )
                  }
                )}
              </div>
            </>
          ) : (
            <>
              <Text className="text-sm">
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
            {teams?.length > 0 ? (
              teams.map((team) => (
                <TeamSimpleCard
                  key={team.id}
                  id={team.id}
                  name={team.name}
                  teamMembersCount={team._count.members}
                />
              ))
            ) : (
              <Text className="text-sm leading-6">
                Actualmente no existe ningún equipo registrado. Contacta a un
                administrador para realizar la creación de tu primer equipo.
              </Text>
            )}
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
