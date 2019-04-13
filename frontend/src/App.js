import React, {Component} from 'react';
import './App.css';
import FancyNavBar from './layout/FancyNavBar';
import BolForm from './billOfLading/BOLForm';
import ClaimForm from './claimForm/ClaimForm';
import Checkout from './checkout/StripeCheckout';
import ReactLoading from 'react-loading';
import ls from 'local-storage'

class App extends Component {

    constructor(props) {
        super(props);
        this.state = this.getLocalState() || {
            uiState: "INSURE",
            filledFormData: {},
            price: 777,
            loadingTitle: "Preparing the good stuff",
            alarmZones: [],
            bolPdf: "/dummy.pdf",
            policyContractPdf: "/dummy.pdf",
            policyDraftPdf: "/dummy.pdf",
            contractId: "0x00",
            contractPage: "https://google.com",
            triggerClaimPage: "https://google.com",
            failReason: "Check your internet connection.",
            loggedUser: "The Consigner",
            isTakingTooLong: false,
            api_urls:{
                get_premium:'https://r0xsanekn1.execute-api.us-east-1.amazonaws.com/dev/get_premium/',
                pay_premium:'https://r0xsanekn1.execute-api.us-east-1.amazonaws.com/dev/pay_premium/'

            },

            dummyDataFromAPI: {
                "zones": [{
                    "max": {"temperature": 270, "time": 4294967295},
                    "min": {"temperature": 0, "time": 4294967295}
                }, {
                    "max": {"humidity": 100, "time": 4294967295},
                    "min": {"humidity": 85, "time": 2}
                }, {
                    "max": {"optical_power": 1500, "time": 4294967295},
                    "min": {"optical_power": 0, "time": 5}
                }, {
                    "max": {"optical_power": 10000000, "time": 4294967295},
                    "min": {"optical_power": 100000, "time": 5}
                }],
                "premium": {"TBD": "TBD"},
                "bill_of_lading_pdf": "https://www.upsfreight.com/downloads/UPGF_VICS_BOL_Form.pdf",
                "insurance_contract_pdf": "https://www.sungeneral.net/images/policies/money-insurance/SPECIMEN-Grenada-Money-Insurance.pdf",
                "request": {
                    "type": "Buffer",
                    "data": [123, 34, 115, 101, 110, 100, 101, 114, 34, 58, 34, 68, 72, 76, 32, 73, 110, 116, 101, 114, 110, 97, 116, 105, 111, 110, 97, 108, 32, 71, 109, 98, 72, 34, 125]
                }
            }
        }
    }

    onNewInsurance = () => {
        this.setState({uiState: "INSURE", isTakingTooLong: false});
    }

    onHistory = () => {
        this.setState({uiState: "HISTORY"});
    }

    onNewClaim = (id) => {
        this.setState({uiState: "CLAIM", contractId: id});
    }

    onSteteChange = (uiStateToBe) => {
        this.setState({uiState:uiStateToBe, isTakingTooLong: false})
    }

    onApiCallFailed = (info) => {
        console.log("onApiCallFailed")
        this.setState({uiState: "REST_FAIL", failReason: info});
    }

    onBolFormFilled = (formData) => {
        console.log("onBolFormFilled");
        console.log(this.state);
        this.setState({
            uiState: "PAYMENT_LOADING",
            loadingTitle: "Pricing your Premium insurace",
            filledFormData: formData
        });
        // API call for customized premium price
        fetch(this.state.api_urls.get_premium, {
            method: 'POST',
            headers: {"content-type": "application/json"},  // todo , "Access-Control-Allow-Origin":"*" ??
            body: JSON.stringify(formData),
        }).then(response => {
            if (!response.ok) {
                console.log("response NOK")
                this.onApiCallFailed(`${response.status } - ${response.statusText}`);
                return response.json();
            } else {
                console.log("response OK")
                return response.json();
            }
        }).then(data => {
            console.log("received data from TVM API");
            if (data.hasOwnProperty("zones")) {
                console.log(data.zones);
                this.onPremiumReceived(data.premium.price, data.zones, data.premium.policy_draft_pdf);
            }
        });
        // setTimeout(
        // 	this.onPremiumReceived(250000, this.state.dummyDataFromAPI.zones),
        // 	2000
        // );
        setTimeout(
            () => this.onTakingTooLong(),
        	5000
        );
    }

    onPremiumReceived = (insurancePrice, zones, draftPdf) => {
        console.log("onPremiumReceived")
        console.log(this.state)
        this.setState({uiState: "PAY", price: insurancePrice, alarmZones: zones, policyDraftPdf: draftPdf});
    }


    onPaymentReceived = () => {
        console.log("onPaymentReceived")
        console.log(this.state)
        this.setState({uiState: "CONTRACT_LOADING", loadingTitle: "Creating the Premium contract"});
        // API call for contract pdf
        fetch(this.state.api_urls.pay_premium, {
            method: 'POST',
            headers: {"content-type": "application/json"},  // todo
            body: JSON.stringify({paymentOK: true}),
        }).then(response => {
            if (!response.ok) {
                console.log("response NOK")
                this.onApiCallFailed(`${response.status } - ${response.statusText}`);
                return null;
            } else {
                console.log("response OK")
                return response.json();
            }
        }).then(data => {
            if (data.hasOwnProperty("policy")) {
                console.log(`We are in business, ${data}`);
                this.onPolicyReceived(
                    data.policy.bill_of_lading_pdf,
                    data.policy.policy_pdf,
                    data.contract_address,
                    data.contract_page,
                    data.trigger_claim_address
                    );
            }
        });
        setTimeout(
            this.onTakingTooLong(),
            5000
        );

        //
        // setTimeout(
        // 	this.onPolicyReceived(
        // 		this.state.dummyDataFromAPI.bill_of_lading_pdf,
        // 		this.state.dummyDataFromAPI.insurance_contract_pdf
        // 	),
        // 	2000
        // );
    }
OL
    onPolicyReceived = (bolPdf, contractPdf, contractId, contractPage, triggerPage) => {
        console.log("onPolicyReceived")
        console.log(this.state)
        this.setState({
            uiState: "REVIEW", bolPdf: bolPdf, policyContractPdf: contractPdf,
            contractId: contractId, contractPage: contractPage, triggerClaimPage: triggerPage
        });

    }

