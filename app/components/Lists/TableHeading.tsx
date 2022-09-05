import clsx from 'clsx'

interface TableHeadingProps {
  title: string
  isCentered?: boolean
}

export const TableHeading = ({ title, isCentered }: TableHeadingProps) => (
  <th
    scope="col"
    className={clsx(
      'px-6 py-3 text-left text-sm font-semibold tracking-wider text-gray-800',
      isCentered && 'text-center'
    )}
  >
    {title}
  </th>
)
