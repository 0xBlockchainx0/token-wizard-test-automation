const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const wizardStep3 = require("./WizardStep3.js");
const itemsRemove = By.className("item-remove");
const buttonAdd = By.className("button button_fill button_fill_plus");
const whitelistContainer = By.className("white-list-container");
const whitelistContainerInner = By.className("white-list-item-container-inner");
const buttonClearAll = By.className("fa fa-trash");
const buttonYesAlert = By.className("swal2-confirm swal2-styled");

let COUNT_TIERS = 0;
const timeAdjust=80000;//relative value  for tier time


class TierPage extends Page {

	constructor(driver, tier) {
		super(driver);
		this.URL;
		this.tier = tier;
		this.number = COUNT_TIERS++;
		this.name = "Tier #" + this.number + ": ";

		this.fieldWhAddressTier;
		this.fieldMinTier;
		this.fieldMaxTier;
		this.checkboxModifyOn;
		this.checkboxModifyOff;
		this.itemsRemove = [];
		this.warningName;
		this.warningStartTime;
		this.warningEndTime;
		this.warningRate;
		this.warningSupply;
		this.warningRate;
		this.warningWhAddress;
		this.warningWhMin;
		this.warningWhMax;
	}

	static async setCountTiers(value) {
		COUNT_TIERS = value;
		return true;
	}

	async getFieldSetupName() {
		logger.info(this.name + "getFieldSetupName ");
		const locator = By.id("tiers[" + this.number + "].tier");
		return await super.getElement(locator);
	}

	async fillSetupName() {
		logger.info(this.name + "fillSetupName ");
		let element = await this.getFieldSetupName();
		return await super.clearField(element) &&
			await super.fillWithWait(element, this.tier.name);
	}

	async getFieldRate() {
		logger.info(this.name + "getFieldRate ");
		const locator = By.id("tiers[" + this.number + "].rate");
		return await super.getElement(locator);
	}

	async fillRate() {
		logger.info(this.name + "fillRate ");
		let element = await this.getFieldRate();
		return await super.clearField(element) &&
			await super.fillWithWait(element, this.tier.rate);
	}

	async getFieldSupply() {
		logger.info(this.name + "getFieldSupply ");
		const locator = By.id("tiers[" + this.number + "].supply");
		return await super.getElement(locator);
	}

	async fillSupply() {
		logger.info(this.name + "fillSupply ");
		let element = await this.getFieldSupply();
		return await super.clearField(element) &&
			await super.fillWithWait(element, this.tier.supply);
	}

	async getFieldStartTime() {
		logger.info(this.name + "getFieldStartTime ");
		const locator = By.id("tiers[" + this.number + "].startTime");
		return await super.getElement(locator);
	}

	async fillStartTime() {
		logger.info(this.name + "fillStartTime ");
		//if (this.tier.startDate === "") return true;
		let locator = await this.getFieldStartTime();
		let format = await Utils.getDateFormat(this.driver);
		if (this.tier.startDate === "") {
			this.tier.startDate = Utils.getDateWithAdjust(timeAdjust, format);
			this.tier.startTime = Utils.getTimeWithAdjust(timeAdjust, format);


		}
		else if (format === "mdy") {
			this.tier.startDate = Utils.convertDateToMdy(this.tier.startDate);
			this.tier.startTime = Utils.convertTimeToMdy(this.tier.startTime);
		}
		return await super.clickWithWait(locator) &&
			await super.fillWithWait(locator, this.tier.startDate) &&
			await super.pressKey(key.TAB, 1) &&
			await super.fillWithWait(locator, this.tier.startTime);
	}

	async getFieldEndTime() {
		logger.info(this.name + "getFieldEndTime ");
		const locator = By.id("tiers[" + this.number + "].endTime");
		return await super.getElement(locator);
	}

