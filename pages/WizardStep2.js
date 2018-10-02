const key = require('selenium-webdriver').Key;
const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonContinue = By.className('sw-ButtonContinue_Text')
const fieldName = By.id("name");
const fieldTicker = By.id("ticker");
const fieldDecimals = By.id("decimals");
const fieldSupply = By.id("supply");

class WizardStep2 extends Page {

	constructor(driver) {
		super(driver);
		this.URL;
		this.name = "WizardStep2 page: ";
		this.warningName;
		this.warningTicker;
		this.warningDecimals;
		this.warningAddress;
		this.warningValue;
		this.warningSupply;
		this.title = "TOKEN SETUP";
	}

	async initWarnings() {
		logger.info(this.name + " :init warnings");
		try {
			const locator = By.className("error");
			let array = await super.findWithWait(locator);
			this.warningName = array[0];
			this.warningTicker = array[1];
			this.warningDecimals = array[2];
			if (array.length > 2) this.warningSupply = array[3];
			return array;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async isDisplayedFieldName() {
		logger.info(this.name + "isDisplayedFieldName ");
		return await this.isElementDisplayed(fieldName);
	}

	async fillName(value) {
		logger.info(this.name + "fillName with value=" + value);
		return await this.clearField(fieldName) &&
			await super.fillWithWait(fieldName, value);
	}

	async fillTicker(value) {
		logger.info(this.name + "fillTicker with value=" + value);
		return await super.clearField(fieldTicker) &&
			await super.fillWithWait(fieldTicker, value);
	}

	async fillDecimals(value) {
		logger.info(this.name + "fillDecimals with value=" + value);
		return await super.clearField(fieldDecimals)
			&& await super.fillWithWait(fieldDecimals, value);
	}

	async fillSupply(value) {
		logger.info(this.name + "fillSupply with value=" + value);
		return await super.clearField(fieldSupply)
			&& await super.fillWithWait(fieldSupply, value);
	}

	async clickButtonContinue() {
		logger.info(this.name + "clickButtonContinue ");
		return await super.clickWithWait(buttonContinue);
	}

	async scrollDownUntilButtonContinueDislayed() {
		logger.info(this.name + "scrollDownUntilButtonContinueDislayed ");
		try {
			await this.pressKey(key.TAB, 5);
			return true;
		}
		catch (err) {
			console.log("Error:  " + err);
			return false;
		}

	}

	async isDisplayedButtonContinue() {
		logger.info(this.name + "isDisplayedButtonContinue ");
		return await super.isElementDisplayed(buttonContinue);
	}

	async isDisplayedWarningName() {
		logger.info(this.name + "isDisplayedWarningName ");

		return (await this.initWarnings() !== null) &&
			(await this.getTextForElement(this.warningName) !== "");
	}

	async isDisplayedWarningTicker() {
		logger.info(this.name + "isDisplayedWarningTicker ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await this.getTextForElement(this.warningTicker) !== "");
	}

	async isDisplayedWarningDecimals() {
		logger.info(this.name + "isDisplayedWarningDecimals ");
		return (await this.initWarnings() !== null) &&
			(await this.getTextForElement(this.warningDecimals) !== "");
	}

	async isDisplayedWarningSupply() {
		logger.info(this.name + "isDisplayedWarningSupply ");
		return (await this.initWarnings() !== null) &&
			(await this.getTextForElement(this.warningSupply) !== "");
	}

	async getValueFieldDecimals() {
		logger.info(this.name + "getValueFieldDecimals ");
		return await super.getAttribute(fieldDecimals, "value");
	}
    async getValueFieldTicker() {
        logger.info(this.name + "getValueFieldTicker ");
        return await super.getAttribute(fieldTicker, "value");
    }
    async getValueFieldName() {
        logger.info(this.name + "getValueFieldName ");
        return await super.getAttribute(fieldName, "value");
    }

	async isDisabledDecimals() {
		logger.info(this.name + "isDisabledDecimals ");
		return await super.isElementDisabled(fieldDecimals);
	}

	async fillPage(crowdsale) {
		logger.info(this.name + "fillPage ");
		return await this.fillName(crowdsale.name) &&
			await this.fillTicker(crowdsale.ticker) &&
			await this.fillDecimals(crowdsale.decimals) &&
			((crowdsale.totalSupply !== undefined) ? await this.fillSupply(crowdsale.totalSupply) : true);
	}

	async isDisplayedFieldSupply() {
		logger.info(this.name + "isDisplayedFieldSupply ");
		return await super.isElementDisplayed(fieldSupply);
	}

    async waitUntilDisplayedFieldName(Twaiting) {
        logger.info(this.name + "waitUntilDisplayedFieldName: ");
        return await super.waitUntilDisplayed(fieldName,Twaiting);
    }

    async waitUntilHasValueFieldName(Twaiting) {
        logger.info(this.name + "waitUntilHasValueFieldName: ");
        return await super.waitUntilHasValue(fieldName,Twaiting);
    }

}

module.exports.WizardStep2 = WizardStep2;