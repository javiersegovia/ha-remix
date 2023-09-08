import type { Table } from '@tanstack/react-table'
import type { getIndicators } from '~/services/indicator/indicator.server'

import { ValidatedForm } from 'remix-validated-form'
import { ButtonColorVariants, ButtonIconVariants } from '~/components/Button'
import { Input } from '~/components/FormFields/Input'
import { Select } from '~/components/FormFields/Select'
import { Title } from '~/components/Typography/Title'
import { SubmitButton } from '../../components/SubmitButton'
import { indicatorActivitySearchValidator } from '~/services/indicator-activity/indicator-activity-search.schema'

interface TableActionsProps<TData> {
  table: Table<TData>
  indicators: Awaited<ReturnType<typeof getIndicators>>
}

export const TableActions = <TData extends Record<string, any>>({
  indicators,
}: TableActionsProps<TData>) => {
  return (
    <>
      <ValidatedForm validator={indicatorActivitySearchValidator} method="get">
        <Title as="h4">Filtros de búsqueda</Title>

        <div className="flex flex-wrap items-center gap-x-3 pt-4 lg:flex-nowrap">
          <Input
            type="text"
            label="Nombre o correo"
            name="keywords"
            placeholder="Ingrese texto..."
          />

          <Select
            name="indicatorId"
            label="Indicador"
            placeholder="Seleccionar"
            options={indicators}
            isClearable
          />

          <SubmitButton
            type="submit"
            formMethod="GET"
            variant={ButtonColorVariants.SECONDARY}
            icon={ButtonIconVariants.SEARCH}
            size="SM"
            className="mb-5 w-full lg:mb-0 lg:w-auto"
          >
            Filtrar
          </SubmitButton>
        </div>
      </ValidatedForm>
    </>
  )
}
