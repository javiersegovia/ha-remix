import * as bankAccountService from './bank-account.server'

describe('validateBankAccount', () => {
  test('should return undefined if all the values are empty', () => {
    const data = {
      bankId: undefined,
      accountNumber: undefined,
      accountTypeId: undefined,

      identityDocument: undefined,
    }

    const result = bankAccountService.validateBankAccount(data, 'formId')
    expect(result).toEqual(undefined)
  })

  test('should return undefined if all the values are truthy', () => {
    const data = {
      bankId: 1,
      accountNumber: '123123',
      accountTypeId: 1,
      identityDocument: {
        value: '123',
        documentTypeId: 1,
      },
    }

    const result = bankAccountService.validateBankAccount(data, 'formId')
    expect(result).toEqual(undefined)
  })

  test('should return a validation error if some values are present but only one value is missing', async () => {
    const data = {
      bankId: undefined,
      accountNumber: '123123',
      accountTypeId: 1,
      identityDocument: {
        value: '123',
        documentTypeId: 1,
      },
    }
    const formId = 'formId'
    const result = bankAccountService.validateBankAccount(data, formId)
    expect(await result?.json()).toEqual({
      fieldErrors: {
        'bankAccount.bankId': 'Seleccione un banco',
      },
      formId,
    })
  })

  test('should return a validation error if some values are present and multiple values are missing', async () => {
    const data = {
      bankId: 1,
      accountNumber: undefined,
      accountTypeId: undefined,
      identityDocument: {
        value: undefined,
        documentTypeId: 1,
      },
    }
    const formId = 'formId'
    const result = bankAccountService.validateBankAccount(data, formId)
    expect(await result?.json()).toEqual({
      fieldErrors: {
        'bankAccount.accountNumber': 'Ingrese un número de cuenta',
        'bankAccount.accountTypeId': 'Seleccione el tipo de cuenta',
        'bankAccount.identityDocument.value':
          'Ingrese el documento de identidad',
      },
      formId,
    })
  })
})
