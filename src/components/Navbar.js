import React, { Component } from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { connect } from 'react-redux'
import { accountSelector } from '../store/selectors'

class Navigationbar extends Component {
	render() {
		return (
		
			
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" className="px-2">
                <Navbar.Brand href="#home">The CHICKS Token Exchange</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav>
                       	
                    </Nav>
                </Navbar.Collapse>
                <ul className="navbar-nav mr-auto">
					<li className="nav-item">
						<a 
							className="nav-link small" 
							href={`https://etherscan.io/address/${this.props.account}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{this.props.account}
						</a>
					</li>
				</ul>
            </Navbar>
         
		)
	}
}

function mapStateToProps(state) {
	return {
		account: accountSelector(state)
	}
}
export default connect(mapStateToProps)(Navigationbar)