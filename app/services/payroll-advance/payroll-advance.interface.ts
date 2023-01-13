import type { BankFee, GlobalTax } from '@prisma/client'

export interface ITaxItem {
  name: string
  description: string
  value: GlobalTax['value'] | BankFee['value']
}
