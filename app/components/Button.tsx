import type { ButtonHTMLAttributes } from 'react'
import { Link } from '@remix-run/react'
import { HiCheck, HiPlus } from 'react-icons/hi'
import { Spinner } from '~/components/Spinner'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import { MdOutlineUploadFile } from 'react-icons/md'

export type TButtonSizes = 'XS' | 'SM' | 'MD' | 'LG' | 'XL'

export enum ButtonColorVariants {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  SUCCESS = 'SUCCESS',
  DARK = 'DARK',
  WARNING = 'WARNING',
}

export enum ButtonIconVariants {
  UPLOAD = 'UPLOAD',
  CREATE = 'CREATE',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  external?: boolean
  targetBlank?: boolean
  isLoading?: boolean
  showCheckOnSuccess?: boolean
  size?: TButtonSizes
  variant?: ButtonColorVariants
  icon?: ButtonIconVariants
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
  variant = ButtonColorVariants.PRIMARY,
  disabled = false,
  isLoading = false,
  showCheckOnSuccess = false,
  children,
  className,
  icon,
  ...otherProps
}: ButtonProps) => {
  const isPrimary = variant === ButtonColorVariants.PRIMARY
  const isSecondary = variant === ButtonColorVariants.SECONDARY
  const isSuccess = variant === ButtonColorVariants.SUCCESS
  const isDark = variant === ButtonColorVariants.DARK
  const isWarning = variant === ButtonColorVariants.WARNING

  return (
    <button
      type={type}
      disabled={disabled}
      className={twMerge(
        clsx(
          'flex w-full transform items-center justify-center rounded-lg text-center text-base font-medium transition duration-100 active:scale-95',

          size === 'MD' && 'px-6 py-4',
          size === 'SM' && 'px-5 py-3',

          disabled && 'cursor-not-allowed opacity-40',

          isPrimary && 'bg-electricYellow-500 text-steelBlue-800',
          isPrimary && !disabled && 'hover:bg-electricYellow-700',

          isDark && 'bg-gray-800 text-white',
          isDark && !disabled && 'hover:bg-gray-900',

          isSecondary && 'bg-blue-100 text-cyan-600',
          isSecondary && !disabled && 'hover:bg-blue-200',

          isWarning && 'bg-red-100 text-red-600',
          isWarning && !disabled && 'hover:bg-red-200',

          isSuccess && 'bg-green-400 text-white',
          isSuccess && !disabled && 'hover:bg-green-600',
          isSuccess && disabled && 'opacity-100',

          className
        )
      )}
      {...otherProps}
    >
      {isLoading ? (
        <Spinner />
      ) : showCheckOnSuccess && isSuccess ? (
        <HiCheck className="text-2xl" />
      ) : (
        <>
          {icon === ButtonIconVariants.UPLOAD ? (
            <MdOutlineUploadFile className="mr-3" />
          ) : (
            icon === ButtonIconVariants.CREATE && <HiPlus className="mr-3" />
          )}

          {children}
        </>
      )}
    </button>
  )
}
