const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonContribute = By.className("button button_fill");
const fieldInvest = By.className("invest-form-input");
const buttonOk = By.className("swal2-confirm swal2-styled");
const fieldBalance = By.className("balance-title");
const fields = By.className("hashes-title");
const warningText = By.id("swal2-content");
const errorNotice = By.className("css-6bx4c3");
const countdownTimer = By.className("timer");
const countdownTimerValue = By.className("timer-count");

class InvestPage extends Page {

	constructor(driver) {
		super(driver);
		this.URL;
		this.fieldExecutionID;
		this.fieldCurrentAccount;
		this.name = "Invest page :";
		this.timer = [];
	}

	async initTimer() {
		logger.info(this.name + "initTimer ");
		try {
			let arr = await super.findWithWait(countdownTimer);
			this.timer = arr[0];
			return arr;
		}
		catch (err) {
			logger.info("Error " + err);
			return null;
		}
	}

	async initFields() {
		logger.info(this.name + "initFields ");
		try {
			let array = await super.findWithWait(fields);
			this.fieldCurrentAccount = array[0];
			this.fieldExecutionID = array[1];
			return array;
		}
		catch (err) {
			logger.info("Error " + err);
			return null;
		}
	}

	async isCrowdsaleTimeOver() {
		logger.info(this.name + " :isCrowdsaleTimeOver ");
		try {
			let arr = await super.findWithWait(countdownTimerValue);
			let result = 0;
			for (let i = 0; i < arr.length; i++) {
				result = result + parseInt((await this.getTextForElement(arr[i])));
			}
			if (result < 0) result = 0;
			return (result === 0);
		}
		catch (err) {
			logger.info("Error " + err);
			return false;
		}
	}

	async getBalance() {
		logger.info(this.name + "getBalance ");
		return await super.getTextForElement(fieldBalance);
	}

	async isPresentError() {
		logger.info(this.name + "isPresentError ");
		return await super.isElementDisplayed(errorNotice);
	}

	async isPresentWarning() {
		logger.info(this.name + "isPresentWarning ");
		return await super.isElementDisplayed(buttonOk);
	}

	async isDisplayedCountdownTimer() {
		logger.info(this.name + "isDisplayedCountdownTimer ");
		return await super.isElementDisplayed(countdownTimer);
	}

	async waitUntilDisplayedCountdownTimer() {
		logger.info(this.name + "waitUntilDisplayedCountdownTimer ");
		return (await super.isElementDisplayed(countdownTimer));
	}

	async clickButtonOK() {
		logger.info(this.name + "clickButtonOK ");
		return await super.clickWithWait(buttonOk);
	}

	async fillInvest(amount) {
		logger.info(this.name + "field Contribute :");
		await super.fillWithWait(fieldInvest, amount);
	}

	async clickButtonContribute() {
		logger.info(this.name + "button Contribute :");
		await super.clickWithWait(buttonContribute);
	}

	async getWarningText() {
		logger.info(this.name + "Warning text :");
		return await super.getTextForElement(warningText);
	}

	async getErrorText() {
		logger.info(this.name + "Error text :");
		return await super.getTextForElement(errorNotice);
	}

	async getExecutionID() {
		logger.info(this.name + "field TokenAddress :");
		return (await  this.initFields() !== null) &&
			await super.getTextForElement(this.fieldExecutionID);
	}

	async getCurrentAccount() {
		logger.info(this.name + "getCurrentAccount ");
		return (await  this.initFields() !== null) &&
			await super.getTextForElement(this.fieldCurrentAccount);
	}
}

module.exports.InvestPage = InvestPage;

