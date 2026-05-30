import { test, expect } from '../support/fixtures'

test.describe('Checkout', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/order')
        await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    })

    test.describe('Validações de campos obrigatórios', () => {

        let alerts: any

        test.beforeEach(async ({ app }) => {
            alerts = app.checkout.elements.alerts
        })

        test('Deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
            await app.checkout.submit()

            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
            await expect(alerts.email).toHaveText('Email inválido')
            await expect(alerts.phone).toHaveText('Telefone inválido')
            await expect(alerts.document).toHaveText('CPF inválido')
            await expect(alerts.store).toHaveText('Selecione uma loja')
            await expect(alerts.terms).toHaveText('Aceite os termos')
        })

        test('Deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
            const customer = {
                name: 'A',
                lastname: 'B',
                email: 'papito@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
        })

        test('Deve exibir erro para e-mail com formato inválido', async ({ app }) => {
            const customer = {
                name: 'Fernando',
                lastname: 'Papito',
                email: 'papito@.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()
            await app.checkout.submit()
            await expect(alerts.email).toHaveText('Email inválido')
        })

        test('Deve exibir erro para CPF inválido', async ({ app }) => {
            const customer = {
                name: 'Fernando',
                lastname: 'Papito',
                email: 'papito@test.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()
            await app.checkout.submit()
            await expect(alerts.document).toHaveText('CPF inválido')
        })

        test('Deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
            const customer = {
                name: 'Fernando',
                lastname: 'Papito',
                email: 'papito@test.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')

            await expect(app.checkout.elements.terms).not.toBeChecked()
            await app.checkout.submit()
            await expect(alerts.terms).toHaveText('Aceite os termos')
        })
    })
})