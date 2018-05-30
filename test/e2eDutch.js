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
const endTimeForTestEarlier = "11:23";
const endDateForTestEarlier = "01/07/2049";
const endTimeForTestLater = "11:23";
const endDateForTestLater = "01/07/2050";

test.describe('POA token-wizard. Test DutchAuctionCrowdsale', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_dDdCFile = './users/user8545_dDdC.json';//Owner
	const user8545_Db0EFile = './users/user8545_Db0E.json';//Investor1 - whitelisted before deployment
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor2 - whitelisted before deployment
	const scenarioE2eMinCap = './scenarios/scenarioE2eDutchMincapLong.json';
	const scenarioE2eWhitelist = './scenarios/scenarioDutchWhitelistShort.json';

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

	let mngPage;
	let balance;

	let balanceEthOwnerBefore;
	let balanceEthOwnerAfter;

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("Version 2.4.0 - Wizard2.0 - DutchAuction");
		e2eMinCap = await Utils.getDutchCrowdsaleInstance(scenarioE2eMinCap);
		e2eWhitelist = await Utils.getDutchCrowdsaleInstance(scenarioE2eWhitelist);

		//e2eMinCap.print();
		//throw("Stop");

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();

		Owner = new User(driver, user8545_dDdCFile);
		Investor1 = new User(driver, user8545_Db0EFile);
		Investor1.tokenBalance = 0;
		Investor2 = new User(driver, user8545_F16AFile);
		Investor2.minCap = e2eWhitelist.tiers[0].whitelist[0].min;
		Investor2.maxCap = e2eWhitelist.tiers[0].whitelist[0].max;

		await Utils.receiveEth(Owner, 10);
		await Utils.receiveEth(Investor1, 10);
		await Utils.receiveEth(Investor2, 10);
		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = :" + await Utils.getBalance(Owner) / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = :" + await Utils.getBalance(Investor1) / 1e18);
		logger.info("Investor2  = " + Investor2.account);
		logger.info("Investor2 balance = :" + await Utils.getBalance(Investor2) / 1e18);

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

	////////UI TESTS
	test.it.skip('Check persisTTTTTTTTTT', async function () {

		let investor = Investor1;
		let newBalance = await investor.getTokenBalance(e2eMinCap) / 1e18;
		let balance = e2eMinCap.minCap + smallAmount + 10;
		logger.info("Investor should receive  = " + balance);
		logger.info("Investor has received balance = " + newBalance);
		logger.info("Difference = " + (newBalance - balance));
		return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
	});
	//////////////////////// Test SUITE #1 /////////////////////////////
	test.it('Owner can create crowdsale, 2 Whitelisted',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(e2eWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it("Invest page: Owner's balance has correct value (totalSupply-supply) ",
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let owner = Owner;
			await owner.openInvestPage(e2eMinCap);
			let balance = await owner.getBalanceFromInvestPage(e2eWhitelist);
			let shouldBe = e2eWhitelist.totalSupply - e2eWhitelist.tiers[0].supply;
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED. Owner's balance has incorrect value (totalSupply-supply)");
		});

	test.it('Whitelisted investor not able to buy before start of crowdsale ',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can buy before the crowdsale started");
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier starts as scheduled',
		async function () {
			let investor = Owner;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it('Whitelisted investor is NOT able to buy less than min in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});

	test.it('Whitelisted investor can buy amount equal mincap',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
		});
	test.it('Invest page: Investors balance is properly changed  after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			console.log("newBalance="+newBalance);
			console.log("investor.tokenBalance="+investor.tokenBalance);
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 25);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Whitelisted investor is able to buy less than mincap after first transaction',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.1;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});
	test.it('Whitelisted investor is able to buy maxCap',
		async function () {

			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it("Whitelisted investor's balance restricted by maxCap",
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			investor.tokenBalance = e2eWhitelist.tiers[0].whitelist[0].max;
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 300);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");

		});
	test.it('Whitelisted investor#2 is able to buy  if mincap is zero',
		async function () {

			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = 0.000001;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		});
	test.it('Whitelisted investor#2 balance is properly changed',
		async function () {

			let investor = Investor2;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (parseFloat(newBalance) !== 0);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		});



	test.it('Tier#1 has finished as scheduled',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it('Whitelisted investor is not able to buy if crowdsale finished',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			return await assert.equal(await investor.contribute(contribution), false, 'Whitelisted investor is able to buy if crowdsale finalized');
		});
	test.it('Not owner is not able to finalize',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await investor.finalize(e2eWhitelist);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it('Owner is able to finalize (if all tokens are sold but crowdsale time is not expired)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it.skip('Investor has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});
	test.it.skip('Owner has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});
	//////////////////////// Test SUITE #2 /////////////////////////////
	test.it('Owner  can create crowdsale(scenario scenarioE2eDutchMincapLong.json), minCap,no whitelist',
		async function () {
			Investor1.tokenBalance = 0;
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(e2eMinCap);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it("Invest page: Owner's balance has correct value (totalSupply-supply) ",
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let owner = Owner;
			await owner.openInvestPage(e2eMinCap);
			let balance = await owner.getBalanceFromInvestPage(e2eMinCap);
			let shouldBe = e2eMinCap.totalSupply - e2eMinCap.tiers[0].supply;
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED. Owner's balance has incorrect value (totalSupply-supply)");
		});

	test.it('Investor not able to buy before start of crowdsale ',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eMinCap), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eMinCap.minCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can buy before the crowdsale started");
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			await investPage.waitUntilLoaderGone();
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier start as scheduled',
		async function () {
			let investor = Investor1;
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

	test.it('Investor is not able to buy less than minCap in first transaction',
		async function () {
			let investor = Investor1;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eMinCap), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eMinCap.minCap * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});

	test.it('Investor is able to buy amount equal mincap',
		async function () {
			let investor = Investor1;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = e2eMinCap.minCap;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(e2eMinCap)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Invest page: Investors balance is properly changed after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 10);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Whitelisted investor is able to buy less than mincap after first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eMinCap), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eMinCap.minCap * 0.5;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});

	test.it('Whitelisted investor is able to buy maxCap',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eMinCap), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eMinCap.tiers[0].supply;
			investor.tokenBalance = contribution;
			await investor.contribute(contribution);
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (Math.abs(parseFloat(balance) - parseFloat(investor.tokenBalance)) < 0.1);
			return await assert.equal(result, true, "Test FAILED.Investor can not  buy  maxCap");
		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = e2eMinCap.tiers[0].supply;
			let delta = 0.1;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].minRate, delta);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it('Owner is able to finalize (if all tokens have been sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it.skip('Investor has received correct quantity of tokens after finalization',
		async function () {

			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eMinCap) / 1e18;
			let balance = e2eMinCap.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});
	test.it.skip('Owner has received correct quantity of tokens after finalization',
		async function () {

			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eMinCap) / 1e18;
			let balance = e2eMinCap.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});

	test.it.skip('Crowdsale is finished in time',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			driver.sleep(10000);
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it.skip('Is disabled to buy after crowdsale time expired',
		async function () {
			let investor = Investor1;
			let contribution = e2eMinCap.minCap * 1.1;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
		});

	test.it.skip('Not owner can not finalize)',
		async function () {
			let investor = Investor1;
			let result = await investor.finalize(e2eMinCap);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it.skip('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});
	test.it.skip('Investor has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});
	test.it.skip('Owner has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor1;
			let newBalance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let balance = e2eWhitelist.minCap + smallAmount + 10;
			logger.info("Investor should receive  = " + balance);
			logger.info("Investor has received balance = " + newBalance);
			logger.info("Difference = " + (newBalance - balance));
			return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
		});
});