import { test as base } from '@playwright/test'

import { createCheckoutActions } from './actions/checkoutActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createOrderLockupActions } from './actions/orderLockupActions'
import { MockApi } from './mock.api'

type App = {
    checkout: ReturnType<typeof createCheckoutActions>
    configurator: ReturnType<typeof createConfiguratorActions>
    orderLookup: ReturnType<typeof createOrderLockupActions>
    mock: MockApi
}

export const test = base.extend<{ app: App }>({
    app: async ({ page }, use) => {
        const app: App = {
            checkout: createCheckoutActions(page),
            configurator: createConfiguratorActions(page),
            orderLookup: createOrderLockupActions(page),
            mock: new MockApi(page),
        }
        await use(app)
    },
})

export { expect } from '@playwright/test'