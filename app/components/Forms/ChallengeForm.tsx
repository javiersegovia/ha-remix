import type { Challenge, Team } from '@prisma/client'
import type { getTeamsByCompanyId } from '~/services/team/team.server'

import { ValidatedForm } from 'remix-validated-form'

import { Input } from '~/components/FormFields/Input'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { SelectMultiple } from '~/components/FormFields/SelectMultiple'
import { DatePicker } from '~/components/FormFields/DatePicker'
import { challengeValidator } from '~/services/challenge/challenge.schema'

interface ChallengeFormProps {
  formId: string
  teams: Awaited<ReturnType<typeof getTeamsByCompanyId>>
  defaultValues?: Pick<
    Challenge,
    | 'title'
    | 'description'
    | 'goalDescription'
    | 'measurerDescription'
    | 'rewardDescription'
    | 'startDate'
    | 'finishDate'
  > & {
    teams: Pick<Team, 'id' | 'name'>[]
  }
}

export const ChallengeForm = ({
  formId,
  defaultValues,
  teams,
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
          goalDescription: defaultValues?.goalDescription || undefined,
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

          <FormGridItem>
            <Input
              name="goalDescription"
              type="number"
              label="Meta"
              placeholder="Ej: 20000"
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="measurerDescription"
              type="text"
              label="Tipo de medidor"
              placeholder="Ej: Número de ventas"
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
