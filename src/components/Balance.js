import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import { 
	loadBalances,
	depositEther,
	withdrawEther,
	depositToken,
	withdrawToken
} from '../store/interactions'
import { 
	etherDepositAmountChanged, 
	etherWithdrawAmountChanged,
	tokenDepositAmountChanged, 
	tokenWithdrawAmountChanged
} from '../store/actions'
import { 
	web3Selector, 
	exchangeSelector, 
	tokenSelector, 
	accountSelector,
	etherBalanceSelector,
	tokenBalanceSelector,
	exchangeEtherBalanceSelector,
	exchangeTokenBalanceSelector,
	balancesLoadingSelector,
	etherDepositAmountSelector,
	etherWithdrawAmountSelector,
	tokenDepositAmountSelector,
	tokenWithdrawAmountSelector
} from '../store/selectors'

const showEtherBalances = (etherBalance, exchangeEtherBalance) => {
	return(
		<tr>
			<td>ETH</td>
			<td>{etherBalance}</td>
			<td>{exchangeEtherBalance}</td>
		</tr>
	)
}

const showTokenBalances = (tokenBalance, exchangeTokenBalance) => {
	return(
		<tr>
			<td>CHICKS</td>
			<td>{tokenBalance}</td>
			<td>{exchangeTokenBalance}</td>
		</tr>
	)
}

const buildForm = (submitFn, changeFn, ph, btnLabel) => {
	return(
		<tr>
			<td colSpan="3">
				<form className="row" onSubmit={(event) => {
					event.preventDefault()
					submitFn()
				}}>
					<div className="col-12 col-sm pr-sm-2">
						<input 
							type="text" 
							placeholder={ph} 
							onChange={ changeFn() } 
							className="form-control form-control-sm bg-dark text-white" 
							required />
					</div>
					<div className="col-12 col-sm-auto pl-sm-0">
						<button type="submit" className="btn btn-primary btn-block btn-sm">{btnLabel}</button>
					</div>
				</form>
			</td>
		</tr>
	)
}

const showForm = (props) => {
	const {
		etherBalance,
		tokenBalance,
		exchangeEtherBalance,
		exchangeTokenBalance, 
		dispatch,
		etherDepositAmount,
		etherWithdrawAmount,
		account,
		web3,
		token,
		exchange,
		tokenDepositAmount,
		tokenWithdrawAmount
	} = props
	
	return(
		<Tabs defaultActiveKey='deposit' className="bg-dark text-white small">
			<Tab eventKey="deposit" title="Deposit" className="bg-dark">
				<table className="table table-dark table-sm small">
					<thead  className="thead-light">
						<tr>
							<th>Token</th>
							<th>Wallet</th>
							<th>Exchange</th>
						</tr>
					</thead>
					<tbody>

						{showEtherBalances(etherBalance, exchangeEtherBalance)}

						{buildForm(
							() => {depositEther(dispatch, exchange, web3, etherDepositAmount, account)},
							() => (e) => { dispatch( etherDepositAmountChanged(e.target.value) ) },
							"ETH Amount",
							"Deposit"
						)}

						{showTokenBalances(tokenBalance, exchangeTokenBalance)}

						{buildForm(
							() => {depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)},
							() => (e) => { dispatch( tokenDepositAmountChanged(e.target.value) ) },
							"CHICKS Amount",
							"Deposit"
						)}

					</tbody>
				</table>
			</Tab>
			<Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
				<table className="table table-dark table-sm small">
					<thead  className="thead-light">
						<tr>
							<th>Token</th>
							<th>Wallet</th>
							<th>Exchange</th>
						</tr>
					</thead>
					<tbody>

						{showEtherBalances(etherBalance, exchangeEtherBalance)}

						{buildForm(
							() => {withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)},
							() => (e) => { dispatch( etherWithdrawAmountChanged(e.target.value) ) },
							"ETH Amount",
							"Withdraw"
						)}
						
						{showTokenBalances(tokenBalance, exchangeTokenBalance)}

						{buildForm(
							() => {withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)},
							() => (e) => { dispatch( tokenWithdrawAmountChanged(e.target.value) ) },
							"CHICKS Amount",
							"Withdraw"
						)}
						
					</tbody>
				</table>
			</Tab>
		</Tabs>
	)
}

class Balance extends Component {

	componentDidMount() {
		this.loadBlockchainData()
	}

	async loadBlockchainData() {
		const { dispatch, web3, exchange, token, account } = this.props
		await loadBalances(dispatch, web3, exchange, token, account)
	}

	render() {
		return (
			<div className="card bg-dark text-white">
				<div className="card-header">
					Balance
				</div>
				<div className="card-body">
					{this.props.showForm ? showForm(this.props) : <Spinner />}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	const balancesLoading = balancesLoadingSelector(state)
	
	return {
		account: accountSelector(state),
		exchange: exchangeSelector(state), 
		token: tokenSelector(state),
		web3: web3Selector(state),
		etherBalance: etherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		balancesLoading,
		showForm: !balancesLoading,
		etherDepositAmount: etherDepositAmountSelector(state),
		etherWithdrawAmount: etherWithdrawAmountSelector(state),
		tokenDepositAmount: tokenDepositAmountSelector(state),
		tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
	}
}
export default connect(mapStateToProps)(Balance)