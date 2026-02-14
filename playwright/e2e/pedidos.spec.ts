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
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    // Assert
    const pedidoContainer = page.locator('div').filter({ hasText: 'Pedido' });

    await expect(
      pedidoContainer.locator('p', { hasText: 'VLO-' })
    ).toHaveText('VLO-ZAREOS');
    
    await expect(
      pedidoContainer.getByText('APROVADO')
    ).toBeVisible();
    
});