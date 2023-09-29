import { ChallengeStatus } from '@prisma/client'
import clsx from 'clsx'

interface ChallengeStatusPillProps {
  status: ChallengeStatus
}

const ChallengeStatusLabel = {
  [ChallengeStatus.ACTIVE]: 'Reto activo',
  [ChallengeStatus.INACTIVE]: 'Reto inactivo',
  [ChallengeStatus.COMPLETED]: 'Reto completado',
} as const

export const ChallengeStatusPill = ({ status }: ChallengeStatusPillProps) => {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[6rem] justify-center rounded-3xl px-4 py-2 text-xs font-semibold leading-5',
        status === ChallengeStatus.ACTIVE && 'bg-blue-200 text-blue-700',
        status === ChallengeStatus.INACTIVE && 'bg-gray-200 text-gray-700',
        status === ChallengeStatus.COMPLETED && 'bg-green-200 text-green-700'
      )}
    >
      {ChallengeStatusLabel[status]}
    </span>
  )
}
