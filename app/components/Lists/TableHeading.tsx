import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

interface TableHeadingProps {
  title: string
  isCentered?: boolean
  className?: string
}

export const TableHeading = ({
  title,
  isCentered,
  className,
}: TableHeadingProps) => (
  <th
    scope="col"
    className={twMerge(
      clsx(
        'bg-steelBlue-700 px-6 py-3 text-left text-base font-bold tracking-wider text-white',
        isCentered && 'text-center'
      ),
      className
    )}
  >
    {title}
  </th>
)
