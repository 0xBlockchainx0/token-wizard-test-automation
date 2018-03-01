webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');

////////////////////////////////////////////////////////
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
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
	var user4_F16AFile = './users/user4_F16A.json';  // foreigh investor
	var user77_F16AFile = './users/user4_F16A.json';  // reserved address
	var user77_56B2File = './users/user77_56B2.json';// owner
	var user4_40cAFile = './users/user4_40cA.json';
	var user77_27F2File = './users/user77_27F2.json';//whtlisted in tier1
	var user77_d13cFile = './users/user77_d13c.json';//whitelisted in tier#1 but will buy in tier #2 only
	var user77_d3E4File = './users/user77_d3E4.json';//whtlisted in tier2

	var user77_41BFile = './users/user77_41B.json';//NOT whtlisted
	var user4_F16A;
	var user77_F16A;
	var user77_56B2;
	var user4_40cA;
	var user77_27F2;
	var user77_41B;
	var user77_d3E4;
	var user77_d13c;
	var owner;


	var investor;

	//var scenario="./scenarios/T1RyWn_0008.json";//'./scenarios/simple.json';
	var scenario = './scenarios/testSuite2.json';
	var mtMask;
	var crowdsale = new Crowdsale();
	var b = false;
	var balance;
	var newBalance;
	var contribution;

	///////////////////////////////////////////////////////////////////////

	test.before(async function () {

		driver = Utils.startBrowserWithMetamask();
		user77_56B2 = new User(driver, user77_56B2File);
		user4_F16A = new User(driver, user4_F16AFile);
		user77_F16A = new User(driver, user77_F16AFile);
		user77_27F2 = new User(driver, user77_27F2File);
		user4_40cA = new User(driver, user4_40cAFile);
		user77_41B = new User(driver, user77_41BFile);
		user77_d3E4 = new User(driver, user77_d3E4File);
		user77_d13c = new User(driver, user77_d13cFile);
		mtMask = new MetaMask(driver);
		await mtMask.open();//return activated Metamask and empty page

	});

	test.after(async function () {
		driver.sleep(5000);
		let outputPath = Utils.getOutputPath();
		outputPath = outputPath + "/result" + Utils.getDate();
		fs.ensureDirSync(outputPath);
		fs.copySync(tempOutputPath, outputPath);
		fs.remove(tempOutputPath);

		//driver.quit();
	});
