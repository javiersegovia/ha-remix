import type { Prisma } from '@prisma/client'
import { prisma } from '~/db.server'
import type { CreateCompanySchemaInput } from '~/schemas/createCompany.schema'

export const getCompanies = async () => {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

export const createCompany = async (formData: CreateCompanySchemaInput) => {
  const {
    country,
    // contactPerson, // Todo: add contact person to schema

    status,

    paymentDays,
    dispersion,
    lastRequestDay,

    premiumPaymentDays,
    premiumDispersion,
    premiumLastRequestDay,

    ...companyData
  } = formData

  // const { firstName, lastName, phone } = contactPerson || {}

  // const createContactPerson: Prisma.CompanyCreateInput['contactPerson'] =
  //   firstName && lastName && phone
  //     ? {
  //         create: {
  //           firstName,
  //           lastName,
  //           phone,
  //         },
  //       }
  //     : {}

  const connectCountry: Prisma.CompanyCreateInput['country'] = country?.id
    ? { connect: { id: country?.id } }
    : {}

  try {
    const company = await prisma.company.create({
      data: {
        ...companyData,
        country: connectCountry,

        // categories: connectCategories, // todo Add CompanyCategories
        // contactPerson: createContactPerson,
        status: status.value,

        paymentDays: paymentDays || {
          set: [],
        },
        dispersion: dispersion || null,
        lastRequestDay: lastRequestDay || null,

        premiumPaymentDays: premiumPaymentDays || {
          set: [],
        },
        premiumDispersion: premiumDispersion || null,
        premiumLastRequestDay: premiumLastRequestDay || null,
      },
      select: {
        id: true,
      },
    })

    return { company }
  } catch (err) {
    return { error: err }
  }
}
