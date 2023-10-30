import type { Indicator } from '@prisma/client'

interface ChallengeProgressBarProps {
  progressValue?: number
  progressPercentage?: number
  totalGoal?: number
  indicator?: Pick<Indicator, 'name'> | null
  showDetails?: boolean
}

export const ChallengeProgressBar = ({
  progressValue = 0,
  progressPercentage = 0,
  totalGoal,
  indicator,
  showDetails = true,
}: ChallengeProgressBarProps) => {
  return (
    <div className="text-gray-500">
      {(!totalGoal || !indicator) && (
        <p className="text-sm">
          Para visualizar el progreso, primero debes establecer una meta y un
          indicador de progreso.
        </p>
      )}

      {totalGoal && indicator ? (
        <>
          {showDetails && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <p>Progreso actual ({progressPercentage}%)</p>
              <p>Meta total ({indicator.name})</p>
            </div>
          )}

          <div className="relative h-2 w-full overflow-hidden rounded-md bg-gray-200">
            <div
              className="h-full bg-green-400"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
              }}
            />
          </div>

          {showDetails && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <p>{progressValue.toLocaleString()}</p>
              <p>{totalGoal.toLocaleString()}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
