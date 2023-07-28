import { faker } from '@faker-js/faker'
import { type Team, type Company } from '@prisma/client'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedTeam = Team & {
  company?: Company
}

export const TeamFactory = Factory.define<ExtendedTeam>(
  ({ onCreate, associations }) => {
    const { company } = associations

    if (!company) {
      throw new Error('Missing associations at TeamFactory')
    }

    onCreate((team) => {
      const { id, createdAt, updatedAt, name } = team
      return prisma.team.create({
        data: {
          id,
          createdAt,
          updatedAt,
          name,
          company: connect(company.id),
        },
      })
    })
    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: faker.datatype.string(),

      companyId: company?.id,
    }
  }
)
