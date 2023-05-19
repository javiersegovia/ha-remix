import { Link } from '@remix-run/react'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md'
import { constants } from '~/config/constants'
import { DOTS, usePagination } from '~/hooks/usePagination'

interface PaginationProps {
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

  if (totalPages <= 1 || !paginationRange) return null

  return (
    <>
      <div className="mt-5 flex w-full place-content-end items-center gap-3">
        {currentPage >= 2 && (
          <Link to={`?page=${currentPage - 1}`}>
            <MdArrowBackIos />
          </Link>
        )}

        {paginationRange.map((pageNumber, idx) => {
          // If the pageItem is a DOT, render the DOTS unicode character
          if (pageNumber === DOTS) {
            return (
              <li
                key={`${pageNumber}_${idx}`}
                className="list-none text-2xl font-light text-gray-500"
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
              className="flex h-8 w-8 items-center justify-center rounded border border-gray-400"
              to={`?page=${pageNumber}`}
            >
              {pageNumber}
            </Link>
          )
        })}

        {currentPage < totalPages && (
          <Link to={`?page=${currentPage + 1}`}>
            <MdArrowForwardIos />
          </Link>
        )}
      </div>
    </>
  )
}
