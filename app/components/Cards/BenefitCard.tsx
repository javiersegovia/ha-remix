import type { Benefit, BenefitCategory, Image } from '@prisma/client'

import clsx from 'clsx'

import { isValidURL } from '~/utils/isValidURL'
import { Button } from '../Button'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

export interface BenefitCardProps
  extends Pick<Benefit, 'name' | 'buttonText' | 'buttonHref'> {
  mainImage?: Pick<Image, 'url'> | null
  benefitCategory?: Pick<BenefitCategory, 'hexColor' | 'opacity'> | null
}

export const BenefitCard = ({
  name,
  buttonText,
  buttonHref,
  mainImage,
  benefitCategory,
}: BenefitCardProps) => {
  const { hexColor, opacity } = benefitCategory || {}

  return (
    <Box
      className="relative flex h-[302px] w-full flex-1 flex-col justify-between space-y-5 overflow-hidden bg-cover p-5 shadow-xl"
      style={{
        backgroundImage: mainImage?.url ? `url(${mainImage?.url})` : undefined,
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
        <Title as="h3" className="mt-auto mb-3 text-white">
          {name}
        </Title>

        {/* If isValidURL returns true, then it means the URL must be an externa route */}
        {buttonHref && isValidURL(buttonHref) ? (
          <a
            className="block"
            href={buttonHref}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button type="button" size="XS">
              {buttonText || 'Próximamente'}
            </Button>
          </a>
        ) : (
          <Button
            href={buttonHref || undefined}
            type="button"
            disabled={!buttonHref}
            className={clsx(
              !buttonHref && 'bg-gray-300 text-gray-400 opacity-100'
            )}
            size="XS"
          >
            {(buttonHref && buttonText) || 'Próximamente'}
          </Button>
        )}
      </div>
    </Box>
  )
}
