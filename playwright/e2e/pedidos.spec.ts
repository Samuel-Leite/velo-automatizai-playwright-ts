import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers';

// AAA - Arrange, Act, Assert
// PAV - Preparar, Agir, Validar

test.describe('Consulta de pedido', async () => {

    test.beforeEach(async ({ page }) => {
        // Arrange
        await page.goto('http://localhost:5173/')
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    })

    test.afterEach(async () => {
        console.log('afterEach: roda depois de cada teste')
    })

    test.afterAll(async () => {
        console.log('afterAll: roda uma vez depois de todos os testes')
    })

    test('Deve consultar um pedido aprovado', async ({ page }) => {

        // Test Data
        const order = 'VLO-ZAREOS'

        // Act
        await page.getByTestId('search-order-id').fill(order)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()

        // Assert
        await expect(page.getByTestId(`order-result-${order}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order}
            - img
            - text: APROVADO
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: Midnight Black
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: sport Wheels
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: Samuel Labs
            - paragraph: Email
            - paragraph: francisco-palheta@uorak.com
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: À Vista
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);
    });

    test('Deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {

        const order = generateOrderCode()

        await page.getByTestId('search-order-id').fill(order)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()

        await expect(page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
            `)
    })
})