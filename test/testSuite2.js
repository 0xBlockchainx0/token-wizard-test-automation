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
	var user77_a3e8File = './users2/user77_a3e8.json';  // Owner
	var user77_abDEFile = './users2/user77_abDE.json';  // Not whitelisted investor
	var user77_75B4File = './users2/user77_75B4.json';  //Whitelisted investor #1 in tier 1
	var user77_2C68File = './users2/user77_2C68.json';  //Whitelisted investor #2 in tier 2
	var user77_AAcdFile = './users2/user77_AAcd.json';  //Whitelisted investor #3 ,
	                                                   //will be added in tier 1 from manage page
	var user77_9D76File = './users2/user77_9D76.json'; //Reserved token #1
	var user77_a75CFile = './users2/user77_a75C.json'; //Wallet address
	var user77_E743File = './users2/user77_E743.json'; //Whitelisted investor #4 in tier 2.
	                                                     // Will be added in tier#2


	var user77_a3e8;  // Owner
	var user77_abDE;  // Not whitelisted investor
	var user77_75B4;  //Whitelisted investor #1 in tier 1
	var user77_2C68;  //Whitelisted investor #2 in tier 2
	var user77_AAcd;  //Whitelisted investor #3 ,
	//will be added in tier 1 from manage page
	var user77_9D76; //Reserved token #1
	var user77_a75C; //Wallet address
	var user77_E743; //Whitelisted investor #4 in tier 2.
	// Will be added in tier#2

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

	var flagCrowdsale=false;
	var flagStartTier2=false;

	///////////////////////////////////////////////////////////////////////

	test.before(async function () {
        var u=new Utils();
		driver = await u.startBrowserWithMetamask();

		user77_a3e8 = new User(driver, user77_a3e8File); // Owner
		user77_abDE = new User(driver, user77_abDEFile);  // Not whitelisted investor
		user77_75B4 = new User(driver, user77_75B4File);  //Whitelisted investor #1 in tier 1
		user77_2C68 = new User(driver, user77_2C68File);  //Whitelisted investor #2 in tier 2
		user77_AAcd = new User(driver, user77_AAcdFile);  //Whitelisted investor #3 ,
		//will be added in tier 1 from manage page
		user77_9D76 = new User(driver, user77_9D76File); //Reserved token #1
		user77_a75C = new User(driver, user77_a75CFile); //Wallet address
		user77_E743 = new User(driver, user77_E743File);; //Whitelisted investor #4 in tier 2.

		mtMask = new MetaMask(driver);
		await mtMask.open();//return activated Metamask and empty page

	});

	test.after(async function () {
		driver.sleep(10000);

		//await Utils.sendEmail("./node_modules/token-wizard-test-automation/temp/result.log");
		await Utils.sendEmail("./temp/result.log");
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		await fs.remove(tempOutputPath);
		await driver.quit();


	});
