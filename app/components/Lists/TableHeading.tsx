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
        'bg-white px-6 py-3 text-left text-base font-bold tracking-wider text-steelBlue-600',
        isCentered && 'text-center'
      ),
      className
    )}
  >
    {title}
  </th>
)
