const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const TierPage = require('../pages/TierPage.js').TierPage;

const buttonContinue = By.xpath("//*[contains(text(),'Continue')]");
const buttonOK = By.className("swal2-confirm swal2-styled");
const buttonAddTier = By.className("button button_fill_secondary");
const fieldWalletAddress = By.id("walletAddress");
const fieldMinCap = By.id("minCap");

let flagCustom = false;
let flagWHitelising = false;
let COUNT_TIERS = 0;

class WizardStep3 extends Page {

	constructor(driver) {
		super(driver);
		this.title = "CROWDSALE SETUP";
		this.URL;
		this.tier;
		this.name = "WizardStep3 page: ";

		this.boxGasPriceSafe;
		this.boxGasPriceNormal;
		this.boxGasPriceFast;
		this.boxGasPriceCustom;

		this.boxWhitelistingYes;
		this.boxWhitelistingNo;

		this.fieldGasPriceCustom;

		this.warningWalletAddress;
		this.warningCustomGasPrice;
		this.warningMincap;
	}

	async initWarnings() {
		logger.info(this.name + "initWarnings ");
		try {
			const locator = By.className("error");
			let array = await super.findWithWait(locator);
			this.warningWalletAddress = array[0];
			this.warningMincap = array[2];
			this.warningCustomGasPrice = array[1];
			return array;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async initInputFields() {
		logger.info(this.name + "initInputFields ");
		try {
			const locator = By.className("input");
			let array = await super.findWithWait(locator);
			this.fieldGasPriceCustom = array[1];
			return array;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async initCheckboxes() {
		logger.info(this.name + "initCheckboxes ");
		try {
			let locator = By.className("radio-inline");
			let array = await super.findWithWait(locator);
			this.boxGasPriceSafe = array[0];
			this.boxGasPriceNormal = array[1];
			this.boxGasPriceFast = array[2];
			this.boxGasPriceCustom = array[3];
			this.boxWhitelistingYes = array[4];
			this.boxWhitelistingNo = array[5];
			return array;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async clickButtonContinue() {
		logger.info(this.name + "clickButtonContinue ");
		return await super.clickWithWait(buttonContinue);

	}

	async fillWalletAddress(value) {
		logger.info(this.name + "field WalletAddress: ");
		return await super.clearField(fieldWalletAddress) &&
			await super.fillWithWait(fieldWalletAddress, value);
	}

	async clickCheckboxGasPriceSafe() {
		logger.info(this.name + "CheckboxGasclickCheckboxGasPriceSafe ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxGasPriceSafe);
	}

	async clickCheckboxGasPriceNormal() {
		logger.info(this.name + "clickCheckboxGasPriceNormal ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxGasPriceNormal);
	}

	async clickCheckboxGasPriceFast() {
		logger.info(this.name + "clickCheckboxGasPriceFast ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxGasPriceFast);
	}

	async clickCheckboxGasPriceCustom() {
		logger.info(this.name + "clickCheckboxGasPriceCustom ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxGasPriceCustom);
	}

	async fillGasPriceCustom(value) {
		logger.info(this.name + "fillGasPriceCustom ");
		return (await this.initInputFields() !== null) &&
			await super.clearField(this.fieldGasPriceCustom) &&
			await super.fillWithWait(this.fieldGasPriceCustom, value);
	}

	async clickCheckboxWhitelistYes() {
		logger.info(this.name + "clickCheckboxWhitelistYes ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxWhitelistingYes);
	}

	async clickCheckboxWhitelistNo() {
		logger.info(this.name + "clickCheckboxWhitelistNo ");
		return (await this.initCheckboxes() !== null) &&
			await super.clickWithWait(this.boxWhitelistingNo);
	}

	async setGasPrice(value) {
		logger.info(this.name + "setGasPrice with value= " + value);
		return await this.clickCheckboxGasPriceCustom() &&
			await this.fillGasPriceCustom(value);
	}

	async fillMinCap(value) {
		logger.info(this.name + "fillMinCap ");
		if (value === undefined) return true;
		return await super.clearField(fieldMinCap) &&
			await super.fillWithWait(fieldMinCap, value);
	}

	async isDisplayedWarningMincap() {
		logger.info(this.name + "isDisplayedWarningMincap ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningMincap) !== "");
	}

	async isDisplayedWarningCustomGasPrice() {
		logger.info(this.name + "isPresentWarningCustomGasPrice ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningCustomGasPrice) !== "");
	}

	async isDisplayedWarningWalletAddress() {
		logger.info(this.name + "isDisplayedWarningWalletAddress ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningWalletAddress) !== "");
	}

	async isDisplayedFieldWalletAddress() {
		logger.info(this.name + "isPresentFieldWalletAddress ");
		return await super.isElementDisplayed(fieldWalletAddress)
	}

	async getValueFromFieldWalletAddress() {
		logger.info(this.name + "getValueFromFieldWalletAddress ");
		return await super.getAttribute(fieldWalletAddress, "value");
	}

	async clickButtonOk() {
		logger.info(this.name + "clickButtonOk ");
		return await super.clickWithWait(buttonOK);
	}

	async isDisplayedButtonContinue() {
		logger.info(this.name + "isDisplayedButtonContinue ");
		return await super.isElementDisplayed(buttonContinue);
	}

	async isDisplayedFieldGasPriceCustom() {
		logger.info(this.name + "isDisplayedFieldCustomGasPrice ");
		return await super.isElementDisplayed(this.fieldGasPriceCustom);
	}

	async fillPage(crowdsale) {
		logger.info(this.name + "fillPage ");
		let result = await this.waitUntilLoaderGone() &&
			await this.fillWalletAddress(crowdsale.walletAddress) &&
			await this.setGasPrice(crowdsale.gasPrice);

		for (let i = 0; i < crowdsale.tiers.length - 1; i++) {
			result = await new TierPage(this.driver, crowdsale.tiers[i]).fillTier()
				&& await this.clickButtonAddTier();
		}
		return result &&
			await new TierPage(this.driver, crowdsale.tiers[crowdsale.tiers.length - 1]).fillTier();
	}

	async clickButtonAddTier() {
		logger.info(this.name + "clickButtonAddTier: ");
		return await super.clickWithWait(buttonAddTier);
	}

	async isDisabledMinCap() {
		logger.info(this.name + "isDisabledMinCap ");
		return await super.isElementDisabled(fieldMinCap);
	}

	async isEnabledButtonContinue() {
		logger.info(this.name + " isEnabledButtonContinue ");
		if (await super.getAttribute(buttonContinue, "class") === "button button_fill") {
			logger.info("present and enabled");
			return true;
		}
		else {
			logger.info("present and disabled");
			return false;
		}
	}

}

module.exports.WizardStep3 = WizardStep3;
