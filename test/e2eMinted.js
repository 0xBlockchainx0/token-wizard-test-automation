webdriver = require('selenium-webdriver');
let test = require('selenium-webdriver/testing');
let assert = require('assert');
const fs = require('fs-extra');
///////////////////////////////////////////////////////
const WizardWelcome = require('../pages/WizardWelcome.js').WizardWelcome;
const WizardStep1 = require('../pages/WizardStep1.js').WizardStep1;
const WizardStep2 = require('../pages/WizardStep2.js').WizardStep2;
const WizardStep3 = require('../pages/WizardStep3.js').WizardStep3;
const WizardStep4 = require('../pages/WizardStep4.js').WizardStep4;
const TierPage = require('../pages/TierPage.js').TierPage;
const ReservedTokensPage = require('../pages/ReservedTokensPage.js').ReservedTokensPage;
const CrowdsalePage = require('../pages/CrowdsalePage.js').CrowdsalePage;
const InvestPage = require('../pages/InvestPage.js').InvestPage;
const ManagePage = require('../pages/ManagePage.js').ManagePage;
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Utils = require('../utils/Utils.js').Utils;
const MetaMask = require('../pages/MetaMask.js').MetaMask;
const User = require("../entity/User.js").User;
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;

const supplyTier1 = 200;
const rateTier1 = 50000;
const mincapForInvestor2 = 20;
const maxForInvestor2 = 200;
const minReservedAddress = 15;
const maxReservedAddress = 50;

const smallAmount = 0.1;
const significantAmount = 12345678900;
const endTimeForTestEarlier = "01:23";
const endDateForTestEarlier = "01/07/2049";
const endTimeForTestLater = "23:45";
const endDateForTestLater = "05/12/2050";


