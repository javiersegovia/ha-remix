import type { JobPosition } from '@prisma/client'

import { prisma } from '~/db.server'
import { JobPositionFactory } from './job-position.factory'
import * as jobPositionService from './job-position.server'

describe('getJobPositions', () => {
  it('returns an array of jobPositions', async () => {
    const jobPositions = JobPositionFactory.buildList(3)
    vi.spyOn(prisma.jobPosition, 'findMany').mockResolvedValueOnce(jobPositions)
    const result = await jobPositionService.getJobPositions()
    expect(result).toEqual<Pick<JobPosition, 'id' | 'name'>[]>(jobPositions)
  })
})

describe('getJobPositionById', () => {
  it('returns a Job Position', async () => {
    const expectedJobPosition = JobPositionFactory.build()
    vi.spyOn(prisma.jobPosition, 'findUnique').mockResolvedValueOnce(
      expectedJobPosition
    )

    const result = await jobPositionService.getJobPositionById(
      expectedJobPosition.id
    )

    expect(result).toEqual(expectedJobPosition)
  })
})

describe('createJobPosition', () => {
  it('creates and returns a Job Position', async () => {
    const expectedJobPosition = JobPositionFactory.build()

    vi.spyOn(prisma.jobPosition, 'create').mockResolvedValueOnce(
      expectedJobPosition
    )

    const result = await jobPositionService.createJobPosition({
      name: expectedJobPosition.name,
    })

    expect(result).toEqual(expectedJobPosition)
  })
})

describe('updateJobPositionById', () => {
  it('updates and returns a Job Position', async () => {
    const existingJobPosition = JobPositionFactory.build()
    const newJobPosition = JobPositionFactory.build()

    vi.spyOn(prisma.jobPosition, 'update').mockResolvedValueOnce(newJobPosition)

    const result = await jobPositionService.updateJobPositionById(
      existingJobPosition.id,
      {
        name: newJobPosition.name,
      }
    )

    expect(result).toEqual(newJobPosition)
  })
})

describe('deleteJobPositionById', () => {
  it('deletes a JobPosition and returns the id', async () => {
    const existingJobPosition = JobPositionFactory.build()

    vi.spyOn(prisma.jobPosition, 'delete').mockResolvedValueOnce(
      existingJobPosition
    )

    const result = await jobPositionService.deleteJobPositionById(
      existingJobPosition.id
    )

    expect(result).toEqual(existingJobPosition.id)
  })
})
