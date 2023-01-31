import type { JobDepartment } from '@prisma/client'

import { prisma } from '~/db.server'
import { JobDepartmentFactory } from './job-department.factory'
import * as jobDepartmentService from './job-department.server'

describe('getJobDepartments', () => {
  it('returns an array of jobDepartments', async () => {
    const jobDepartments = JobDepartmentFactory.buildList(3)

    vi.spyOn(prisma.jobDepartment, 'findMany').mockResolvedValueOnce(
      jobDepartments
    )

    const result = await jobDepartmentService.getJobDepartments()
    expect(result).toEqual<Pick<JobDepartment, 'id' | 'name'>[]>(jobDepartments)
  })
})
