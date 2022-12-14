import { Button } from '../Button'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

export interface BenefitCardProps {
  title: string
  imageUrl?: string | null
  buttonText?: string | null
  buttonHref?: string | null
}

export const BenefitCard = ({
  title,
  imageUrl,
  buttonText,
  buttonHref,
}: BenefitCardProps) => {
  return (
    <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
      <Title as="h4">{title}</Title>
      {imageUrl && <img className="mx-auto" src={imageUrl} alt="Icon" />}

      {buttonHref && buttonHref.includes('http') ? (
        <a
          className="block"
          href={buttonHref}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button type="button">{buttonText || 'Próximamente'}</Button>
        </a>
      ) : (
        <Button
          href={buttonHref || undefined}
          type="button"
          disabled={!buttonHref}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  )
}
