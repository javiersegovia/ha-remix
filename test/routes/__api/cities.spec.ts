import { truncateDB } from '../../helpers/truncateDB'
import { loader as cityLoader } from '~/routes/__api/cities'
import { prisma } from '~/db.server'

beforeEach(async () => {
  await truncateDB()
})

describe('LOADER /__api/cities', () => {
  it('returns an array of cities', async () => {
    const country = await prisma.country.create({
      data: {
        name: 'My country',
        code2: 'MC2',
        phoneCode: '+999',
      },
    })
    const state = await prisma.state.create({
      data: {
        name: 'MyState',
        country: {
          connect: { id: country.id },
        },
        cities: {
          createMany: {
            data: [
              {
                name: 'B_City_1',
              },
              {
                name: 'A_City_2',
              },
            ],
          },
        },
      },
    })

    const response: Response = await cityLoader({
      request: new Request(`http://localhost:3000/cities?stateId=${state?.id}`),
      params: {},
      context: {},
    })

    expect(response.status).toEqual(200)
    expect(await response.json()).toEqual({
      cities: [
        { id: expect.any(Number), name: 'A_City_2' },
        { id: expect.any(Number), name: 'B_City_1' },
      ],
    })
  })

  it('returns an empty array if the stateId is not defined', async () => {
    const response: Response = await cityLoader({
      request: new Request(`http://localhost:3000/cities`),
      params: {},
      context: {},
    })

    expect(response.status).toEqual(200)
    expect(await response.json()).toEqual({
      cities: [],
    })
  })
})
