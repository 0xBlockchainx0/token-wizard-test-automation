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
const InvestPage = require('../pages/ContributionPage.js').InvestPage;
const ManagePage = require('../pages/ManagePage.js').ManagePage;
const Utils = require('../utils/Utils.js').Utils;
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const Page = require('../pages/Page.js').Page;
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
			this.minCap;
			this.maxCap;
			this.tokenBalance;
		}
		catch (err) {
			logger.info("can not create User instance");
			logger.info(err);
		}

	}

	async getTokenBalance(crowdsale) {
		logger.info("getTokenBalance");
		try {
			const web3 = await Utils.getWeb3Instance(crowdsale.networkID);
			let contractAddress = await Utils.getContractAddressInitCrowdsale(crowdsale);
			logger.info("contractAddress" + contractAddress);
			let addressRegistryStorage = await Utils.getEnvAddressRegistryStorage();
			logger.info("addressRegistryStorage" + addressRegistryStorage);
			let abi = await Utils.getContractABIInitCrowdsale(crowdsale);
			let myContract = new web3.eth.Contract(abi, contractAddress);
			let balance = await myContract.methods.balanceOf(addressRegistryStorage, crowdsale.executionID, this.account).call();
			logger.info("Balance = " + balance);
			return balance;
		}
		catch (err) {
			logger.info("Can not get balance. " + err);
			return 0;
		}
	}

	async setMetaMaskAccount() {
		logger.info("Set Metamask account")
		let metaMask = new MetaMask(this.driver);
		if (this.accountOrderInMetamask === undefined) {
			return await metaMask.importAccount(this);
		}
		else {
			return await metaMask.selectAccount(this);
		}
	}

	print() {
		logger.info("account:" + this.account);
		logger.info("privateKey:" + this.privateKey);
		logger.info("networkID:" + this.networkID);
	}

	async openInvestPage(crowdsale) {
		return await new Page(this.driver).open(crowdsale.url);
	}

	async openManagePage(crowdsale) {
		logger.info("Open manage page")
		const startURL = Utils.getStartURL();
		let mngPage = new ManagePage(this.driver);
		mngPage.URL = startURL + "manage/" + crowdsale.executionID;
		return await mngPage.open()
			&& await mngPage.waitUntilLoaderGone()
			&& !await mngPage.isDisplayedButtonOK();
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
		try {
			let mngPage = new ManagePage(this.driver);
			await mngPage.refresh();
			let result = await mngPage.getStartTimeTier(tier);
			logger.info("Received value=" + result);
			return result;
		}
		catch (err) {
			logger.info(err);
			return null;
		}
	}

	async getEndTime(tier) {
		logger.info("getEndTime of tier #" + tier);
		try {
			let mngPage = new ManagePage(this.driver);
			await mngPage.refresh();
			let result = await mngPage.getEndTimeTier(tier);
			logger.info("Received value=" + result);
			return result;
		}
		catch (err) {
			logger.info(err);
			return null;
		}

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

	async addWhitelistTier(tier, address, min, max) {
		logger.info("fill whitelist for tier " + tier);
		logger.info("Wh address=" + address + " , min=" + min + ", max=" + max);
		let mngPage = new ManagePage(this.driver);
		let metaMask = new MetaMask(this.driver);
		return await mngPage.fillWhitelist(tier, address, min, max)
			&& await metaMask.signTransaction(10)
			&& await mngPage.waitUntilLoaderGone()
			&& await this.confirmPopup()
			&& await mngPage.waitUntilLoaderGone();
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

	async changeEndTimeFromManagePage(tier, newDate, newTime) {
		logger.info("changeEndTime for tier#" + tier + ", new date=" + newDate + ", new time=" + newTime);
		let formatTimeBrowser = await Utils.getDateFormat(this.driver);
		if (formatTimeBrowser === "mdy") {
			newDate = Utils.convertDateToMdy(newDate);
			newTime = Utils.convertTimeToMdy(newTime);
		}
		let mngPage = new ManagePage(this.driver);
		let metaMask = new MetaMask(this.driver);
		return await mngPage.waitUntilLoaderGone()
			&& await mngPage.fillEndTimeTier(tier, newDate, newTime)
			&& !await mngPage.isPresentWarningEndTimeTier1()
			&& !await mngPage.isPresentWarningEndTimeTier2()
			&& await mngPage.clickButtonSave()
			&& await metaMask.signTransaction(10)
			&& await metaMask.signTransaction(10)
			&& await mngPage.waitUntilLoaderGone()
			&& await this.confirmPopup()
			&& await mngPage.waitUntilLoaderGone();
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

	async finalize(crowdsale) {
		logger.info(this.account + ": finalize ");
		let metaMask = new MetaMask(this.driver);
		let mngPage = new ManagePage(this.driver);
		return await this.openManagePage(crowdsale)
			&& await mngPage.waitUntilLoaderGone()
			&& !await mngPage.waitUntilShowUpPopupConfirm(10) //3 sec
			&& await mngPage.isEnabledButtonFinalize()
			&& await mngPage.clickButtonFinalize()
			&& await mngPage.waitUntilShowUpPopupFinalize()
			&& await mngPage.clickButtonYesFinalize()
			&& await metaMask.signTransaction(5)
			&& await mngPage.waitUntilLoaderGone()
			&& await mngPage.waitUntilShowUpPopupConfirm()
			&& await mngPage.clickButtonOk();
	}

	async confirmPopup() {
		logger.info("confirmPopup ");
		let investPage = new InvestPage(this.driver);
		return await investPage.waitUntilShowUpButtonOk(60)
			&& await investPage.clickButtonOK();
	}

	async contribute(amount) {
		logger.info("contribute  " + amount);
		const investPage = new InvestPage(this.driver);
		return !await investPage.waitUntilShowUpWarning(15)
			&& await investPage.waitUntilLoaderGone()
			&& await investPage.fillContribute(amount)
			&& await investPage.clickButtonContribute()
			&& !await investPage.waitUntilShowUpErrorNotice(10)//3 sec
			&& !await investPage.waitUntilShowUpWarning(10)//3 sec
			&& await new MetaMask(this.driver).signTransaction(5)
			&& await investPage.waitUntilLoaderGone()
			&& await investPage.waitUntilShowUpWarning(10)//3 sec
			&& await investPage.clickButtonOK()
			&& await investPage.waitUntilLoaderGone();
	}

	async getBalanceFromInvestPage(crowdsale) {
		logger.info("getBalanceFromInvestPage " + crowdsale.url);
		try {
			const investPage = new InvestPage(this.driver);
			const curURL = await investPage.getURL();
			if (crowdsale.url !== curURL) await investPage.open(crowdsale.url);
			await investPage.waitUntilLoaderGone();
			await this.driver.sleep(2000);
			await investPage.refresh();
			await this.driver.sleep(3000);
			await investPage.refresh();
			await this.driver.sleep(7000);
			let result = await investPage.getBalance();
			let arr = result.split(" ");
			result = arr[0].trim();
			logger.info("received " + result);
			return result;
		}
		catch (err) {
			logger.info("Error " + err);
			return false;
		}
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
		await TierPage.setCountTiers(0);

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
		crowdsale.networkID = this.networkID;
		return result && crowdsale.executionID !== "";
	}

	async createDutchAuctionCrowdsale(crowdsale) {

		logger.info(" createDutchAuctionCrowdsale ");

		const startURL = Utils.getStartURL();
		const welcomePage = new WizardWelcome(this.driver, startURL);
		const wizardStep1 = new WizardStep1(this.driver);
		const wizardStep2 = new WizardStep2(this.driver);
		const wizardStep3 = new WizardStep3(this.driver);
		const wizardStep4 = new WizardStep4(this.driver);
		const crowdsalePage = new CrowdsalePage(this.driver);
		const investPage = new InvestPage(this.driver);
		const reservedTokens = new ReservedTokensPage(this.driver);
		await TierPage.setCountTiers(0);

		let result = await  welcomePage.open() &&
			await  welcomePage.clickButtonNewCrowdsale() &&
			await wizardStep1.waitUntilDisplayedCheckboxDutchAuction() &&
			await wizardStep1.clickCheckboxDutchAuction();
		if (!result) return false;
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
			await wizardStep2.clickButtonContinue() &&
			await wizardStep3.fillPage(crowdsale);

		if (!result) return false;
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
		if (!result) return false;
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
		crowdsale.networkID = this.networkID;
		logger.info("crowdsale.networkID " + crowdsale.networkID);

		return result && crowdsale.executionID !== "";
	}

	async changeMinCapFromManagePage(tier,value) {
		logger.info("changeMinCapFromManagePage ");
		let mngPage = new ManagePage(this.driver);
		let metaMask = new MetaMask(this.driver);
		return await mngPage.waitUntilLoaderGone()
			&& await mngPage.fillMinCap(tier,value)
			&& !await mngPage.isDisplayedWarningMinCap()
			&& await mngPage.clickButtonSave()
			&& await metaMask.signTransaction(10)
			&& await mngPage.waitUntilLoaderGone()
			&& await this.confirmPopup()
			&& await mngPage.waitUntilLoaderGone();
	}

}

module.exports.User = User;
