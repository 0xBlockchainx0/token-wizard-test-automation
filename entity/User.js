const logger = require('../entity/Logger.js').logger;
const MetaMask = require('../pages/MetaMask.js').MetaMask;
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
const Utils = require('../utils/Utils.js').Utils;
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const Page = require('../pages/Page.js').Page;
const testRA = require('../test/testRA.js');
const fs = require('fs');


class User {
	constructor(driver, file) {
		try {
			this.driver = driver;
			let obj = JSON.parse(fs.readFileSync(file, "utf8"));
			this.account = obj.account;
			this.privateKey = obj.privateKey;
			this.networkID = obj.networkID;
			this.accountOrderInMetamask = undefined;//for MetaMaskPage only
			this.name = file;
		}
		catch (err) {
			logger.info("can not create User instance");
			logger.info(err);
		}

	}

	async getTokenBalance(crowdsale) {
		logger.info("GetTokenBalance: account=" + this.account);
		logger.info("Token address=" + crowdsale.tokenAddress);
		try {
			let web3 = Utils.setNetwork(this.networkID);
			let tokenContract = crowdsale.tokenContractAbi;
			let MyContract = new web3.eth.Contract(tokenContract, crowdsale.tokenAddress);
			return await MyContract.methods.balanceOf(this.account).call();
		}
		catch (err) {
			logger.info("Can not get balance. " + err);
			return 0;
		}
	}

	async setMetaMaskAccount() {
		logger.info("Set Metamask account")
		let metaMask = new MetaMask(this.driver);
		if (this.accountOrderInMetamask === undefined ) {
			await metaMask.importAccount(this);
		}
		else {
			await metaMask.selectAccount(this);
		}
	}

	print() {
		logger.info("account:" + this.account);
		logger.info("privateKey:" + this.privateKey);
		logger.info("networkID:" + this.networkID);
	}

	async openInvestPage(crowdsale) {
		await new Page(this.driver).open(crowdsale.url);
	}

	async openManagePage(crowdsale) {
		logger.info("Open manage page")
		const startURL = Utils.getStartURL();
		let mngPage = new ManagePage(this.driver);
		mngPage.URL = startURL + "manage/" + crowdsale.executionID;
		await mngPage.open();
		await mngPage.waitUntilLoaderGone();
		if (await mngPage.isPresentButtonOK()) return false;
		return mngPage;
	}

