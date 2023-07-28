import type { Challenge, Team } from '@prisma/client'

import { Card } from './Card'
import { Title } from '../Typography/Title'
import { Text } from '../Typography/Text'
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
import { MenuButton } from '../Button/MenuButton'
import { $path } from 'remix-routes'
import type { ReactNode } from 'react'
import { formatDate } from '~/utils/formatDate'

type ChallengeCardProps = Pick<
  Challenge,
  | 'id'
  | 'title'
  | 'description'
  | 'goalDescription'
  | 'rewardDescription'
  | 'measurerDescription'
> & {
  startDate?: string | null
  finishDate?: string | null
  teams?: Pick<Team, 'id' | 'name'>[]
}

type TGridItems = {
  label: string
  content: string | ReactNode
}

export const ChallengeCard = ({
  id,
  title,
  description,
  startDate,
  finishDate,
  goalDescription,
  rewardDescription,
  measurerDescription,
  teams,
}: ChallengeCardProps) => {
  const navigation = [
    {
      name: 'Editar',
      href: $path('/home/edit-challenge/:challengeId', { challengeId: id }),
      preventScrollReset: true,
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
      label: 'Equipos',
      content:
        teams?.length && teams.length > 0
          ? teams.map((t) => t.name).join(', ')
          : '-',
    },
    {
      label: 'Fecha de inicio',
      content: startDate ? formatDate(Date.parse(startDate)) : '-',
    },
    {
      label: 'Fecha de finalización',
      content: finishDate ? formatDate(Date.parse(finishDate)) : '-',
    },
    {
      label: 'Recompensa',
      content: rewardDescription || '-',
    },
    {
      label: 'Meta',
      content: goalDescription || '-',
    },
    {
      label: 'Medidor',
      content: measurerDescription || '-',
    },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Title as="h3">{title}</Title>
        <MenuButton navigation={navigation} />
      </div>

      {description && (
        <Text className="mt-2 text-justify text-sm text-gray-500">
          {description}
        </Text>
      )}

      <section className="mt-6 grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
        {gridItems?.map(({ label, content }) => (
          <div key={label}>
            <p className="font-semibold text-gray-700">{label}</p>
            <p className="text-gray-500">{content}</p>
          </div>
        ))}
      </section>
    </Card>
  )
}
