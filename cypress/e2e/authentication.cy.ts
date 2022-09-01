import { faker } from '@faker-js/faker'

const loginForm = {
  email: `${faker.internet.userName()}@example.com`,
  password: faker.internet.password(),
}

describe('Authentication flow', () => {
  afterEach(() => {
    cy.cleanUp({ email: loginForm.email })
  })

  describe('as an Employee', () => {
    it('should allow to log in and log out', () => {
      cy.createEmployee({
        email: loginForm.email,
        password: loginForm.password,
      })

      cy.visitAndCheck('/')
      cy.findByRole('link', { name: /log in/i }).click()

      cy.findByRole('textbox', { name: /email/i }).type(loginForm.email)
      cy.findByLabelText(/password/i).type(loginForm.password)
      cy.findByRole('button', { name: /log in/i }).click()

      cy.findByRole('button', { name: /logout/i }).click()
      cy.findByRole('link', { name: /log in/i })
    })

    it('should allow to log in and log out part two', () => {
      cy.login({ email: loginForm.email })

      cy.visitAndCheck('/')
      cy.findByRole('link', { name: /view dashboard/i }).click()

      cy.findByRole('button', { name: /logout/i }).click()
      cy.findByRole('link', { name: /log in/i })
    })
  })
})
