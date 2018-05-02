
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');
///////////////////////////////////////////////////////
const wizardWelcome=require('../pages/WizardWelcome.js');
const WizardWelcome=wizardWelcome.WizardWelcome;
const wizStep1=require('../pages/WizardStep1.js');
const WizardStep1=wizStep1.WizardStep1;
const wizStep2=require('../pages/WizardStep2.js');
const WizardStep2=wizStep2.WizardStep2;
const wizStep3=require('../pages/WizardStep3.js');
const WizardStep3=wizStep3.WizardStep3;
const wizStep4=require('../pages/WizardStep4.js');
const WizardStep4=wizStep4.WizardStep4;
const tierpage=require('../pages/TierPage.js');
const TierPage=tierpage.TierPage;
const reservedTokensPage=require('../pages/ReservedTokensPage.js');
const ReservedTokensPage=reservedTokensPage.ReservedTokensPage;
const crowdPage=require('../pages/CrowdsalePage.js');
const CrowdsalePage=crowdPage.CrowdsalePage;
const invstPage=require('../pages/InvestPage.js');
const InvestPage=invstPage.InvestPage;
const managePage=require('../pages/ManagePage.js');
const ManagePage=managePage.ManagePage;

////////////////////////////////////////////////////////
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const tempOutputFile=Logger.tempOutputFile;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const mtMask=require('../pages/MetaMask.js');
const MetaMask=mtMask.MetaMask;
const user=require("../entity/User.js");
const User=user.User;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;

const supplyTier1=200;
const rateTier1=50000;
const mincapForInvestor2=20;
const maxForInvestor2=200;
const minReservedAddress=15;
const maxReservedAddress=50;

const smallAmount=0.1;
const significantAmount=12345678900;
const endTimeForTestEarlier="11:23";
const endDateForTestEarlier="01/07/2049";
const endTimeForTestLater="11:23";
const endDateForTestLater="01/07/2050";




