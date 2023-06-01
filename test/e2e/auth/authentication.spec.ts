import { test, expect } from '@playwright/test'

// todo: create a new user everytime we run this auth flow.

test('First login auth', async ({ page }) => {
  await page.goto('/dashboard')

  // todo: create-new-user

  await expect(page).toHaveTitle(/Inicio de sesión/)

  await page.getByLabel(/Correo electrónico/).fill('user@test.com')
  await page.getByLabel(/Contraseña/).fill('123123')

  await page.getByTestId('login-button').click()

  await expect(page).toHaveTitle(/Bienvenido/)

  await page.getByLabel(/País/).fill('Colombia')
  await page.keyboard.press('Enter')

  await page.getByLabel(/Dirección/).fill('Cra 46 #91-34')

  await page.getByLabel(/Fecha de nacimiento/).fill('1996-12-01')
  await page.getByLabel(/Fecha de expedición de documento/).fill('2010-01-01')

  await page.getByLabel(/Número de celular/).fill('+58 4141234567')
  await page.getByLabel(/Género/i).click()
  await page.getByText(/Masculino/, { exact: true }).click()

  await page.getByLabel(/Cantidad de hijos/).fill('2')

  await page.getByLabel(/Contraseña/).fill('123123')
  await page.getByLabel(/Confirmar contraseña/).fill('123123')

  await page.getByLabel(/Términos y condiciones/i).click()
  await page.getByText(/Continuar/).click()

  await expect(page).toHaveTitle(/Inicio/)
})
