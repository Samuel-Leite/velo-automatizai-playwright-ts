import { test, expect } from '../support/fixtures'
import { deleteOrderByDocument } from '../support/database/orderRepository'

test.describe('Checkout', () => {

    test.describe('Validações de campos obrigatórios', () => {

        let alerts: any

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/order')
            await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
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

    test.describe('Pagamento e Confirmação', () => {

        test('Deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {

            const customer = {
                name: 'Samuel',
                lastname: 'Leite',
                email: 'samuel@gmail.com',
                document: '651.765.228-02',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'À Vista',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByDocument(customer.document);

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
        })

        test('Deve aprovar automaticamente o crédito quando o score do CPF for maior que 710 no financiamento.', async ({ page, app }) => {

            const customer = {
                name: 'Steve',
                lastname: 'Jobs',
                email: 'steve@velo.com',
                document: '166.738.327-20',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByDocument(customer.document);

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 710
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            // await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
        })

        test('Deve encaminhar o pedido para análise manual quando o score do CPF estiver entre 501 e 700 no financiamento', async ({ page, app }) => {

            const customer = {
                name: 'Kenobi',
                lastname: 'Obi-Wan',
                email: 'kenobi@velo.com',
                document: '003.223.141-51',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByDocument(customer.document);

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 600
                    })
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido em Análise!' })).toBeVisible()
        })
    })
})