import { truncateDB } from '../../helpers/truncateDB'
import { loader as stateLoader } from '~/routes/__api/states'
import { prisma } from '~/db.server'

beforeEach(async () => {
  await truncateDB()
})

// todo: the tests are slow, check how to mock DB in order to make them faster

describe('LOADER /__api/states', () => {
  test('should return an array of states', async () => {
    const country = await prisma.country.create({
      data: {
        name: 'My country',
        code2: 'MC2',
        phoneCode: '+999',
        states: {
          createMany: {
            data: [
              {
                name: 'Zaragoza',
              },
              {
                name: 'Amazonas',
              },
            ],
          },
        },
      },
    })

    const response: Response = await stateLoader({
      request: new Request(
        `http://localhost:3000/states?countryId=${country?.id}`
      ),
      params: {},
      context: {},
    })

    expect(response.status).toEqual(200)
    expect(await response.json()).toMatchObject({
      states: [
        { id: expect.any(Number), name: 'Amazonas' },
        { id: expect.any(Number), name: 'Zaragoza' },
      ],
    })
  })

  test('should return an empty array if the stateId is not defined', async () => {
    const response: Response = await stateLoader({
      request: new Request(`http://localhost:3000/states`),
      params: {},
      context: {},
    })

    expect(response.status).toEqual(200)
    expect(await response.json()).toMatchObject({
      states: [],
    })
  })
})
