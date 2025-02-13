/*********************************************************************/

type TId = string | number
export function connect<T extends string | number | undefined | null>(
  id: T
): T extends TId ? { connect: { id: T } } : undefined
export function connect(id: string | number | undefined | null) {
  return id ? { connect: { id } } : undefined
}

type TConnectOrDisconnectRelationshipFn = <T extends string | number>(
  itemId?: T | null,
  disconnect?: boolean
) =>
  | {
      connect: {
        id: T
      }
    }
  | { disconnect: boolean }

export const connectOrDisconnect: TConnectOrDisconnectRelationshipFn = (
  id,
  disconnect = false
) => {
  return id
    ? {
        connect: { id },
      }
    : { disconnect }
}

export function connectMany<T extends string[] | number[] | undefined | null>(
  ids: T
): T extends TId ? { connect: { id: T }[] } : undefined
export function connectMany(ids: string[] | number[] | undefined | null) {
  return ids
    ? ({
        connect: ids.map((itemId) => ({ id: itemId })),
      } as const)
    : undefined
}

export function setMany<T extends string[] | number[] | undefined | null>(
  ids: T
): T extends TId ? { set: { id: T }[] } : { set: [] }
export function setMany(ids: string[] | number[] | undefined | null) {
  return ids
    ? ({
        set: ids.map((itemId) => ({ id: itemId })),
      } as const)
    : { set: [] }
}
