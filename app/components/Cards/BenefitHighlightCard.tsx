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
    <Box className="grid h-full grid-cols-5 items-stretch gap-2 overflow-hidden rounded-3xl xl:flex-row">
      {/* Imagen */}
      <img
        src={benefitHighlight.image?.url}
        className="col-span-5 w-full bg-white object-cover md:col-span-3"
        alt="Highlight"
      />

      <div className="col-span-5 p-4 md:col-span-2">
        {/* Título */}
        <Title as="h3">{benefitHighlight.title}</Title>

        {/* Descripción */}
        <p className="mt-2 whitespace-pre-wrap text-gray-700">
          {benefitHighlight.description}
        </p>

        <div className="mt-5">
          {/* Botón */}
          <Button
            href={benefitHighlight.buttonHref}
            external={isValidURL(benefitHighlight.buttonHref)}
            className="w-auto"
          >
            {benefitHighlight.buttonText}
          </Button>
        </div>
      </div>
    </Box>
  )
}