    render() {
        console.log("App render state -- saving");
        console.log(this.state);
        this.saveLocalState();
        if (this.state.loggedUser === "TVM") {
            // tvm claims dashboard
            return (
                <div className="App">
                    {this.renderNavbar()}
                </div>
            );
        } else
            switch (this.state.uiState) {
                case "REST_FAIL":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents App-button " id="contract-review">
                                <div className="panel panel-info">
                                    <h5>Communication failed :</h5>
                                    <p> {this.state.failReason}</p>
                                    <a href={this.onNewInsurance} target="_blank"
                                       className="btn btn-secondary">Restart</a>
                                </div>
                            </div>
                        </div>
                    );
                    break;
                case "INSURE":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents" id="bol-form">
                                <BolForm onNextStep={this.onBolFormFilled}/>
                            </div>
                            <div className="App-contents" id="checkout"></div>
                        </div>
                    );
                    break;
                case "PAY":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents" id="payment-review">
                                <h4>Premium for you</h4>
                                <p>Premium conditions will be shown here ... in table maybe</p>
                                <p>{this.state.zones}</p>
                                <Checkout onPaymentReceived={this.onPaymentReceived} price={this.state.price}/>
                            </div>
                        </div>
                    );
                    break;
                case "REVIEW":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents App-button " id="contract-review">
                                <div className="panel panel-info">
                                    <h5>Contract : {this.state.contractId}</h5>
                                    <p>Contract information has been save in your profile history.</p>
                                    <p>Save the documents otherwise you wont be able to claim insurance!</p>
                                    <a href={this.state.contractPage} target="_blank" className="btn btn-secondary">Contract
                                        state</a>
                                    <a href={this.state.triggerClaimPage} target="_blank"
                                       className="btn btn-secondary">Trigger claim contract</a>
                                    <a href={() => this.onNewClaim(this.state.contractId)} target="_blank"
                                       className="btn btn-secondary">Trigger
                                        claim</a>
                                </div>
                                <a href={this.state.bolPdf} target="_blank" className="btn btn-secondary">Bill of
                                    Lading</a>
                                <a href={this.state.policyContractPdf} target="_blank" className="btn btn-danger">Legal
                                    Contract</a>
                            </div>
                        </div>
                    );
                    break;
                case "HISTORY":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents App-button " id="contract-review">
                                {/*<InsuranceList />*/}
                                previous insurance list
                            </div>
                        </div>
                    );
                    break;
                case "CLAIM":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents" id="claim-form">
                                <ClaimForm onNextStep={this.onClaimFormFilled} contractId={this.state.contractId}/>
                            </div>
                        </div>
                    );
                    break;
                case "CLAIM_DONE":
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-contents App-button " id="contract-review">
                                <h5>Contract : {this.state.contractId}</h5>
                                claiming that the item has been stole .. or something simmilar {/*description, atachments*/}
                            </div>
                        </div>
                    );
                    break;
                default:
                    return (
                        <div className="App">
                            {this.renderNavbar()}
                            <div className="App-loading">
                                <ReactLoading type={"spin"} color={"#ffffff"} height={'20%'} width={'20%'}/>
                            </div>
                            <div className="App-loading">
                                <h4>{this.state.loadingTitle}</h4>
                            </div>
                            {this.renderRetryButton()}
                        </div>
                    );
            }

    }

// <header className="App-header">
// <img src={logo} className="App-logo" alt="logo" />
// <p>
// 	Edit <code>src/App.js</code> and save to reload.
// </p>
// <a
// 	className="App-link"
// 	href="https://reactjs.org"
// 	target="_blank"
// 	rel="noopener noreferrer"
// >
// Learn React
// </a>
// </header>
    saveLocalState() {
        ls.set("app-state", this.state)
    }

    getLocalState() {
        ls.get("app-state")
    }

    renderNavbar() {
        return <FancyNavBar
            userName={this.state.loggedUser}
            onUserChange={this.changeUser}
            onStateChange={this.onUiStateChange}/>
    }

    onUserChange = (userName) => {
        this.setState({loggedUser:userName})
    }

    onTakingTooLong = () => {
        console.log("onTakingTooLong")
        if(this.state.uiState.includes("LOADING")){
            this.setState({isTakingTooLong:true})
        }
    }

    renderRetryButton = () => {
        console.log("renderRetryButton")
        if(this.state.isTakingTooLong){
            console.log("renderRetryButton -- isTakingTooLong")
            return <div className="App-contents App-button ">
                <div className="btn btn-primary" onClick={this.onNewInsurance}>Try again</div>
            </div>
        }
    }
}

export default App;
