require('dotenv').config()
let test = require('selenium-webdriver/testing');
let assert = require('assert');
const fs = require('fs-extra');
const Web3 = require('web3');
const Utils = require('../utils/Utils.js').Utils;
const addressRegistryStorage = '0xB1D914e7c55f16C2BAcAc11af6b3e011Aee38caF';
const addressMintedInitCrowdsale = '0x4FEEC2b6944E510EEf031D96330cB70F9051c440';
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const User = require("../entity/User.js").User;
//const execID = '0x39e0f8fc2049d5176112b8695b4f245ad4c5a2a8b8b4dfd04607cf4f95e74ebc';



run();

async function run()
{

	fs.copySync('../../.env','./.env',{overwrite:true});
	let crowdsale = new Crowdsale();
	crowdsale.executionID = '0x4b9cf9f229c56a943d7deeee7de40d36e0bbd486d810e281297faeaefadaf4a3';
	crowdsale.sort = "minted";
	crowdsale.networkID=8545;
	const account = '0xF16AB2EA0a7F7B28C267cbA3Ed211Ea5c6e27411';

	const user8545_F16AFile = './users/user8545_F16A.json';//Investor2 - whitelisted before deployment

	let user = new User(null, user8545_F16AFile);
console.log("user.account "+user.account )
	let balance = await user.getTokenBalance(crowdsale)
	console.log("Balance = " + balance );

}

