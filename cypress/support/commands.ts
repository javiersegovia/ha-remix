import { faker } from '@faker-js/faker'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create a random employee including a new user and company. Yields the employeeId and adds an alias to the employee
       *
       * @returns {typeof createEmployee}
       * @memberof Chainable
       * @example
       *    cy.createEmployee()
       * @example
       *    cy.createEmployee({ email: 'whatever@example.com', password: 'myrandompassword' })
       */
      createEmployee: typeof createEmployee

      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login

      /**
       * Deletes the current @employee and their related models (User and Company)
       *
       * @returns {typeof cleanUp}
       * @memberof Chainable
       * @example
       *    cy.cleanUp()
       * @example
       *    cy.cleanUp({ email: 'whatever@example.com' })
       */
      cleanUp: typeof cleanUp

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck
    }
  }
}

function createEmployee({
  email = faker.internet.email(undefined, undefined, 'example.com'),
  password = faker.internet.password(),
}: {
  email?: string
  password?: string
} = {}) {
  cy.then(() => ({ email })).as('user')
  cy.task('createEmployee', {
    email,
    password,
  })

  return cy.get('@user')
}

function login({
  email = faker.internet.email(undefined, undefined, 'example.com'),
}: {
  email?: string
} = {}) {
  cy.then(() => ({ email })).as('user')
  cy.task('login', {
    email,
  }).then((cookie: any) => {
    cy.setCookie('__session', cookie)
  })

  return cy.get('@user')
}

function cleanUp({ email }: { email?: string } = {}) {
  if (email) {
    cy.task('deleteEmployee', {
      email,
    })
  } else {
    cy.get('@user').then((user) => {
      const email = (user as { email?: string })?.email
      if (email) {
        cy.task('deleteEmployee', {
          email,
        })
      }
    })
  }
  cy.clearCookie('__session')
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url)
  cy.location('pathname').should('contain', url).wait(waitTime)
}

Cypress.Commands.add('createEmployee', createEmployee)
Cypress.Commands.add('login', login)
Cypress.Commands.add('cleanUp', cleanUp)
Cypress.Commands.add('visitAndCheck', visitAndCheck)
