
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
const smallAmount = 0.1;

test.describe('e2e test for TokenWizard2.0/DutchAuctionCrowdsale. v2.8.1 ', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_dDdCFile = './users/user8545_dDdC.json';//Owner
	const user8545_Db0EFile = './users/user8545_Db0E.json';//Investor1 - whitelisted before deployment
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor2 - whitelisted before deployment
	const scenarioE2eMinCap = './scenarios/scenarioE2eDutchMincapLong.json';
	const scenarioE2eWhitelist = './scenarios/scenarioE2eDutchWhitelistShort.json';
	const scenarioForUItests = './scenarios/scenarioUItests.json';
	const scenarioE2eDutchCheckBurn = './scenarios/scenarioE2eDutchCheckBurn.json';
	let driver;
	let Owner;
	let Investor1;
	let Investor2;

	let metaMask;
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

		e2eWhitelist = await Utils.getDutchCrowdsaleInstance(scenarioE2eWhitelist);
		crowdsaleForUItests = await Utils.getDutchCrowdsaleInstance(scenarioForUItests);

		e2eCheckBurn = await Utils.getDutchCrowdsaleInstance(scenarioE2eDutchCheckBurn);

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();

		Owner = new User(driver, user8545_dDdCFile);
		Owner.tokenBalance = 0;
		Investor1 = new User(driver, user8545_Db0EFile);
		Investor1.tokenBalance = 0;
		Investor2 = new User(driver, user8545_F16AFile);
		Investor2.minCap = e2eWhitelist.tiers[0].whitelist[0].min;
		Investor2.maxCap = e2eWhitelist.tiers[0].whitelist[0].max;
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
		tierPage = new TierPage(driver, crowdsaleForUItests.tiers[0]);

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


	//////////////////////// Test SUITE #0 /////////////////////////////

	test.it('Owner can create crowdsale: 1 whitelisted address,duration 1 min',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(e2eCheckBurn);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getDutchCrowdsaleStartTime(e2eCheckBurn);
				logger.info("wait " + Date.now());
				logger.info("wait " + startTime);
				await driver.sleep(1000);

			}
			while (counter-- > 0 && (Date.now() / 1000 <= startTime));
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});
	test.it('Crowdsale has finished as scheduled',
		async function () {
			let endT;
			let counter = 180;
			do {
				endT = await Utils.getDutchCrowdsaleEndTime(e2eCheckBurn);
				logger.info("wait " + Date.now());
				logger.info("wait " + endT);
				await driver.sleep(1000);
			}
			while (counter-- > 0 && (Date.now() / 1000 <= endT));
			return await assert.equal(counter > 0, true, 'Test FAILED. Crowdsale has not finished in time ');
		});

	test.it('Owner is able to finalize (if crowdsale time is over but not all tokens have sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eCheckBurn);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it('Check if flag  `burn_exceed` works: Owner has  NOT received unsold tokens after finalization',
		async function () {
			let investor = Owner;
			let balance = await investor.getTokenBalance(e2eCheckBurn) / 1e18;
			let shouldBe = 0;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));

			console.log("Investor should receive  = " + shouldBe);
			console.log("Investor has received balance = " + balance);
			console.log("Difference = " + (balance - shouldBe));


			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});
	//////////////////////// Test SUITE #1 /////////////////////////////
	test.it('Owner can create crowdsale: 1 whitelisted address,duration 5 min',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createDutchAuctionCrowdsale(e2eWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it("Contribution page: Countdown timer has correct status: 'TO START OF TIER1 '",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.isCrowdsaleNotStarted();
			//console.log(await investPage.getStatusTimer())
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
		});

	test.it("Invest page: Owner's balance has correct value (totalSupply-supply) ",
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let owner = Owner;
			await owner.openInvestPage(e2eWhitelist);
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

	test.it('Manage page: owner is able to add whitelisted address before start of crowdsale',
		async function () {
			let owner = Owner;
			let investor = Investor2;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
			let tierNumber = 1;
			let result = await owner.addWhitelistTier(tierNumber, investor.account, investor.minCap, investor.maxCap);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
		});

	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getDutchCrowdsaleStartTime(e2eWhitelist);
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

	test.it("Contribution  page: Countdown timer has correct status: 'TO END OF TIER1 '",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.isCurrentTier1();
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
		});

	test.it("Contribution page: minContribution field is 'You are not allowed' for non-whitelisted investors",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.getMinContribution();
			return await assert.equal(result, -1, 'Test FAILED. MinContribution value is incorrect');
		});
	test.it('Manage page: owner is able to add whitelisted address after start of crowdsale',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
			let tierNumber = 1;
			owner.minCap = e2eWhitelist.tiers[0].supply / 10;
			owner.maxCap = e2eWhitelist.tiers[0].supply;
			let result = await owner.addWhitelistTier(tierNumber, owner.account, owner.minCap, owner.maxCap);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');
		});

	test.it("Contribution page: minContribution field contains correct minCap value for whitelisted investor",
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.getMinContribution();
			return await assert.equal(result, investor.minCap, 'Test FAILED. MinContribution value is incorrect ');
		});

	test.it('Whitelisted investor which was added before start can buy amount equal mincap',
		async function () {
			let investor = Investor2;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = investor.minCap;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Whitelisted investor that was added before start can not buy');
		});

	test.it('Whitelisted investor which was added after start can buy amount equal mincap',
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = investor.minCap;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Whitelisted investor that was added after start can not buy');
		});

	test.it('Whitelisted investor is not able to buy less than minCap in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});

	test.it('Whitelisted investor  can buy amount equal mincap',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
		});
	test.it("Contribution page: Investor's balance is properly changed  after purchase ",
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			logger.info("newBalance=" + newBalance);
			logger.info("investor.tokenBalance=" + investor.tokenBalance);
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 250);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Whitelisted investor  is able to buy less than mincap after first transaction',
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
	test.it('Whitelisted investor  is able to buy maxCap',
		async function () {

			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			investor.tokenBalance = Investor1.maxCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it("Whitelisted investor's #1 balance limited by maxCap",
		async function () {
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let newBalance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			investor.tokenBalance = e2eWhitelist.tiers[0].whitelist[0].max;
			let result = (Math.abs(parseFloat(newBalance) - parseFloat(investor.tokenBalance)) < 500);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");

		});

	test.it('Crowdsale has finished as scheduled',
		async function () {
			let endT;
			let counter = 180;
			do {
				endT = await Utils.getDutchCrowdsaleEndTime(e2eWhitelist);
				logger.info("wait " + Date.now());
				logger.info("wait " + endT);
				//console.log("Date.now() = " + Date.now());
				//console.log("endTime =  " + endT);
				//console.log("counter"+counter);
				await driver.sleep(1000);
			}
			while (counter-- > 0 && (Date.now() / 1000 <= endT));
			return await assert.equal(counter > 0, true, 'Test FAILED. Crowdsale has not finished in time ');
		});

	test.it("Contribution page: Countdown timer has correct status: 'CROWDSALE HAS ENDED'",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.isCrowdsaleEnded();
			//console.log("result = "+result);
			return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
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
	test.it('Owner has received correct quantity of tokens ',
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			await investor.openInvestPage(e2eWhitelist);
			let shouldBe = parseFloat(await investor.getBalanceFromInvestPage(e2eWhitelist));
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			balanceEthOwnerBefore = balance;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});
	test.it('Owner is able to finalize (if crowdsale time is over but not all tokens have sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it("Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'",
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.isCrowdsaleFinalized();
			return await assert.equal(result, true, 'Test FAILED. Countdown timer are not displayed ');
		});
	test.it('Investor#1 has received correct quantity of tokens after finalization',
		async function () {

			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let shouldBe = parseFloat(await investor.getBalanceFromInvestPage(e2eWhitelist));
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

	test.it('Investor#2 has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			await investor.openInvestPage(e2eWhitelist);
			let shouldBe = parseFloat(await investor.getBalanceFromInvestPage(e2eWhitelist));
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			let result = (Math.abs(shouldBe - balance) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

	test.it('Check if flag  `burn_exceed` works: Owner has  received unsold tokens after finalization',
		async function () {
			let investor = Owner;

			let soldAmount = await Utils.getTokensSold(e2eWhitelist) / 1e18;
			let unsoldAmount = e2eWhitelist.tiers[0].supply - soldAmount;
			console.log("Owner should receive unsoldAmount = " + unsoldAmount);
			console.log("soldAmount = " + soldAmount);

			console.log("balanceOwnerBefore = " + balanceEthOwnerBefore);//Token balance before finalization
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			console.log("balanceOwnerAfter = " + balance);
			let delta = Math.abs(balanceEthOwnerBefore - balance)
			let result = (Math.abs(delta - unsoldAmount) < 1e-6);
			return await assert.equal(result, true, "Test FAILED.'Owner has additionaly  received " + balance + " tokens instead " + unsoldAmount)
		});


});
