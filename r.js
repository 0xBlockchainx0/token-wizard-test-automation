const Nifty = require('./pages/Nifty.js').Nifty;
const Utils = require('./utils/Utils.js').Utils;
//import {WALLET} from './utils/constants.js'

//let a=WALLET;
//run();
async function run()
{
	let wallet = await
	await Utils.getWalletInstance(1);

	console.log(wallet.URL)
	console.log(wallet.constructor.name)
}
