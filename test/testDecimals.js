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
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const smallAmount = 0.1;
const endTimeForTestEarlier = "01:23";
const endDateForTestEarlier = "01/07/2049";
const endTimeForTestLater = "420000";
const endDateForTestLater = "420000";

test.describe('POA token-wizard. Test MintedCappedCrowdsale', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);
	const user3_56B2File ='./users/user3_56B2.json';
	const user8545_56B2File = './users/user8545_56B2.json';//Owner
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor1 - whitelisted for Tier#1 before deployment
	const user8545_f5aAFile = './users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile = './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time
	const user8545_dDdCFile = './users/user8545_dDdC.json';//Investor3 - whitelisted for Tier#2 before deployment

	let driver;
	let Owner;
	let Investor1;
	let Investor2;
	let Investor3;
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
	let endTime;
	let endDate;

	let MintedDecimalsWhitelist;
	let DutchDecimalsWhitelist;
	const scenarioDutchDecimalsWhitelist = './scenarios/scenarioDutchDecimalsWhitelist.json';
	const scenarioMintedDecimalsWhitelist = './scenarios/scenarioMintedDecimalsWhitelist.json';

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("test decimals ");
		await Utils.copyEnvFromWizard();



		//DutchDecimalsWhitelist = await  Utils.getDutchCrowdsaleInstance(scenarioDutchDecimalsWhitelist);

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();
		Owner = new User(driver, user8545_56B2File);
		await Utils.receiveEth(Owner, 20);
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = " + await Utils.getBalance(Owner) / 1e18 + " Eth");

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
		//tierPage = new TierPage(driver, e2eRopsten.tiers[0]);

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
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist.decimals = 0;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 1;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 2;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 3;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 4;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 5;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 6;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 7;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 8;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 9;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 10;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 11;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 12;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 13;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 14;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 15;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 16;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 17;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
	test.it('Owner  can create crowdsale:Minted,whitelist',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			MintedDecimalsWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioMintedDecimalsWhitelist);
			MintedDecimalsWhitelist.decimals = 18;
			console.log("Decimals = "+ MintedDecimalsWhitelist.decimals);
			let result = await owner.createMintedCappedCrowdsale(MintedDecimalsWhitelist);
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(MintedDecimalsWhitelist);
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

	test.it('Investor is able to buy amount equal minCap',
		async function () {
			let investor = Owner;
			//assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let contribution = MintedDecimalsWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.openInvestPage(MintedDecimalsWhitelist)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
		});

	test.it('Investors balance is properly changed after purchase ',
		async function () {
			let investor = Owner;
			let balance= await investor.getTokenBalance(MintedDecimalsWhitelist);
			console.log("Balance in wei = "+balance);
			let balanceTokens = balance/Math.pow(10,MintedDecimalsWhitelist.decimals);
			console.log("Balance in tokens = "+balanceTokens);
			console.log("ShouldBe = " + MintedDecimalsWhitelist.tiers[0].whitelist[0].min);
			let result  = (balanceTokens === MintedDecimalsWhitelist.tiers[0].whitelist[0].min)
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

//////////////////////////////////////
});
