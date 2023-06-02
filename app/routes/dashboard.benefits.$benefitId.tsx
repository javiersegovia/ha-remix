import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import type { TabItem } from '~/components/Tabs/Tabs'

import { json } from '@remix-run/server-runtime'
import { getEmployeeEnabledBenefits } from '~/services/permissions/permissions.server'
import { getBenefitById } from '~/services/benefit/benefit.server'
import { requireUserId } from '~/session.server'
import { badRequest } from '~/utils/responses'
import { Outlet, useLoaderData } from '@remix-run/react'
import { Container } from '~/components/Layout/Container'
import { GoBack } from '~/components/Button/GoBack'
import { Title } from '~/components/Typography/Title'

import { Button } from '~/components/Button'
import { isValidURL } from '~/utils/isValidURL'
import clsx from 'clsx'
import { FaStar } from 'react-icons/fa'
import { Tabs } from '~/components/Tabs/Tabs'

export const meta: MetaFunction = () => {
  return {
    title: 'Beneficios | HoyTrabajas Beneficios',
  }
}

export type BenefitRouteData = {
  benefit: Awaited<ReturnType<typeof getBenefitById>>
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const { benefitId } = params

  if (!benefitId) {
    throw badRequest({
      message: 'No pudimos encontrar el ID del beneficio',
      redirect: `/dashboard/overview`,
    })
  }

  const benefit = await getBenefitById(parseFloat(benefitId))

  if (!benefit) {
    throw badRequest({
      message: 'No pudimos encontrar el beneficio',
      redirect: `/dashboard/overview`,
    })
  }

  const benefits = await getEmployeeEnabledBenefits(userId)
  const hasBenefit = benefits.some((b) => b.id === parseFloat(benefitId))

  if (!hasBenefit) {
    throw badRequest({
      message:
        'No estás autorizado para visualizar los detalles de este beneficio',
      redirect: `/dashboard/overview`,
    })
  }

  return json({
    benefit,
  })
}

export default function BenefitDetailsRoute() {
  const { benefit } = useLoaderData<typeof loader>()
  const {
    buttonHref,
    buttonText,
    mainImage,
    name,
    isHighlighted,
    shortDescription,
    instructions,
  } = benefit

  const tabItems: TabItem[] = []

  if (instructions?.length > 0) {
    tabItems.push(
      {
        path: `/dashboard/benefits/${benefit.id}/details`,
        title: 'Descripción',
      },
      {
        path: `/dashboard/benefits/${benefit.id}/instructions`,
        title: 'Instrucciones',
      }
    )
  }

  return (
    <Container className="mx-auto my-10 w-full">
      <GoBack redirectTo="/dashboard/overview" />

      <section className="mb-16 flex w-full flex-col sm:flex-row sm:justify-between">
        <div>
          <Title>{name}</Title>
          <div className="mt-10 flex gap-8">
            <div
              className="relative inline-block h-36 w-32 rounded-xl bg-gray-300 bg-cover bg-top"
              style={{
                backgroundImage: mainImage?.url
                  ? `url(${mainImage?.url})`
                  : undefined,
              }}
            />

            <div>
              {isHighlighted && (
                <p className="mt-1 inline-flex items-center gap-2 rounded-3xl bg-indigo-200 px-2 py-1 text-sm font-semibold leading-5 text-indigo-600">
                  <FaStar className="mb-[2px] text-xs" />
                  <span>Destacado</span>
                </p>
              )}

              <p className="mt-4">{shortDescription}</p>
            </div>
          </div>
        </div>

        {/* If isValidURL returns true, then it means the URL must be an externa route */}
        {buttonHref && isValidURL(buttonHref) ? (
          <a
            className="mt-4 block w-full sm:mt-0 sm:w-auto"
            href={buttonHref}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button type="button" size="MD">
              {buttonText || 'Próximamente'}
            </Button>
          </a>
        ) : (
          <div>
            <Button
              href={buttonHref || undefined}
              type="button"
              disabled={!buttonHref}
              size="MD"
              className={clsx(
                'w-full sm:w-auto',
                !buttonHref && 'bg-gray-300 text-gray-400 opacity-100'
              )}
            >
              {(buttonHref && buttonText) || 'Próximamente'}
            </Button>
          </div>
        )}
      </section>

      {tabItems.length > 0 && <Tabs items={tabItems} className="mb-12" />}

      <Outlet />
    </Container>
  )
}
