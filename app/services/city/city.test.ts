import { prisma } from '~/db.server'
import { CityFactory } from './city.factory'
import * as cityService from './city.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getCitiesByStateId', () => {
  test('should return an array of cities', async () => {
    const cities = CityFactory.buildList(3)
    vi.spyOn(prisma.city, 'findMany').mockResolvedValueOnce(cities)
    const result = await cityService.getCitiesByStateId(1)
    expect(result).toEqual(cities)
  })
})
