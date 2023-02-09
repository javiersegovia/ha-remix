import { CompanyStatus, EmployeeStatus } from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { CompanyFactory } from '../company/company.factory'
import { EmployeeFactory } from '../employee/employee.factory'
import { GlobalSettingsFactory } from '../global-settings/global-settings.factory'
import { calculatePremiumAdvanceSpecs } from './premium-advance.server'

beforeEach(async () => {
  await truncateDB()
})

describe('calculatePremiumAdvanceSpecs', () => {
  it(`calculates the premium advance specs correctly`, async () => {
    const globalSettings = await GlobalSettingsFactory.create({
      transportationAid: 1000,
    })

    const company = await CompanyFactory.create({
      status: CompanyStatus.ACTIVE,
    })

    const employee = await EmployeeFactory.create(
      {
        status: EmployeeStatus.ACTIVE,
        salaryFiat: 200000,
      },
      {
        associations: { company },
      }
    )

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2020, 0, 20))

    // const result = await calculatePremiumAdvanceSpecs(employee.id)

    vi.useRealTimers()

    // console.log('date_now', new Date())
  })
})
