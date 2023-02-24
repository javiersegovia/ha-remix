import type { BenefitHighlight, Image } from '@prisma/client'

import { isValidURL } from '~/utils/isValidURL'
import { Button } from '../Button'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

interface BenefitHighlightCardProps {
  benefitHighlight: Pick<
    BenefitHighlight,
    'title' | 'buttonHref' | 'buttonText' | 'description'
  > & {
    image: Pick<Image, 'url'> | null
  }
}

export const BenefitHighlightCard = ({
  benefitHighlight,
}: BenefitHighlightCardProps) => {
  return (
    <Box className="flex h-full flex-col items-center gap-2 overflow-hidden rounded-lg xl:flex-row">
      <img
        src={benefitHighlight.image?.url}
        className="max-h-72 w-full bg-white object-cover"
        alt="Highlight"
      />
      <div className="p-4">
        <Title as="h3">{benefitHighlight.title}</Title>
        <p className="mt-2 whitespace-pre-wrap text-gray-700">
          {benefitHighlight.description}
        </p>
        <div className="inline-block w-full lg:max-w-[14rem]">
          <Button
            href={benefitHighlight.buttonHref}
            external={isValidURL(benefitHighlight.buttonHref)}
            className="mt-5"
          >
            {benefitHighlight.buttonText}
          </Button>
        </div>
      </div>
    </Box>
  )
}
