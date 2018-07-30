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

test.describe('POA token-wizard. Test MintedCappedCrowdsale', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File = './users/user8545_56B2.json';//Owner

	let driver;
	let Owner;

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

	let crowdsale;
	let whitelistedAddresses;
	const scenario = './scenarios/scenarioWhitelistMinted.json';

	const amountWhitelisted = 60;

/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("test how many whitelisted can be added ");
		await Utils.copyEnvFromWizard();

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithWallet();
		Owner = new User(driver, user8545_56B2File);
		await Utils.receiveEth(Owner, 2);
		logger.info("Owner = " + Owner.account);
		logger.info("Owner's balance = " + await Utils.getBalance(Owner) / 1e18 + " Eth");

		metaMask = new MetaMask(driver);
		await metaMask.activate();//return activated Metamask and empty page
		await Owner.setWalletAccount();

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

	test.it('Owner  can create crowdsale:Minted,minCap',
		async function () {
			let owner = Owner;
			crowdsale = await  Utils.getMintedCrowdsaleInstance(scenario);
			whitelistedAddresses = await Utils.generateCSVWhitelistedAddresses(amountWhitelisted);

			assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");

			let result = await owner.createMintedCappedCrowdsale(crowdsale, false, "", true, whitelistedAddresses + ".csv");
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it('Crowdsale has correct number of whitelisted',
		async function () {
			let tierNumber = 1;
			let numberWhitelisted = await Utils.getTierWhitelistMintedCrowdsale(crowdsale, tierNumber);
			console.log("numberWhitelisted = " + numberWhitelisted)
			return await assert.equal(numberWhitelisted, amountWhitelisted, 'Test FAILED. ');
		});

	test.it('Crowdsale starts as scheduled',
		async function () {
			let startTime;
			let counter = 180;
			do {
				startTime = await Utils.getMintedCrowdsaleStartTime(crowdsale);
				logger.info("wait " + Date.now());
				logger.info("wait " + startTime);
				await driver.sleep(1000);
			}
			while (counter-- > 0 && (Date.now() / 1000 <= startTime));
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	for (let i = 0; i < amountWhitelisted; i++) {

		test.it('Whitelisted address ' + i + ' able to buy',
			async function () {
				let pow = Math.pow(10, crowdsale.decimals);

				let obj = JSON.parse(fs.readFileSync(whitelistedAddresses + ".json", "utf8"));

				let user = new User(driver);

				user.account = obj.whitelistedAddresses[i].account.address;
				user.privateKey = obj.whitelistedAddresses[i].account.privateKey;
				user.minCap = obj.whitelistedAddresses[i].min;
				user.maxCap = obj.whitelistedAddresses[i].max;
				user.networkID = crowdsale.networkID;
				console.log("" + user.account + " ," + user.privateKey + " ," + user.minCap + " ," + user.maxCap)
				await Utils.receiveEth(user, 1);
				console.log("Eth balance= " + await Utils.getBalance(user) / 1e18);

				let investor = user;
				assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
				let contribution = user.minCap;

				let result = await investor.openInvestPage(crowdsale)
					&& await investor.contribute(contribution);

				let balance = await user.getTokenBalance(crowdsale) / pow;
				console.log("balance= " + balance);
				console.log("contribution= " + contribution);
				console.log("delta = " + (Math.abs(balance - contribution)));
				console.log("result = " + result);
				result = result && (Math.abs(balance - contribution) < 0.01);

				return await assert.equal(result, true, "Test FAILED.");
			});
	}

//////////////////////////////////////
});
