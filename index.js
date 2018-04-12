
const os = require('os');
const test1=require('./tests/Test1.js');
const Test1=test1.Test1;



const utils=require('./utils/Utils.js');
const Utils=utils.Utils;
const page=require('./pages/Page.js');
const wizardWelcome=require('./pages/WizardWelcome.js');
const metaMask=require('./pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const currency= require('./entity/Currency.js');
const Currency=currency.Currency;
const tierpage=require('./pages/TierPage.js');
const TierPage=tierpage.TierPage;
const Web3 = require('web3');
const fs = require('fs-extra');
const assert = require('assert');
const Logger= require('./entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const user=require("./entity/User.js");
const User=user.User;
//const deployRegistry= require("./contracts/DeployRegistry.js");
//var Accounts = require('web3-eth-accounts');
///////////////////////////////////////
//address="0x9E963042D581D262AdE4E31541360e7FDAeE70C6";
//address="0xdDdC96314b7f16cB243Cb07e1dE081CA367095E7";
//var user8545_56B2File='./users/user8545_56B2.json';
//var user1=new User(null,user8545_56B2File);
console.log(new Date().getTime());
var decimals=15;
var smallAmount=Math.pow(10,-decimals);
//console.log(1-smallAmount);

console.log(new Date(Date.now()).getTime());
console.log(new Date().getTime());

//run();
//srun();


async function srun(){
	var user77_F16AFile='./users/user77_F16A.json';
	var owner=new User(null,user77_F16AFile);
	var user77_1180File='./users/user77_1180.json';
	var investor=new User(null,user77_1180File);


	var tokenAddress="0x8892a103A69C0dE5497cEe2acB06cEB260376e43";
	var contractAddress="0x56A9b2D6F7FE1C1Da92A6481d0c2cf9286421E5D";

	//var web3=Utils.setNetwork(77);
	//var b=await web.eth.getBalance(tokenAddress);

	var abi=[{"constant":true,"inputs":[],"name":"isPricingStrategy","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tier","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"value","type":"uint256"},{"name":"weiRaised","type":"uint256"},{"name":"tokensSold","type":"uint256"},{"name":"msgSender","type":"address"},{"name":"decimals","type":"uint256"}],"name":"calculatePrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_tier","type":"address"}],"name":"setTier","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOneTokenInWei","type":"uint256"}],"name":"updateRate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"oneTokenInWei","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"crowdsale","type":"address"}],"name":"isSane","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"purchaser","type":"address"}],"name":"isPresalePurchase","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_oneTokenInWei","type":"uint256"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newOneTokenInWei","type":"uint256"}],"name":"RateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]

	var web3 = Utils.setNetwork(this.networkID);
	var tokenContract=abi;
	var MyContract = new web3.eth.Contract(tokenContract, tokenAddress);

	var b = await MyContract.methods.balanceOf(this.account).call();
console.log (b);

}













//////////////////////////
async function xrun() {
	const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
	await web3.eth.getAccounts().then(console.log);

	await web3.eth.accounts.privateKeyToAccount("ba98116a7d4b98f22f113c59448b9cc69f916d75f35d51f088b64b483fd0b8ca");
	console.log("?????????????????????");
	await web3.eth.getAccounts().then(console.log);

	await deployRegistry("0x56B2e3C3cFf7f3921Dc2e0F8B8e20d1eEc29216b");

}

async function run() {


	// @Before Tests


    var driver;

    driver= await Utils.startBrowserWithMetamask();
    var mtMask = new MetaMask(driver);
    await mtMask.activate();//return activated Metamask and empty page

    var test1 = new Test1(driver,Utils.getOutputPath());
  // var d=await Utils.getDateFormat(driver);
 //  console.log(d);
    test1.run().then().catch();


  //  var test4 = new Test4(driver,Utils.getOutputPath());
  // test4.run().then().catch();

  //@After suit
   // driver.close();




}






