const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const user=require("../entity/User.js");
const User=user.User;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const acc=require('../entity/Account.js');
const Account=acc.Account;
const reservedTokens=require('../entity/ReservedTokens.js');
const ReservedTokens=reservedTokens.ReservedTokens;
const reservedTokensPage=require('../pages/ReservedTokensPage.js');
const ReservedTokensPage=reservedTokensPage.ReservedTokensPage;
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');
const eth_wallet=require('ethereumjs-wallet');
const bundleRA=[];
const bundleAccounts=[];

const number=process.argv[2];
const network=process.argv[3];

//testRA();

  async function testRA() {

	  const tempOutputPath='./temp/';
	  fs.ensureDirSync(tempOutputPath);
	  const tempOutputFile=tempOutputPath+'resultReservedBundle'+Date.now()+'.json';
	  fs.ensureFileSync(tempOutputFile);


	logger.info("Test: create crowdsale with bundle of reserved tokens");
	let driver = await Utils.startBrowserWithMetamask();
	let user4_F16AFile='./users/user4_F16A.json';//Rinkeby
	let user8545_56B2File='./users/user8545_56B2.json';//Ganache
	let user77_56B2File='./users/user77_56B2.json';//Sokol
	let Owner;
	  switch(network)
	  {
		  case '4': { Owner = new User (driver,user4_F16AFile);break;}
		  case '8545':{Owner = new User (driver,user8545_56B2File);break;}
		  default: {Owner =  new User (driver,user77_56B2File);break;}
	  }

	await Utils.increaseBalance(Owner,20);
	logger.info("Owner = "+Owner.account);
	logger.info("Owner's balance = :"+await Utils.getBalance(Owner)/1e18);
	let mtMask = new MetaMask(driver);
	await mtMask.activate();//return activated Metamask and empty page
    await Owner.setMetaMaskAccount();
    var scenario = './scenarios/testRA.json';
    let crowdsale = await Utils.getCrowdsaleInstance(scenario);
    crowdsale = await Owner.createCrowdsale(crowdsale,5,'reserved');

	await Owner.openInvestPage(crowdsale);
	await driver.sleep(15000);
	await Owner.contribute(crowdsale.currency.tiers[0].supply);
	await Owner.distribute(crowdsale);
	await Owner.finalize(crowdsale);
    let obj;
	let balance;
    let shouldBe;
    let isPass=true;
    let user= Owner;
    for (let i=0;i<bundleRA.length;i++) {

	if (bundleRA[i].dimension=='percentage')
      shouldBe=bundleRA[i].value*crowdsale.tiers[0].supply/100;
	  else shouldBe=bundleRA[i].value;

	user.account=bundleAccounts[i].address;
	user.privateKey=bundleAccounts[i].privateKey;
	user.networkID=Owner.networkID;
	balance=await user.getTokenBalance(crowdsale)/1e18;
	bundleAccounts[i].balance=balance;
	isPass=isPass&&(shouldBe==balance);
	logger.info("#"+i+"   should be:"+ shouldBe+"    balance: "+balance+"   "+ (shouldBe==balance));
    }

    logger.info("RESULT: "+isPass);
    obj={owner:Owner,crowdsale:crowdsale,accounts:bundleAccounts,isPassTest:isPass};
	fs.appendFileSync(tempOutputFile,JSON.stringify(obj));

  }

  async function generateAccount() {

	let obj = eth_wallet.generate();
	let address="0x".concat(obj.getAddress().toString('hex'));
	let privateKey="0x".concat(obj.getPrivateKey().toString('hex'));
	logger.info("Address created: "+address +"   ,private key: "+privateKey);
  	return new Account(address,privateKey);

  }

   async function fillReservedTokens(driver) {

	   let account;
	   let dimension;
	   let value;
	   let RA;
  	logger.info("fill reserved tokens for testRA")
	   const reservedTokensPage=new ReservedTokensPage(driver);
	   for (var i=0;i<number;i++) {
	   account=await generateAccount();

	   dimension=Math.round(Math.random());
	   if (dimension==0) dimension='percentage';
	     else dimension='tokens';

	   value=Math.trunc(Math.random()*1000);
	   RA=new ReservedTokens(account.address,dimension,value);
	   await reservedTokensPage.fillReservedTokens(RA);
	   await reservedTokensPage.clickButtonAddReservedTokens();

	    bundleRA[i]=RA;
	    bundleAccounts[i]=account;

	   logger.info("#"+i+"  Address: "+bundleRA[i].address+"  , dimension"+bundleRA[i].dimension+"   , value: "+ bundleRA[i].value+"   #"+i);
	   await driver.sleep(1000);
	 }
	  let check=await reservedTokensPage.amountAddedReservedTokens();
	  logger.info("Reserved tokens added: "+check);
	  logger.info("Reserved tokens should be: "+number);
	   //await driver.sleep(120000);

  }

  module.exports.fillReservedTokens=fillReservedTokens;
