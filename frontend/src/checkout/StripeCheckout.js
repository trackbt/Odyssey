import React from 'react'
import StripeCheckout from 'react-stripe-checkout';

class Checkout extends React.Component {
	constructor(props) {
		super(props);
		console.log("TakeMoney");
		console.log(props);
	}

	onSubmit = (token) => {
		console.log("Payment received by token: ",  token);
		// if payment was correctly processed

		this.props.onPaymentReceived();
	}

	onClosed = () => {
		console.log("Payment checkout closed: ");
		// TODO : !!! comment out  for testing only
		this.props.onPaymentReceived();
	}


	// ...
	
	render() {
		return (
			// ...
			<StripeCheckout
			token={this.onSubmit} // submit callback
			opened={this.onOpened} // called when the checkout popin is opened (no IE6/7)
			closed={this.onClosed} // called when the checkout popin is closed (no IE6/7)
			stripeKey="pk_test_wmvBYxueVozMD9rDbncXxzIY00ep3OGJ2T"

			name="TVM" // the pop-in header title
			description="Premium insurance" // the pop-in header subtitle
			image="https://www.tvm.nl/sites/tvm.nl/files/Vignet-TVM%2C-PMS-355.jpg" // the pop-in header image (default none)
			ComponentClass="div"
			panelLabel="Pay for Premium" // prepended to the amount in the bottom pay button
			amount={this.props.price} // cents
			currency="EUR"
			locale="en"
			email="super@ferrari.co"
			// Note: Enabling either address option will give the user the ability to
			// fill out both. Addresses are sent as a second parameter in the token callback.
			shippingAddress={false}
			billingAddress={false}
			// Note: enabling both zipCode checks and billing or shipping address will
			// cause zipCheck to be pulled from billing address (set to shipping if none provided).
			zipCode={false}
			alipay // accept Alipay (default false)
			bitcoin // accept Bitcoins (default false)
			allowRememberMe // "Remember Me" option (default true)
			// Note: `reconfigureOnUpdate` should be set to true IFF, for some reason
			// you are using multiple stripe keys
			reconfigureOnUpdate={false}
			// Note: you can change the event to `onTouchTap`, `onClick`, `onTouchStart`
			// useful if you're using React-Tap-Event-Plugin
			// triggerEvent="onTouchTap"
			>
			<button className="btn btn-primary">
			Checkout
			</button>
			</StripeCheckout>
		)
	}
}

export default Checkout
