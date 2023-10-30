import type { ReactNode } from 'react'

import { json, type LoaderArgs } from '@remix-run/node'
import { useLoaderData, useOutlet } from '@remix-run/react'
import {
  HiMiniUserGroup,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2'
import { GiProgression } from 'react-icons/gi'

import { $path } from 'remix-routes'
import { MenuButton } from '~/components/Button/MenuButton'
import { Container } from '~/components/Layout/Container'
import { ChallengeStatusPill } from '~/components/Pills/ChallengeStatusPill'
import { Text } from '~/components/Typography/Text'
import { Title } from '~/components/Typography/Title'

import {
  calculateChallengeProgress,
  getChallengeById,
  requireEmployeeCanViewChallenge,
} from '~/services/challenge/challenge.server'
import { requireEmployee } from '~/session.server'
import { formatDate, sanitizeDate } from '~/utils/formatDate'
import { badRequest } from '~/utils/responses'
import {
  getEmployeeIndicatorActivities,
  getIndicatorActivitiesByChallengeId,
} from '~/services/indicator-activity/indicator-activity.server'
import { DataTable } from '~/components/Table/DataTable'
import { ChallengeProgressBar } from '~/components/Bars/ChallengeProgressBar'
import { hasPermissionByUserId } from '~/services/permissions/permissions.server'
import { ChallengeStatus, PermissionCode } from '@prisma/client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/Accordions/Accordion'
import { percentageOf } from '~/utils/percentage'
import { Button, ButtonColorVariants } from '~/components/Button'
import {
  fullIndicatorActivityColumns,
  indicatorActivityColumns,
} from './table-columns'

export const loader = async ({ request, params }: LoaderArgs) => {
  const employee = await requireEmployee(request)

  const { challengeId } = params
  if (!challengeId || isNaN(Number(challengeId))) {
    throw badRequest({
      message: 'No se encontró el ID del reto',
      redirect: $path('/home'),
    })
  }

  await requireEmployeeCanViewChallenge(Number(challengeId), employee.id)

  const challenge = await getChallengeById(Number(challengeId))

  if (!challenge) {
    throw badRequest({
      message: 'No se encontró el reto',
      redirect: $path('/home'),
    })
  }

  const challengeIndicatorActivities = challenge.indicator
    ? await getIndicatorActivitiesByChallengeId(Number(challengeId))
    : []

  const employeesIActivities = challenge?.goal
    ? getEmployeeIndicatorActivities({
        indicatorActivities: challengeIndicatorActivities,
        goal: challenge.goal,
      })
    : []

  const canManageIndicatorActivity = await hasPermissionByUserId(
    employee.userId,
    PermissionCode.MANAGE_INDICATOR_ACTIVITY
  )

  const progress = calculateChallengeProgress({
    goal: challenge.goal,
    rewardEligibles: challenge.rewardEligibles,
    indicatorActivities: challengeIndicatorActivities,
  })

  return json({
    challenge,
    progress,
    canManageIndicatorActivity,
    employeesIActivities,
  })
}

type TGridItems = {
  label: string
  content: string | ReactNode
}

const ChallengeDetailsRoute = () => {
  const {
    challenge,
    progress,
    canManageIndicatorActivity,
    employeesIActivities,
  } = useLoaderData<typeof loader>()

  const outlet = useOutlet()

  const {
    title,
    id,
    description,
    startDate,
    finishDate,
    goal,
    indicator,
    status,
    reward,
    rewardEligibles = 1,
    teams: currentTeams,
  } = challenge

  const navigation = []

  if (
    challenge.status !== ChallengeStatus.CANCELED &&
    challenge.status !== ChallengeStatus.COMPLETED
  ) {
    navigation.push({
      name: 'Editar',
      href: $path('/challenges/:challengeId/update', { challengeId: id }),
      preventScrollReset: false,
      Icon: HiOutlinePencilSquare,
    })
  }

  if (challenge.status !== ChallengeStatus.COMPLETED) {
    navigation.push({
      name: 'Eliminar',
      href: $path('/challenges/:challengeId/delete', { challengeId: id }),
      preventScrollReset: true,
      Icon: HiOutlineTrash,
    })
  }

  const gridItems: TGridItems[] = [
    {
      label: 'Fecha de inicio',
      content: startDate
        ? formatDate(sanitizeDate(new Date(Date.parse(startDate))) as Date)
        : '-',
    },
    {
      label: 'Fecha de finalización',
      content: finishDate
        ? formatDate(sanitizeDate(new Date(Date.parse(finishDate))) as Date)
        : '-',
    },
    {
      label: 'Elegibles para recompensa',
      content: rewardEligibles || '-',
    },
    {
      label: 'Recompensa individual',
      content: reward?.toLocaleString() || '-',
    },
    {
      label: 'Recompensa total',
      content: reward ? (reward * rewardEligibles)?.toLocaleString() : '-',
    },
    {
      label: 'Indicador de progreso',
      content: indicator?.name || '-',
    },
    {
      label: 'Meta individual',
      content: goal?.toLocaleString() || '-',
    },
    {
      label: 'Meta grupal',
      content: goal ? (goal * rewardEligibles)?.toLocaleString() : '-',
    },
    {
      label: 'Equipos participantes',
      content:
        currentTeams?.length && currentTeams.length > 0
          ? currentTeams.map((t) => t.name).join(', ')
          : '-',
    },
  ]

  return (
    <>
      <Container>
        <div className="flex items-center gap-4">
          <Title as="h1">{title}</Title>
          <ChallengeStatusPill status={status} />

          {navigation.length > 0 && (
            <div className="ml-auto flex items-center gap-4">
              <MenuButton navigation={navigation} />
            </div>
          )}
        </div>

        {description && (
          <Text className="mt-6 text-justify text-sm text-gray-500">
            {description}
          </Text>
        )}
        <section className="mt-6 grid grid-cols-2 gap-6 text-sm md:grid-cols-3 ">
          {gridItems?.map(({ label, content }) => (
            <div key={label}>
              <p className="font-semibold text-gray-700">{label}</p>
              <p className="text-gray-500">{content}</p>
            </div>
          ))}
        </section>

        {challenge.status !== ChallengeStatus.CANCELED &&
          challenge.status !== ChallengeStatus.COMPLETED && (
            <section className="mt-10">
              <div className="flex items-center justify-end gap-4 py-4">
                <Button
                  size="XS"
                  className="ml-auto whitespace-nowrap sm:w-auto"
                  href={$path('/challenges/:challengeId/complete', {
                    challengeId: challenge.id,
                  })}
                >
                  Finalizar reto
                </Button>

                <Button
                  size="XS"
                  className="whitespace-nowrap sm:w-auto"
                  variant={ButtonColorVariants.WARNING}
                  href={$path('/challenges/:challengeId/cancel', {
                    challengeId: challenge.id,
                  })}
                >
                  Cancelar reto
                </Button>
              </div>
            </section>
          )}

        {challenge.status !== ChallengeStatus.CANCELED && (
          <section className="mt-10">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-200">
                <GiProgression className="text-lg text-green-700" />
              </div>

              <Title as="h3">Progreso</Title>
            </div>

            <div className="mt-4">
              <ChallengeProgressBar
                totalGoal={goal ? goal * rewardEligibles : undefined}
                indicator={indicator}
                progressValue={progress?.progressValue}
                progressPercentage={progress?.progressPercentage}
              />
            </div>
          </section>
        )}

        {challenge.status !== ChallengeStatus.CANCELED &&
          employeesIActivities?.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-200">
                  <HiMiniUserGroup className="text-lg text-teal-700" />
                </div>

                <Title as="h3">Participantes</Title>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {employeesIActivities.map((item) => {
                  return (
                    <AccordionItem
                      value={item.employeeId}
                      key={item.employeeId}
                    >
                      <AccordionTrigger>
                        <div className="w-full pr-4 font-normal text-gray-500">
                          <div className="text-left">
                            {item.fullName} (
                            {Math.round(
                              percentageOf(item.totalActivityValue, goal || 0)
                            )}
                            %)
                          </div>

                          <ChallengeProgressBar
                            totalGoal={goal || undefined}
                            indicator={indicator}
                            showDetails={false}
                            progressValue={item.totalActivityValue}
                            progressPercentage={
                              goal
                                ? (item.totalActivityValue * 100) / goal
                                : undefined
                            }
                          />
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="">
                        <div className="flex justify-between pb-6 text-gray-500">
                          <div>
                            <p>Progreso actual</p>
                            <p>{item.totalActivityValue?.toLocaleString()}</p>
                          </div>

                          <div className="text-right">
                            <p>Meta individual</p>{' '}
                            <p>{goal?.toLocaleString()}</p>
                          </div>
                        </div>

                        <DataTable
                          data={item.indicatorActivities}
                          columns={
                            canManageIndicatorActivity
                              ? fullIndicatorActivityColumns
                              : indicatorActivityColumns
                          }
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </section>
          )}
      </Container>

      {outlet}
    </>
  )
}

export default ChallengeDetailsRoute
