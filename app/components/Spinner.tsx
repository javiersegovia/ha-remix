import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

type TSpinnerColor = 'black' | 'white' | 'teal'
type TSpinnerSize = 6 | 7 | 8 | 9 | 10

interface SpinnerProps {
  size?: TSpinnerSize
  color?: TSpinnerColor
  className?: string
}

export const Spinner = ({
  size = 6,
  color = 'white',
  className,
}: SpinnerProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={twMerge(
        clsx(
          'animate-spin text-white',

          color === 'white' && `text-white`,
          color === 'black' && `text-black`,
          color === 'teal' && `text-teal-800`,

          size === 6 && `h-6 w-6`,
          size === 7 && `h-7 w-7`,
          size === 8 && `h-8 w-8`,
          size === 9 && `h-9 w-9`,
          size === 10 && `h-10 w-10`,

          className
        )
      )}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
