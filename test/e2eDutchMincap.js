
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
const InvestPage = require('../pages/ContributionPage.js').InvestPage;
const ManagePage = require('../pages/ManagePage.js').ManagePage;
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Utils = require('../utils/Utils.js').Utils;
const MetaMask = require('../pages/MetaMask.js').MetaMask;
const User = require("../entity/User.js").User;

test.describe(`e2e test for TokenWizard2.0/DutchAuctionCrowdsale. v ${testVersion} `, async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_dDdCFile = './users/user8545_dDdC.json';//Owner
	const user8545_Db0EFile = './users/user8545_Db0E.json';//Investor1 - whitelisted before deployment
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor2 - whitelisted before deployment
	const scenarioE2eMinCap = './scenarios/scenarioE2eDutchMincapLong.json';

	const scenarioE2eDutchCheckBurn = './scenarios/scenarioE2eDutchCheckBurn.json';
	let driver;
	let Owner;
	let Investor1;
	let Investor2;

	let wallet;
	let welcomePage;
	let wizardStep1;
	let wizardStep2;
	let wizardStep3;
	let wizardStep4;
	let tierPage;
	let mngPage;
	let reservedTokensPage;
	let investPage;
	let startURL;
	let crowdsaleForUItests;
	let e2eMinCap;
	let e2eWhitelist;
	let e2eCheckBurn;
	let balanceEthOwnerBefore;
	let balanceEthOwnerAfter;

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {

		await Utils.copyEnvFromWizard();
		e2eMinCap = await Utils.getDutchCrowdsaleInstance(scenarioE2eMinCap);
		e2eCheckBurn = await Utils.getDutchCrowdsaleInstance(scenarioE2eDutchCheckBurn);

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithWallet();

		Owner = new User(driver, user8545_dDdCFile);
		Owner.tokenBalance = 0;
		Investor1 = new User(driver, user8545_Db0EFile);
		Investor1.tokenBalance = 0;
		Investor2 = new User(driver, user8545_F16AFile);
		Investor2.tokenBalance = 0;

		await Utils.receiveEth(Owner, 20);
		await Utils.receiveEth(Investor1, 20);
		await Utils.receiveEth(Investor2, 20);
		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = :" + await Utils.getBalance(Owner) / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = :" + await Utils.getBalance(Investor1) / 1e18);
		logger.info("Investor2  = " + Investor2.account);
		logger.info("Investor2 balance = :" + await Utils.getBalance(Investor2) / 1e18);

		wallet = await Utils.getWalletInstance(driver);
		await wallet.activate();//return activated Wallet and empty page
		await Owner.setWalletAccount();

		welcomePage = new WizardWelcome(driver, startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		wizardStep4 = new WizardStep4(driver);
		investPage = new InvestPage(driver);
		reservedTokensPage = new ReservedTokensPage(driver);
		mngPage = new ManagePage(driver);
		tierPage = new TierPage(driver, e2eMinCap.tiers[0]);

	});

	test.after(async function () {
		//await Utils.sendEmail(tempOutputFile);
		let outputPath = Utils.getOutputPath();
		outputPath = outputPath + "/result" + Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath, outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});

	//////////////////////// Test SUITE #2 /////////////////////////////

	test.it('Owner  can create DutchAuction crowdsale(scenario scenarioE2eDutchMincapLong.json), minCap,no whitelist',
		async function () {
			Investor1.tokenBalance = 0;
			let owner = Owner;
			assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(e2eMinCap);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it("Contribution page: Countdown timer has correct status: 'TO START OF TIER1 '",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
			let result = await investPage.isCrowdsaleNotStarted();
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
		});

	test.it("Contribution page: Owner's balance has correct value (totalSupply-supply) ",
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Owner;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let shouldBe = e2eMinCap.totalSupply - e2eMinCap.tiers[0].supply;
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED. Owner's balance has incorrect value (totalSupply-supply)");
		});
	test.it("Contribution page: minContribution field contains correct minCap value ",
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
			return await assert.equal(result, e2eMinCap.tiers[0].minCap, 'Test FAILED. MinContribution value is incorrect ');
		});
	test.it('Manage page: owner is able to change minCap before start of crowdsale',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
			assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
			e2eMinCap.tiers[0].minCap = e2eMinCap.tiers[0].minCap / 2;
			let result = await owner.changeMinCapFromManagePage(tierNumber, e2eMinCap.tiers[0].minCap);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
		});

	test.it('Investor not able to buy before start of crowdsale ',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can buy before the crowdsale started");
		});

	test.it('Crowdsale starts as scheduled',
		async function () {

			let counter = 180;
			let startTime;
			do {
				startTime = await Utils.getDutchCrowdsaleStartTime(e2eMinCap);
				logger.info("wait " + Date.now());
				logger.info("wait " + startTime);
				//console.log("Date.now() = " + Date.now());
				//console.log("startTime =  " + startTime);
				//console.log("counter"+counter);
				await driver.sleep(1000);
			}
			while (counter-- > 0 && (Date.now() / 1000 <= startTime));
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it("Contribution page: Countdown timer has correct status: 'TO END OF TIER1 '",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCurrentTier1();
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
		});
	test.it("Contribution page: minContribution field contains correct minCap value (after modifying)",
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
			//	console.log("minContr= "+ result );
			//	console.log("minCap= "+ e2eMinCap.tiers[0].minCap );
			//	console.log("equals= "+ result === e2eMinCap.tiers[0].minCap);
			//	await driver.sleep(30000);
			return await assert.equal(result, e2eMinCap.tiers[0].minCap, 'Test FAILED. MinContribution value is incorrect ');
		});
	test.it('Investor is not able to buy less than minCap in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Investor1;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = e2eMinCap.tiers[0].minCap;
			investor.tokenBalance += contribution;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Contribution page: Investors balance is properly changed after purchase ',
		async function () {
			let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 10);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Investor is able to buy less than minCap after first transaction',
		async function () {
			let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap * 0.5;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});

	test.it('Manage page: owner is able to update minCap after start of crowdsale',
		async function () {
			let owner = Owner;
			let tierNumber = 1;
			assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
			assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
			e2eMinCap.tiers[0].minCap = e2eMinCap.tiers[0].minCap * 2;
			let result = await owner.changeMinCapFromManagePage(tierNumber, e2eMinCap.tiers[0].minCap);
			return await assert.equal(result, true, 'Test FAILED.Manage page: owner is not able to update minCap after start of crowdsale ');
		});
	test.it("Contribution page: minContribution field contains correct minCap value (after modifying) ",
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
			return await assert.equal(result, e2eMinCap.tiers[0].minCap, 'Test FAILED. MinContribution value is incorrect ');
		});
	test.it('minCap should be updated: new investor is not able to buy less than new minCap ',
		async function () {
			let investor = Investor2;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap - 1;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. minCap wasn't updated");

		});
	test.it('minCap should be updated:  New investor is  able to buy amount equals  new minCap ',
		async function () {
			let investor = Investor2;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap;
			investor.tokenBalance = contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Updated minCap in action: New investor is not able to buy amount equals  new minCap");
		});

	test.it('Old investor still able to buy amount less than minCap',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap / 10;
			investor.tokenBalance += contribution;

			await investor.contribute(contribution);
			let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (Math.abs(parseFloat(balance) - parseFloat(investor.tokenBalance)) < 1);
			return await assert.equal(result, true, "Test FAILED.Investor can not  buy  maxCap");
		});

	test.it('Investor is able to buy maxCap',
		async function () {
			let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].supply;
			investor.tokenBalance = contribution - Investor2.tokenBalance;
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
			assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it("Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED '",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCrowdsaleFinalized();
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
		});

	test.it('Investor #1 has received correct quantity of tokens after finalization',
		async function () {

			let investor = Investor1;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let shouldBe = parseFloat(await investor.getBalanceFromInvestPage(e2eMinCap));
			let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)

		});
	test.it('Investor #2 has received correct quantity of tokens after finalization',
		async function () {

			let investor = Investor2;
			assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let shouldBe = parseFloat(await investor.getBalanceFromInvestPage(e2eMinCap));
			let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)

		});

	test.it('Owner has received correct quantity of tokens after finalization',
		async function () {

			let investor = Owner;
			let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
			let shouldBe = e2eMinCap.totalSupply - e2eMinCap.tiers[0].supply;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

});
