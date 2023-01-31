import { prisma } from '~/db.server'
import { GenderFactory } from './gender.factory'
import { getGenders } from './gender.server'

describe('getGenders', () => {
  it('returns an array of genders', async () => {
    const genders = GenderFactory.buildList(3)
    vi.spyOn(prisma.gender, 'findMany').mockResolvedValue(genders)
    expect(await getGenders()).toEqual(genders)
  })
})
