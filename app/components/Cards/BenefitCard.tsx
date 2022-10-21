// import type { IconType } from 'react-icons'

import { BiDollarCircle } from 'react-icons/bi'
import {
  MdMenuBook,
  MdOutlineHealthAndSafety,
  MdOutlineSavings,
} from 'react-icons/md'
import { GiFruitBowl } from 'react-icons/gi'
import { IoAirplaneOutline } from 'react-icons/io5'
import { FaHandHoldingHeart } from 'react-icons/fa'

import { Button } from '../Button'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'
import { TbDiscount2 } from 'react-icons/tb'

const benefitIcons = {
  dollar: BiDollarCircle,
  savings: MdOutlineSavings,
  airplane: IoAirplaneOutline,
  book: MdMenuBook,
  health: FaHandHoldingHeart,
  insurance: MdOutlineHealthAndSafety,
  food: GiFruitBowl,
  discount: TbDiscount2,
} as const

export interface BenefitCardProps {
  title: string
  icon: keyof typeof benefitIcons
  button: {
    text: string
    href?: string
    external?: boolean
  }
}

export const BenefitCard = ({ title, icon, button }: BenefitCardProps) => {
  const IconComponent = benefitIcons[icon]
  return (
    <Box className="flex h-full w-full max-w-xs flex-1 flex-col justify-between space-y-5 p-5 shadow-xl">
      <Title as="h4">{title}</Title>
      <IconComponent className="mx-auto text-8xl text-steelBlue-800" />

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
