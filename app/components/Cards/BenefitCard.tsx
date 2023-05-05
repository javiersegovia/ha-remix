import type { Benefit, BenefitCategory, Image } from '@prisma/client'

import clsx from 'clsx'
import { Link } from '@remix-run/react'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

export interface BenefitCardProps
  extends Pick<Benefit, 'id' | 'name' | 'buttonText' | 'buttonHref'> {
  mainImage?: Pick<Image, 'url'> | null
  benefitCategory?: Pick<BenefitCategory, 'hexColor' | 'opacity'> | null
}

export const BenefitCard = ({
  id,
  name,
  mainImage,
  benefitCategory,
}: BenefitCardProps) => {
  const { hexColor, opacity } = benefitCategory || {}
  const biggestWordInTheName = name
    .split(' ')
    .sort((a, b) => b.length - a.length)?.[0]

  return (
    <Link to={`/dashboard/benefits/${id}/details`}>
      <Box
        className="relative flex h-[302px] w-full flex-1 flex-col justify-between space-y-5 overflow-hidden bg-cover p-5 shadow-xl"
        style={{
          backgroundImage: mainImage?.url
            ? `url(${mainImage?.url})`
            : undefined,
        }}
      >
        <div
          className={clsx(
            'absolute top-0 bottom-0 left-0 right-0',
            !hexColor && 'bg-gray-900',
            !opacity && 'opacity-50'
          )}
          style={{
            backgroundColor: hexColor || undefined,
            opacity: opacity || undefined,
          }}
        />

        <div className="z-10 flex h-full w-full flex-col text-center">
          <Title
            as="h3"
            className={clsx(
              'mt-auto mb-3 break-words text-white',
              biggestWordInTheName?.length >= 10 && 'text-lg'
            )}
          >
            {name}
          </Title>
        </div>
      </Box>
    </Link>
  )
}
