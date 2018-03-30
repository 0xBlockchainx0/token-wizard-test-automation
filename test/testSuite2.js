
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');

////////////////////////////////////////////////////////
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const tempOutputFile=Logger.tempOutputFile;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const user=require("../entity/User.js");
const User=user.User;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;


test.describe('POA token-wizard. Test suite #2', function() {
	this.timeout(2400000);//40 min

	var driver;
    var s="";
    var min;
    var max;
    var owner;
    var investor;
	var mngPage;

	var Owner;
	var Investor1;
	var Investor2;
	var Investor3;
	var ReservedAddress;

	//var scenario="./scenarios/T1RyWn_0008.json";//'./scenarios/simple.json';
	var scenario1 = './scenarios/testSuite1.json';
	var scenario2 = './scenarios/testSuite2.json';
	var mtMask;
	var crowdsale1 = new Crowdsale();//test suite #1
	var crowdsale = new Crowdsale();//test suite #2
	var b = false;
	var balance;
	var newBalance;
	var contribution;
	var flagCrowdsale=false;
	var flagStartTimeChanged=false;
	var flagWhitelistAdded=false;
	var flagDistribute=false
	var supplyTier1=200;
	var rateTier1=500;
	var newTime;
	var newDate;
	var minInvestor2=20;
	var maxInvestor2=200;
	var minReservedAddress=15;
	var maxReservedAddress=50;
	var startTime=0;
    var smallAmount=0.1;
	var user8545_56B2File='./users/user8545_56B2.json';//Owner
	var user8545_F16AFile='./users/user8545_F16A.json';//Investor1 - whitelisted before deployment
	var user8545_f5aAFile='./users/user8545_f5aA.json';//Investor2 - added from manage page before start
	var user8545_ecDFFile= './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time



	///////////////////////////////////////////////////////////////////////

	test.before(async function() {

		driver = await Utils.startBrowserWithMetamask();
		flagCrowdsale=false;
		Owner = new User (driver,user8545_56B2File);
		Investor1 = new User (driver,user8545_F16AFile);
		Investor2 = new User (driver,user8545_f5aAFile);
		ReservedAddress = new User (driver,user8545_ecDFFile);

		await Utils.sendEth(Owner,20);
		await Utils.sendEth(Investor1,20);
		await Utils.sendEth(Investor2,20);
		await Utils.sendEth(ReservedAddress,20);
		// await deployRegistry(Owner.account);
		logger.info("Roles:");
		logger.info("Owner = "+Owner.account);
		logger.info("Owner's balance = :"+await Utils.getBalance(Owner)/1e18);
		logger.info("Investor1  = "+Investor1.account);
		logger.info("Investor1 balance = :"+await Utils.getBalance(Investor1)/1e18);
		logger.info("Investor2  = :"+Investor2.account);
		logger.info("Investor2 balance = :"+await Utils.getBalance(Investor2)/1e18);

		mtMask = new MetaMask(driver);
		await mtMask.open();//return activated Metamask and empty page

	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		await Utils.sendEmail(tempOutputFile);
		//driver.sleep(10000);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});
/////////////////////////////////////////////////////////////////////////////


	test.it('Owner  can create crowdsale(scenario testSuite1.json),1 tier, not modifiable, no whitelist,1 reserved',
		async function () {
		b=false;
		owner = Owner;//Owner

		await owner.setMetaMaskAccount();
		startTime=new Date(Date.now()).getTime()+80000+80000;
		crowdsale1 = await owner.createCrowdsale(scenario1,3);
		logger.info("TokenAddress:  " + crowdsale1.tokenAddress);
		logger.info("ContractAddress:  " + crowdsale1.contractAddress);
		logger.info("url:  " + crowdsale1.url);
		b = (crowdsale1.tokenAddress != "") & (crowdsale1.contractAddress != "") & (crowdsale1.url != "");
		flagCrowdsale=b;
		assert.equal(b, true, "Test FAILED. Crowdsale has NOT created ");
		logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

	});

	test.it('Disabled to modify the end time if crowdsale not modifiable',
		async function () {
		assert.equal(flagCrowdsale, true);
		b=true;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale1);
		newTime=Utils.getTimeNear(80000000,"utc");
		newDate=Utils.getDateNear(80000000,"utc");
		b=await owner.changeEndTime(1,newDate, newTime);
		assert.equal(b, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');
		logger.info('Test PASSED. Disabled to modify the end time if crowdsale not modifiable ');
	});

	test.it('Investor can NOT buy less than minCap in first transaction',
		async function() {
		assert.equal(flagCrowdsale,true);
		b=true;
		investor=Investor1;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale1.url);
		b = await investor.contribute(crowdsale1.currency.minCap * 0.5);
		assert.equal(b, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

	});

	test.it('Investor can buy amount equals minCap',
		async function() {
		assert.equal(flagCrowdsale,true);

		b=false;
		investor=Investor1;
		//await investor.setMetaMaskAccount();
		await investor.open(crowdsale1.url);
		balance=await investor.getBalanceFromPage(crowdsale1.url);
		contribution=crowdsale1.currency.minCap;
		b = await investor.contribute(contribution);
		assert.equal(b,true,'Test FAILED. Investor can not buy amount = min');
		await investor.open(crowdsale1.url) ;
		newBalance=await investor.getBalanceFromPage(crowdsale1.url);
		b=((newBalance-balance)==contribution);
		logger.info("minCap: Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy minCap");

	});

	test.it('Investor can buy less than min after first transaction', async function() {
		assert.equal(flagCrowdsale,true);

		b=false;
		investor=Investor1;
		await investor.open(crowdsale1.url);
		balance=await investor.getBalanceFromPage(crowdsale1.url);
		contribution=smallAmount;
		b = await investor.contribute(contribution);
		newBalance=await investor.getBalanceFromPage(crowdsale1.url);
		b=((parseFloat(newBalance)-parseFloat(balance))-contribution)<=Math.abs(smallAmount);
		//console.log("Difference="+(parseFloat(newBalance)-parseFloat(balance)));
		//console.log("Contributin="+contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		//await driver.sleep(10000);
		assert.equal(b, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		logger.warn("Test PASSED. Investor can buy less than min after first transaction" );

	});

	test.it('Disabled to buy after crowdsale time is over', async function() {

      var endTime=startTime+parseInt(crowdsale1.currency.tiers[0].endDate);
      //console.log("Starttime="+startTime);
      do{
      	await driver.sleep(1000);
      	logger.info("Wait 1 sec until crowdsale ended");
      	logger.info(new Date().getTime() +" : "+ endTime);
      }
      while (new Date().getTime()<=endTime);
      assert.equal(flagCrowdsale,true);
      b=true;
      investor=Investor1;
      await investor.open(crowdsale1.url);
      contribution=crowdsale1.currency.tiers[0].supply;
      b = await investor.contribute(contribution);
      assert.equal(b, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
      logger.warn("Test PASSED. IDisabled to buy after crowdsale is finalized");
	});

	test.it('Owner can distribute (if crowdsale time is over but not all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale1);
		assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
		logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");
		flagDistribute=true;
	});

	test.it('Reserved address has received correct AMOUNT of tokens after distribution)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		flagDistribute=false;
		newBalance=await ReservedAddress.getTokenBalance(crowdsale1)/1e18;
		balance=crowdsale1.currency.reservedTokens[0].value;//1e18
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");
		flagDistribute=true;
	});

	test.it('Owner can  finalize (if crowdsale time is over but not all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		b=false;
		owner=Owner;
		//await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale1);
		assert.equal(b, true, "Test FAILED.'Owner can NOT finalize ");
		logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

	});
	test.it('Investor  receives correct amount of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		investor=Investor1;
		newBalance=await investor.getTokenBalance(crowdsale1)/1e18;
		balance=crowdsale1.currency.minCap+smallAmount;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		logger.info("Difference = "+(newBalance-balance));
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});
////////////////// TEST SUITE 2 /////////////////////////////////////////////////

	test.it('Owner  can create crowdsale(scenario testSuite2.json),1 tier,' +
		' 1 whitelist address,2 reserved addresses, modifiable',
		async function () {

		flagCrowdsale=false;
		b=false;
		owner = Owner;//Owner
		await owner.setMetaMaskAccount();
		crowdsale = await owner.createCrowdsale(scenario2,1);
		logger.info("TokenAddress:  " + crowdsale.tokenAddress);
		logger.info("ContractAddress:  " + crowdsale.contractAddress);
		logger.info("url:  " + crowdsale.url);
		b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
		flagCrowdsale=b;
		assert.equal(b, true, 'Test FAILED. Crowdsale has NOT created ');
		logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

	});

	test.it('Whitelisted investor can not buy before the crowdsale started ',
		async function () {
		assert.equal(flagCrowdsale,true);
		b=true;
		investor=Investor1;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min);
		assert.equal(b, false, "Test FAILED. Whitelisted investor can not buy before the crowdsale started");
		logger.warn("Test PASSED. IWhitelisted investor can  buy before the crowdsale started");


	});


	test.it('Disabled to modify the name of tier ',
		async function () {
		assert.equal(flagCrowdsale, true);
		owner = Owner;
		await owner.setMetaMaskAccount();
		mngPage=await owner.openManagePage(crowdsale);
		b=await mngPage.isDisabledNameTier(1);
		assert.equal(b,true,"Test FAILED. Enabled to modify the name of tier");
		logger.warn("Test PASSED. Disabled to modify the name of tier");
	});

	test.it("Tier's name  matches given value",
		async function () {
		assert.equal(flagCrowdsale, true);
		owner = Owner;
		//await owner.setMetaMaskAccount();
		mngPage=await owner.openManagePage(crowdsale);
		s=await mngPage.getNameTier(1);
		b=(s==crowdsale.currency.tiers[0].name);
		assert.equal(b,true,"Test FAILED. Tier's name does NOT matches given value");
		logger.warn("Test PASSED. Tier's name  matches given value");

	});

	test.it('Disabled to modify the wallet address ',
		async function () {
		assert.equal(flagCrowdsale, true);
		owner = Owner;
		//await owner.setMetaMaskAccount();
		mngPage=await owner.openManagePage(crowdsale);
		b=await mngPage.isDisabledWalletAddressTier(1);
		assert.equal(b,true,"Test FAILED. Enabled to modify the wallet address of tier");
		logger.warn("Test PASSED. Disabled to modify the wallet address of tier");
	});


	test.it("Tier's wallet address  matches given value",
		async function () {
		assert.equal(flagCrowdsale, true);
		owner = Owner;
		//await owner.setMetaMaskAccount();
		mngPage=await owner.openManagePage(crowdsale);
		s=await mngPage.getWalletAddressTier(1);
		b=(s==crowdsale.currency.walletAddress);
		assert.equal(b,true,"Test FAILED. Tier's wallet address does NOT matches given value")
		logger.warn("Test PASSED. Tier's wallet address  matches given value");

	});

	test.it('Owner is able to add whitelisted address before start of crowdsale',
		async function () {
		assert.equal(flagCrowdsale, true);
		b=false;
		owner = Owner;
		investor=Investor2;
		//await owner.setMetaMaskAccount();
		b=await owner.openManagePage(crowdsale);
		b=await owner.fillWhitelistTier(1,investor.account,minInvestor2,maxInvestor2);
		assert.equal(b, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
		logger.error("Test PASSED. Owner is able to add whitelisted address before start of crowdsale ");
		flagWhitelistAdded=true;
	});

	test.it.skip('Owner is able to modify the rate before start of crowdsale',
		async function () {
		assert.equal(flagCrowdsale, true);
		b=false;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		b=await owner.changeRate(1,rateTier1);//500
		assert.equal(b,true,'Test FAILED.Owner is NOT able to modify the rate before start of crowdsale ');
		await owner.openManagePage(crowdsale);
		balance=await owner.getRateTier(1);
		b=(rateTier1==balance);
		assert.equal(b, true, 'Test FAILED.New value of rate does not match given value');
		logger.error("Test PASSED. Owner is able to modify the rate before start of crowdsale");



	});
	test.it('Owner is able to modify the total supply before start of crowdsale',
		async function () {
		assert.equal(flagCrowdsale,true);
		b=false;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		b=await owner.changeSupply(1,supplyTier1)//200
		assert.equal(b,true,'Test FAILED.Owner can NOT modify the total supply before start of crowdsale ');
		await owner.openManagePage(crowdsale);
		balance=await owner.getSupplyTier(1);
		b=(supplyTier1==balance);
		assert.equal(b, true, 'Test FAILED. New value of supply does not match given value ');
		logger.error("Test PASSED. Owner is able to modify the total supply before start of crowdsale");
	});


	test.it('Owner is able to modify the start time of tier before start  ',
		async function () {
		assert.equal(flagCrowdsale,true);
		b=false;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		newTime=Utils.getTimeNear(90000,"utc");
		newDate=Utils.getDateNear(90000,"utc");
		b=await owner.changeStartTime(1,newDate, newTime);
		assert.equal(b, true, 'Test FAILED.Owner can NOT modify the start time of tier#1 before start ');
		await owner.openManagePage(crowdsale);
		s=await  owner.getStartTime(1);
		b=Utils.compare(s,newDate,newTime);
		//console.log("It is BBBB="+b);
		assert.equal(b, true, 'Test FAILED. Start time is changed but doest match the given value');
		logger.info('Test PASSED. Owner is able to modify the start time of tier#1 before start ');
		flagStartTimeChanged=true;
	});


	test.it('Owner is able to modify the end time before start of crowdsale',
		async function () {
		assert.equal(flagCrowdsale, true);
		b=false;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		newTime=Utils.getTimeNear(7000000000,"utc");
		newDate=Utils.getDateNear(7000000000,"utc");
		await owner.changeEndTime(1,newDate, newTime);
		//assert.equal(b, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 before start ');
		await owner.openManagePage(crowdsale);
		s=await  owner.getEndTime(1);
		b=await Utils.compare(s,newDate,newTime);
		//console.log("It is BBBB="+b);
		assert.equal(b, true, 'Test FAILED. End time is changed but doest match the given value');
		logger.info('Test PASSED. Owner is able to modify the end time of tier#1 before start ');

	});


	test.it('Warning present if end time earlier than start time',
		async function () {
		assert.equal(flagCrowdsale, true);

		b=true;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		newTime=Utils.getTimeNear(100,"utc");
		newDate=Utils.getDateNear(100,"utc");
		b=await owner.changeEndTime(1,newDate,newTime);
		assert.equal(b, false, 'Test FAILED. Allowed to set  end time earlier than start time ');
		logger.info('Test PASSED. Warning present if end time earlier than start time');


	});

	test.it('Not owner can NOT modify the start time of tier#1 ',
		async function () {
		assert.equal(flagCrowdsale,true);
		b=true;
		owner = Investor1;
		await owner.setMetaMaskAccount();
		b=await owner.openManagePage(crowdsale);
		if (b!=false) assert.equal(true, false, 'Test FAILED.Warning "NOT OWNER" doesnt present');
		newTime=Utils.getTimeNear(120000,"utc");
		newDate=Utils.getDateNear(120000,"utc");
		b=await owner.changeStartTime(1,newDate, newTime);
		assert.equal(b, false, 'Test FAILED.Not owner can  modify the start time of tier#1 ');
		logger.error("Test PASSED. Not owner can NOT modify the start time of tier#1 ");

	});


	test.it('Disabled to modify the start time if crowdsale has begun',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner = Owner;//Owner
		await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		newTime=Utils.getTimeNear(120000,"utc");
		newDate=Utils.getDateNear(120000,"utc");
		b=await owner.changeStartTime(1,newDate,newTime);
		assert.equal(b, false, 'Test FAILED. Owner can  modify start time of tier#1 if tier has started');
		logger.info('Test PASSED. Owner can NOT modify start time if tier has started');

	});

	test.it('Disabled to modify the total supply if crowdsale has begun',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner = Owner;//Owner
		//await owner.setMetaMaskAccount();
		//await owner.openManagePage(crowdsale);
		b=await owner.changeSupply(1,supplyTier1)//200
		assert.equal(b,false,'Test FAILED.Owner able to modify the total supply after start of crowdsale ');
		logger.error("Test PASSED. Owner is able to modify the total supply before start of crowdsale");

	});
	test.it('Disabled to modify the rate if crowdsale has begun',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner = Owner;//Owner
		//await owner.setMetaMaskAccount();
		//await owner.openManagePage(crowdsale);
		b=await owner.changeRate(1,rateTier1);//200
		assert.equal(b,false,'Test FAILED.Owner able to modify the rate after start of crowdsale ');
		logger.error("Test PASSED. Owner is able to modify the rate before start of crowdsale");

	});

	test.it('Owner is able to modify the end time after start of crowdsale.',
		async function () {
		assert.equal(flagCrowdsale, true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		owner = Owner;
		//await owner.setMetaMaskAccount();
		await owner.openManagePage(crowdsale);
		newTime=Utils.getTimeNear(80000000,"utc");
		newDate=Utils.getDateNear(80000000,"utc");
		b=await owner.changeEndTime(1,newDate, newTime);
		assert.equal(b, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');
		await owner.openManagePage(crowdsale);
		s=await  owner.getEndTime(1);
		b=Utils.compare(s,newDate,newTime);
		assert.equal(b, true, 'Test FAILED. End time is changed but doest match the given value');
		logger.info('Test PASSED. Owner is able to modify the end time of tier#1 after start ');
	});

	test.it('Owner is able to add whitelisted address if crowdsale has begun',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		flagWhitelistAdded=false;
		b=false;
		owner = Owner;
		investor=ReservedAddress;
		//await owner.setMetaMaskAccount();
		b=await owner.openManagePage(crowdsale);
		b=await owner.fillWhitelistTier(1,investor.account,minReservedAddress,maxReservedAddress);
		assert.equal(b, true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');
		logger.error("Test PASSED. Owner is able to add whitelisted address after start of crowdsale ");
		flagWhitelistAdded=true;
	});

	test.it('Whitelisted investor can NOT buy less than min in first transaction',
		async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=Investor1;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min * 0.5);
		assert.equal(b, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

	});



	test.it('Whitelisted investor can buy amount = min',
		async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor1;
		//await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=crowdsale.currency.tiers[0].whitelist[0].min;
		b = await investor.contribute(contribution);
        assert.equal(b,true,'Test FAILED. Investor can not buy amount = min');
		await investor.open(crowdsale.url) ;
		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("minCap: Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy minCap");

	});
	test.it('Whitelisted investor can buy less than min after first transaction', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor1;
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=crowdsale.currency.tiers[0].whitelist[0].min-2;
		b = await investor.contribute(contribution);
		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		logger.warn("Test PASSED. Investor can buy less than min after first transaction" );

	});

	test.it('Whitelisted investor can NOT buy more than assigned max', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=Investor1;
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].max);
		assert.equal(b, false, "Test FAILED.Investor can  buy more than assigned max");
		logger.warn("Test PASSED. Investor can NOT buy more than assigned max");

	});
	test.it('Whitelisted investor can  buy assigned max', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor1;
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=crowdsale.currency.tiers[0].whitelist[0].max-
			         2*crowdsale.currency.tiers[0].whitelist[0].min+2;
		b = await investor.contribute(contribution);
		assert.equal(b, true, "Test FAILED.Investor can not buy  assigned max");
		await investor.open(crowdsale.url);

		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy assigned max" );
	});

	test.it('Whitelisted investor can NOT buy more than total supply in tier', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=Investor2;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
		assert.equal(b, false, "Test FAILED.Investor can  buy more than supply in tier");
		logger.warn("Test PASSED. Investor can NOT contribute more than supply in tier");

	});

	test.it('Owner can NOT distribute before  all tokens are sold & crowdsale NOT ended ', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");
		logger.warn("Owner can NOT distribute before  all tokens are sold " );
	});

	test.it('Owner can NOT finalize before  all tokens are sold & crowdsale NOT ended ', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=Owner;
		b = await owner.finalize(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
		logger.warn("Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended" );
	});

	test.it('Whitelisted investor can buy total supply', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor2;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=supplyTier1-crowdsale.currency.tiers[0].whitelist[0].max;

		b = await investor.contribute(contribution);
		assert.equal(b, true, "Test FAILED.Investor can not buy total supply");
		await investor.open(crowdsale.url);
		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy total supply.");

	});
	test.it('Whitelisted investor is NOT able to buy if all tokens sold',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=ReservedAddress;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		contribution=minReservedAddress;
		b = await investor.contribute(contribution);
		assert.equal(b,false, "Test FAILED.Investor can not buy if all tokens were sold");
		logger.warn("Test PASSED. Investor can buy total supply.");

	});

	test.it('Owner can distribute (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		flagDistribute=false;
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
		logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");
		flagDistribute=true;
	});

	test.it('Reserved address has received correct AMOUNT of tokens after distribution)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		owner=Owner;

		newBalance=await owner.getTokenBalance(crowdsale)/1e18;
		balance=
			crowdsale.currency.reservedTokens[1].value;//1e18

		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");

	});

	test.it('Reserved address has received correct PERCENT of tokens after distribution)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		owner=ReservedAddress;

		newBalance=await owner.getTokenBalance(crowdsale)/1e18;
		balance=
			crowdsale.currency.reservedTokens[0].value*supplyTier1/100;

		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");

	});

	test.it('NOT Owner can NOT finalize (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=ReservedAddress;
		await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale);
		assert.equal(b, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");
		logger.warn("Test PASSED. NOT Owner can NOT finalize (after all tokens were sold) " );

	});

	test.it('Owner can  finalize (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale);
		assert.equal(b, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");
		logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

	});


	test.it('Disabled to buy after crowdsale is finalized',
		async function () {

		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=ReservedAddress;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		contribution=minReservedAddress;
		b = await investor.contribute(contribution);
		assert.equal(b, false, "Test FAILED.Investor can  buy if crowdsale is finalized");
		logger.warn("Test PASSED. IDisabled to buy after crowdsale is finalized");

	});

	test.it('Investor #1 receives correct amount of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		investor=Investor1;
		newBalance=await investor.getTokenBalance(crowdsale)/1e18;
		balance=crowdsale.currency.tiers[0].whitelist[0].max;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});
	test.it('Investor #2  receives correct amount of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		investor=Investor2;
		newBalance=await investor.getTokenBalance(crowdsale)/1e18;
		balance=50;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});

	test.it('Owner receive  correct amount of ETH ',
		async function () {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);

	});



});