	async getSupplyTier(tier) {
		logger.info("get Supply for tier #" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.refresh();
		let s = await mngPage.getSupplyTier(tier);
		logger.info("Received value=" + s);
		return s;
	}

	async getRateTier(tier) {
		logger.info("get Rate for tier #" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.refresh();
		let s = await mngPage.getRateTier(tier);
		logger.info("Received value=" + s);
		return s;
	}

	async getStartTime(tier) {
		logger.info("get Start time of tier #" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.refresh();
		let s = await mngPage.getStartTimeTier(tier);
		logger.info("Received value=" + s);
		return s;
	}

	async getEndTime(tier) {
		logger.info("get End time of tier #" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.refresh();
		let s = await mngPage.getEndTimeTier(tier);
		logger.info("Received value=" + s);
		return s;
	}

	async changeRate(tier, value) {
		logger.info("change Rate for tier#" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			await mngPage.fillRateTier(tier, value);
			await mngPage.clickButtonSave();
			let metaMask = new MetaMask(this.driver);
			await metaMask.signTransaction(5);
			await mngPage.waitUntilLoaderGone();
			let result = await this.confirmPopup();
			await mngPage.waitUntilLoaderGone();
			return result;
		}
		catch (err) {
			logger.info("can not change Rate for tier #" + tier + " ,err:" + err);
			return false;
		}
	}

	async fillWhitelistTier(tier, address, min, max) {
		logger.info("fill whitelist for tier " + tier);
		logger.info("Wh address=" + address + " , min=" + min + ", max=" + max);
		let mngPage = new ManagePage(this.driver);
		await mngPage.fillWhitelist(tier, address, min, max);
		let metaMask = new MetaMask(this.driver);
		let result = await metaMask.signTransaction(5);
		if (!result) return false;
		await mngPage.waitUntilLoaderGone();
		result = await this.confirmPopup();
		await mngPage.waitUntilLoaderGone();
		return result;
	}

	async changeSupply(tier, value) {
		logger.info("change Supply for tier#" + tier);
		let mngPage = new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			await mngPage.fillSupplyTier(tier, value);
			await mngPage.clickButtonSave();
			let metaMask = new MetaMask(this.driver);
			await metaMask.signTransaction(5);
			await mngPage.waitUntilLoaderGone();
			let result = await this.confirmPopup();
			await mngPage.waitUntilLoaderGone();
			return result;
		}
		catch (err) {
			logger.info("can not change Supply for tier #" + tier + " ,err:" + err);
			return false;
		}
	}

	async changeEndTime(tier, newDate, newTime) {
		logger.info("change EndTime for tier#" + tier + ", new date=" + newDate + ", new time=" + newTime);
		let formatTimeBrowser = await Utils.getDateFormat(this.driver);
		if (formatTimeBrowser == "mdy") {
			newDate = Utils.convertDateToMdy(newDate);
			newTime = Utils.convertTimeToMdy(newTime);
		}
		let mngPage = new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			let b = await mngPage.fillEndTimeTier(tier, newDate, newTime);
			if (!b) return false;
			if (await mngPage.isPresentWarningEndTimeTier1() ||
				await mngPage.isPresentWarningEndTimeTier2()
			) {
				return false;
			}
			await mngPage.clickButtonSave();
			let metaMask = new MetaMask(this.driver);
			await metaMask.signTransaction(5);
			await mngPage.waitUntilLoaderGone();
			b = await this.confirmPopup();
			await mngPage.waitUntilLoaderGone();
			return b;
		}
		catch (err) {
			logger.info("can not change Supply for tier #" + tier + " ,err:" + err);
			return false;
		}
	}

	async changeStartTime(tier, newDate, newTime) {
		logger.info("change StartTime for tier#" + tier + ", new date=" + newDate + ", new time=" + newTime);
		let formatTimeBrowser = await Utils.getDateFormat(this.driver);
		if (formatTimeBrowser == "mdy") {
			newDate = Utils.convertDateToMdy(newDate);
			newTime = Utils.convertTimeToMdy(newTime);
		}
		let mngPage = new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			let result = await mngPage.fillStartTimeTier(tier, newDate, newTime);
			if (!result) return false;
			if (await mngPage.isPresentWarningStartTimeTier1() ||
				await mngPage.isPresentWarningStartTimeTier2()
			)
				return false;
			await mngPage.clickButtonSave();
			let metaMask = new MetaMask(this.driver);
			await metaMask.signTransaction();
			await mngPage.waitUntilLoaderGone();
			result = await this.confirmPopup();
			await mngPage.waitUntilLoaderGone();
			return result;
		}
		catch (err) {
			logger.info("can not change start time for tier #" + tier + " ,err:" + err);
			return false;
		}
	}

	async distribute(crowdsale) {

		logger.info(this.account + ": distribution:");

		let mngPage = await this.openManagePage(crowdsale);
		await mngPage.refresh();
		logger.info("Snapshot:");
		logger.info("Time now: " + Utils.getDate());
		logger.info("Start time: " + await mngPage.getStartTimeTier(1));
		logger.info("End time: " + await mngPage.getEndTimeTier(1));
		logger.info("isDistributionEnabled: " + await mngPage.isEnabledDistribute());
		logger.info("isFinalizeEnabled: " + await mngPage.isEnabledFinalize());
		logger.info("walletAddress: " + await mngPage.getWalletAddressTier(1));

		await mngPage.waitUntilLoaderGone();
		await this.driver.sleep(3000);
		if (await mngPage.isEnabledFinalize())
			await mngPage.clickButtonFinalize();
		await Utils.zoom(this.driver, 0.5);

		await Utils.takeScreenshoot(this.driver, "manage1");
		await Utils.zoom(this.driver, 1);

		await mngPage.waitUntilLoaderGone();
		await mngPage.refresh();
		await this.driver.sleep(3000);
		let result = false;
		for (let i = 0; i < 5; i++) {
			result = (await mngPage.isEnabledDistribute()) || result;
		}
		await Utils.zoom(this.driver, 0.5);

		await Utils.takeScreenshoot(this.driver, "manage2");
		await Utils.zoom(this.driver, 1);

		if (result) {
			await mngPage.clickButtonDistribute();
		}
		else {
			await mngPage.clickButtonDistribute();
			return false;
		}
		let metaMask = new meta.MetaMask(this.driver);
		await metaMask.signTransaction(5);
		await mngPage.waitUntilLoaderGone();
		result = await mngPage.confirmPopup();
		return true;
	}

	async finalize(crowdsale) {
		logger.info(this.account + ": finalize:");
		await this.openManagePage(crowdsale);
		let mngPage = new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		await this.driver.sleep(3000);
		if (await mngPage.isEnabledFinalize()) {
			await mngPage.clickButtonFinalize();
		}
		else {
			return false;
		}
		let counter = 0;
		do {
			if (counter++ > 20) return false;
			await this.driver.sleep(1000);
		} while (!(await mngPage.isPresentPopupYesFinalize()));
		await mngPage.clickButtonYesFinalize();
		let metaMask = new meta.MetaMask(this.driver);
		await metaMask.signTransaction(5);
		await mngPage.waitUntilLoaderGone();
		await mngPage.confirmPopup();
		return true;
	}



	async confirmPopup() {
		logger.info("confirm popup");
		let investPage = new InvestPage(this.driver);
		await this.driver.sleep(1000);
		let counter = 10;
		while (counter-- > 0) {
			await this.driver.sleep(1000);
			if (await investPage.isPresentWarning()) {
				await this.driver.sleep(1000);
				await investPage.clickButtonOK();
				return true;
			}
			return false;
		}
	}

	async contribute(amount) {
		logger.info("contribute  " + amount);
		const investPage = new InvestPage(this.driver);
		await investPage.waitUntilLoaderGone();
		await investPage.fillInvest(amount);
		await investPage.clickButtonContribute();
		let counter = 0;
		let isContinue = true;
		let timeLimit = 2;
		do {
			await this.driver.sleep(500);
			if (await investPage.isPresentWarning()) {
				await logger.info(this.name + ": warning:" + await investPage.getWarningText());
				return false;
			}
			if (await investPage.isPresentError()) {
				await logger.info(this.name + ": error:" + await investPage.getErrorText());
				return false;
			}
			counter++;
			if (counter >= timeLimit) {
				isContinue = false;
			}
		} while (isContinue);

		let result = await new MetaMask(this.driver).signTransaction(5);
		if (!result) {
			return false;
		}
		await investPage.waitUntilLoaderGone();
		counter = 0;
		timeLimit = 5;
		while (counter++ < timeLimit) {
			await this.driver.sleep(500);
			if (await investPage.isPresentWarning()) {
				await investPage.clickButtonOK();
				await investPage.waitUntilLoaderGone();
				await this.driver.sleep(2000);
				return true;
			}
		}
		return false;
	}

	async getBalanceFromInvestPage(crowdsale) {
		logger.info("get balance from " + crowdsale.url);
		const investPage = new InvestPage(this.driver);
		const curURL = await investPage.getURL();
		if (crowdsale.url != curURL) await investPage.open(crowdsale.url);
		await investPage.waitUntilLoaderGone();
		await this.driver.sleep(10000);
		await investPage.refresh();
		await this.driver.sleep(2000);
		let result = await investPage.getBalance();
		let arr = result.split(" ");
		result = arr[0].trim();
		logger.info("received " + result);
		return result;
	}


	async createMintedCappedCrowdsale(crowdsale) {

		logger.info(" createMintedCappedCrowdsale ");
		const startURL = Utils.getStartURL();
		const welcomePage = new WizardWelcome(this.driver, startURL);
		const wizardStep1 = new WizardStep1(this.driver);
		const wizardStep2 = new WizardStep2(this.driver);
		const wizardStep3 = new WizardStep3(this.driver);
		const wizardStep4 = new WizardStep4(this.driver);
		const crowdsalePage = new CrowdsalePage(this.driver);
		const investPage = new InvestPage(this.driver);
		const reservedTokens = new ReservedTokensPage(this.driver);

		let result = await  welcomePage.open() &&
					 await  welcomePage.clickButtonNewCrowdsale();

		let counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await wizardStep1.isDisplayedButtonContinue()) &&
				!(await wizardStep2.isDisplayedFieldName())) {
				result = result && await wizardStep1.clickButtonContinue();
			}
			else break;
			if (counter === 0) return false;
		} while (counter-- >= 0);

		result = result &&
			await wizardStep2.fillPage(crowdsale) &&
			await reservedTokens.fillReservedTokens(crowdsale) &&
			await wizardStep2.clickButtonContinue() &&
			await wizardStep3.fillPage(crowdsale);
		await this.driver.sleep(15000);

		counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await wizardStep3.isDisplayedButtonContinue()) &&
				!(await wizardStep4.isDisplayedModal())) {
				result = result && await wizardStep3.clickButtonContinue();
			}
			else break;
			if (counter === 0) {
				logger.info("Incorrect data in tiers");
				return false;
			}
		} while (counter-- >= 0);

		result = result &&
				await wizardStep4.deployContracts(crowdsale) &&
                await wizardStep4.waitUntilDisplayedButtonContinue() &&
				await wizardStep4.clickButtonContinue() &&
				await wizardStep4.waitUntilLoaderGone();

		counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await crowdsalePage.isDisplayedButtonInvest()) &&
				!(await investPage.isDisplayedCountdownTimer())) {
				result = result && await crowdsalePage.clickButtonInvest();
			}
			else break;
			if (counter === 0) {
				return false;
			}
		} while (counter-- >= 0);

		result = result && await investPage.waitUntilLoaderGone();
		crowdsale.url = await investPage.getURL();
		crowdsale.executionID = await investPage.getExecutionID();
		logger.info("Final invest page link: " + crowdsale.url);
		logger.info("token address: " + crowdsale.executionID);

		return result && crowdsale.executionID !== "";
	}

	async createDuthAuctionCrowdsale(crowdsale) {

		logger.info(" createDuthAuctionCrowdsale ");
		const startURL = Utils.getStartURL();
		const welcomePage = new WizardWelcome(this.driver, startURL);
		const wizardStep1 = new WizardStep1(this.driver);
		const wizardStep2 = new WizardStep2(this.driver);
		const wizardStep3 = new WizardStep3(this.driver);
		const wizardStep4 = new WizardStep4(this.driver);
		const crowdsalePage = new CrowdsalePage(this.driver);
		const investPage = new InvestPage(this.driver);
		const reservedTokens = new ReservedTokensPage(this.driver);

		let result = await  welcomePage.open() &&
			await  welcomePage.clickButtonNewCrowdsale() &&
			await wizardStep1.waitUntilDisplayedCheckboxDutchAuction() &&
			await wizardStep1.clickCheckboxDutchAuction();

		let counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await wizardStep1.isDisplayedButtonContinue()) &&
				!(await wizardStep2.isDisplayedFieldName())) {
				result = result && await wizardStep1.clickButtonContinue();
			}
			else break;
			if (counter === 0) return false;
		} while (counter-- >= 0);

		result = result &&
			await wizardStep2.fillPage(crowdsale) &&
			await reservedTokens.fillReservedTokens(crowdsale) &&
			await wizardStep2.clickButtonContinue() &&
			await wizardStep3.fillPage(crowdsale);

		counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await wizardStep3.isDisplayedButtonContinue()) &&
				!(await wizardStep4.isDisplayedModal())) {
				result = result && await wizardStep3.clickButtonContinue();
			}
			else break;
			if (counter === 0) {
				logger.info("Incorrect data in tiers");
				return false;
			}
		} while (counter-- >= 0);

		result = result &&
			await wizardStep4.deployContracts(crowdsale) &&
			await wizardStep4.waitUntilDisplayedButtonContinue() &&
			await wizardStep4.clickButtonContinue() &&
			await wizardStep4.waitUntilLoaderGone();

		counter = 200;
		do {
			await this.driver.sleep(300);
			if ((await crowdsalePage.isDisplayedButtonInvest()) &&
				!(await investPage.isDisplayedCountdownTimer())) {
				result = result && await crowdsalePage.clickButtonInvest();
			}
			else break;
			if (counter === 0) {
				return false;
			}
		} while (counter-- >= 0);

		result = result && await investPage.waitUntilLoaderGone();
		crowdsale.url = await investPage.getURL();
		crowdsale.executionID = await investPage.getExecutionID();
		logger.info("Final invest page link: " + crowdsale.url);
		logger.info("token address: " + crowdsale.executionID);

		return result && crowdsale.executionID !== "";
	}



}

module.exports.User = User;
