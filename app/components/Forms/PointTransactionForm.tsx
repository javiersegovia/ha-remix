import {
  type Company,
  type Employee,
  type PointTransaction,
} from '@prisma/client'
import type { EnumOption } from '~/schemas/helpers'

import { ValidatedForm } from 'remix-validated-form'

import { pointTransactionValidator } from '~/services/points/point.schema'
import { FormGridWrapper } from '../FormFields/FormGridWrapper'
import { FormGridItem } from '../FormFields/FormGridItem'
import { Input } from '../FormFields/Input'
import { Select } from '../FormFields/Select'
import { useSelectEmployee } from '~/hooks/useSelectEmployee'

interface PointTransactionFormProps {
  currentSenderEmail?: string
  currentReceiverEmail?: string
  formId: string
  companyId: Company['id']
  pointTransactionTypeOptions: EnumOption[]
  defaultValues?: Pick<PointTransaction, 'type' | 'value'> & {
    senderId?: Employee['id']
    receiverId?: Employee['id']
  }
}

export const PointTransactionForm = ({
  formId,
  currentSenderEmail,
  currentReceiverEmail,
  defaultValues,
  companyId,
  pointTransactionTypeOptions,
}: PointTransactionFormProps) => {
  const {
    options: senderOptions,
    handleSelectChange: handleSenderSelectChange,
  } = useSelectEmployee({
    currentEmail: currentSenderEmail,
    companyId,
  })

  const {
    options: receiverOptions,
    handleSelectChange: handleReceiverSelectChange,
  } = useSelectEmployee({
    currentEmail: currentReceiverEmail,
    companyId,
  })

  return (
    <>
      <ValidatedForm
        id={formId}
        validator={pointTransactionValidator}
        method="post"
        className="pt-10"
        defaultValues={defaultValues}
      >
        <FormGridWrapper>
          <FormGridItem isFullWidth>
            <Input
              name="value"
              type="text"
              label="Puntos"
              placeholder="Ej: 5000"
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="type"
              label="Tipo de transacción"
              placeholder="Seleccione un tipo de transacción"
              options={pointTransactionTypeOptions}
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="senderId"
              label="Emisor"
              placeholder="Escribe un nombre o correo electrónico"
              options={senderOptions}
              onInputChange={handleSenderSelectChange}
              isClearable
            />
          </FormGridItem>

          <FormGridItem isFullWidth>
            <Select
              name="receiverId"
              label="Receptor"
              placeholder="Escribe un nombre o correo electrónico"
              options={receiverOptions}
              onInputChange={handleReceiverSelectChange}
              isClearable
            />
          </FormGridItem>
        </FormGridWrapper>
      </ValidatedForm>
    </>
  )
}
