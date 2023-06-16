import { Link, useSearchParams } from '@remix-run/react'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'
import { constants } from '~/config/constants'
import { DOTS, usePagination } from '~/hooks/usePagination'

export interface PaginationProps {
  totalPages: number
  currentPage: number
}

export const Pagination = ({ totalPages, currentPage }: PaginationProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    pageSize: constants.itemsPerPage,
    siblingCount: 1,
  })

  const [searchParams] = useSearchParams()

  if (totalPages <= 1 || !paginationRange) return null

  const getNewSearchParams = (newPage: number | string) => {
    searchParams.set('page', newPage.toString())
    return searchParams.toString()
  }

  return (
    <>
      <div className="mx-auto mt-5 flex w-full items-center justify-center gap-3 text-sm">
        {currentPage >= 2 && (
          <Link
            to={{ search: getNewSearchParams(currentPage - 1) }}
            className=" flex h-8 w-8 items-center justify-center rounded border border-gray-300"
          >
            <MdArrowBackIos className="ml-1" />
          </Link>
        )}

        {paginationRange.map((pageNumber, idx) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber === DOTS) {
            return (
              <li
                key={`${pageNumber}_${idx}`}
                className="flex h-8 w-8 list-none items-center justify-center rounded border border-gray-300 text-2xl font-light text-gray-500"
              >
                ···
              </li>
            )
          }

          // Render our Page Pills
          return pageNumber === currentPage ? (
            <li className="flex h-8 w-8 list-none items-center justify-center rounded bg-steelBlue-700 text-white">
              {pageNumber}
            </li>
          ) : (
            <Link
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-300"
              to={{
                search: getNewSearchParams(pageNumber),
              }}
            >
              {pageNumber}
            </Link>
          )
        })}

        {currentPage < totalPages && (
          <Link
            to={{
              search: getNewSearchParams(currentPage + 1),
            }}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300"
          >
            <MdArrowForwardIos />
          </Link>
        )}
      </div>
    </>
  )
}
