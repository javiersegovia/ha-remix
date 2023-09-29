import type { Challenge, Indicator, Team } from '@prisma/client'
import type { ReactNode } from 'react'

import { Card } from './Card'
import { Title } from '../Typography/Title'
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
import { MenuButton } from '../Button/MenuButton'
import { $path } from 'remix-routes'
import { formatDate, sanitizeDate } from '~/utils/formatDate'
import { ChallengeStatusPill } from '../Pills/ChallengeStatusPill'
import { Button, ButtonColorVariants, ButtonIconVariants } from '../Button'
import type { getChallengesWithProgressByCompanyId } from '~/services/challenge/challenge.server'
import { ChallengeProgressBar } from '../Bars/ChallengeProgressBar'
import clsx from 'clsx'

type ChallengeCardProps = Pick<
  Challenge,
  'id' | 'title' | 'goal' | 'reward' | 'rewardEligibles' | 'status'
> & {
  startDate?: string | null
  finishDate?: string | null
  teams?: Pick<Team, 'id' | 'name'>[]
  indicator?: Pick<Indicator, 'name'> | null
  progress?: Awaited<
    ReturnType<typeof getChallengesWithProgressByCompanyId>
  >[number]['progress']
}

type TGridItems = {
  label: string
  content: string | ReactNode
}

export const ChallengeCard = ({
  id,
  title,
  startDate,
  finishDate,
  progress,
  goal,
  reward,
  rewardEligibles,
  status,
  indicator,
  teams,
}: ChallengeCardProps) => {
  const navigation = [
    {
      name: 'Editar',
      href: $path('/challenges/:challengeId/update', { challengeId: id }),
      Icon: HiOutlinePencilSquare,
    },
    {
      name: 'Eliminar',
      href: $path('/home/delete-challenge/:challengeId', { challengeId: id }),
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
      label: 'Recompensa individual',
      content: reward?.toLocaleString() || '-',
    },
    {
      label: 'Recompensa total',
      content: reward ? (reward * rewardEligibles).toLocaleString() : '-',
    },
    {
      label: 'Meta individual',
      content: goal?.toLocaleString() || '-',
    },
    {
      label: 'Meta grupal',
      content: goal ? (goal * rewardEligibles).toLocaleString() : '-',
    },
    {
      label: 'Elegibles para recompensa',
      content: rewardEligibles || '-',
    },
    {
      label: 'Indicador de progreso',
      content: indicator?.name || '-',
    },
    {
      label: 'Equipos participantes',
      content:
        teams?.length && teams.length > 0
          ? teams.map((t) => t.name).join(', ')
          : '-',
    },
  ]

  return (
    <Card
      className={clsx(
        progress?.progressPercentage &&
          progress.progressPercentage > 100 &&
          'border-green-300 bg-green-50'
      )}
    >
      <div className="flex items-center">
        <Title as="h3">{title}</Title>

        <div className="ml-auto flex items-center gap-4">
          <ChallengeStatusPill status={status} />
          <MenuButton navigation={navigation} />
        </div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-6 text-sm ">
        {gridItems?.map(({ label, content }) => (
          <div key={label}>
            <p className="font-semibold text-gray-700">{label}</p>
            <p className="text-gray-500">{content}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 h-[1px] w-full bg-gray-200" />

      {goal && indicator ? (
        <div className="pb-4 pt-10">
          <ChallengeProgressBar
            indicator={indicator}
            totalGoal={goal ? goal * rewardEligibles : 0}
            progressPercentage={progress?.progressPercentage}
            progressValue={progress?.progressValue}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          variant={ButtonColorVariants.ALTERNATIVE}
          size="XS"
          icon={ButtonIconVariants.VIEW}
          className="ml-auto md:w-auto"
          href={$path('/challenges/:challengeId', { challengeId: id })}
        >
          Ver detalles
        </Button>
      </div>
    </Card>
  )
}