	async fillEndTime() {
		logger.info(this.name + "fillEndTime ");
		if (this.tier.endDate === "") return true;
		let locator = await this.getFieldEndTime();
		let format = await Utils.getDateFormat(this.driver);
		if (!this.tier.endDate.includes("/")) {
			this.tier.endTime = Utils.getTimeWithAdjust(timeAdjust+parseInt(this.tier.endDate), "utc");
			this.tier.endDate = Utils.getDateWithAdjust(timeAdjust+parseInt(this.tier.endDate), "utc");
		}
		else if (format === "mdy") {
			this.tier.endDate = Utils.convertDateToMdy(this.tier.endDate);
			this.tier.endTime = Utils.convertTimeToMdy(this.tier.endTime);
		}
		return await super.clickWithWait(locator) &&
			await super.fillWithWait(locator, this.tier.endDate) &&
			await super.pressKey(key.TAB, 1) &&
			await super.fillWithWait(locator, this.tier.endTime);
	}

	async initItemsRemove() {
		logger.info(this.name + "initItemsRemove ");
		try {
			let array = await super.findWithWait(itemsRemove);
			for (let i = 0; i < array.length; i++) {
				this.itemsRemove[i] = array[i];
			}
			return array;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async initWhitelistFields() {
		logger.info(this.name + "initWhitelistContainer ");
		let element = (await this.findWithWait(whitelistContainer))[this.number];
		let array = await this.getChildFromElementByClassName("input", element);
		if (array === null) return null;
		else {
			this.fieldWhAddressTier = array[0];
			this.fieldMinTier = array[1];
			this.fieldMaxTier = array[2];
		}
		return array;
	}

	async initCheckboxes() {
		logger.info(this.name + "initCheckboxes ");
		try {
			const locator = By.className("radio-inline");
			let array = await super.findWithWait(locator);
			this.checkboxModifyOn = array[6 + 2 * this.number];
			this.checkboxModifyOff = array[7 + 2 * this.number];
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async fillAddress(address) {
		logger.info(this.name + "fillAddress ");
		await this.initWhitelistFields();
		return (this.fieldWhAddressTier !== undefined) &&
			await super.clearField(this.fieldWhAddressTier) &&
			await super.fillWithWait(this.fieldWhAddressTier, address);
	}

	async fillMin(value) {
		logger.info(this.name + "fillMin ");
		await this.initWhitelistFields();
		return (this.fieldMinTier !== undefined) &&
			await super.clearField(this.fieldMinTier) &&
			await super.fillWithWait(this.fieldMinTier, value);
	}

	async fillMax(value) {
		logger.info(this.name + "fillMax  ");
		await this.initWhitelistFields();
		return (this.fieldMaxTier !== undefined) &&
			await super.clearField(this.fieldMaxTier) &&
			await super.fillWithWait(this.fieldMaxTier, value);
	}

	async clickButtonAdd() {
		logger.info(this.name + "clickButtonAdd ");
		let array = await this.findWithWait(buttonAdd);
		if (array === null) return false;
		else return await super.clickWithWait(array[this.number]);
	}

	async setModify() {
		logger.info(this.name + "setModify ");
		await this.initCheckboxes();
		if (this.tier.allowModify) {
			return await super.clickWithWait(this.checkboxModifyOn);
		} else return (await this.initCheckboxes() !== null);
	}

	async removeWhiteList(number) {
		logger.info(this.name + "removeWhiteList ");
		return await this.initItemsRemove() &&
			await super.clickWithWait(this.itemsRemove[number]);
	}

	async amountAddedWhitelist() {
		logger.info(this.name + "amountAddedWhitelist ");
		try {
			let array = await this.findWithWait(whitelistContainerInner);
			logger.info("Whitelisted addresses added=" + array.length);
			return array.length;
		}
		catch (err) {
			return 0;
		}
	}

	async clickButtonClearAll() {
		return await super.clickWithWait(buttonClearAll);
	}

	async clickButtonYesAlert() {
		return await super.clickWithWait(buttonYesAlert);
	}

	async isPresentWarningName() {
		logger.info(this.name + "isPresentWarningName");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningMincap) !== "");
	}

	async isPresentWarningStartTime() {
		logger.info(this.name + "isPresentWarningStartTime ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningStartTime) !== "");
	}

	async isPresentWarningEndTime() {
		logger.info(this.name + "isPresentWarningEndTime ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningEndTime) !== "");
	}

	async isPresentWarningRate() {
		logger.info(this.name + "isPresentWarningRate ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningRate) !== "");
	}

	async isPresentWarningSupply() {
		logger.info(this.name + "isPresentWarningSupply ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningSupply) !== "");
	}

	async isPresentWarningWhAddress() {
		logger.info(this.name + "isPresentWarningWhAddress ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningWhAddress) !== "");
	}

	async isPresentWarningWhMin() {
		logger.info(this.name + "isPresentWarningWhMin ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningWhMin) !== "");
	}

	async isPresentWarningWhMax() {
		logger.info(this.name + "isPresentWarningWhMax ");
		return false;
		return (await this.initWarnings() !== null) &&
			(await super.getTextForElement(this.warningWhMax) !== "");
	}

	async uploadWhitelistCSVFile() {
		logger.info(this.name + "uploadWhitelistCSVFile ");
		try {
			let path = await Utils.getPathToFileInPWD("bulkWhitelist.csv");
			logger.info(this.name + ": uploadWhitelistCSVFile: from path: " + path);
			const locator = By.xpath('//input[@type="file"]');
			let element = await this.driver.findElement(locator);
			await element.sendKeys(path);
			return true;
		}
		catch (err) {
			logger.info("Error: " + err);
			return false;
		}
	}

	async initWarnings() {
		logger.info(this.name + "initWarnings ");
		try {
			const locator = By.className("error");
			let array = await super.findWithWait(locator);
			let ci_tresh = 2;
			let ci_mult = 5;
			if (wizardStep3.WizardStep3.getFlagCustom()) ci_tresh = 3;
			if (wizardStep3.WizardStep3.getFlagWHitelising()) ci_mult = 8;
			this.warningName = arr[ci_tresh + (this.number) * ci_mult];
			this.warningStartTime = arr[ci_tresh + (this.number) * ci_mult + 1];
			this.warningEndTime = arr[ci_tresh + (this.number) * ci_mult + 2];
			this.warningRate = arr[ci_tresh + (this.number) * ci_mult + 3];
			this.warningSupply = arr[ci_tresh + (this.number) * ci_mult + 4];
			this.warningWhAddress = arr[ci_tresh + (this.number) * ci_mult + 5];
			this.warningWhMin = arr[ci_tresh + (this.number) * ci_mult + 6];
			this.warningWhMax = arr[ci_tresh + (this.number) * ci_mult + 7];
			return array;
		}
		catch (err) {
			logger.info(this.name + ": dont contain warning elements");
			return null;
		}
	}

	async fillTier() {
		logger.info(this.name + "fillTier ");
		return await this.fillRate() &&
			await this.fillSetupName() &&
			await this.fillSupply() &&
			await this.fillStartTime() &&
			await this.fillEndTime() &&
			await this.setModify() &&
			await this.fillWhitelist();

	}

	async fillWhitelist() {
		logger.info(this.name + "fillWhitelist ");
		try {
			for (let i = 0; i < this.tier.whitelist.length; i++) {
				logger.info(this.name + "fillWhitelist #" + i + ": ");
				do {
					await this.fillAddress(this.tier.whitelist[i].address);
				} while (await this.isPresentWarningWhAddress());
				do {
					await this.fillMin(this.tier.whitelist[i].min);
				} while (await this.isPresentWarningWhMin());
				do {
					await this.fillMax(this.tier.whitelist[i].max);
				} while (await this.isPresentWarningWhMax());
				await this.clickButtonAdd();
			}
			return true;
		}
		catch (err) {
			logger.info("Error: " + err);
			return false;
		}
	}
}

module.exports.TierPage = TierPage;
