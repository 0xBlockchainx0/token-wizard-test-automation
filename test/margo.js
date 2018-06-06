const logger = require('../entity/Logger.js').logger;
let test = require('selenium-webdriver/testing');
let assert = require('assert');
const fs = require('fs-extra');
const Web3 = require('web3');
const Utils = require('../utils/Utils.js').Utils;
const addressRegistryStorage = '0xB1D914e7c55f16C2BAcAc11af6b3e011Aee38caF';
const addressMintedInitCrowdsale = '0x4FEEC2b6944E510EEf031D96330cB70F9051c440';
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const User = require("../entity/User.js").User;

run();

async function run() {

	fs.copySync('../../.env', './.env', {overwrite: true});
	let crowdsale = new Crowdsale();
	crowdsale.executionID = '0x8d96e757b5e5b2a533b7b1ad17493245ac729e6b78bf4e4e81bd8098b50a797a';
	crowdsale.sort = "dutch";
let file = await takeFunctionRateTime(crowdsale);

	//console.log("Status = " + JSON.stringify(status));
	//console.log("Status.current_rate = " + status.current_rate);
	//console.log("Status.time_remaining = " + status.time_remaining);

}

async function takeFunctionRateTime(crowdsale) {
	const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
	let status;
	await fs.ensureDirSync("./time_rate_logs/");
	let file = "./time_rate_logs/time_rate"+Date.now()+".json";
	let object = {time: "", rate: ""};
	let array=[];
	let counter = 0;

	do {
		status = await getCrowdsaleStatusRopsten(crowdsale,abi);
		await Utils.sleep(1000);
		object.time = (counter++).toString();
		object.rate = status.current_rate;
		logger.info("time: " + object.time + " ,rate: " + object.rate);
		array.push({time: object.time, rate: object.rate});
	}
	while ((parseInt(status.time_remaining) !== 0));

	await fs.writeJsonSync(file,array);
	return file;

}

async function getCrowdsaleStatusRopsten(crowdsale,abi) {
	console.log("getCrowdsaleStatusRopsten");
	try {
		let networkIDRopsten = 3;
		const web3 = await Utils.getWeb3Instance(networkIDRopsten);
		let REACT_APP_REGISTRY_STORAGE_ADDRESS = "0xb1d914e7c55f16c2bacac11af6b3e011aee38caf";
		let REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS = "0xbe9c4888a51761f6c5a7d3803106edab7c96196e";
		let myContract = new web3.eth.Contract(abi, REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS);
		let status = await myContract.methods.getCrowdsaleStatus(REACT_APP_REGISTRY_STORAGE_ADDRESS, crowdsale.executionID).call();
		//console.log("status = " + status );
		return status;
	}
	catch (err) {
		console.log("Can not get status. " + err);
		return 0;
	}

}

