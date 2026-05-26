import { test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('Deve consultar um pedido aprovado', async ({ app }) => {
    const order = {
      number: 'VLO-ZAREOS',
      status: 'APROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Samuel Labs',
        email: 'francisco-palheta@uorak.com'
      },
      payment: 'À Vista'
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('Deve consultar um pedido reprovado', async ({ app }) => {
    const order = {
        number: 'VLO-9KVDS6',
        status: 'REPROVADO' as const,
        color: 'Glacier Blue',
        wheels: 'sport Wheels',
        customer: {
            name: 'Patinha McDuck',
            email: 'patinhas@mcduck.com'
        },
        payment: 'À Vista'
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('Deve consultar um pedido em analise', async ({ app }) => {
    const order = {
        number: 'VLO-BRDRYI',
        status: 'EM_ANALISE' as const,
        color: 'Lunar White',
        wheels: 'aero Wheels',
        customer: {
            name: 'Donald McDuck',
            email: 'donald@gmail.com'
        },
        payment: 'À Vista'
    }

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('Deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLockup.searchOrder(order)
    await app.orderLockup.validateOrderNotFound()
  })

  test('Deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()
  })
})
