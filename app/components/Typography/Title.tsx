import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children?: ReactNode
}

export const Title = ({
  as: Element = 'h2',
  className,
  children,
  ...props
}: TitleProps) => {
  return (
    <Element
      className={twMerge(
        clsx(
          'block text-2xl font-semibold text-gray-800',
          Element === 'h1' && `lg:text-3xl`,
          Element === 'h3' && `lg:text-xl`,
          Element === 'h4' && `text-lg`,
          (Element === 'h5' || Element === 'h6') && `text-base`
        ),
        className
      )}
      {...props}
    >
      {children}
    </Element>
  )
}