/////////////////////////////////////////////////////////////////////////////


	test.it('Owner  can create crowdsale(scenario testSuite2.json),2 tiers,' +
		' 2 whitelist adresses,1 reserved addresses, modifiable', async function () {
		b=false;
		owner = user77_a3e8;//Owner
		await owner.setMetaMaskAccount();
		crowdsale = await owner.createCrowdsale(scenario);
		logger.info("TokenAddress:  " + crowdsale.tokenAddress);
		logger.info("ContractAddress:  " + crowdsale.contractAddress);
		logger.info("url:  " + crowdsale.url);
		b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
		flagCrowdsale=b;
		assert.equal(b, true, 'Test FAILED. ');
		logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

	});
	test.it('Not whitelisted investor can NOT buy',
		async function () {
		assert.equal(flagCrowdsale,true);
		b=true;
		investor=user77_2C68;//whitelisted#2 for tier#2
		await owner.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b=await investor.confirmPopup();
		assert.equal(b, false, 'Test FAILED.Not whitelisted investor can  buy ');
		logger.error('Test PASSED. Not whitelisted investor can NOT buy');

		});

	test.it('Whitelisted investor can NOT buy less than assigned MIN value in first transaction',
		async function () {
			assert.equal(flagCrowdsale,true);
		    b=true;
			investor=user77_75B4;//Whitelisted investor #1 in tier 1
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min*0.5);
			assert.equal(b, false, 'Test FAILED. Whitelisted investor can  buy less than assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can NOT buy less than assigned MIN value');

		});

	test.it('Whitelisted investor can buy assigned MIN value ',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			investor=user77_75B4;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);

			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].min;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		    assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can buy assigned MIN value');

		});

	test.it('Whitelisted investor can buy less than MIN value if it is NOT first transaction',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			investor=user77_75B4;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].min*0.5;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy less than MIN value if it is NOT first transaction');
			logger.error('Test PASSED. Whitelisted investor can buy less than MIN value if it is NOT first transaction');

		});

	test.it('Whitelisted investor can buy assigned MAX value ',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			investor=user77_75B4;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].max-balance;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy maximum.");
			logger.info("Test PASSED. Investor can buy maximum.");


		});
	/////////////////////////////////////////////////////////////////////////////////

	test.it('Owner can add whitelist in tier#1 if tier has not finished yet',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			owner = user77_a3e8;//Owner
			await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			investor=user77_AAcd;//Whitelisted investor #3 ,
		                         //will be added in tier 1 from manage page
			min=5;
			max=200;
			b=await investor.addWhitelistMngPage(1,min,max);//tier#1, Min,Max
			assert.equal(b, true, 'Test FAILED. Owner can NOT add whitelist if tier has not finished yet');
			logger.info('Test PASSED. Owner can add whitelist if tier has not finished yet');


		});



	test.it('New added whitelisted investor can buy',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			investor=user77_AAcd;//Whitelisted investor #3 ,
		                         //will be added in tier 1 from manage page
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=0;
			contribution=min;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. New added whitelisted investor can NOT buy.");
			logger.info("Test PASSED. New added whitelisted investor can buy.");

		});

	test.it('Whitelisted investor can NOT buy more than total supply',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=true;
			investor=user77_AAcd;//Whitelisted investor #3 ,
		                         //will be added in tier 1 from manage page
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);

			contribution=max-3*min;
			b = await investor.contribute(contribution);


			assert.equal(b, false, "Test FAILED. New added whitelisted investor can  buy more than total supply.");
			logger.info("Test PASSED. New added whitelisted investor can NOT buy more than total supply.");

		});


	test.it('Owner can NOT modify start time if crowdsale has begun',
		async function () {
			assert.equal(flagCrowdsale,true);
		b=true;
		owner = user77_a3e8;//Owner
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
	test.it('Owner can modify start time of tier#2 if tier has not begun yet',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			owner = user77_a3e8;//Owner
			//await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(180000,"utc");//"12:30";
			let newDate=Utils.getDateNear(180000,"utc");//"21/03/2020";
			b=await owner.changeStartTime(crowdsale,2,newDate,newTime);
			s=await owner.getStartTime(2);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			flagStartTier2=b;
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify start time of tier if tier has not started yet');
			logger.info('Test PASSED. Owner can modify start time of tier if tier has not started yet');

		});

	test.it('Owner can modify end time of tier#1',
		async function () {
			assert.equal(flagCrowdsale,true);

			b=false;
			owner = user77_a3e8;//Owner
		    //await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(100000,"utc");
			let newDate=Utils.getDateNear(100000,"utc");
			b=await owner.changeEndTime(crowdsale,1,newDate,newTime);
			s=await owner.getEndTime(1);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify end time of tier#1');
			logger.info('Test PASSED. Owner can modify end time of tier#1');

		});

	test.it('Owner can NOT distribute after tier#1 if tier#2 exist ', async function() {
		assert.equal(flagCrowdsale,true);

		b=true;
		owner=user77_a3e8;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  distribute after tier#1 if tier#2 exist ");
		logger.warn("Owner can NOT after tier#1 if tier#2 exist " );
	});

	test.it('Owner can NOT finalize after tier#1 if tier#2 exist ', async function() {
		assert.equal(flagCrowdsale,true);

		b=true;
		owner=user77_a3e8;
		b = await owner.finalize(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  finalize after tier#1 if tier#2 exist ");
		logger.warn("Owner can NOT finalizeafter tier#1 if tier#2 exist" );
	});

////////////////////SECOND TIER////////////////////////////////////////////////

	test.it('Owner can add whitelist for tier#2',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			owner = user77_a3e8;//Owner
			await owner.setMetaMaskAccount();//77   5b2
			await owner.openManagePage(crowdsale);
			investor=user77_E743;//Whitelisted investor #4 ,

			min=5;
			max=1000;
			b=await investor.addWhitelistMngPage(2,min,max);//tier#1, Min,Max
			assert.equal(b, true, 'Test FAILED. Owner can NOT add whitelist if tier has not finished yet');
			logger.info('Test PASSED. Owner can add whitelist if tier has not finished yet');


		});

	test.it('Check inheritance of whitelisting. Whitelisted investor can buy in next tier if max amount is not bought.',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			investor=user77_AAcd;//Whitelisted investor #3 ,
		                         //will be added in tier 1 from manage page
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=min;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy in next tier.');
			logger.error('Test PASSED. Whitelisted investor can buy in next tier.');


		});

	test.it('Whitelisted investor for tier#1 can NOT buy in tier#2 if max reached',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=true;
			investor=user77_75B4;//whitelisted#1 for tier#1
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);

			contribution=min;
			b = await investor.contribute(contribution);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy.");
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. New added whitelisted investor can NOT buy.");
			logger.info("Test PASSED. New added whitelisted investor can buy.");

			b=await investor.confirmPopup();
			assert.equal(b, false, 'Test FAILED.Not whitelisted investor can  buy ');
			logger.error('Test PASSED. Not whitelisted investor can NOT buy');

		});

