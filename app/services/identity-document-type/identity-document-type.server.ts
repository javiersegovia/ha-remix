import { prisma } from '~/db.server'

export const getIdentityDocumentTypes = () => {
  return prisma.identityDocumentType.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
