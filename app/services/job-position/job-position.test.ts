import type { JobPosition } from '@prisma/client'

import { prisma } from '~/db.server'
import { JobPositionFactory } from './job-position.factory'
import * as jobPositionService from './job-position.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getJobPositions', () => {
  it('returns an array of jobPositions', async () => {
    const jobPositions = JobPositionFactory.buildList(3)
    vi.spyOn(prisma.jobPosition, 'findMany').mockResolvedValueOnce(jobPositions)
    const result = await jobPositionService.getJobPositions()
    expect(result).toEqual<Pick<JobPosition, 'id' | 'name'>[]>(jobPositions)
  })
})