test.describe('POA token-wizard. Test MintedCappedCrowdsale', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File = './users/user8545_56B2.json';//Owner
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor1 - whitelisted before deployment
	const user8545_f5aAFile = './users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile = './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time


	let driver;
	let Owner;
	let Investor1;
	let Investor2;
	let ReservedAddress;

	let metaMask;
	let welcomePage;
	let wizardStep1;
	let wizardStep2;
	let wizardStep3;
	let wizardStep4;
	let tierPage;
	let reservedTokensPage;
	let investPage;
	let startURL;
	let crowdsaleForUItests;
	let e2eMinCap;
	let e2eWhitelist;
	let e2eMultitier;
	let mngPage;
	let balance;

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("Version 2.4.0 - Wizard2.0 ");
		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();

		const scenarioE2eMintedMinCap = './scenarios/scenarioE2eMintedMinCap.json';
		const scenarioE2eMintedWhitelist = './scenarios/scenarioE2eMintedWhitelist.json';
		const scenarioForUItests = './scenarios/ReservedTokens.json';
		const scenarioE2eMintedMultitier = './scenarios/scenarioE2eMintedMultitier.json'

		crowdsaleForUItests = await Utils.getCrowdsaleInstance(scenarioForUItests);
		e2eMinCap = await  Utils.getCrowdsaleInstance(scenarioE2eMintedMinCap);
		e2eWhitelist = await  Utils.getCrowdsaleInstance(scenarioE2eMintedWhitelist);
		e2eMultitier = await  Utils.getCrowdsaleInstance(scenarioE2eMintedMultitier);

		Owner = new User(driver, user8545_56B2File);
		Investor1 = new User(driver, user8545_F16AFile);
		Investor2 = new User(driver, user8545_f5aAFile);
		Investor2.minCap = 0;
		Investor2.maxCap = e2eWhitelist.tiers[0].supply*2;
		ReservedAddress = new User(driver, user8545_ecDFFile);
		ReservedAddress.minminCap = e2eWhitelist.tiers[0].supply/4;
		ReservedAddress.maxCap = e2eWhitelist.tiers[0].supply/2;

		await Utils.receiveEth(Owner, 20);
		await Utils.receiveEth(Investor1, 20);
		await Utils.receiveEth(Investor2, 20);
		await Utils.receiveEth(ReservedAddress, 20);

		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = :" + await Utils.getBalance(Owner) / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = :" + await Utils.getBalance(Investor1) / 1e18);
		logger.info("Investor2  = :" + Investor2.account);
		logger.info("Investor2 balance = :" + await Utils.getBalance(Investor2) / 1e18);
		logger.info("Reserved address  = :" + ReservedAddress.account);
		logger.info("ReservedAddress balance = :" + await Utils.getBalance(ReservedAddress) / 1e18);

		metaMask = new MetaMask(driver);
		await metaMask.activate();//return activated Metamask and empty page
		await Owner.setMetaMaskAccount();

		welcomePage = new WizardWelcome(driver, startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		wizardStep4 = new WizardStep4(driver);
		investPage = new InvestPage(driver);
		reservedTokensPage = new ReservedTokensPage(driver);
		mngPage = new ManagePage(driver);

	});

	test.after(async function () {
		// Utils.killProcess(ganache);
		//await Utils.sendEmail(tempOutputFile);
		let outputPath = Utils.getOutputPath();
		outputPath = outputPath + "/result" + Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath, outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});
	//////////////////////// Test SUITE #1 /////////////////////////////
	test.it('Owner  can create crowdsale(e2eWhitelist.json),1 tier, modifiable, whitelist,2 reserved',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await owner.createMintedCappedCrowdsale(e2eWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Whitelisted investor NOT able to buy before start of crowdsale ',
		async function () {
			let investor=Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution=e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can buy before the crowdsale started");
		});


	test.it('Manage page: owner is able to open the manage page',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			return await assert.equal(await owner.openManagePage(e2eWhitelist),true, 'Owner can not open manage page');
		});

	test.it('Manage page: owner is able to add whitelisted address before start of crowdsale',
		async function () {
			let owner = Owner;
			let investor=Investor2;
			let tierNumber=1;
			let result= await owner.fillWhitelistTier(tierNumber,investor.account,investor.minCap,investor.maxCap);
			return await assert.equal(result , true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
	});

	test.it('Manage page: owner is able to modify the end time before start of crowdsale',
		async function () {
			let owner = Owner;
			assert.equal(await owner.openManagePage(e2eWhitelist),true, 'Owner can not open manage page');
			let tierNumber=1;
			let result=await owner.changeEndTime(tierNumber,endDateForTestLater, endTimeForTestLater);

			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

		});
	test.it('Manage page:  end time changed  accordingly after modifying ',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber=1;
			let endTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compareDates(endTime, endDateForTestLater, endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier starts as scheduled',
		async function () {
			let investor = Owner;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it.skip('Manage page: owner is able to add whitelisted address if crowdsale has begun',
		async function () {
			let owner = Owner;
			let investor=ReservedAddress;
			assert.equal(await owner.openManagePage(e2eWhitelist),true, 'Owner can not open manage page');
			let tierNumber=1;
			let result= await owner.fillWhitelistTier(tierNumber,investor.account,investor.minCap,investor.maxCap);
			return await assert.equal(result , true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');
	});

	test.it.skip('Manage page: owner is able to modify the end time after start of crowdsale',
		async function () {
			let owner = Owner;
			assert.equal(await owner.openManagePage(e2eWhitelist),true, 'Owner can not open manage page');
			let tierNumber=1;
			let result=await owner.changeEndTime(tierNumber,endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

		});

	test.it.skip('Manage page:  end time changed  accordingly after modifying ',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber=1;
			let endTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compareDates(endTime, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});

	test.it('Whitelisted investor is NOT able to buy less than min in first transaction',
		async function() {
			let investor=Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");

	});

	test.it('Whitelisted investor can buy amount equal mincap',
		async function() {

			let investor=Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution=e2eWhitelist.tiers[0].whitelist[0].min;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result,true,'Test FAILED. Investor can not buy amount = min');
		});
	test.it('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let shouldBe = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (shouldBe.toString() === e2eWhitelist.tiers[0].whitelist[0].min.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Whitelisted investor is able to buy less than mincap after first transaction',
		async function() {
			let investor=Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution=e2eWhitelist.tiers[0].whitelist[0].min*0.1;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});

	test.it('Whitelisted investor is able to buy not more than maxCap',
		async function() {
			let investor=Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution=e2eWhitelist.tiers[0].supply;
			let result = await investor.contribute(contribution);
			let shouldBe = e2eWhitelist.tiers[0].whitelist[0].max;
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
	});

	test.it('Whitelisted investor (which was added from Manage page) is able to buy maxCap',
		async function() {
			let investor=Investor2;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it('Whitelisted investor is not able to buy more than remained even if individual maxCap is not reached',
		async function() {
			let investor=Investor2;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let shouldBe = e2eWhitelist.tiers[0].supply - Investor1.maxCap;
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than total supply");
		});

	test.it('Whitelisted investor is not able to buy if all tokens were sold',
		async function() {
			let investor=ReservedAddress;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			await assert.equal( await investor.contribute(contribution),true,'Investor can not buy') ;
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (balance.toString() === "0");
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than total supply");
		});

	test.it('Not owner can not finalize)',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await investor.finalize(e2eMinCap);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it('Whitelisted investor is not able to buy if crowdsale finalized',
		async function() {
			let investor=ReservedAddress;
			assert.equal(await investor.openInvestPage(e2eWhitelist),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			await assert.equal( await investor.contribute(contribution),true,'Investor can not buy') ;
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (balance.toString() === "0");
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than total supply");
		});

	test.it.skip('Reserved address has received correct quantity of tokens after distribution',
		async function () {

			let newBalance = await ReservedAddress.getTokenBalance(e2eMinCap) / 1e18;
			let balance = e2eMinCap.reservedTokens[0].value;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);
		});

	test.it.skip('Investor has received correct quantity of tokens after finalization', async function () {

		let investor = Investor1;
		let newBalance = await investor.getTokenBalance(e2eMinCap) / 1e18;
		let balance = e2eMinCap.minCap + smallAmount + 10;
		logger.info("Investor should receive  = " + balance);
		logger.info("Investor has received balance = " + newBalance);
		logger.info("Difference = " + (newBalance - balance));
		return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
	});


	test.it('Just STOP',
		async function () {

			return await assert.equal(false, true, 'STOP!!!! ');
		});


	//////////////////////// Test SUITE #2 /////////////////////////////
	test.it('Owner  can create crowdsale(scenarioE2eMintedMinCap.json),minCap,1 tier, not modifiable, no whitelist,2 reserved',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await owner.createMintedCappedCrowdsale(e2eMinCap);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Investor not able to buy before start of crowdsale ',
		async function () {
			let investor=Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eMinCap),true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(),true, 'Loader displayed too long time');
			let contribution=e2eMinCap.minCap*1.1;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy before the crowdsale started");
		});
	test.it('Disabled to modify the end time if crowdsale is not modifiable',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			await owner.openManagePage(e2eMinCap);
			let adjust = 80000000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, newDate, newTime);
			return await assert.equal(result, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eMinCap);
			await investPage.waitUntilLoaderGone();
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier start as scheduled',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eMinCap);
			await investPage.waitUntilLoaderGone();
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it('Investor can NOT buy less than mincap in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			await investor.openInvestPage(e2eMinCap);

			let contribution = e2eMinCap.minCap * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy less than minCap in first transaction");
		});

	test.it('Investor can buy amount equal mincap',
		async function () {
			let investor = Investor1;
			let contribution = e2eMinCap.minCap;
			balance = contribution;
			let result = await investor.openInvestPage(e2eMinCap)
					&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
	});

	test.it('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (newBalance.toString() === balance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
	});

	test.it('Investor is able to buy less than mincap after first transaction',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let contribution = smallAmount + 10;
			balance = balance + contribution;
			await investor.contribute(contribution);
			let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (newBalance.toString() === balance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
		});

	test.it('Owner is not able to finalize if all tokens were not sold and crowdsale is not finished ',
		async function() {
			let owner=Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result  = await owner.finalize(e2eMinCap);
			return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
	});

	test.it('Crowdsale is finished in time',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it('Is disabled to buy after crowdsale time expired',
		async function () {
			let investor = Investor1;
			let contribution = e2eMinCap.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
		});

	test.it('Not owner can not finalize)',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await investor.finalize(e2eMinCap);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(),true,"Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it('Investor can NOT buy if crowdsale is finalized',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(),true,"Can not set Metamask account");
			await investor.openInvestPage(e2eMinCap);
			let contribution = e2eMinCap.minCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy if crowdsale is finalized");
		});

	test.it.skip('Reserved address has received correct quantity of tokens after distribution',
		async function () {

			let newBalance = await ReservedAddress.getTokenBalance(e2eMinCap) / 1e18;
			let balance = e2eMinCap.reservedTokens[0].value;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);
		});

	test.it.skip('Investor has received correct quantity of tokens after finalization', async function () {

		let investor = Investor1;
		let newBalance = await investor.getTokenBalance(e2eMinCap) / 1e18;
		let balance = e2eMinCap.minCap + smallAmount + 10;
		logger.info("Investor should receive  = " + balance);
		logger.info("Investor has received balance = " + newBalance);
		logger.info("Difference = " + (newBalance - balance));
		return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
	});

	////////////////////////// TestSuite #2 //////////////////////////////////////

	test.it.skip('Owner  can create crowdsale(scenario testSuite2.json): 1 tier,' +
		' 1 whitelist address,2 reserved addresses, modifiable',
		async function () {
			let owner = Owner;//Owner
			let result = await owner.setMetaMaskAccount()
				&& await owner.createMintedCappedCrowdsale(e2eWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has NOT created ');
		});

	test.it.skip('Whitelisted investor NOT able to buy before start of crowdsale ',
		async function () {

			let investor = Investor1;
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await investor.setMetaMaskAccount()
				&& await investor.openInvestPage(e2eWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can not buy before the crowdsale started");
		});

	test.it.skip('Disabled to modify the name of tier ',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			let result = await owner.setMetaMaskAccount()
				&& await owner.openManagePage(e2eWhitelist)
				&& await mngPage.isDisabledNameTier(tierNumber);
			return await assert.equal(result, true, "Test FAILED. Enabled to modify the name of tier");
	});

	test.it.skip("Tier's name  matches given value",
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			assert.equal(await owner.openManagePage(e2eWhitelist),true,"Can not open Manage page");
			let tierName = await mngPage.getNameTier(tierNumber);
			return await assert.equal(tierName, e2eWhitelist.tiers[0].name, "Test FAILED. Tier's name does NOT match given value");
		});

	test.it.skip('Disabled to modify the wallet address ',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			let result = await owner.openManagePage(e2eWhitelist)
				&& await mngPage.isDisabledWalletAddressTier(tierNumber);
			return await assert.equal(result, true, "Test FAILED. Enabled to modify the wallet address of tier");
		});

	test.it.skip("Tier's wallet address matches given value",
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			await owner.openManagePage(e2eWhitelist);
			let walletAddress = await mngPage.getWalletAddressTier(tierNumber);
			return await assert.equal(walletAddress, e2eWhitelist.walletAddress, "Test FAILED. Tier's wallet address does NOT matches given value")
		});

	test.it.skip('Owner is able to add whitelisted address before start of crowdsale',
		async function () {
			let owner = Owner;
			let investor = Investor2;
			let tierNumber = 1;
			let result = await owner.openManagePage(e2eWhitelist)
				&& await owner.fillWhitelistTier(tierNumber, investor.account, mincapForInvestor2, maxForInvestor2);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
		});

	test.it.skip('Manage page: Owner is able to modify the rate before start of crowdsale',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			let result = await owner.openManagePage(e2eWhitelist)
				&& await owner.changeRate(tierNumber, rateTier1);//500
			assert.equal(result, true, 'Test FAILED.Owner is NOT able to modify the rate before start of crowdsale ');

		});

	test.it.skip('Manage page: rate changed accordingly after modifying',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			await owner.openManagePage(e2eWhitelist);
			let rate = await owner.getRateTier(tierNumber);
			return await assert.equal(rate, e2eWhitelist.tiers[0].rate, 'Test FAILED.New value of rate does not match given value');

		});

	test.it.skip('Manage page: owner is able to modify the total supply before start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let result = await owner.changeSupply(tierNumber, supplyTier1);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the total supply before start of crowdsale ');
		});

	test.it.skip('Manage page:  total supply changed accordingly  after changing',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let balance = await owner.getSupplyTier(tierNumber);
			return await assert.equal(balance, supplyTier1, 'Test FAILED. New value of supply does not match given value ');
		});

	test.it.skip('Manage page: owner is able to modify the start time  before start of crowdsale ',
		async function () {
			let adjust = 90000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);

			let result = await owner.changeStartTime(tierNumber, newDate, newTime);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the start time of tier#1 before start ');
		});

	test.it.skip('Owner is able to modify the end time before start of crowdsale',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED. Owner is NOT able to modify the end time before start of crowdsale');
		});

	test.it.skip('Manage page:  end time changed  after modifying ',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let endTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compare(endTime, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});

	test.it.skip('Manage page: warning is displayed if end time earlier than start time',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let adjust = 100;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, newDate, newTime);
			return await assert.equal(result, false, 'Test FAILED. Allowed to set  end time earlier than start time ');
		});

	test.it.skip('Warning present if not owner open manage page ',
		async function () {
			let owner = Investor1;
			await owner.setMetaMaskAccount();
			let result = await owner.openManagePage(e2eWhitelist);
			return await assert.equal(result, false, 'Test FAILED.Warning "NOT OWNER" doesnt present');
		});

	test.it.skip('Manage page: disabled to modify the start time if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			await owner.openManagePage(e2eWhitelist);
			let adjust = 120000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let result = await owner.changeStartTime(tierNumber, newDate, newTime);
			return await assert.equal(result, false, 'Test FAILED. Owner can  modify start time of tier#1 if tier has begun');

		});

	test.it.skip('Manage page: disabled to modify the total supply if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);

			let tierNumber = 1;
			let result = await owner.changeSupply(tierNumber, supplyTier1);
			return await assert.equal(result, false, 'Test FAILED.Owner able to modify the total supply after start of crowdsale ');
		});

	test.it.skip('Manage page: disabled to modify the rate if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let result = await owner.changeRate(tierNumber, rateTier1);//200
			return await assert.equal(result, false, 'Test FAILED.Owner able to modify the rate after start of crowdsale ');
		});

	test.it.skip('Manage page: owner is able to modify the end time after start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);

			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, endDateForTestLater, endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

		});

	test.it('Manage page:  end time changed  accordingly after modifying ',
		async function () {

			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let result = await  owner.getEndTime(tierNumber);
			result = Utils.compareDates(result, endDateForTestLater, endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED. End time is changed but doest match the given value');
		});

	test.it.skip('Manage page: owner is able to add whitelisted address if crowdsale has begun',
		async function () {
			let owner = Owner;
			let investor = ReservedAddress;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let result = await owner.fillWhitelistTier(tierNumber, investor.account, minReservedAddress, maxReservedAddress);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');

		});


	test.it.skip('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eWhitelist);
			await investPage.waitUntilLoaderGone();
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it.skip('Tier start as scheduled',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eWhitelist);
			await investPage.waitUntilLoaderGone();
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it.skip('Not whitelisted investor can not buy',
		async function () {
			let investor = Owner;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let contribution = e2eWhitelist.tiers[0].supply/2;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});


	test.it.skip('Whitelisted investor is NOT able to buy less than min in first transaction',
		async function () {
			let investor = Investor1;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
	});

	test.it.skip('Whitelisted investor can buy amount equal mincap',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			balance = contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
	});

	test.it.skip('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (newBalance.toString() === balance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it.skip('Whitelisted investor is able to buy less than mincap after first transaction',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min - 2;
			balance = balance +contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});

	test.it.skip('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (newBalance.toString() === balance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it.skip('Whitelisted investor is not able to buy more than assigned max',
		async function () {

			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].max;
			balance = e2eWhitelist.tiers[0].whitelist[0].max;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than assigned max");

		});
	test.it.skip('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (newBalance.toString() === balance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it.skip('Whitelisted investor is not able to buy more than total supply in tier',
		async function () {

			let investor = Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let result = await investor.contribute(e2eWhitelist.tiers[0].supply + 1);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than supply in tier");

	});

	test.it.skip('Owner is not able to finalize before  all tokens are sold and crowdsale is not finished ',
		async function () {

			let owner = Owner;
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");

		});

	test.it.skip('Whitelisted investor is able to buy total supply ',
		async function () {

			let investor = Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let contribution = supplyTier1 - e2eWhitelist.tiers[0].whitelist[0].max;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can not buy total supply");
		});

	test.it.skip('Whitelisted investor is not able to buy if all tokens were sold',
		async function () {

			let investor = ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let contribution = minReservedAddress;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can not buy if all tokens were sold");

		});

	test.it.skip('Not Owner is NOT able to finalize (after all tokens were sold)',
		async function () {

			let owner = ReservedAddress;
			await owner.setMetaMaskAccount();
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");

		});

	test.it.skip('Owner able to finalize (after all tokens were sold)',
		async function () {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");

		});


	test.it.skip('Reserved address has received correct QUANTITY of tokens after distribution',
		async function () {

			let owner = Owner;
			let newBalance = await owner.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.reservedTokens[1].value;//1e18
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);

		});

	test.it.skip('Reserved address has received correct PERCENT of tokens after distribution',
		async function () {

			let owner = ReservedAddress;

			let newBalance = await owner.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.reservedTokens[0].value * supplyTier1 / 100;

			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);

		});


	test.it.skip('Disabled to buy after finalization of crowdsale',
		async function () {

			let investor = ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(e2eWhitelist);
			let contribution = minReservedAddress;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy if crowdsale is finalized");
		});

	test.it.skip('Investor #1 has received correct amount of tokens after finalization',
		async function () {

			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.tiers[0].whitelist[0].max;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);

		});

	test.it.skip('Investor #2 has received correct amount of tokens after finalization',
		async function () {

			let investor = Investor2;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = supplyTier1 - e2eWhitelist.tiers[0].whitelist[0].max;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance);

		});

});
