import { get, reject, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import { 
	decorateFilledOrders,
	decorateOrderBookOrders,
	decorateMyOpenOrders,
	decorateMyFilledOrders,
	decorateOrder,
	buildGraphData
} from './decorators'
import { formatBalance } from '../helpers'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, e => e)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
)

// All Orders
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
const allOrders = state => get(state, 'exchange.allOrders.data', [])

// Cancelled Orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

// Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
	filledOrders, 
	(orders) => {
		// Sort orders by time in ascending order for price comparison
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		// Decorate the orders
		orders = decorateFilledOrders(orders)
		// Sort orders by time in desending order
		orders = orders.sort((a,b) => b.timestamp - a.timestamp)

		return orders
	}
)

const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id === order.id)
		const orderCancelled = cancelled.some((o) => o.id === order.id)
		return(orderFilled || orderCancelled)
	})

	return openOrders
}

const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

// Create order book
export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {
		orders = decorateOrderBookOrders(orders)
		orders = groupBy(orders, 'orderType')
		const buyOrders = get(orders, 'buy', [])
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
		}

		const sellOrders = get(orders, 'sell', [])
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
		}

		return orders
	}
)

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)
export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders) => {
		orders = orders.filter((o) => o.user === account || o.userFill === account)
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		orders = decorateMyFilledOrders(orders, account)
		return orders
	}
)

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)
export const myOpenOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders) => {
		orders = orders.filter((o) => o.user === account)
		orders = decorateMyOpenOrders(orders)
		orders.sort((a,b) => b.timestamp - a.timestamp)
		return orders
	}
)

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)
export const priceChartSelector = createSelector(
	filledOrders,
	(orders) => {
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		orders = orders.map((o) => decorateOrder(o))
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
		return({
			lastPrice, 
			lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
			series: [{
				data: buildGraphData(orders)
			}]
			
		})
	}
)

const orderCancelling = state => get(state, 'exchange.orderCancelling', false)
export const orderCancellingSelector = createSelector(orderCancelling, status => status)

const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, status => status)

const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, status => status)

const etherBalance = state => get(state, 'web3.balance', 0)
export const etherBalanceSelector = createSelector(
	etherBalance, 
	(balance) => {
		return formatBalance(balance)
	}
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
	tokenBalance, 
	(balance) => {
		return formatBalance(balance)
	}
)

const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
export const exchangeEtherBalanceSelector = createSelector(
	exchangeEtherBalance, 
	(balance) => {
		return formatBalance(balance)
	}
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
	exchangeTokenBalance, 
	(balance) => {
		return formatBalance(balance)
	}
)

const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount)

const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)

const buyOrder = state => get(state, 'exchange.buyOrder', {})
export const buyOrderSelector = createSelector(buyOrder, order => order)

const sellOrder = state => get(state, 'exchange.sellOrder', {})
export const sellOrderSelector = createSelector(sellOrder, order => order)
