import { test, expect } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
    test.beforeEach(async ({ app }) => {
        await app.configurator.open()
    })

    test('Deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
        await app.configurator.expectPrice('R$ 40.000,00')

        await app.configurator.selectColor('Midnight Black')
        await app.configurator.expectPrice('R$ 40.000,00')
        await app.configurator.expectCarImageSrc('/src/assets/midnight-black-aero-wheels.png')
    })

    test('Deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
        await app.configurator.expectPrice('R$ 40.000,00')

        await app.configurator.selectWheels(/Sport Wheels/)
        await app.configurator.expectPrice('R$ 42.000,00')
        await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-sport-wheels.png')

        await app.configurator.selectWheels(/Aero Wheels/)
        await app.configurator.expectPrice('R$ 40.000,00')
        await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-aero-wheels.png')
    })

    test('Deve atualizar o preço ao marcar e desmarcar opcionais e persistir no checkout', async ({ app }) => {
        await app.configurator.expectPrice('R$ 40.000,00')

        // Passo 1: Marcar o checkbox do opcional "Precision Park"
        await app.configurator.toggleOptional('Precision Park')
        await app.configurator.expectPrice('R$ 45.500,00')

        // Passo 2: Marcar o checkbox do opcional "Flux Capacitor"
        await app.configurator.toggleOptional('Flux Capacitor')
        await app.configurator.expectPrice('R$ 50.500,00')

        // Passo 3: Desmarcar os checkboxes dos opcionais
        await app.configurator.toggleOptional('Precision Park')
        await app.configurator.toggleOptional('Flux Capacitor')
        await app.configurator.expectPrice('R$ 40.000,00')

        // Marcar novamente ambos os opcionais para verificar se são persistidos no checkout
        await app.configurator.toggleOptional('Precision Park')
        await app.configurator.toggleOptional('Flux Capacitor')
        await app.configurator.expectPrice('R$ 50.500,00')

        // Passo 4: Clicar no botão "Monte o Seu" (Checkout)
        await app.configurator.submit()

        // Validar redirecionamento para /order e persistência dos valores
        await app.configurator.expectCheckoutPage()

        // Validar os opcionais listados e o preço total no resumo
        await app.configurator.expectCheckoutOptional('Precision Park')
        await app.configurator.expectCheckoutOptional('Flux Capacitor')
        await app.configurator.expectCheckoutTotal('R$ 50.500,00')
    })
})