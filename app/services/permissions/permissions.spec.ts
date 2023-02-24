import { PermissionCode } from '@prisma/client'
import { truncateDB } from 'test/helpers/truncateDB'
import { UserRoleFactory } from '../user-role/user-role.factory'
import { UserFactory } from '../user/user.factory'
import { defaultPermissions } from './permissions.list'
import {
  findOrCreateManyPermissions,
  hasPermissionByUserId,
  hasPermissionByUserRoleId,
} from './permissions.server'

beforeAll(async () => {
  await truncateDB()
})

describe('findOrCreateManyPermissions', () => {
  it('returns a list of permissions matching the default permissions, and deletes any permission not existing in the list', async () => {
    const result = await findOrCreateManyPermissions()

    expect(result.length).toEqual(defaultPermissions.length)
    expect(result).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          code: expect.any(String),
          name: expect.any(String),
          description: expect.toBeOneOf([expect.any(String), undefined]),
        },
      ])
    )
  })
})

describe('hasPermissionByUserRoleId', () => {
  test('it returns true or false depending if the UserRole has the permission or not', async () => {
    await findOrCreateManyPermissions()

    const role = await UserRoleFactory.create({
      name: 'Analista',
      permissions: [
        {
          code: PermissionCode.MANAGE_COMPANY,
        },
      ],
    })

    const [hasManageCompanyPermission, hasManageBenefitCategoryPermission] =
      await Promise.all([
        hasPermissionByUserRoleId(role.id, PermissionCode.MANAGE_COMPANY),
        hasPermissionByUserRoleId(
          role.id,
          PermissionCode.MANAGE_BENEFIT_CATEGORY
        ),
      ])

    expect(hasManageCompanyPermission).toBeTrue()
    expect(hasManageBenefitCategoryPermission).toBeFalse()
  })
})

describe('hasPermissionByUserId', () => {
  test('it returns true or false depending if the User has the permission or not', async () => {
    await findOrCreateManyPermissions()

    const role = await UserRoleFactory.create({
      name: 'Administrador',
      permissions: [
        {
          code: PermissionCode.MANAGE_COMPANY,
        },
      ],
    })

    const user = await UserFactory.create(undefined, {
      associations: {
        role,
      },
    })

    const [hasManageCompanyPermission, hasManageBenefitCategoryPermission] =
      await Promise.all([
        hasPermissionByUserId(user.id, PermissionCode.MANAGE_COMPANY),
        hasPermissionByUserId(user.id, PermissionCode.MANAGE_BENEFIT_CATEGORY),
      ])

    expect(hasManageCompanyPermission).toBeTrue()
    expect(hasManageBenefitCategoryPermission).toBeFalse()
  })
})
