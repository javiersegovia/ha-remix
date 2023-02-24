import { prisma } from '~/db.server'
import { IdentityDocumentTypeFactory } from './identity-document-type.factory'
import * as identityDocumentTypeService from './identity-document-type.server'

describe('getIdentityDocumentTypes', () => {
  it('returns an array of identityDocumentTypes', async () => {
    const identityDocumentTypes = IdentityDocumentTypeFactory.buildList(3)

    vi.spyOn(prisma.identityDocumentType, 'findMany').mockResolvedValueOnce(
      identityDocumentTypes
    )

    const result = await identityDocumentTypeService.getIdentityDocumentTypes()
    expect(result).toEqual(identityDocumentTypes)
  })
})

describe('getIdentityDocumentTypeById', () => {
  it('returns a identity document type', async () => {
    const expectedIdentityDocumentType = IdentityDocumentTypeFactory.build()
    vi.spyOn(prisma.identityDocumentType, 'findUnique').mockResolvedValueOnce(
      expectedIdentityDocumentType
    )

    const result =
      await identityDocumentTypeService.getIdentityDocumentTypeById(
        expectedIdentityDocumentType.id
      )

    expect(result).toEqual(expectedIdentityDocumentType)
  })
})

describe('createIdentityDocumentType', () => {
  it('creates and returns a Identity Document Type', async () => {
    const expectedIdentityDocumentType = IdentityDocumentTypeFactory.build()

    vi.spyOn(prisma.identityDocumentType, 'create').mockResolvedValueOnce(
      expectedIdentityDocumentType
    )

    const result = await identityDocumentTypeService.createIdentityDocumentType(
      {
        name: expectedIdentityDocumentType.name,
      }
    )

    expect(result).toEqual(expectedIdentityDocumentType)
  })
})

describe('updateIdentityDocumentType', () => {
  it('updates and returns a Identity Document Type', async () => {
    const existingIdentityDocumentType = IdentityDocumentTypeFactory.build()
    const newIdentityDocumentType = IdentityDocumentTypeFactory.build()

    vi.spyOn(prisma.identityDocumentType, 'update').mockResolvedValueOnce(
      newIdentityDocumentType
    )

    const result =
      await identityDocumentTypeService.updateIdentityDocumentTypeById(
        existingIdentityDocumentType.id,
        {
          name: newIdentityDocumentType.name,
        }
      )

    expect(result).toEqual(newIdentityDocumentType)
  })
})

describe('deleteIdentityDocumentTypeById', () => {
  it('deletes a identity document type and returns the id', async () => {
    const existingIdentityDocumentType = IdentityDocumentTypeFactory.build()

    vi.spyOn(prisma.identityDocumentType, 'delete').mockResolvedValueOnce(
      existingIdentityDocumentType
    )

    const result =
      await identityDocumentTypeService.deleteIdentityDocumentTypeById(
        existingIdentityDocumentType.id
      )

    expect(result).toEqual(existingIdentityDocumentType.id)
  })
})
