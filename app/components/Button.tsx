import type { ButtonHTMLAttributes } from 'react'
import { Link } from '@remix-run/react'
import { HiCheck, HiPlus, HiSearch } from 'react-icons/hi'
import { Spinner } from '~/components/Spinner'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import {
  MdOutlineUploadFile,
  MdOutlineDownload,
  MdOutlineDelete,
} from 'react-icons/md'
import { HiOutlineEye } from 'react-icons/hi2'

export type TButtonSizes = 'XS' | 'SM' | 'MD' | 'LG' | 'XL'

export enum ButtonColorVariants {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  ALTERNATIVE = 'ALTERNATIVE',
  SUCCESS = 'SUCCESS',
  DARK = 'DARK',
  WARNING = 'WARNING',
}

export enum ButtonIconVariants {
  UPLOAD = 'UPLOAD',
  CREATE = 'CREATE',
  DOWNLOAD = 'DOWNLOAD',
  DELETE = 'DELETE',
  SEARCH = 'SEARCH',
  VIEW = 'VIEW',
}

export enum ButtonDesignVariants {
  BUTTON = 'BUTTON',
  FAB = 'FAB',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string | null
  external?: boolean
  targetBlank?: boolean
  isLoading?: boolean
  showCheckOnSuccess?: boolean
  size?: TButtonSizes
  variant?: ButtonColorVariants
  icon?: ButtonIconVariants
  design?: ButtonDesignVariants
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
          className="block"
          href={href}
          {...(targetBlank
            ? { target: '_blank', rel: 'noreferrer noopener' }
            : {})}
        >
          <ButtonElement {...props} />
        </a>
      </>
    ) : (
      <Link to={href}>
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
  design = ButtonDesignVariants.BUTTON,
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
  const isAlternative = variant === ButtonColorVariants.ALTERNATIVE
  const isSuccess = variant === ButtonColorVariants.SUCCESS
  const isDark = variant === ButtonColorVariants.DARK
  const isWarning = variant === ButtonColorVariants.WARNING

  return (
    <button
      type={type}
      disabled={disabled}
      className={twMerge(
        clsx(
          'flex w-full transform items-center justify-center rounded-[2rem] border border-transparent text-center text-base font-medium outline-none transition duration-100 active:scale-95',

          size === 'XS' && 'px-3 py-2 text-sm',
          size === 'SM' && 'px-5 py-3',
          size === 'MD' && 'px-10 py-4',

          disabled && 'cursor-not-allowed opacity-40',

          design === 'FAB' &&
            'flex h-10 w-10 items-center justify-center gap-3 rounded-full p-2 text-2xl',

          isPrimary &&
            'border-b-green-600 border-t-green-500 bg-gradient-to-b from-green-500 to-green-600 text-white',

          isPrimary &&
            !disabled &&
            'hover:border-t-green-600 hover:from-green-600 hover:to-green-600',

          isDark && 'bg-gray-800 text-white',
          isDark && !disabled && 'hover:bg-gray-900',

          isSecondary && 'border border-gray-300 bg-transparent text-gray-800',
          isSecondary && !disabled && 'hover:bg-transparent',

          isAlternative && 'bg-steelBlue-700 text-white',
          isAlternative && !disabled && 'hover:bg-steelBlue-800',

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
          {icon && (
            <span
              className={twMerge(
                clsx(
                  design === ButtonDesignVariants.BUTTON &&
                    icon &&
                    'mr-3 text-xl'
                ),
                size === 'XS' && 'mr-2'
              )}
            >
              {icon === ButtonIconVariants.UPLOAD && <MdOutlineUploadFile />}
              {icon === ButtonIconVariants.CREATE && <HiPlus />}
              {icon === ButtonIconVariants.DOWNLOAD && <MdOutlineDownload />}
              {icon === ButtonIconVariants.DELETE && <MdOutlineDelete />}
              {icon === ButtonIconVariants.SEARCH && <HiSearch />}
              {icon === ButtonIconVariants.VIEW && <HiOutlineEye />}
            </span>
          )}

          {children}
        </>
      )}
    </button>
  )
}
