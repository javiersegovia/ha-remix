import { prisma } from '~/db.server'
import { JobDepartmentFactory } from './job-department.factory'
import {
  getJobDepartments,
  createJobDepartment,
  updateJobDepartmentById,
} from './job-department.server'
import {
  getJobDepartmentById,
  deleteJobDepartmentById,
} from './job-department.server'

describe('getJobDepartments', () => {
  it('Returns an array of job Departments', async () => {
    // Arrange
    const jobDepartments = JobDepartmentFactory.buildList(3)

    vi.spyOn(prisma.jobDepartment, 'findMany').mockResolvedValueOnce(
      jobDepartments
    )

    // Act

    const result = await getJobDepartments()

    //Assert
    expect(prisma.jobDepartment.findMany).toHaveBeenCalledOnce()
    expect(prisma.jobDepartment.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    expect(result).toEqual(jobDepartments)
  })
})

describe('getJobDepartmentById', () => {
  it('Returns a job Department', async () => {
    // Arrange
    const jobDepartments = JobDepartmentFactory.build()

    vi.spyOn(prisma.jobDepartment, 'findUnique').mockResolvedValueOnce(
      jobDepartments
    )

    // Act
    const result = await getJobDepartmentById(jobDepartments.id)

    // Assert
    expect(prisma.jobDepartment.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(jobDepartments)
  })
})

describe('createJobDepartment', () => {
  it('creates and returns a Job Department', async () => {
    // Arrange
    const jobDepartments = JobDepartmentFactory.build()

    vi.spyOn(prisma.jobDepartment, 'create').mockResolvedValueOnce(
      jobDepartments
    )

    // Act
    const result = await createJobDepartment({
      name: jobDepartments.name,
    })

    // Asserve
    expect(result).toEqual(jobDepartments)
  })
})

describe('updateJobDepartmentById', () => {
  it('updates and returns a Job Department', async () => {
    // Arrange
    const existingJobDepartment = JobDepartmentFactory.build()
    const newJobDepartment = JobDepartmentFactory.build()

    vi.spyOn(prisma.jobDepartment, 'update').mockResolvedValueOnce(
      newJobDepartment
    )
    // Act
    const result = await updateJobDepartmentById(existingJobDepartment.id, {
      name: newJobDepartment.name,
    })

    // Assert

    expect(result).toEqual(newJobDepartment)
  })
})

describe('deleteJobDepartmentById', () => {
  it('deletes a Job Department and returns the id', async () => {
    // Arrange
    const existingJobDepartment = JobDepartmentFactory.build()

    vi.spyOn(prisma.jobDepartment, 'delete').mockResolvedValueOnce(
      existingJobDepartment
    )

    // Act
    const result = await deleteJobDepartmentById(existingJobDepartment.id)

    // Assert
    expect(result).toEqual(existingJobDepartment.id)
  })
})
