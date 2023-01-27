import type {
  Benefit,
  BenefitConsumption,
  BenefitSubproduct,
  Employee,
} from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import { BenefitSubproductFactory } from '~/services/benefit-subproduct/benefit-subproduct.factory'

type ExtendedBenefitConsumption = BenefitConsumption & {
  employee: Employee
  benefit: Benefit
  benefitSubproduct?: BenefitSubproduct
}

export const BenefitConsumptionFactory =
  Factory.define<ExtendedBenefitConsumption>(
    ({ onCreate, sequence, associations }) => {
      const { benefit, employee } = associations

      if (!benefit || !employee) {
        throw new Error('Missing associations at BenefitConsumptionFactory')
      }

      onCreate((benefitConsumption) => {
        const {
          benefitSubproduct,
          benefit,
          employee,
          consumedAt,
          value,
          createdAt,
          updatedAt,
        } = benefitConsumption

        return prisma.benefitConsumption.create({
          data: {
            createdAt,
            updatedAt,
            consumedAt,
            value,
            benefitSubproduct: connect(benefitSubproduct?.id),
            benefit: connect(benefit.id),
            employee: connect(employee.id),
          },
          include: {
            benefit: true,
            employee: true,
          },
        })
      })

      const benefitSubproduct =
        associations?.benefitSubproduct || BenefitSubproductFactory.build()

      return {
        id: sequence,
        createdAt: new Date(),
        updatedAt: new Date(),
        consumedAt: new Date(),
        value: faker.datatype.number(),
        employee,
        employeeId: employee.id,
        benefit,
        benefitId: benefit.id,
        benefitSubproduct,
        benefitSubproductId: benefitSubproduct.id,
      }
    }
  )
