import type {
  AgeRange,
  City,
  Company,
  Country,
  EmployeeGroup,
  Gender,
  JobDepartment,
  SalaryRange,
  State,
} from '@prisma/client'

import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'

type ExtendedEmployeeGroup = EmployeeGroup & {
  company?: Company
  country?: Country
  state?: State
  city?: City
  gender?: Gender
  jobDepartment?: JobDepartment
  ageRange?: AgeRange
  salaryRange?: SalaryRange
}

export const EmployeeGroupFactory = Factory.define<ExtendedEmployeeGroup>(
  ({ onCreate, associations }) => {
    const {
      company,
      country,
      state,
      city,
      gender,
      jobDepartment,
      ageRange,
      salaryRange,
    } = associations

    if (!company) {
      throw new Error('Missing associations at EmployeeGroupFactory')
    }

    onCreate((employeeGroup) => {
      const { id, createdAt, updatedAt, name } = employeeGroup
      return prisma.employeeGroup.create({
        data: {
          id,
          createdAt,
          updatedAt,
          name,
          company: connect(company.id),
          country: connect(country?.id),
          state: connect(state?.id),
          city: connect(city?.id),
          gender: connect(gender?.id),
          jobDepartment: connect(jobDepartment?.id),
          ageRange: connect(ageRange?.id),
          salaryRange: connect(salaryRange?.id),
        },
      })
    })

    return {
      id: faker.datatype.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),

      name: faker.datatype.string(),

      companyId: company?.id,
      countryId: country?.id || null,
      stateId: state?.id || null,
      cityId: city?.id || null,
      genderId: gender?.id || null,
      jobDepartmentId: jobDepartment?.id || null,
      ageRangeId: ageRange?.id || null,
      salaryRangeId: salaryRange?.id || null,
    }
  }
)
