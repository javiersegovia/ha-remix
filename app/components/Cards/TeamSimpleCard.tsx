import type { Team } from '@prisma/client'
import { Title } from '../Typography/Title'
import { Text } from '../Typography/Text'

interface TeamSimpleCardProps {
  id: Team['id']
  name: string
  teamMembersCount: number
}

export const TeamSimpleCard = ({
  id,
  name,
  teamMembersCount,
}: TeamSimpleCardProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-3xl border border-gray-300 bg-gray-100" />

      <div>
        <Title as="h6">{name}</Title>

        <Text>
          {teamMembersCount} {teamMembersCount === 1 ? 'miembro' : 'miembros'}
        </Text>
      </div>
    </div>
  )
}
