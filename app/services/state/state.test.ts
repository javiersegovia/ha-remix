import { prisma } from '~/db.server'
import { StateFactory } from './state.factory'
import * as stateService from './state.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getStatesByCountryId', () => {
  test('should return a list of states', async () => {
    const states = StateFactory.buildList(3)
    vi.spyOn(prisma.state, 'findMany').mockResolvedValueOnce(states)
    const result = await stateService.getStatesByCountryId(1)
    expect(result).toEqual(states)
  })
})
