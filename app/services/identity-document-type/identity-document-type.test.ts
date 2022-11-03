import { prisma } from '~/db.server'
import { IdentityDocumentTypeFactory } from './identity-document-type.factory'
import * as identityDocumentTypeService from './identity-document-type.server'

describe('getIdentityDocumentTypes', () => {
  test('should return an array of identityDocumentTypes', async () => {
    const identityDocumentTypes = IdentityDocumentTypeFactory.buildList(3)

    vi.spyOn(prisma.identityDocumentType, 'findMany').mockResolvedValueOnce(
      identityDocumentTypes
    )

    const result = await identityDocumentTypeService.getIdentityDocumentTypes()
    expect(result).toEqual(identityDocumentTypes)
  })
})
