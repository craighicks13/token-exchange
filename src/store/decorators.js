import { groupBy, maxBy, minBy } from 'lodash'
import moment from 'moment'
import { ETHER_ADDRESS, GREEN, RED, ether, tokens } from '../helpers'

export const decorateFilledOrders = (orders) => {
	let previousOrder = orders[0]
	return (
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateFilledOrder(order, previousOrder)
			previousOrder = order
			return order
		})
	)
}

export const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount

	if(order.tokenGive === ETHER_ADDRESS) {
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	} else {
		tokenAmount = order.amountGive
		etherAmount = order.amountGet
	}

	const precision = 1000000
	let tokenPrice = (etherAmount / tokenAmount)
	tokenPrice = Math.round(tokenPrice * precision) / precision

	return({
		...order,
		etherAmount: ether(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
	})
}

const decorateFilledOrder = (order, previousOrder) => {
	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenOrder, order.id, previousOrder)
	})
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	if(previousOrder.id === orderId) {
		return GREEN
	}

	if(previousOrder.tokenPrice <= tokenPrice) {
		return GREEN
	} else {
		return RED
	}
}

export const decorateOrderBookOrders = (orders) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateOrderBookOrder(order)
			return(order)
		})
	)
}

const decorateOrderBookOrder = (order) => {
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
	})
}

export const decorateMyFilledOrders = (orders, account) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyFillOrder(order, account)
			return(order)
		})
	)
}

const decorateMyFillOrder = (order, account) => {
	const myOrder = order.user === account

	let orderType
	if(myOrder) {
		orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
	} else {
		orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
	}

	return({
		...order,
		orderType, 
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderSign: (orderType === 'buy' ? '+' : '-')
	})
}

export const decorateMyOpenOrders = (orders, account) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order)
			order = decorateMyOpenOrder(order)
			return(order)
		})
	)
}


const decorateMyOpenOrder = (order, account) => {
	let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)
	})
}

export const buildGraphData = (orders) => {
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
	const hours = Object.keys(orders)
	const graphData = hours.map((hour) => {
		const group = orders[hour]

		const open = group[0]
		const high = maxBy(group, 'tokenPrice')
		const low = minBy(group, 'tokenPrice')
		const close = group[group.length - 1]
		
		return({
			x: new Date(hour),
			y:[open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})
	return graphData
}