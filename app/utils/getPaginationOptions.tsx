import { constants } from '~/config/constants'

interface GetPaginationOptionsArgs {
  request: Request
  itemsCount: number
  itemsPerPage?: number
}

const { itemsPerPage: defaultItemsPerPage } = constants

export const getPaginationOptions = ({
  request,
  itemsCount,
  itemsPerPage = defaultItemsPerPage,
}: GetPaginationOptionsArgs) => {
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  const currentPage = parseFloat(page || '1')

  return {
    take: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage || 0,

    pagination: {
      currentPage,
      totalPages: Math.ceil(itemsCount / itemsPerPage),
    },
  }
}
