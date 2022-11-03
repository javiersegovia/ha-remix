import { faker } from '@faker-js/faker'
import type { Bank, BankAccount, Employee } from '@prisma/client'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { BankAccountTypeFactory } from '../bank-account-type/bank-account-type.factory'
import { BankFactory } from '../bank/bank.factory'
import { IdentityDocumentTypeFactory } from '../identity-document-type/identity-document-type.factory'

type ExtendedBankAccount = BankAccount & {
  bank?: Pick<Bank, 'id'>
  employee?: Pick<Employee, 'id'>
}

export const BankAccountFactory = Factory.define<ExtendedBankAccount>(
  ({ onCreate, associations }) => {
    const bank = BankFactory.build()
    const bankAccountType = BankAccountTypeFactory.build()
    const identityDocumentType = IdentityDocumentTypeFactory.build()

    onCreate((bankAccount) => {
      const { createdAt, updatedAt, accountNumber } = bankAccount

      return prisma.bankAccount.create({
        data: {
          createdAt,
          updatedAt,
          accountNumber,

          bank: associations?.bank
            ? connect(associations?.bank.id)
            : {
                create: {
                  name: bank.name,
                },
              },

          employee: associations?.employee
            ? connect(associations?.employee.id)
            : undefined,

          accountType: {
            create: {
              name: bankAccountType.name,
            },
          },

          identityDocument: {
            create: {
              value: faker.datatype.string(10),
              documentType: {
                create: {
                  name: identityDocumentType.name,
                },
              },
            },
          },
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),

      accountNumber: faker.finance.account(),

      accountTypeId: bankAccountType.id,
      bankId: bank.id,
      identityDocumentId: faker.datatype.number(),
    }
  }
)
