import React, { Component } from 'react';
import './component.css';

import Form from "react-jsonschema-form";
import formSchema from './form-schema.json';
// import formSchema from './form-schema-test.json';
import formUiSchema from './form-ui-schema.json';


const log = (type) => console.log.bind(console, type);

class ClaimForm extends Component {
	constructor(props) {
		super(props);
		console.log(props);
	}

	onSubmit = ({formData}, e) => {
		console.log("Claim submitted: ",  formData);
		this.props.onNextStep(formData);
	}

	render() {
		return (
			(<Form schema={formSchema}
				uiSchema={formUiSchema}
				onChange={log("changed")}
				// onSubmit={() => this.onInsure()}
				onSubmit={this.onSubmit}
				onError={log("errors")} />
			)
			// , document.getElementById("bol-form")
		);
	}
}

export default ClaimForm;
