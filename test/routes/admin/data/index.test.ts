import { vi } from 'vitest'
import { prisma } from '~/db.server'
import { loader as adminDashboardDataIndexLoader } from '~/routes/admin.dashboard.data._index'

vi.mock('~/session.server', () => {
  return {
    requireAdminUserId: () => 'adminUser123',
  }
})

describe('AdminDashboardDataIndexRoute Loader', () => {
  it('returns an object with the correct keys', async () => {
    vi.spyOn(prisma.bank, 'count').mockResolvedValue(3)
    vi.spyOn(prisma.jobPosition, 'count').mockResolvedValue(5)
    vi.spyOn(prisma.jobDepartment, 'count').mockResolvedValue(4)
    vi.spyOn(prisma.companyCategory, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.benefitCategory, 'count').mockResolvedValue(10)
    vi.spyOn(prisma.city, 'count').mockResolvedValue(6)
    vi.spyOn(prisma.state, 'count').mockResolvedValue(8)
    vi.spyOn(prisma.gender, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.currency, 'count').mockResolvedValue(3)
    vi.spyOn(prisma.country, 'count').mockResolvedValue(5)
    vi.spyOn(prisma.bankAccountType, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.identityDocumentType, 'count').mockResolvedValue(4)
    vi.spyOn(prisma.salaryRange, 'count').mockResolvedValue(8)
    vi.spyOn(prisma.ageRange, 'count').mockResolvedValue(9)

    const response: Response = await adminDashboardDataIndexLoader({
      request: new Request(`http://localhost:3000/admin/dashboard/data`),
      params: {},
      context: {},
    })
    expect(response.status).toEqual(200)

    const result = await response.json()

    expect(result).toEqual({
      rows: [
        {
          rowId: 'job-departments',
          items: ['Áreas de trabajo', 4],
          href: '/admin/dashboard/data/job-departments',
        },
        {
          rowId: 'banks',
          items: ['Bancos', 3],
          href: '/admin/dashboard/data/banks',
        },
        {
          rowId: 'job-positions',
          items: ['Cargos de trabajo', 5],
          href: '/admin/dashboard/data/job-positions',
        },
        {
          rowId: 'company-categories',
          items: ['Categorías de compañías', 2],
          href: '/admin/dashboard/data/company-categories',
        },
        {
          rowId: 'benefit-categories',
          items: ['Categorías de beneficios', 10],
          href: '/admin/dashboard/data/benefit-categories',
        },
        {
          rowId: 'cities',
          items: ['Ciudades', 6],
          href: '/admin/dashboard/data/cities',
          isDisabled: true,
        },
        {
          rowId: 'states',
          items: ['Estados', 8],
          href: '/admin/dashboard/data/states',
          isDisabled: true,
        },
        {
          rowId: 'genders',
          items: ['Géneros', 2],
          href: '/admin/dashboard/data/genders',
        },
        {
          rowId: 'currencies',
          items: ['Monedas', 3],
          href: '/admin/dashboard/data/currencies',
          isDisabled: true,
        },
        {
          rowId: 'countries',
          items: ['Países', 5],
          href: '/admin/dashboard/data/countries',
          isDisabled: true,
        },
        {
          rowId: 'age-ranges',
          items: ['Rangos de edad', 9],
          href: '/admin/dashboard/data/age-ranges',
        },
        {
          rowId: 'salary-ranges',
          items: ['Rangos salariales', 8],
          href: '/admin/dashboard/data/salary-ranges',
        },
        {
          rowId: 'bank-account-types',
          items: ['Tipos de cuenta bancaria', 2],
          href: '/admin/dashboard/data/bank-account-types',
        },
        {
          rowId: 'identity-document-types',
          items: ['Tipos de documento de identidad', 4],
          href: '/admin/dashboard/data/identity-document-types',
        },
      ],
    })
  })
})