test.describe('POA token-wizard. Test suite #1',  async function() {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File='./users/user8545_56B2.json';//Owner
	const user8545_F16AFile='./users/user8545_F16A.json';//Investor1 - whitelisted before deployment
	const user8545_f5aAFile='./users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile= './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time

    let scenario;
	let scenario1;
	let driver ;
	let Owner ;
	let Investor1;
	let Investor2;
	let ReservedAddress;
	let balance;

	let metaMask;
	let welcomePage;
	let wizardStep1 ;
	let wizardStep2;
	let wizardStep3;
	let tierPage;
	let reservedTokensPage;
    let investPage;
	let startURL;
	let crowdsale;
	let crowdsale1;

/////////////////////////////////////////////////////////////////////////

	test.before(async function() {
		startURL = await Utils.getStartURL();

		logger.info("Version 2.2.0 - ropsten ");
		driver = await Utils.startBrowserWithMetamask();

		//let random=Math.round(Math.random()*2);
		let random = 0;
		logger.info("Test set #"+random);
		switch (random){
			case 0:{
				scenario="./users/ropsten/0/test0_ropsten.json";
				//scenario1 = "./users/ropsten/0/testSimple_wizard2.json";
				scenario1 = "./scenarios/T1RyWy_0013.json";

				Owner = new User (driver,"./users/ropsten/0/user3_0e03.json");
				Investor1 = new User (driver,"./users/ropsten/0/user3_2a77.json");
				Investor2 = new User (driver,'./users/ropsten/0/user3_4B33.json');
				ReservedAddress = new User (driver,"./users/ropsten/0/user3_5ACC.json");
				break;
			}
			case 1:{
				scenario="./users/ropsten/1/test1_ropsten.json";
				Owner = new User (driver,"users/ropsten/1/user3_8ce1.json");
				Investor1 = new User (driver,"users/ropsten/1/user3_9E96.json");
				Investor2 = new User (driver,"users/ropsten/1/user3_020F.json");
				ReservedAddress = new User (driver,"users/ropsten/1/user3_27F2.json");
				break;
			}
			case 2:{
				scenario="./users/ropsten/2/test2_ropsten.json";
				Owner = new User (driver,"users/ropsten/2/user3_41B.json");
				Investor1 = new User (driver,"users/ropsten/2/user3_45D9.json");
				Investor2 = new User (driver,"users/ropsten/2/user3_56B2.json");
				ReservedAddress = new User (driver,"users/ropsten/2/user3_76b3.json");
				break;

			}
		}
		crowdsale=await  Utils.getCrowdsaleInstance(scenario);
		crowdsale1=await  Utils.getCrowdsaleInstance(scenario1);

		metaMask = new MetaMask(driver);
		await metaMask.activate();//return activated Metamask and empty page

		welcomePage = new WizardWelcome(driver,startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		investPage = new InvestPage(driver);

		balance = 0;

	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		//await Utils.sendEmail(tempOutputFile);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});



	/////// Tests
	test.it('Owner  can create crowdsale: 1 tier, no reserved, no whitelist' ,

		async function () {
			await  welcomePage.open();
			await  welcomePage.clickButtonNewCrowdsale();


		   // await wizardStep1.clickCheckboxDutchAuction();
		   // await driver.sleep(2000);
			//await wizardStep1.clickCheckboxWhitelistWithCap();
await wizardStep1.clickButtonContinue();

			await wizardStep2.fillName("nama");
			await wizardStep2.fillTicker("tik");
			await wizardStep2.clickButtonContinue();

			tierPage = new TierPage(driver,crowdsale1.tiers[0]);
			 await driver.sleep(5000);
			await tierPage.fillSetupName();
			await tierPage.fillRate();
			await tierPage.fillSupply();
			await tierPage.fillStartTime();
			await tierPage.fillEndTime();
		await wizardStep3.clickButtonAddTier();

			tierPage = new TierPage(driver,crowdsale1.tiers[1]);
			await driver.sleep(5000);
			await tierPage.fillSetupName();
			await tierPage.fillRate();
			await tierPage.fillSupply();
			await tierPage.fillStartTime();
			await tierPage.fillEndTime();




			return await assert.equal(true,false,"stop");

		});
////////////////// Simple scenario  /////////////////////////////////////////////////

	test.it('Owner  can create crowdsale: 1 tier, no reserved, no whitelist' ,

		async function () {

			let owner = Owner;//Owner
			await owner.setMetaMaskAccount();
			let Tfactor=1;
			await owner.createCrowdsale(crowdsale1,Tfactor);
			logger.info("Execution ID:  " + crowdsale1.executionID);
			logger.info("url:  " + crowdsale1.url);
			return await assert.equal(true,false,"stop");
			//return await assert.notEqual(crowdsale1.executionID, "", 'Test FAILED. Crowdsale has not created ');
	});

	test.it('Investor is NOT able to buy less than mincap in first transaction',
		async function() {
			let owner = Owner;//Owner
			await owner.setMetaMaskAccount();

			await owner.openInvestPage(crowdsale1);
			await owner.contribute(crowdsale1.minCap * 0.5);
			let result = await owner.getBalanceFromInvestPage(crowdsale1);
			return await assert.equal(result, 0, "Test FAILED.Investor can buy less than minCap in first transaction");
	});

	test.it('Investor can buy amount equal mincap',
		async function() {

			let investor=Owner;
			await investor.openInvestPage(crowdsale1);
			let contribution=crowdsale1.minCap;
			balance = balance + contribution;
			await investor.contribute(contribution);
			let result = await investor.getBalanceFromInvestPage(crowdsale);
			return await assert.equal(result,contribution,'Test FAILED. Investor can not buy amount = min');
	});

	test.it('Investor is able to buy less than min after first transaction',
		async function() {
			let investor=Owner;
			await investor.openInvestPage(crowdsale1);
			let contribution=crowdsale.minCap-2;
			balance = balance + contribution;
			await investor.contribute(contribution);
			let result = await investor.getBalanceFromInvestPage(crowdsale);

			return await assert.equal(result, balance, "Test FAILED. Investor can NOT buy less than min after first transaction");

	});

	test.it('Investor is  NOT able to buy more than total supply',
		async function() {

			let investor=Owner;
			await investor.openInvestPage(crowdsale1);
			let contribution=crowdsale1.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than assigned max");

	});

	test.it('Investor is able to buy total supply',
		async function() {

			let investor=Owner;
			await investor.openInvestPage(crowdsale1);
			let contribution=crowdsale1.tiers[0].supply-
							 2*crowdsale1.minCap+2;
			balance = balance + contribution;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result, balance, "Test FAILED.Investor can not buy  assigned max");

	});

	test.it('Investor is NOT able to buy if all tokens were sold',
		async function () {

			let investor=Owner;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsale1);
			let contribution=crowdsale.tier[0].minCap;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result,false, "Test FAILED.Investor can not buy if all tokens were sold");

	});

	test.it('Owner able to distribute after all tokens were sold but crowdsale is not finished',
		async function() {

			let owner=Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsale1);
			return await assert.equal(result, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");

	});


});