/////////////////////////////////////////////////////////////////////////////////////////////////
	test.it('Tier#2.Whitelisted investor can NOT buy less than assigned MIN value in first transaction',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=true;
			investor=user77_2C68;//Whitelisted investor #2 in tier 2
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(crowdsale.currency.tiers[1].whitelist[0].min*0.5);
			assert.equal(b, false, 'Test FAILED. Whitelisted investor can  buy less than assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can NOT buy less than assigned MIN value');

		});

	test.it ('Tier#2. Whitelisted investor can buy assigned MIN value ',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			investor=user77_2C68;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);

			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[1].whitelist[0].min;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy assigned MIN value');
			logger.error('Test PASSED. Whitelisted investor can buy assigned MIN value');

		});

	test.it('Tier#2. Whitelisted investor can buy less than MIN value if it is NOT first transaction',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			investor=user77_2C68;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[1].whitelist[0].min*0.5;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, 'Test FAILED. Whitelisted investor can NOT buy less than MIN value if it is NOT first transaction');
			logger.error('Test PASSED. Whitelisted investor can buy less than MIN value if it is NOT first transaction');

		});

	test.it('Tier#2. Whitelisted investor can buy assigned MAX value ',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			investor=user77_2C68;//Whitelisted investor #1 in tier 1
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[1].whitelist[0].max-balance;
			b = await investor.contribute(contribution);
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=b&&((newBalance-balance)==contribution);
			logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED. Investor can NOT buy maximum.");
			logger.info("Test PASSED. Investor can buy maximum.");


		});

///@@@@@@@@@@@@@@@@@@(((NKJWNECNON#N$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

	test.it('Owner can modify end time of tier#2',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
			b=false;
			owner = user77_a3e8;//Owner
			await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			let newTime=Utils.getTimeNear(100000,"utc");//"12:30";
			let newDate=Utils.getDateNear(100000,"utc");//"21/03/2020";
			b=await owner.changeEndTime(crowdsale,2,newDate,newTime);
			s=await owner.getEndTime(2);//# of tier, mngPage should be open
			b=b&&Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. Owner can NOT modify end time of tier#2');
			logger.info('Test PASSED. Owner can modify end time of tier#2');


		});

	test.it('Investor can NOT buy after crowdsale time is over.',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTier2,true);
		    await Utils.wait(driver,60);//wait until crowdsale time is over for sure
			b=false;
			investor=user77_AAcd;//Whitelisted investor #3 ,
		                         //will be added in tier 1 from manage page
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(min);
			assert.equal(b, true, 'Test FAILED. Investor can  buy after crowdsale time is over.');
			logger.error('Test PASSED. Investor can NOT buy after crowdsale time is over.');

		});

///$$$$$$$%%%%%%%%%%%%%%%%%%%%##########################&&&&&&&&&&&&&&&&&@@@@@@@@@@@@@@@@@@@

	test.it('Owner can distribute (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTier2,true);
		b=false;
		owner=user77_a3e8;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
		logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");

	});

	test.it('Owner can  finalize (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTier2,true);
		b=false;
		owner=user77_a3e8;
		await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale);
		assert.equal(b, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");
		logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

	});


});