/////////////////////////////////////////////////////////////////////////////


	test.it('Owner  can create crowdsale(scenario testSuite2.json),2 tiers,' +
		' 2 whitelist adresses,1 reserved addresses, modifiable', async function () {
		b=false;
		owner = user77_56B2;
		await owner.setMetaMaskAccount();
		crowdsale = await owner.createCrowdsale(scenario);
		logger.info("TokenAddress:  " + crowdsale.tokenAddress);
		logger.info("ContractAddress:  " + crowdsale.contractAddress);
		logger.info("url:  " + crowdsale.url);
		b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
		assert.equal(b, true, 'Test FAILED. ');
		logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

	});
	test.it('Not whitelisted investor can NOT buy',
		async function () {
		b=true;
		investor=user77_41B;//whitelisted but only for second tier
		await owner.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b=await investor.confirmPopup();
		assert.equal(b, false, 'Test FAILED.Not whitelisted investor can  buy ');
		logger.error('Test PASSED. Not whitelisted investor can NOT buy');

		});

	test.it('Whitelisted investor can NOT buy less than assigned MIN value in first transaction',
		async function () {
		    b=true;
			investor=user77_27F2;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min*0.5);
			assert.equal(b, false, 'Test FAILED. Whitelisted investor can  buy less than assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can NOT buy less than assigned MIN value');

		});

	test.it.skip('Whitelisted investor can buy assigned MIN value ',
		async function () {
			b=false;
			investor=user77_27F2;
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);

			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].min;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		    assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can buy assigned MIN value');

		});

	test.it.skip('Whitelisted investor can buy less than MIN value if it is NOT first transaction',
		async function () {
			b=false;
			investor=user77_27F2;
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].min*0.5;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy less than MIN value if it is NOT first transaction');
			logger.error('Test PASSED. Whitelisted investor can buy less than MIN value if it is NOT first transaction');

		});

	test.it.skip('Whitelisted investor can buy assigned MAX value ',
		async function () {
			b=false;
			investor=user77_27F2;
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].max-balance;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy maximum.");
			logger.info("Test PASSED. Investor can buy maximum.");


		});
	/////////////////////////////////////////////////////////////////////////////////

	test.it('Owner can add whitelist if tier has not finished yet',
		async function () {
			b=false;
			owner = user77_56B2;
			await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			investor=user77_d13c;
			min=5;
			max=77;
			var b=await investor.addWhitelistMngPage(1,min,max);//tier#1, Min,Max
			assert.equal(b, true, 'Test FAILED. Owner can NOT add whitelist if tier has not finished yet');
			logger.info('Test PASSED. Owner can add whitelist if tier has not finished yet');


		});

	test.it('New added whitelisted investor can buy',
		async function () {
			b=false;
			investor=user77_d13c;//new added whitelist
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=0;
			contribution=max-min;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. New added whitelisted investor can NOT buy.");
			logger.info("Test PASSED. New added whitelisted investor can buy.");

		});


	test.it('Owner can NOT modify start time if crowdsale has started',
		async function () {
		b=true;
		owner = user77_56B2;
			await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(1200000,"utc");//"12:30";
			let newDate=Utils.getDateNear(1200000,"utc");//"21/03/2020";
			b=await owner.changeStartTime(crowdsale,1,newDate,newTime);
			s=await owner.getStartTime(1);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, false, 'Test FAILED. Owner can  modify start time of tier#1 if tier has started');
			logger.info('Test PASSED. Owner can NOT modify start time if tier has started');

		});
	test.it('Owner can modify start time of tier if tier has not started yet',
		async function () {
			b=false;
			owner = user77_56B2;
			//await owner.setMetaMaskAccount();//77   5b2
			//await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(120000,"utc");//"12:30";
			let newDate=Utils.getDateNear(120000,"utc");//"21/03/2020";
			b=await owner.changeStartTime(crowdsale,2,newDate,newTime);
			s=await owner.getStartTime(2);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify start time of tier if tier has not started yet');
			logger.info('Test PASSED. Owner can modify start time of tier if tier has not started yet');

		});

	test.it('Owner can modify end time of tier#1',
		async function () {
			b=false;
			owner = user77_56B2;
		    //await owner.setMetaMaskAccount();//77   5b2
			//await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(120000,"utc");
			let newDate=Utils.getDateNear(120000,"utc");
			b=await owner.changeEndTime(crowdsale,1,newDate,newTime);
			s=await owner.getEndTime(1);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify end time of tier#1');
			logger.info('Test PASSED. Owner can modify end time of tier#1');

		});
////////////////////SECOND TIER////////////////////////////////////////////////

	test.it('Check inheritance of whitelisting. Whitelisted investor can buy in next tier.',
		async function () {
			b=false;
			investor=user77_d13c;//new added whitelist
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=min;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy in next tier.');
			logger.error('Test PASSED. Whitelisted investor can buy in next tier.');


		});


	test.it('Owner can modify end time of tier#2',
		async function () {
			b=false;
			owner = user77_56B2;
			//await owner.setMetaMaskAccount();//77   5b2
			//await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(120000,"utc");//"12:30";
			let newDate=Utils.getDateNear(120000,"utc");//"21/03/2020";
			b=await owner.changeEndTime(crowdsale,2,newDate,newTime);
			s=await owner.getEndTime(2);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify end time of tier#2');
			logger.info('Test PASSED. Owner can modify end time of tier#2');


		});


	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});
	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});
	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});
	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});
	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});
	test.it('',
		async function () {
			b=false;

			assert.equal(b, true, 'Test FAILED. ');
			logger.error('');

		});





});
