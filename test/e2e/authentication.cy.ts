import { faker } from '@faker-js/faker'

const loginForm = {
  email: `${faker.internet.userName()}@example.com`,
  password: faker.internet.password(),
}

describe('Authentication flow', () => {
  // afterEach(() => {
  //   cy.cleanUp({ email: loginForm.email })
  // })

  describe('as an employee', () => {
    it.only('should be able to log in and complete the welcome form', () => {
      cy.createEmployee({
        email: loginForm.email,
        password: loginForm.password,
      })

      cy.visitAndCheck('/login')

      cy.findByLabelText(/correo electrónico/i).type(loginForm.email)
      cy.findByLabelText(/contraseña/i).type(loginForm.password)
      cy.findByTestId('login-button').click()

      cy.findByLabelText(/país/i).click()
      cy.findByText(/colombia/i).click()

      cy.findByLabelText(/departamento/i).click()
      cy.findByText(/antioquia/i).click()

      cy.findByLabelText(/ciudad/i).click()
      cy.findByText(/medellín/i, {
        selector: 'div',
      }).click()

      cy.findByLabelText(/dirección/i).type('This is a custom address #35')
      cy.findByLabelText(/número de celular/i).type('+530119292')

      cy.findByLabelText(/género/i).click()
      cy.findByText(/masculino/i, {
        selector: 'div',
      }).click()

      cy.findByLabelText(/fecha de nacimiento/i).type('1996-02-02')
      cy.findByLabelText(/fecha de expedición de documento/i).type('1996-02-02')

      cy.findByLabelText(/cantidad de hijos/i).type('2')

      cy.findByLabelText(/contraseña/i, {
        selector: 'input[name="password"]',
        exact: true,
      }).type('111111')
      cy.findByLabelText(/confirmar contraseña/i).type('111111')

      cy.findByLabelText(
        /he leído y estoy de acuerdo con la política de privacidad y los términos y condiciones/i
      ).click()

      // cy.wait(200)

      cy.findByRole('button', { name: /continuar/i }).click()
      cy.get('button[type=submit').click()
      // cy.get('form').submit()

      // cy.url().should('include', 'verify-signature')
      cy.findByText(/verificar documento/i).should('exist')
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
