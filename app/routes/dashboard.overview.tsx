import type { BenefitCategory, Gender, User } from '@prisma/client'
import type { LoaderArgs } from '@remix-run/server-runtime'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

import { prisma } from '~/db.server'
import { Title } from '~/components/Typography/Title'
import { BenefitCard } from '~/components/Cards/BenefitCard'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'
import { requireEmployee } from '~/session.server'
import { Container } from '~/components/Layout/Container'
import { Carousel } from '~/components/Carousels/Carousel'
import { BenefitHighlightCard } from '~/components/Cards/BenefitHighlightCard'
import { Button } from '~/components/Button'
import { capitalizeFirstLetter } from '~/utils/capitalizeFirstLetter'
import { badRequest } from '~/utils/responses'

export type DashboardIndexLoaderData = {
  gender: Pick<Gender, 'name'> | null
  user: Pick<User, 'firstName'>
  benefits: Awaited<ReturnType<typeof prisma.benefit.findMany>>
  company: NonNullable<Awaited<ReturnType<typeof getEmployeeData>>>['company']
}

const getEmployeeData = (userId: string) => {
  return prisma.employee.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
    select: {
      availablePoints: true,

      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },

      company: {
        select: {
          name: true,
          description: true,
          logoImage: {
            select: {
              url: true,
            },
          },
          benefits: {
            select: {
              id: true,
            },
          },
        },
      },
      benefits: {
        select: {
          id: true,
          companyBenefit: {
            select: {
              id: true,
            },
          },
        },
      },
      employeeGroups: {
        select: {
          id: true,
          benefits: {
            select: {
              id: true,
              companyBenefit: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      membership: {
        select: { id: true, name: true, benefits: { select: { id: true } } },
      },
    },
  })
}

export const loader = async ({ request }: LoaderArgs) => {
  const employee = await requireEmployee(request)
  const company = await prisma.company.findFirst({
    where: {
      id: employee.companyId,
    },
    select: {
      id: true,
      description: true,
      name: true,
      logoImage: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  })

  if (!company) {
    throw badRequest({
      message: 'No pudimos encontrar la compañía',
      redirect: `/dashboard/overview`,
    })
  }

  const benefits = await getEmployeeEnabledBenefits(employee.userId)

  const benefitHighlights = benefits.reduce((acc, benefit) => {
    if (benefit.benefitHighlight && benefit.isHighlighted) {
      acc.push(benefit.benefitHighlight)
    }
    return acc
  }, [] as BHighlight[])

  const benefitHash: Record<BenefitCategory['id'], BenefitCategory['name']> = {}

  const benefitCategories = benefits.reduce((acc, benefit) => {
    if (benefit.benefitCategory && !benefitHash[benefit.benefitCategory.id]) {
      benefitHash[benefit.benefitCategory.id] = benefit.benefitCategory.name
      acc.push(benefit.benefitCategory)
    }
    return acc
  }, [] as BCategory[])

  const {
    availablePoints,
    user: { firstName },
  } = employee

  return json({
    benefits,
    company,
    benefitHighlights,
    benefitCategories,
    availablePoints,
    firstName,
  })
}

type BHighlight = Awaited<
  ReturnType<typeof getEmployeeEnabledBenefits>
>[0]['benefitHighlight']

type BCategory = Awaited<
  ReturnType<typeof getEmployeeEnabledBenefits>
>[0]['benefitCategory']

export default function DashboardIndexRoute() {
  const {
    benefitHighlights,
    benefitCategories,
    benefits,
    company,
    availablePoints,
    firstName,
  } = useLoaderData<typeof loader>()

  const carouselBenefitHighlights = benefitHighlights.slice(0, 3)

  const [selectedBenefitCategoryId, setSelectedBenefitCategoryId] =
    useState<number>()

  const filteredBenefits = selectedBenefitCategoryId
    ? benefits.filter(
        (benefit) => benefit.benefitCategory?.id === selectedBenefitCategoryId
      )
    : benefits

  return (
    <>
      <div className="relative w-full flex-1 bg-white">
        <section className="overflow-hidden bg-steelBlue-100 pb-16 pt-10">
          <Container>
            <section className="flex flex-col items-center justify-between md:flex-row">
              <Title className="text-center text-steelBlue-600 md:text-left">
                Hola, {firstName && capitalizeFirstLetter(firstName)}
              </Title>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="mx-auto mt-4 text-right md:m-0">
                  <p className="inline md:block">Tienes</p>
                  <p className=" ml-1 inline whitespace-nowrap font-bold text-steelBlue-800 md:ml-0 md:block">
                    {availablePoints} puntos
                  </p>
                </div>

                <Button
                  href="https://puntos.umany.co"
                  external
                  targetBlank
                  size="XS"
                  className="mx-auto w-auto md:m-0"
                >
                  Canjear
                </Button>
              </div>
            </section>

            {benefitHighlights?.length > 0 && (
              <div className="relative z-10 mx-auto mt-10 w-full max-w-screen-xl">
                <Title>
                  {benefitHighlights?.length > 1
                    ? 'Beneficios destacados del mes'
                    : 'Beneficio destacado del mes'}
                </Title>

                <Carousel className="mt-5">
                  {carouselBenefitHighlights.map((benefitHighlight) => (
                    <BenefitHighlightCard
                      key={benefitHighlight!.id}
                      benefitHighlight={benefitHighlight!}
                    />
                  ))}
                </Carousel>
              </div>
            )}
          </Container>
        </section>

        <section className="bg-white py-10 lg:px-10">
          <section className="mx-auto grid grid-cols-[minmax(170px,_300px)] items-center justify-center gap-4 sm:grid-cols-[repeat(auto-fit,minmax(170px,_200px))] md:gap-5 lg:grid-cols-[repeat(auto-fit,minmax(170px,_1fr))] lg:items-stretch xl:grid-cols-[repeat(5,minmax(170px,200px))]">
            <div className="col-span-full mb-6 border-b-2 border-blue-100 pb-10">
              {!company.logoImage && (
                <Title
                  as="h3"
                  className={twMerge(
                    clsx(
                      'text-center text-steelBlue-600 lg:text-left',
                      !company.description && 'lg:text-center'
                    )
                  )}
                >
                  {company.name}
                </Title>
              )}

              {(company.logoImage?.url || company.description) && (
                <div className="mt-4 flex flex-col items-center justify-center gap-10 lg:flex-row">
                  {company.logoImage?.url && (
                    <img
                      className="w-44 object-contain"
                      src={company.logoImage.url}
                      alt={company.name}
                    />
                  )}

                  {company.description && (
                    <p className="whitespace-pre-wrap text-justify">
                      {company.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {benefitCategories.length > 0 && (
              <div className="col-span-full mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                <button
                  className={twMerge(
                    clsx(
                      'rounded-full bg-blue-100 px-4 py-1',
                      !selectedBenefitCategoryId &&
                        'bg-steelBlue-700 text-white'
                    )
                  )}
                  type="button"
                  onClick={() => setSelectedBenefitCategoryId(undefined)}
                >
                  Todos
                </button>

                {benefitCategories.map((benefitCategory) => (
                  <button
                    key={benefitCategory?.id}
                    className={twMerge(
                      clsx(
                        'rounded-full bg-blue-100 px-4 py-1',
                        benefitCategory?.id === selectedBenefitCategoryId &&
                          'bg-steelBlue-700 text-white'
                      )
                    )}
                    type="button"
                    onClick={() =>
                      setSelectedBenefitCategoryId(benefitCategory?.id)
                    }
                  >
                    {benefitCategory?.name}
                  </button>
                ))}
              </div>
            )}

            {filteredBenefits.map(
              ({
                id,
                name,
                buttonHref,
                buttonText,
                mainImage,
                benefitCategory,
              }) => (
                <BenefitCard
                  id={id}
                  key={id}
                  name={name}
                  buttonText={buttonText}
                  buttonHref={buttonHref}
                  mainImage={mainImage}
                  benefitCategory={benefitCategory}
                />
              )
            )}
          </section>
        </section>
     
      </div>
      <Button
      href="https://api.whatsapp.com/send?phone=573228157785&text=Hola, quiero más información" target="_blank"
      icon='WHATSAPP'
      design='FAB'
      className="fixed bottom-10 right-10 z-50 w-20 h-20 bg-green-500 hover:bg-blue-950"
      >
      </Button>
    {/*   <div className="fixed bottom-10 right-10 z-50 w-20 h-20">
        <span className='mr-8'>¡Contáctanos!</span>
    <a href="https://api.whatsapp.com/send?phone=573228157785&text=Hola, quiero más información" target="_blank">
     <img src="/images/icon/icon_whatsapp.svg" className="w-20 h-20" alt='¡Contáctanos ahora mismo en WhatsApp!'/>
    </a>
  </div> */}

      <Outlet />
    </>
  )
}
