import type { EmployeeSchemaInput } from '~/services/employee/employee.schema'
import { validationError } from 'remix-validated-form'

export const validateBankAccount = (
  bankAccount: EmployeeSchemaInput['bankAccount'],
  formId?: string
) => {
  const { bankId, accountNumber, accountTypeId, identityDocument } = bankAccount
  const { value, documentTypeId } = identityDocument || {}

  const values = [bankId, accountNumber, accountTypeId, value, documentTypeId]

  // If at least one value is truthy, all of them should be truthy
  // If that's not the case, then we return the validationError.
  // ! This should be removed when we refactor the BankAccounts...
  // ! We should be able to save the data partially.

  if (values.some(Boolean) !== values.every(Boolean)) {
    return validationError({
      fieldErrors: {
        ...(!bankId && { 'bankAccount.bankId': 'Seleccione un banco' }),

        ...(!accountNumber && {
          'bankAccount.accountNumber': 'Ingrese un número de cuenta',
        }),

        ...(!accountTypeId && {
          'bankAccount.accountTypeId': 'Seleccione el tipo de cuenta',
        }),

        ...(!documentTypeId && {
          'bankAccount.identityDocument.documentTypeId':
            'Seleccione el tipo de cuenta',
        }),

        ...(!value && {
          'bankAccount.identityDocument.value':
            'Ingrese el documento de identidad',
        }),
      },
      formId,
    })
  }
}
