import { vi } from 'vitest'
import { prisma } from '~/db.server'
import { loader as adminDashboardDataIndexLoader } from '~/routes/admin/dashboard/data'

vi.mock('~/session.server', () => {
  return {
    requireAdminUserId: () => 'adminUser123',
  }
})

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('AdminDashboardDataIndexRoute Loader', () => {
  it('returns an object with the correct keys', async () => {
    vi.spyOn(prisma.bank, 'count').mockResolvedValue(3)
    vi.spyOn(prisma.jobPosition, 'count').mockResolvedValue(5)
    vi.spyOn(prisma.jobDepartment, 'count').mockResolvedValue(4)
    vi.spyOn(prisma.companyCategory, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.city, 'count').mockResolvedValue(6)
    vi.spyOn(prisma.state, 'count').mockResolvedValue(8)
    vi.spyOn(prisma.gender, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.currency, 'count').mockResolvedValue(3)
    vi.spyOn(prisma.country, 'count').mockResolvedValue(5)
    vi.spyOn(prisma.bankAccountType, 'count').mockResolvedValue(2)
    vi.spyOn(prisma.identityDocumentType, 'count').mockResolvedValue(4)

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
          key: 'job-departments',
          items: ['Áreas de trabajo', 4],
          href: '/admin/dashboard/data/job-departments',
          isDisabled: true,
        },
        {
          key: 'banks',
          items: ['Bancos', 3],
          href: '/admin/dashboard/data/banks',
          isDisabled: true,
        },
        {
          key: 'job-positions',
          items: ['Cargos de trabajo', 5],
          href: '/admin/dashboard/data/job-positions',
          isDisabled: true,
        },
        {
          key: 'company-categories',
          items: ['Categorías de compañías', 2],
          href: '/admin/dashboard/data/company-categories',
          isDisabled: true,
        },
        {
          key: 'cities',
          items: ['Ciudades', 6],
          href: '/admin/dashboard/data/cities',
          isDisabled: true,
        },
        {
          key: 'states',
          items: ['Estados', 8],
          href: '/admin/dashboard/data/states',
          isDisabled: true,
        },
        {
          key: 'genders',
          items: ['Géneros', 2],
          href: '/admin/dashboard/data/genders',
          isDisabled: true,
        },
        {
          key: 'currencies',
          items: ['Monedas', 3],
          href: '/admin/dashboard/data/currencies',
          isDisabled: true,
        },
        {
          key: 'countries',
          items: ['Países', 5],
          href: '/admin/dashboard/data/countries',
          isDisabled: true,
        },
        {
          key: 'bank-account-types',
          items: ['Tipos de cuenta bancaria', 2],
          href: '/admin/dashboard/data/bank-account-types',
          isDisabled: true,
        },
        {
          key: 'identity-document-types',
          items: ['Tipos de documento de identidad', 4],
          href: '/admin/dashboard/data/identity-document-types',
          isDisabled: true,
        },
      ],
    })
  })
})
