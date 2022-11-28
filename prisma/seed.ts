import { CompanyStatus, EmployeeStatus, PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface CountryJSON {
  name: string
  code: string
  iso: string
}

const cryptoNetworks = [
  {
    name: 'Binance Smart Chain',
    networkIdNumber: 56,
  },
  {
    name: 'Binance Smart Chain (Testnet)',
    networkIdNumber: 97,
  },
]

const cryptoCurrencies = [
  {
    name: 'Binance USD',
    acronym: 'BUSD',
    network: cryptoNetworks[0],
  },
  {
    name: 'Binance USD (Testnet)',
    acronym: 'BUSD',
    network: cryptoNetworks[1],
  },
]

const banks = [
  {
    name: 'Bancolombia',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'Banco de Bogotá',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'Davivienda',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'BBVA',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'Banco de Occidente',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'Banco Agrario',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
  {
    name: 'Colpatria',
    country: 'Colombia',
    fee: { name: 'Costo de transferencia', value: 3245 },
  },
]

const bankAccountTypes = ['Ahorro', 'Corriente']

const companyCategories = [
  'Agricultura',
  'Comercio',
  'Construcción',
  'Educación',
  'Reclutamiento',
  'Salud',
  'Transporte',
]

const currencies = [{ name: 'Peso colombiano', code: 'COP' }]

const identityDocumentTypes = ['Cédula de Identidad', 'Pasaporte']

const jobDepartments = [
  'Directiva',
  'Finanzas',
  'Mercadeo',
  'Operaciones',
  'Recursos Humanos',
  'Tecnología',
]

const jobPositions = [
  'Administrador',
  'Asesor Legal',
  'Cocinero',
  'Mensajero',
  'Operario',
  'Programador',
  'Tesorero',
  'Vendedor',
]

// const statesAndCitiesOfColombia = [
//   {
//     state: 'Amazonas',
//     cities: ['El encanto', 'La chorrera'],
//   },
//   {
//     state: 'Antioquia',
//     cities: ['Medellín'],
//   },
//   {
//     state: 'Bogotá',
//     cities: ['Bogotá'],
//   },
// ]

const genders = ['Masculino', 'Femenino', 'Otro']

async function main() {
  console.info('Seeding...')

  const rawFile = fs.readFileSync(
    path.resolve(__dirname, 'data/countries.json'),
    'utf8'
  )

  const countriesData: CountryJSON[] = JSON.parse(rawFile)

  const upsertCountries = countriesData.map((country) =>
    prisma.country.upsert({
      where: {
        name: country.name,
      },
      update: {},
      create: {
        name: country.name,
        phoneCode: country.code,
        code2: country.iso,
      },
    })
  )

  await prisma.$transaction(upsertCountries)

  const upsertCryptoNetworks = cryptoNetworks.map((network) =>
    prisma.cryptoNetwork.upsert({
      where: {
        name: network.name,
      },
      create: {
        name: network.name,
        networkIdNumber: network.networkIdNumber,
      },
      update: {
        name: network.name,
        networkIdNumber: network.networkIdNumber,
      },
    })
  )

  await prisma.$transaction(upsertCryptoNetworks)

  const upsertCryptocurrencies = cryptoCurrencies.map((cryptocurrency) =>
    prisma.cryptocurrency.upsert({
      where: {
        name: cryptocurrency.name,
      },
      create: {
        name: cryptocurrency.name,
        acronym: cryptocurrency.acronym,
      },
      update: {
        name: cryptocurrency.name,
        acronym: cryptocurrency.acronym,
      },
    })
  )

  const existingBanks = await prisma.bank.findMany()

  if (existingBanks.length === 0) {
    const createBanks = banks.map((bank) => {
      return prisma.bank.create({
        data: {
          name: bank.name,
          fee: {
            create: {
              ...bank.fee,
            },
          },
          country: {
            connect: {
              name: bank.country,
            },
          },
        },
      })
    })

    await prisma.$transaction(createBanks)
  }

  const upsertBankAccountTypes = bankAccountTypes.map((accountType) =>
    prisma.bankAccountType.upsert({
      where: {
        name: accountType,
      },
      update: {},
      create: {
        name: accountType,
      },
    })
  )

  const upsertCompanyCategories = companyCategories.map((companyCategory) =>
    prisma.companyCategory.upsert({
      where: {
        name: companyCategory,
      },
      update: {},
      create: {
        name: companyCategory,
      },
    })
  )

  const upsertCurrencies = currencies.map((currency) =>
    prisma.currency.upsert({
      where: {
        code: currency.code,
      },
      update: {},
      create: {
        name: currency.name,
        code: currency.code,
      },
    })
  )

  const upsertIdentityDocumentTypes = identityDocumentTypes.map(
    (documentType) =>
      prisma.identityDocumentType.upsert({
        where: {
          name: documentType,
        },
        update: {},
        create: {
          name: documentType,
        },
      })
  )

  const upsertJobPositions = jobPositions.map((jobPosition) =>
    prisma.jobPosition.upsert({
      where: {
        name: jobPosition,
      },
      update: {},
      create: {
        name: jobPosition,
      },
    })
  )

  const upsertJobDepartments = jobDepartments.map((jobDepartment) =>
    prisma.jobDepartment.upsert({
      where: {
        name: jobDepartment,
      },
      update: {},
      create: {
        name: jobDepartment,
      },
    })
  )

  const upsertGenders = genders.map((gender) =>
    prisma.gender.upsert({
      where: {
        name: gender,
      },
      update: {},
      create: {
        name: gender,
      },
    })
  )

  // todo: refactor to an upsert
  // const colombia = await prisma.country.findFirst({
  //   where: {
  //     name: 'Colombia',
  //   },
  // })

  // if (colombia) {
  //   statesAndCitiesOfColombia.map(async (item) => {
  //     const { state, cities } = item
  //     const stateExists = await prisma.state.findFirst({
  //       where: { name: state },
  //     })
  //     if (stateExists) return
  //     return prisma.state.create({
  //       data: {
  //         name: state,
  //         cities: {
  //           createMany: {
  //             data: cities.map((city) => ({ name: city })),
  //             skipDuplicates: true,
  //           },
  //         },
  //         country: {
  //           connect: {
  //             id: colombia.id,
  //           },
  //         },
  //       },
  //     })
  //   })
  // }

  const testUserEmail = 'user@test.com'
  const testUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  })
  const hashedPassword = await bcrypt.hash('123123', 10)

  if (!testUser) {
    await prisma.employee.create({
      data: {
        status: EmployeeStatus.ACTIVE,
        company: {
          create: {
            name: 'Pirates of the Caribbean Company [TEST]',
            description: 'The official company of pirates',
            status: CompanyStatus.ACTIVE,
          },
        },
        user: {
          create: {
            firstName: 'Jack',
            lastName: 'Sparrow',
            email: testUserEmail,
            password: hashedPassword,
          },
        },
      },
    })
  }

  await prisma.adminUser.upsert({
    where: {
      email: 'admin@test.com',
    },
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
    },
    update: {},
  })

  const upsertRequestReason = async () => {
    const requestReasonName = 'Emergencia'
    const exists = await prisma.payrollAdvanceRequestReason.findFirst({
      where: {
        name: requestReasonName,
      },
    })

    if (!exists) {
      return await prisma.payrollAdvanceRequestReason.create({
        data: {
          name: requestReasonName,
        },
      })
    }
  }

  /** We make every upsert in a separate transaction to make sure that they don't
   *  interfere with each other.
   */
  await upsertRequestReason()
  await prisma.$transaction(upsertBankAccountTypes)
  await prisma.$transaction(upsertCompanyCategories)
  await prisma.$transaction(upsertCurrencies)
  await prisma.$transaction(upsertIdentityDocumentTypes)
  await prisma.$transaction(upsertJobPositions)
  await prisma.$transaction(upsertJobDepartments)
  await prisma.$transaction(upsertCryptocurrencies)
  await prisma.$transaction(upsertGenders)

  console.info(`Seeding finished.`)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
