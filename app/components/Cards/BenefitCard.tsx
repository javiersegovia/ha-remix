import { Button } from '../Button'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

export interface BenefitCardProps {
  title: string
  imageUrl: string
  button: {
    text: string
    href?: string
    external?: boolean
  }
}

export const BenefitCard = ({ title, imageUrl, button }: BenefitCardProps) => {
  return (
    <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
      <Title as="h4">{title}</Title>
      <img className="mx-auto" src={imageUrl} alt="Icon" />

      {button.href && button.external ? (
        <a
          className="block"
          href={button.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button type="button">{button.text}</Button>
        </a>
      ) : (
        <Button href={button.href} type="button" disabled={!button.href}>
          {button.text}
        </Button>
      )}
    </Box>
  )
}
