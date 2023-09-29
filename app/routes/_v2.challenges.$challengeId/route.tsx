import type { ReactNode } from 'react'

import { json, type LoaderArgs } from '@remix-run/node'
import { useLoaderData, useOutlet } from '@remix-run/react'
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
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
import { getIndicatorActivitiesByChallengeId } from '~/services/indicator-activity/indicator-activity.server'
import { DataTable } from '~/components/Table/DataTable'
import { ChallengeProgressBar } from '~/components/Bars/ChallengeProgressBar'
import { columns, fullColumns } from './table-columns'
import { hasPermissionByUserId } from '~/services/permissions/permissions.server'
import { PermissionCode } from '@prisma/client'

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
    challengeIndicatorActivities,
    progress,
    canManageIndicatorActivity,
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
    challengeIndicatorActivities,
    canManageIndicatorActivity,
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

  const navigation = [
    {
      name: 'Editar',
      href: $path('/challenges/:challengeId/update', { challengeId: id }),
      Icon: HiOutlinePencilSquare,
    },
    {
      name: 'Eliminar',
      href: $path('/challenges/:challengeId/delete', { challengeId: id }),
      preventScrollReset: true,
      Icon: HiOutlineTrash,
    },
  ]

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
        <div className="flex items-center">
          <Title as="h1">{title}</Title>
          <div className="ml-auto flex items-center gap-4">
            <ChallengeStatusPill status={status} />
            <MenuButton navigation={navigation} />
          </div>
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
        <section className="mt-10">
          <Title as="h3">Progreso</Title>
          <div className="mt-4">
            <ChallengeProgressBar
              totalGoal={goal ? goal * rewardEligibles : undefined}
              indicator={indicator}
              progressValue={progress?.progressValue}
              progressPercentage={progress?.progressPercentage}
            />
          </div>
        </section>
        <section className="mt-10">
          <Title as="h3">Actividad relacionada</Title>
          <div className="mt-4">
            {!challenge.indicator ? (
              <p className="text-sm text-gray-500">
                Para visualizar las actividades relacionadas, primero debes
                establecer un indicador de progreso.
              </p>
            ) : challengeIndicatorActivities?.length > 0 ? (
              <DataTable
                data={challengeIndicatorActivities}
                columns={canManageIndicatorActivity ? fullColumns : columns}
                // pagination={pagination}
                // tableActions={(table) => (
                //   <TableActions table={table} indicators={indicators} />
                // )}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Todavía no se ha encontrado ninguna actividad relacionada a este
                reto.
              </p>
            )}
          </div>
        </section>
      </Container>

      {outlet}
    </>
  )
}

export default ChallengeDetailsRoute
