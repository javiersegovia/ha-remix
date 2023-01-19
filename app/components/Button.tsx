import type { ButtonHTMLAttributes } from 'react'
import { Link } from '@remix-run/react'
import { HiCheck } from 'react-icons/hi'
import { Spinner } from '~/components/Spinner'
import { twMerge } from 'tailwind-merge'

export type TButtonSizes = 'XS' | 'SM' | 'MD' | 'LG' | 'XL'
export type TButtonVariants =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SUCCESS'
  | 'DARK'
  | 'LIGHT'
  | 'WARNING'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  external?: boolean
  targetBlank?: boolean
  isLoading?: boolean
  showCheckOnSuccess?: boolean
  size?: TButtonSizes
  variant?: TButtonVariants
}

export const Button = ({
  href,
  external = false,
  targetBlank,
  ...props
}: ButtonProps) =>
  href ? (
    external ? (
      <>
        <a
          className="block w-full"
          href={href}
          {...(targetBlank
            ? { target: '_blank', rel: 'noreferrer noopener' }
            : {})}
        >
          <ButtonElement {...props} />
        </a>
      </>
    ) : (
      <Link to={href} className="w-full">
        <ButtonElement {...props} />
      </Link>
    )
  ) : (
    <ButtonElement {...props} />
  )

export const ButtonElement = ({
  type = 'button',
  size = 'MD',
  variant = 'PRIMARY',
  disabled = false,
  isLoading = false,
  showCheckOnSuccess = false,
  children,
  className,
  ...otherProps
}: ButtonProps) => {
  const isPrimary = variant === 'PRIMARY'
  const isSecondary = variant === 'SECONDARY'
  const isSuccess = variant === 'SUCCESS'
  const isDark = variant === 'DARK'
  const isLight = variant === 'LIGHT'
  const isWarning = variant === 'WARNING'

  return (
    <button
      type={type}
      disabled={disabled}
      className={twMerge(
        'flex w-full transform items-center justify-center rounded-lg text-center text-base font-medium transition duration-100 active:scale-95',

        size === 'MD' && 'px-6 py-4',
        size === 'SM' && 'px-10 py-2',

        disabled && 'cursor-not-allowed opacity-40',

        isPrimary && 'bg-electricYellow-600 text-steelBlue-800',
        isPrimary && !disabled && 'hover:bg-electricYellow-800',

        isSecondary && 'bg-electricYellow-600 text-black',
        isSecondary && !disabled && 'hover:bg-electricYellow-800',

        isDark && 'bg-gray-800 text-white',
        isDark && !disabled && 'hover:bg-gray-900',

        isLight && 'bg-blue-100 text-cyan-600',
        isLight && !disabled && 'hover:bg-blue-200',

        isWarning && 'bg-red-100 text-red-600',
        isWarning && !disabled && 'hover:bg-red-200',

        isSuccess && 'bg-green-400 text-white',
        isSuccess && !disabled && 'hover:bg-green-600',
        isSuccess && disabled && 'opacity-100',

        className
      )}
      {...otherProps}
    >
      {isLoading ? (
        <Spinner />
      ) : showCheckOnSuccess && isSuccess ? (
        <HiCheck className="text-2xl" />
      ) : (
        <>{children}</>
      )}
    </button>
  )
}
