import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
    return {
        async open() {
            await page.goto('/configure')
        },

        async selectColor(name: string) {
            await page.getByRole('button', { name }).click()
        },

        async selectWheels(name: string | RegExp) {
            await page.getByRole('button', { name }).click()
        },

        async toggleOptional(name: string | RegExp) {
            await page.getByRole('checkbox', { name }).click()
        },

        async expectPrice(price: string) {
            const priceElement = page.getByTestId('total-price')
            await expect(priceElement).toBeVisible()
            await expect(priceElement).toHaveText(price)
        },

        async expectCarImageSrc(src: string | RegExp) {
            const carImage = page.locator('img[alt^="Velô Sprint"]')
            await expect(carImage).toHaveAttribute('src', src)
        },

        async submit() {
            await page.getByRole('button', { name: 'Monte o Seu' }).click()
        },

        async expectCheckoutPage() {
            await expect(page).toHaveURL(/\/order$/)
        },

        async expectCheckoutOptional(name: string) {
            const item = page.getByRole('listitem').filter({ hasText: name })
            await expect(item).toBeVisible()
        },

        async expectCheckoutTotal(price: string) {
            const summaryTotal = page.getByTestId('summary-total-price')
            await expect(summaryTotal).toBeVisible()
            await expect(summaryTotal).toHaveText(price)
        },

        async finishConfigurator() {
            await page.getByRole('button', { name: 'Monte o Seu' }).click()
        },
    }
}