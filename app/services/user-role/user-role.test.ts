import { prisma } from '~/db.server'
import { UserRoleFactory } from './user-role.factory'
import {
  createUserRole,
  deleteUserRoleById,
  getUserRoleById,
  getUserRoles,
  updateUserRoleById,
} from './user-role.server'

describe('getUserRoles', () => {
  it('Returns an array of User Roles', async () => {
    // Arrange
    const userRoles = UserRoleFactory.buildList(3)

    vi.spyOn(prisma.userRole, 'findMany').mockResolvedValueOnce(userRoles)

    // Act

    const result = await getUserRoles()

    //Assert
    expect(prisma.userRole.findMany).toHaveBeenCalledOnce()
    expect(prisma.userRole.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    expect(result).toEqual(userRoles)
  })
})

describe('getUserRoleById', () => {
  it('Returns a User Role', async () => {
    // Arrange
    const userRoles = UserRoleFactory.build()

    vi.spyOn(prisma.userRole, 'findUnique').mockResolvedValueOnce(userRoles)

    // Act
    const result = await getUserRoleById(userRoles.id)

    // Assert
    expect(prisma.userRole.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(userRoles)
  })
})

describe('createUserRole', () => {
  it('creates and returns a User Role', async () => {
    // Arrange
    const userRoles = UserRoleFactory.build()

    vi.spyOn(prisma.userRole, 'create').mockResolvedValueOnce(userRoles)

    // Act
    const result = await createUserRole({
      name: userRoles.name,
    })

    // Asserve
    expect(result).toEqual(userRoles)
  })
})

describe('updateUserRoleById', () => {
  it('updates and returns a User Role', async () => {
    // Arrange
    const existingUserRole = UserRoleFactory.build()
    const newUserRole = UserRoleFactory.build()

    vi.spyOn(prisma.userRole, 'update').mockResolvedValueOnce(newUserRole)

    // Act
    const result = await updateUserRoleById(existingUserRole.id, {
      name: newUserRole.name,
    })

    // Assert

    expect(result).toEqual(newUserRole)
  })
})

describe('deleteUserRoleById', () => {
  it('deletes a User Role and returns the id', async () => {
    // Arrange
    const existingUserRole = UserRoleFactory.build()

    vi.spyOn(prisma.userRole, 'delete').mockResolvedValueOnce(existingUserRole)

    // Act
    const result = await deleteUserRoleById(existingUserRole.id)

    // Assert
    expect(result).toEqual(existingUserRole.id)
  })
})
