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

	const scenarioForE2Etests = './scenarios/simpleDutchAuction.json';

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
	let crowdsaleForE2Etests;

	let mngPage;
	let balance;

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("Version 2.3.0 - Wizard2.0 ");
		crowdsaleForE2Etests = await Utils.getDutchCrowdsaleInstance(scenarioForE2Etests);
		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();

		Owner = new User(driver, user8545_dDdCFile);
		Investor1 = new User(driver, user8545_Db0EFile);

		await Utils.receiveEth(Owner, 10);
		await Utils.receiveEth(Investor1, 10);

		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = :" + await Utils.getBalance(Owner) / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = :" + await Utils.getBalance(Investor1) / 1e18);

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
	test.it('Owner  can create crowdsale(scenario DutchAuction1.json),1 tier, no whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(crowdsaleForE2Etests);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it("Invest page: Owner's balance has correct value (totalSupply-supply) ",
		async function () {
			let owner = Owner;
			await owner.openInvestPage(crowdsaleForE2Etests);
			let balance = await owner.getBalanceFromInvestPage(crowdsaleForE2Etests);
			let shouldBe = crowdsaleForE2Etests.totalSupply - crowdsaleForE2Etests.tiers[0].supply;
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED. Owner's balance has incorrect value (totalSupply-supply)");
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(crowdsaleForE2Etests);
			await investPage.waitUntilLoaderGone();
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier start as scheduled',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(crowdsaleForE2Etests);
			await investPage.waitUntilLoaderGone();
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it('Disabled to modify the end time for DutchCrowdsale',
		async function () {
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests);
			let adjust = 80000000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, newDate, newTime);
			return await assert.equal(result, false, 'Test FAILED.DutchCrowdsale is modifiable ');
		});

	test.it('Investor can buy allowed amount',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = crowdsaleForE2Etests.tiers[0].supply / 2;
			balance = contribution;
			let result = await investor.openInvestPage(crowdsaleForE2Etests)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests);
			let newBalance = await investor.getBalanceFromInvestPage(crowdsaleForE2Etests);
			let result = (newBalance >= balance);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Crowdsale is finished in time',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			driver.sleep(10000);
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it('Is disabled to buy after crowdsale time expired',
		async function () {
			let investor = Investor1;
			let contribution = crowdsaleForE2Etests.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
		});

	test.it('Not owner can not finalize)',
		async function () {
			let investor = Investor1;
			let result = await investor.finalize(crowdsaleForE2Etests);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(crowdsaleForE2Etests);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it.skip('Investor has received correct quantity of tokens after finalization', async function () {

		let investor = Investor1;
		let newBalance = await investor.getTokenBalance(crowdsaleForE2Etests) / 1e18;
		let balance = crowdsaleForE2Etests.minCap + smallAmount + 10;
		logger.info("Investor should receive  = " + balance);
		logger.info("Investor has received balance = " + newBalance);
		logger.info("Difference = " + (newBalance - balance));
		return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
	});

	test.it.skip('Check persisTTTTTTTTTT', async function () {

		let investor = Investor1;
		let newBalance = await investor.getTokenBalance(crowdsaleForE2Etests) / 1e18;
		let balance = crowdsaleForE2Etests.minCap + smallAmount + 10;
		logger.info("Investor should receive  = " + balance);
		logger.info("Investor has received balance = " + newBalance);
		logger.info("Difference = " + (newBalance - balance));
		return await assert.equal(balance, newBalance, "Test FAILED.'Investor has received " + newBalance + " tokens instead " + balance)
	});
});