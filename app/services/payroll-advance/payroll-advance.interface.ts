import type { BankFee, GlobalTax } from '@prisma/client'

export interface ITaxItem {
  name: GlobalTax['name'] | BankFee['name']
  description: GlobalTax['description'] | BankFee['description']
  value: GlobalTax['value'] | BankFee['value']
}
