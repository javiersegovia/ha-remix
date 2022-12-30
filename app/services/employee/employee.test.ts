import type { UploadEmployeeSchemaInput } from '~/schemas/upload-employees.schema'
import { prisma } from '~/db.server'
import { CompanyFactory } from '../company/company.factory'
import { faker } from '@faker-js/faker'
import { MembershipFactory } from '../membership/membership.factory'
import { uploadEmployees } from './employee.server'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('uploadEmployees', () => {
  test('should redirect to the company employee list on a successful upload', async () => {
    const company = CompanyFactory.build()
    const membership = MembershipFactory.build()

    const dummyCsvData: UploadEmployeeSchemaInput[] = []

    for (let i = 0; i < 3; i++) {
      dummyCsvData.push({
        CORREO_ELECTRONICO: faker.internet.email(),
        NOMBRE: faker.name.firstName(),
        APELLIDO: faker.name.lastName(),
        MEMBRESIA: membership.name,
        ESTADO: 'Activo',
        CARGO: faker.name.jobTitle(),
        DEPARTAMENTO: faker.name.jobArea(),
        PAIS: faker.address.country(),
        TIPO_DE_CUENTA: 'Corriente',
        NUMERO_DE_CUENTA: faker.datatype.number().toString(),
        TIPO_DE_DOCUMENTO: 'Pasaporte',
        DOCUMENTO_DE_IDENTIDAD: faker.datatype.number().toString(),
        SALARIO: faker.datatype.number().toString(),
        CUPO_APROBADO: faker.datatype.number().toString(),
        CUPO_DISPONIBLE: faker.datatype.number().toString(),
      })
    }

    vi.spyOn(prisma.company, 'findUnique').mockResolvedValue(company)
    vi.spyOn(prisma.user, 'findFirst').mockResolvedValue(null)
  })
})
