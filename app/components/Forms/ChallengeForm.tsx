import type { Challenge, Team } from '@prisma/client'
import type { getTeamsByCompanyId } from '~/services/team/team.server'
import type { getIndicators } from '~/services/indicator/indicator.server'

import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { SelectMultiple } from '~/components/FormFields/SelectMultiple'
import { DatePicker } from '~/components/FormFields/DatePicker'
import { challengeValidator } from '~/services/challenge/challenge.schema'
import { Select } from '../FormFields/Select'

interface ChallengeFormProps {
  formId: string
  teams: Awaited<ReturnType<typeof getTeamsByCompanyId>>
  indicators: Awaited<ReturnType<typeof getIndicators>>
  defaultValues?: Pick<
    Challenge,
    | 'title'
    | 'description'
    | 'goal'
    | 'measurerDescription'
    | 'rewardDescription'
    | 'startDate'
    | 'finishDate'
    | 'indicatorId'
  > & {
    teams: Pick<Team, 'id' | 'name'>[]
  }
}

export const ChallengeForm = ({
  formId,
  defaultValues,
  teams,
  indicators,
}: ChallengeFormProps) => {
  const { teams: currentTeams } = defaultValues || {}

  return (
    <>
      <ValidatedForm
        id={formId}
        validator={challengeValidator}
        method="post"
        defaultValues={{
          ...defaultValues,
          goal: defaultValues?.goal || undefined,
          teamIds: currentTeams?.map((t) => t.id),
        }}
      >
        <FormGridWrapper>
          <FormGridItem>
            <Input
              name="title"
              type="text"
              label="Título del reto"
              placeholder="Ej: Ventas de Black Friday"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="rewardDescription"
              type="text"
              label="Recompensa en puntos"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Input
              name="description"
              type="text"
              label="Descripción"
              placeholder="Agregar descripción del reto"
              isTextArea
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="goal"
              type="number"
              label="Meta"
              placeholder="Ej: 20000"
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="indicatorId"
              label="Indicador de progreso"
              placeholder="Seleccione un indicador"
              options={indicators}
            />
          </FormGridItem>

          <FormGridItem>
            <DatePicker
              name="startDate"
              label="Fecha de inicio"
              placeholder="Ingresar fecha de inicio"
            />
          </FormGridItem>

          <FormGridItem>
            <DatePicker
              name="finishDate"
              label="Fecha de finalización"
              placeholder="Ingresar fecha de finalización"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <SelectMultiple
              name="teamIds"
              label="Equipos participantes"
              placeholder="Seleccione uno o más equipos"
              options={teams}
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
