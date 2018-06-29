const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonContribute = By.className("button button_fill");
const fieldContribute = By.id("contribute");
const buttonOk = By.className("swal2-confirm swal2-styled");
const fieldBalance = By.className("balance-title");
const fields = By.className("hashes-title");
const warningText = By.id("swal2-content");
const errorNotice = By.className("css-6bx4c3");
const countdownTimer = By.className("timer");
const countdownTimerValue = By.className("timer-count");
const countdownTimerStatus = By.className("timer-interval");
const statusTimer = {
	start: "START",
	end: "END",
	finalized: "HAS BEEN",
	tier1: "TIER 1",
	tier2: "TIER 2",
	tier3:"TIER 3"
}

class ContributionPage extends Page {

	constructor(driver) {
		super(driver);
		this.URL;
		this.fieldExecutionID;
		this.fieldCurrentAccount;
		this.name = "Invest page :";
		this.timer = [];
	}

	async getTimerStatus() {
		logger.info(this.name + "getTimerStatus ");
		try {
			let array = await this.initTimerFields();
			let result = await super.getTextForElement(array[array.length-1]);
			logger.info("timer status: "+result);
			if (result.includes(statusTimer.start)) return statusTimer.start;
			else if (result.includes(statusTimer.tier1)) return statusTimer.tier1;
			else if (result.includes(statusTimer.tier2)) return statusTimer.tier2;
			else if (result.includes(statusTimer.tier3)) return statusTimer.tier3;
			else if (result.includes(statusTimer.finalized)) return statusTimer.finalized;
		}
		catch (err) {
			logger.info("Error " + err);
			return false;
		}
	}


	async isCrowdsaleStarted() {
		logger.info(this.name + "isCrowdsaleStarted ");
		return (await this.getTimerStatus() !== statusTimer.start);
	}

	async isCurrentTier1() {
		logger.info(this.name + "isCurrentTier1 ");
		return (await this.getTimerStatus() === statusTimer.tier1);
	}

	async isCurrentTier2() {
		logger.info(this.name + "isCurrentTier2 ");
		return (await this.getTimerStatus() === statusTimer.tier2);
	}

	async isCurrentTier3() {
		logger.info(this.name + "isCurrentTier3 ");
		return (await this.getTimerStatus() === statusTimer.tier3);
	}

	async initTimerFields() {
		logger.info(this.name + "initTimerFields ");
		try {
			let array = await super.findWithWait(countdownTimerStatus);
			this.timer = array[0];
			return array;
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

	async waitUntilShowUpButtonOk(Twaiting) {
		logger.info(this.name + "waitUntilShowUpButtonOk ");
		return await super.waitUntilDisplayed(buttonOk, Twaiting)
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

	async fillContribute(amount) {
		logger.info(this.name + "fillContribute");
		return await super.fillWithWait(fieldContribute, amount);
	}

	async clickButtonContribute() {
		logger.info(this.name + "clickButtonContribute");
		return await super.clickWithWait(buttonContribute);
	}

	async getWarningText() {
		logger.info(this.name + "getWarningText");
		return await super.getTextForElement(warningText);
	}

	async getErrorText() {
		logger.info(this.name + "getErrorText");
		return await super.getTextForElement(errorNotice);
	}

	async getExecutionID() {
		logger.info(this.name + "getExecutionID");
		return (await  this.initFields() !== null) &&
			await super.getTextForElement(this.fieldExecutionID);
	}

	async getCurrentAccount() {
		logger.info(this.name + "getCurrentAccount ");
		return (await  this.initFields() !== null) &&
			await super.getTextForElement(this.fieldCurrentAccount);
	}

	async waitUntilShowUpErrorNotice(Twaiting) {
		logger.info(this.name + "waitUntilShowUpErrorNotice ");
		return super.waitUntilDisplayed(errorNotice, Twaiting);
	}

	async waitUntilShowUpWarning(Twaiting) {
		logger.info(this.name + "waitUntilShowUpWarning ");
		return super.waitUntilDisplayed(buttonOk, Twaiting);
	}
}

module.exports.InvestPage = ContributionPage;

