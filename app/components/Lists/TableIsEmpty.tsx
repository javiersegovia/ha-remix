import clsx from 'clsx'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Box } from '../Layout/Box'
import { Title } from '../Typography/Title'

interface TableIsEmptyProps {
  title: string
  description?: string
  actions?: JSX.Element
  className?: string
}

export const TableIsEmpty = ({
  title,
  description,
  actions,
  className,
}: TableIsEmptyProps) => {
  return (
    <Box
      className={twMerge(
        clsx(
          'flex flex-col items-center rounded-[32px] border border-gray-200 px-5 py-10 md:p-10',
          className
        )
      )}
    >
      <Title className="mb-10 text-center">{title}</Title>

      <img
        src="/images/routes/dashboard/manage/empty_list.png"
        alt="Empty List"
        className="object-contain sm:max-w-[150px] lg:max-w-[300px]"
      />

      <p className="my-10 text-center">{description}</p>

      <div className="mx-auto md:w-auto">{actions}</div>
    </Box>
  )
}
