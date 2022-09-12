type CheckIdArgs = {
  list: { id: number | string }[]
  id: number | string
}

export const checkIfIdExistInList = ({ list, id }: CheckIdArgs) =>
  Boolean(list?.length && list.some((listItem) => listItem?.id === id))
