import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

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
      className={clsx(
        'block text-2xl font-bold text-steelBlue-600',
        (Element === 'h4' || Element === 'h5') && `text-lg`,
        className
      )}
      {...props}
    >
      {children}
    </Element>
  )
}
