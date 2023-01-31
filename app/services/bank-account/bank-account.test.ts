import * as bankAccountService from './bank-account.server'

describe('validateBankAccount', () => {
  test('if all values are falsy, it returns undefined', () => {
    const data = {
      bankId: undefined,
      accountNumber: undefined,
      accountTypeId: undefined,

      identityDocument: undefined,
    }

    const result = bankAccountService.validateBankAccount(data, 'formId')
    expect(result).toEqual(undefined)
  })

  test('if all the values are truthy, it returns undefined', () => {
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

  test('if some value is present and some value is missing, it returns a validation error', async () => {
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

  test('if some values are present and multiple values are missing, it returns a validation error ', async () => {
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
