import type { User } from '@prisma/client'

import { createCookieSessionStorage, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { getUserById } from '~/services/user/user.server'
import { getAdminUserById } from '~/services/admin-user.server'
import { getEmployeeById } from '~/services/employee/employee.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    // secure: process.env.NODE_ENV === 'production', todo: enable when out of beta
  },
})

export const USER_SESSION_KEY = 'userId'
export const ADMIN_SESSION_KEY = 'adminUserId'

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

/**
 * Returns the userId if it exists.
 * If not, returns undefined.
 */
export async function getUserIdFromSession(
  request: Request
): Promise<User['id'] | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

/**
 * Returns the adminUserId if it exists.
 * If not, returns undefined.
 */
export async function getAdminUserIdFromSession(
  request: Request
): Promise<User['id'] | undefined> {
  const session = await getSession(request)
  const adminUserId = session.get(ADMIN_SESSION_KEY)
  return adminUserId
}

/**
 * Returns the user data using the userId stored in session.
 */
export async function getUser(request: Request) {
  const userId = await getUserIdFromSession(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

/**
 * Returns the adminUser data using session.
 */
export async function getAdminUser(request: Request) {
  const adminUserId = await getAdminUserIdFromSession(request)
  if (adminUserId === undefined) return null

  const adminUser = await getAdminUserById(adminUserId)
  if (adminUser) return adminUser

  throw await logout(request)
}

/**
 * Returns the employee data using session.
 */
export async function getEmployee(request: Request) {
  const user = await getUser(request)

  if (!user || !user?.employee?.id) {
    return null
  }

  const employee = await getEmployeeById(user.employee.id)
  if (employee) return employee

  throw await logout(request)
}

export async function requireEmployee(request: Request) {
  const employee = await getEmployee(request)
  if (!employee) {
    throw await logout(request)
  }
  return employee
}

/**
 * Returns the userId from session.
 * If not present, redirects to login.
 * **This function should be used inside loaders to protect user-specific routes.**
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserIdFromSession(request)

  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

/**
 * Returns the adminUserId from session.
 * If not present, redirects to login.
 * **This function should be used inside loaders to protect admin-specific routes.**
 */
export async function requireAdminUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const adminUserId = await getAdminUserIdFromSession(request)
  if (!adminUserId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/admin/login?${searchParams}`)
  }
  return adminUserId
}

/**
 * Returns the user data using session.
 * If not present, redirects to login.
 * **This function should be used inside loaders to protect user-specific routes.**
 */
export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

/**
 * Returns the admin data using session.
 * If not present, redirects to login.
 * **This function should be used inside loaders to protect admin-specific routes.**
 */
export async function requireAdminUser(request: Request) {
  const adminUserId = await requireAdminUserId(request)

  const adminUser = await getAdminUserById(adminUserId)
  if (adminUser) return adminUser

  throw await logout(request)
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request
  userId: string
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 5, // 5 Hours
      }),
    },
  })
}

export async function createAdminSession({
  request,
  adminUserId,
  redirectTo,
}: {
  request: Request
  adminUserId: string
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(ADMIN_SESSION_KEY, adminUserId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 5, // 5 Hours
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}
