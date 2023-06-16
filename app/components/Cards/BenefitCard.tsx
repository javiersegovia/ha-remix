import type { Benefit, BenefitCategory, Image } from '@prisma/client'

import clsx from 'clsx'
import { Link } from '@remix-run/react'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

export interface BenefitCardProps
  extends Pick<Benefit, 'id' | 'name' | 'buttonText' | 'buttonHref'> {
  mainImage?: Pick<Image, 'url'> | null
  benefitCategory?: Pick<BenefitCategory, 'hexColor'> | null
}

export const BenefitCard = ({
  id,
  name,
  mainImage,
  benefitCategory,
}: BenefitCardProps) => {
  const { hexColor } = benefitCategory || {}
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
            'absolute bottom-0 left-0 right-0 top-0',
            !hexColor && 'bg-gray-900'
          )}
          style={{
            backgroundColor: hexColor || undefined,
            opacity: 0.5,
          }}
        />

        <div className="z-10 flex h-full w-full flex-col text-center">
          <Title
            as="h3"
            className={clsx(
              'mb-3 mt-auto break-words text-white',
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
