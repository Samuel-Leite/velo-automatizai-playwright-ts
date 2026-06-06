import { Page } from '@playwright/test'

export class MockApi {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async setCreditScore(score: number) {
        await this.page.route('**/functions/v1/credit-analysis', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'Done',
                    score: score
                })
            })
        })
    }
}
