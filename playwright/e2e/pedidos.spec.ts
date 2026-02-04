import { test, expect } from '@playwright/test'

// AAA - Arrange, Act, Assert
// PAV - Preparar, Agir, Validar

test('Deve consultar um pedido aprovado', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

    // Act
    await page.getByTestId('search-order-id').fill('VLO-ZAREOS')
    await page.getByTestId('search-order-button').click()

    // Assert
    await expect(page.getByTestId('order-result-id')).toContainText('VLO-ZAREOS')
    await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')
});