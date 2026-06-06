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

        test.beforeEach(async ({ app }) => {
            await app.hero.open()
        })

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

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')
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

            await app.mock.creditAnalysis(710)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            // await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectResult('Pedido Aprovado!')
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

            await app.mock.creditAnalysis(600)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido em Análise!')
        })

        test('Deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {
            const customer = {
                name: 'Bruce',
                lastname: 'Wayne',
                email: 'bruce@wayne.com',
                document: '325.738.332-08',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByDocument(customer.document);

            await app.mock.creditAnalysis(500)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Reprovado!')
        })

        test('Deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {
            const customer = {
                name: 'Alan',
                lastname: 'Turing',
                email: 'alan@turing.com',
                document: '446.918.427-64',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '10000'
            }

            await deleteOrderByDocument(customer.document);

            await app.mock.creditAnalysis(500)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Reprovado!')
        })

        test('Deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {
            const customer = {
                name: 'Peterson',
                lastname: 'Lira',
                email: 'peterson@lira.com',
                document: '035.807.134-85',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '20000'
            }

            await deleteOrderByDocument(customer.document);

            await app.mock.creditAnalysis(450)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')
        })

        test('Deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ page, app }) => {
            const customer = {
                name: 'Alex',
                lastname: 'Mendes',
                email: 'alex@mendes.com',
                document: '161.818.174-25',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '30000'
            }

            await deleteOrderByDocument(customer.document);

            await app.mock.creditAnalysis(300)

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')
        })
    })
})