import { BenefitFactory } from '~/services/benefit/benefit.factory'
import { BenefitHighlightFactory } from '~/services/benefit/benefit-highlight.factory'
import { run } from '../../prisma/scripts/add_isHighlighted_field_to_benefits'
import { prisma } from '~/db.server'
import { truncateDB } from 'test/helpers/truncateDB'

beforeEach(async () => {
  await truncateDB()
})

describe('Update existing isHighlighted fields inside Benefits', () => {
  it('updates all records successfully', async () => {
    const benefits = await BenefitFactory.createList(10, {
      isHighlighted: false,
    })

    const benefitsToUpdate = benefits.slice(0, 5)

    const promises = benefitsToUpdate.map((b) => {
      return BenefitHighlightFactory.create(
        {
          isActive: true,
        },
        {
          associations: {
            benefit: b,
          },
        }
      )
    })

    await Promise.all(promises)

    await run()

    const result = await prisma.benefit.findMany({
      where: {
        id: {
          in: benefitsToUpdate.map((b) => b.id),
        },
      },
      select: {
        isHighlighted: true,
      },
    })

    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ isHighlighted: true })])
    )
  })
})
