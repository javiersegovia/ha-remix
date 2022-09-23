import { defineConfig } from 'cypress'
import { faker } from '@faker-js/faker'
import { installGlobals, Request } from '@remix-run/node'
import { parse } from 'cookie'

import { createEmployee } from './cypress/support/create-employee'
import { deleteEmployee } from './cypress/support/delete-employee'
import { createUserSession } from './app/session.server'

installGlobals()

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges
      const port = process.env.PORT ?? (isDev ? '3000' : '8811')
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        video: !process.env.CI,
        screenshotOnRunFailure: !process.env.CI,
        specPattern: './test/e2e/**/*.{cy,e2e}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      }

      // To use this:
      // cy.task('createEmployee', data)
      on('task', {
        async createEmployee({
          email,
          password,
        }: {
          email: string
          password: string
        }) {
          await createEmployee(email, password)
          return null
        },

        async login({ email }: { email: string }) {
          const employee = await createEmployee(
            email,
            faker.internet.password()
          )
          const response = await createUserSession({
            request: new Request('test://test'),
            userId: employee.userId,
            redirectTo: '/',
          })

          const cookieValue = response.headers.get('Set-Cookie')
          if (!cookieValue) {
            throw new Error('Cookie missing from createUserSession response')
          }

          return parse(cookieValue).__session
        },

        async deleteEmployee({ email }: { email: string }) {
          await deleteEmployee(email)
          return null
        },
      })

      return { ...config, ...configOverrides }
    },
  },
})
