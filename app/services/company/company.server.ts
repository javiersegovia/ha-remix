import type { Company, Prisma } from '@prisma/client'
import { notFound } from '~/utils/responses'
import { prisma } from '~/db.server'
import type {
  CompanyManagementSchemaInput,
  CompanySchemaInput,
} from '~/services/company/company.schema'
import {
  connect,
  connectMany,
  connectOrDisconnect,
  setMany,
} from '~/utils/relationships'
import { getS3ObjectUrl } from '../aws/s3.server'
import { deleteImageByKey } from '../image/image.server'

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
      employees: {
        _count: 'desc',
      },
    },
  })
}

export const getCompanyById = async (id: Company['id']) => {
  return prisma.company.findUnique({
    where: { id },
    include: {
      logoImage: {
        select: {
          id: true,
          key: true,
          url: true,
        },
      },
      benefits: true,
      categories: true,
      country: true,
      contactPerson: true,
    },
  })
}

// TODO: RequireCompany should be a wrapper around findFirst.
// Right now, the return types are not correct if we add "select" or "include"
// We have to refactor this function to make it work with types.
// https://github.com/prisma/prisma/issues/3372
export const requireCompany = async (
  queryOptions: Prisma.CompanyFindFirstArgs & {
    where: Prisma.CompanyFindFirstArgs['where']
  }
) => {
  const company = await prisma.company.findFirst({
    ...queryOptions,
  })

  if (!company) {
    throw notFound({
      message: 'La compañía no ha sido encontrada',
      redirect: null,
    })
  }

  return company
}

export const createCompany = async (formData: CompanySchemaInput) => {
  const {
    countryId,
    contactPerson,
    categoriesIds,
    benefitsIds,
    status,
    paymentDays,
    dispersion,
    lastRequestDay,
    premiumPaymentDays,
    premiumDispersion,
    premiumLastRequestDay,
    description,
    name,
    address,
    phone: companyPhone,
    logoImageKey,
  } = formData

  const { firstName, lastName, phone } = contactPerson || {}

  // Todo: make some data optional, so we can update the data partially
  const createContactPerson: Prisma.CompanyCreateInput['contactPerson'] =
    firstName && lastName && phone
      ? {
          create: {
            firstName,
            lastName,
            phone,
          },
        }
      : undefined

  try {
    const company = await prisma.company.create({
      data: {
        description,
        name,
        address,
        phone: companyPhone,

        country: connect(countryId),

        categories: connectMany(categoriesIds),
        benefits: connectMany(benefitsIds),

        contactPerson: createContactPerson,
        status,

        logoImage: logoImageKey
          ? {
              create: {
                key: logoImageKey,
                url: getS3ObjectUrl(logoImageKey),
              },
            }
          : undefined,

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
    console.error(err)
    // Todo LOGGER: Log error and save to a file
    return { error: err }
  }
}

export const updateCompanyById = async (
  companyId: Company['id'],
  formData: CompanySchemaInput
) => {
  const {
    countryId,
    categoriesIds,
    benefitsIds,
    contactPerson,
    status,
    paymentDays,
    dispersion,
    lastRequestDay,
    premiumPaymentDays,
    premiumDispersion,
    premiumLastRequestDay,
    logoImageKey,
    ...companyData
  } = formData

  // await requireCompany({ where: { id: companyId } }) // Todo: Make "requireCompany" function return types compatible with Prisma types (e.g, adding an "include")
  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      logoImage: { select: { key: true } },
      contactPerson: { select: { id: true } },
      countryId: true,
    },
  })

  if (!existingCompany) {
    throw notFound({
      message: 'La compañía no ha sido encontrada',
      redirect: null,
    })
  }

  const { firstName, lastName, phone } = contactPerson || {}

  const upsertContactPerson: Prisma.CompanyUpdateInput['contactPerson'] =
    firstName && lastName && phone
      ? {
          upsert: {
            create: {
              firstName,
              lastName,
              phone,
            },
            update: {
              firstName,
              lastName,
              phone,
            },
          },
        }
      : {
          delete: !!existingCompany.contactPerson?.id,
        }

  if (
    existingCompany.logoImage &&
    logoImageKey !== existingCompany.logoImage.key
  ) {
    await deleteImageByKey(existingCompany.logoImage.key)
  }

  const isNewLogoImage = existingCompany.logoImage
    ? existingCompany.logoImage.key !== logoImageKey
    : Boolean(logoImageKey)

  const createLogoImage =
    isNewLogoImage && logoImageKey
      ? {
          create: {
            key: logoImageKey,
            url: getS3ObjectUrl(logoImageKey),
          },
        }
      : undefined

  try {
    const company = await prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        ...companyData,
        country: connectOrDisconnect(countryId, !!existingCompany.countryId),

        categories: setMany(categoriesIds),
        benefits: setMany(benefitsIds),

        contactPerson: upsertContactPerson,
        status,

        logoImage: createLogoImage,

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
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    return { error: err }
  }
}

export const updateCompanyByCompanyManagementForm = async (
  companyId: Company['id'],
  formData: CompanyManagementSchemaInput
) => {
  const {
    countryId,
    categoriesIds,
    benefitsIds: _,
    contactPerson,
    logoImageKey,
    ...companyData
  } = formData

  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      logoImage: { select: { key: true } },
      contactPerson: { select: { id: true } },
      countryId: true,
    },
  })

  if (!existingCompany) {
    throw notFound({
      message: 'La compañía no ha sido encontrada',
      redirect: '/dashboard/overview',
    })
  }

  const { firstName, lastName, phone } = contactPerson || {}

  const upsertContactPerson: Prisma.CompanyUpdateInput['contactPerson'] =
    firstName && lastName && phone
      ? {
          upsert: {
            create: {
              firstName,
              lastName,
              phone,
            },
            update: {
              firstName,
              lastName,
              phone,
            },
          },
        }
      : {
          delete: !!existingCompany.contactPerson?.id,
        }

  if (
    existingCompany.logoImage &&
    logoImageKey !== existingCompany.logoImage.key
  ) {
    await deleteImageByKey(existingCompany.logoImage.key)
  }

  const isNewLogoImage = existingCompany.logoImage
    ? existingCompany.logoImage.key !== logoImageKey
    : Boolean(logoImageKey)

  const createLogoImage =
    isNewLogoImage && logoImageKey
      ? {
          create: {
            key: logoImageKey,
            url: getS3ObjectUrl(logoImageKey),
          },
        }
      : undefined

  try {
    const company = await prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        ...companyData,
        country: connectOrDisconnect(countryId, !!existingCompany.countryId),

        categories: setMany(categoriesIds),

        contactPerson: upsertContactPerson,

        logoImage: createLogoImage,
      },
      select: {
        id: true,
      },
    })

    return { company }
  } catch (err) {
    // Todo LOGGER: Log error and save to a file
    console.error(err)
    return { error: err }
  }
}
