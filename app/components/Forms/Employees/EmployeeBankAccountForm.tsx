import type { BankAccount, IdentityDocument } from '@prisma/client'
import type { Validator } from 'remix-validated-form'
import type { getBanks } from '~/services/bank/bank.server'
import type { getBankAccountTypes } from '~/services/bank-account-type/bank-account-type.server'
import type { getIdentityDocumentTypes } from '~/services/identity-document-type/identity-document-type.server'
import type { EmployeeBankAccountSchemaInput } from '~/services/employee/employee.schema'

import { ValidatedForm } from 'remix-validated-form'

import { Box } from '~/components/Layout/Box'
import { FormGridWrapper } from '~/components/FormFields/FormGridWrapper'
import { FormGridItem } from '~/components/FormFields/FormGridItem'
import { Input } from '~/components/FormFields/Input'
import { Select } from '~/components/FormFields/Select'

interface EmployeeBankAccountFormProps<T = EmployeeBankAccountSchemaInput> {
  actions: JSX.Element
  validator: Validator<T>
  banks: Awaited<ReturnType<typeof getBanks>>
  bankAccountTypes: Awaited<ReturnType<typeof getBankAccountTypes>>
  identityDocumentTypes: Awaited<ReturnType<typeof getIdentityDocumentTypes>>
  defaultValues?: Partial<
    Pick<BankAccount, 'accountNumber' | 'accountTypeId' | 'bankId'> & {
      identityDocument?: Pick<IdentityDocument, 'documentTypeId' | 'value'>
    }
  >
}

export const EmployeeBankAccountForm = ({
  defaultValues,
  actions,
  validator,
  banks,
  bankAccountTypes,
  identityDocumentTypes,
}: EmployeeBankAccountFormProps) => {
  const { accountNumber, accountTypeId, bankId, identityDocument } =
    defaultValues || {}

  return (
    <ValidatedForm
      id="EmployeeBankAccountForm"
      validator={validator}
      method="post"
      defaultValues={{
        accountNumber,
        accountTypeId,
        bankId,
        identityDocument: identityDocument
          ? {
              documentTypeId: identityDocument?.documentTypeId,
              value: identityDocument?.value,
            }
          : undefined,
      }}
    >
      <Box className="p-5 shadow-sm">
        <FormGridWrapper>
          <FormGridItem>
            <Select
              name="bankId"
              label="Banco"
              placeholder="Banco"
              options={banks}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="accountTypeId"
              label="Tipo de cuenta"
              placeholder="Tipo de cuenta bancaria"
              options={bankAccountTypes}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="accountNumber"
              type="text"
              label="Número de cuenta"
              placeholder="Número de cuenta bancaria"
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              name="identityDocument.documentTypeId"
              label="Tipo de documento"
              placeholder="Tipo de documento de identidad"
              options={identityDocumentTypes}
              isClearable
            />
          </FormGridItem>

          <FormGridItem>
            <Input
              name="identityDocument.value"
              type="text"
              label="Documento de identidad"
              placeholder="Número de documento de identidad"
            />
          </FormGridItem>
        </FormGridWrapper>
      </Box>

      {actions}
    </ValidatedForm>
  )
}
