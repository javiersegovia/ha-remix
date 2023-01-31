import type { GlobalSettings } from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'

export const GlobalSettingsFactory = Factory.define<GlobalSettings>(
  ({ onCreate }) => {
    onCreate((globalSettings) => {
      const {
        annualInterestRate,
        daysWithoutRequestsBeforePaymentDay,
        transportationAid,
      } = globalSettings

      return prisma.globalSettings.create({
        data: {
          annualInterestRate,
          daysWithoutRequestsBeforePaymentDay,
          transportationAid,
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      annualInterestRate: faker.datatype.number(),
      daysWithoutRequestsBeforePaymentDay: faker.datatype.number(),
      transportationAid: faker.datatype.number(),
    }
  }
)
