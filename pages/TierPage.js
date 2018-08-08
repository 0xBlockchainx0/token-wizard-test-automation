const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const wizardStep3 = require("./WizardStep3.js");
const itemsRemove = By.className("item-remove");
const buttonAddWhitelist = By.className("button button_fill button_fill_plus");
const whitelistContainer = By.className("white-list-container");
const whitelistContainerInner = By.className("white-list-item-container-inner");//white-list-input-container-inner
const buttonClearAll = By.className("fa fa-trash");
const buttonYesAlert = By.className("swal2-confirm swal2-styled");
const fieldMinRate = By.id("tiers[0].minRate");
const fieldMaxRate = By.id("tiers[0].maxRate");
const contentContainer = By.className("steps-content container");

let COUNT_TIERS = 0;
const timeAdjust = 0;//relative value  for tier time

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
		this.checkboxWhitelistingYes;
		this.checkboxWhitelistingNo;
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
		if (this.tier.name === undefined) return true;
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
		if (this.tier.rate === undefined) return true;
		let element = await this.getFieldRate();
		return await super.clearField(element) &&
			await super.fillWithWait(element, this.tier.rate);
	}

	async getFieldMinCap() {
		logger.info(this.name + "getFieldMinCap ");
		const locator = By.id("tiers[" + this.number + "].minCap");
		return await super.getElement(locator);
	}

	async fillMinCap(tier) {
		logger.info(this.name + "fillMinCap ");
		if (this.tier.minCap === undefined) return true;
		let element = await this.getFieldMinCap(tier);
		return await super.clearField(element) &&
			await super.fillWithWait(element, this.tier.minCap);
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

	async fillMinRate() {
		logger.info(this.name + "fillMinRate ");
		if (this.tier.minRate === undefined) return true;
		return await super.clearField(fieldMinRate) &&
			await super.fillWithWait(fieldMinRate, this.tier.minRate);
	}

	async fillMaxRate() {
		logger.info(this.name + "fillMaxRate ");
		if (this.tier.maxRate === undefined) return true;
		return await super.clearField(fieldMaxRate) &&
			await super.fillWithWait(fieldMaxRate, this.tier.maxRate);
	}

	async getFieldStartTime() {
		logger.info(this.name + "getFieldStartTime ");
		const locator = By.id("tiers[" + this.number + "].startTime");
		return await super.getElement(locator);
	}

	async fillStartTime() {
		logger.info(this.name + "fillStartTime ");
		if (this.tier.startDate === "") return true;
		let locator = await this.getFieldStartTime();
		let format = await Utils.getDateFormat(this.driver);
		if (!this.tier.startDate.includes("/")) {
			this.tier.startTime = Utils.getTimeWithAdjust(timeAdjust + parseInt(this.tier.startTime), "utc");
			this.tier.startDate = Utils.getDateWithAdjust(timeAdjust + parseInt(this.tier.startDate), "utc");
		}
		if (format === "mdy") {
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
			this.tier.endTime = Utils.getTimeWithAdjust(timeAdjust + parseInt(this.tier.endDate), "utc");
			this.tier.endDate = Utils.getDateWithAdjust(timeAdjust + parseInt(this.tier.endDate), "utc");
		}
		if (format === "mdy") {
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
		logger.info(this.name + "initWhitelistFields ");
		try {
			let containers = await super.findWithWait(contentContainer);
			let element = await this.getChildFromElementByClassName("white-list-container", containers[this.number + 1]);
			let array = await this.getChildFromElementByClassName("input", element[0]);

			if (array === null) return null;
			else {
				this.fieldWhAddressTier = array[0];
				this.fieldMinTier = array[1];
				this.fieldMaxTier = array[2];
			}
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
			let containers = await super.findWithWait(contentContainer);
			let array = await this.getChildFromElementByClassName("radio-inline", containers[this.number + 1]);

			if (array.length > 2) {
				this.checkboxModifyOn = array[0];
				this.checkboxModifyOff = array[1];
				this.checkboxWhitelistingYes = array[2];
				this.checkboxWhitelistingNo = array[3];
			}
			else { //if DUTCH
				this.checkboxWhitelistingYes = array[0];
				this.checkboxWhitelistingNo = array[1];
			}
			return true;
		}
		catch (err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async fillAddress(address) {
		logger.info(this.name + "fillAddress ");
		return (await this.initWhitelistFields() !== null)
			&& (this.fieldWhAddressTier !== undefined)
			&& await super.clearField(this.fieldWhAddressTier) &&
			await super.fillWithWait(this.fieldWhAddressTier, address);
	}

	async fillMin(value) {
		logger.info(this.name + "fillMin ");
		return (await this.initWhitelistFields() !== null)
			&& (this.fieldMinTier !== undefined) &&
			await super.clearField(this.fieldMinTier) &&
			await super.fillWithWait(this.fieldMinTier, value);
	}

	async fillMax(value) {
		logger.info(this.name + "fillMax  ");
		return (await this.initWhitelistFields() !== null)
			&& (this.fieldMaxTier !== undefined)
			&& await super.clearField(this.fieldMaxTier)
			&& await super.fillWithWait(this.fieldMaxTier, value);
	}

	async getButtonAddWhitelist() {
		logger.info(this.name + "getButtonAddWhitelist ");
		let containers = await super.findWithWait(contentContainer);
		let element = await this.getChildFromElementByClassName("button button_fill button_fill_plus", containers[this.number + 1]);
		return element[0];
	}

	async clickButtonAddWhitelist() {
		logger.info(this.name + "clickButtonAddWhitelist ");
		//if (this.tier.minRate !== undefined) return true;
		let element = await this.getButtonAddWhitelist();
		return await super.clickWithWait(element);
	}

	async setWhitelisting() {
		logger.info(this.name + "setWhitelisting ");
		if (!this.tier.isWhitelisted) return true;
		return (await this.initCheckboxes() !== null)
			&& await super.waitUntilDisplayed(this.checkboxWhitelistingYes)
			&& await super.clickWithWait(this.checkboxWhitelistingYes);
	}

	async setModify() {
		logger.info(this.name + "setModify ");
		if ((this.tier.allowModify === undefined) || (!this.tier.allowModify)) return true;
		return (await this.initCheckboxes() !== null)
			&& await super.clickWithWait(this.checkboxModifyOn);
	}

	async removeWhiteList(number) {
		logger.info(this.name + "removeWhiteList ");
		return await this.initItemsRemove() &&
			await super.clickWithWait(this.itemsRemove[number]);
	}

	async isDisplayedWhitelistContainer() {
		logger.info(this.name + "isDisplayedWhitelistContainer ");
		return (await this.initWhitelistFields() !== null)
	}

	async amountAddedWhitelist(Twaiting) {
		logger.info(this.name + "amountAddedWhitelist ");
		try {
			let array = await super.findWithWait(whitelistContainerInner, Twaiting);
			let length = 0;
			if (array !== null) length = array.length;
			logger.info("Whitelisted addresses added=" + length);
			return length;
		}
		catch (err) {
			return 0;
		}
	}

	async clickButtonClearAll() {
		logger.info(this.name + "clickButtonClearAll:");
		try {
			await this.driver.executeScript("document.getElementsByClassName('fa fa-trash')[0].click();");
			return true;
		}
		catch (err) {
			logger.info("Error " + err);
			return false;
		}
	}

	async clickButtonYesAlert() {
		return await super.clickWithWait(buttonYesAlert);
	}

	async waitUntilShowUpPopupConfirm(Twaiting) {
		logger.info("waitUntilShowUpPopupConfirm: ");
		return await this.waitUntilDisplayed(buttonYesAlert, Twaiting);
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

	async uploadWhitelistCSVFile(path) {
		logger.info(this.name + "uploadWhitelistCSVFile ");
		if (path === undefined) path = "./public/whitelistAddressesTestValidation.csv";
		try {
			path = await Utils.getPathToFileInPWD(path);
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

	async fillTier(isFillBulkWhitelistAddresses, pathCSVWhitelist) {
		logger.info(this.name + "fillTier ");
		return await this.setModify()
		&& await this.fillMinCap()
		&& await this.setWhitelisting()
		&& await this.fillMinRate()
		&& await this.fillMaxRate()
		&& await this.fillRate()
		&& await this.fillSetupName()
		&& await this.fillSupply()
		&& await this.fillStartTime()
		&& await this.fillEndTime()
		&& (isFillBulkWhitelistAddresses) ? await this.fillBulkWhitelist(pathCSVWhitelist) : await this.fillWhitelist();

	}

	async fillBulkWhitelist(pathCSVWhitelist) {
		logger.info(this.name + " fillBulkWhitelist ");
		return await this.uploadWhitelistCSVFile(pathCSVWhitelist)
			&& await this.clickButtonYesAlert();
	}

	async isDisabledFieldEndTime() {
		logger.info(this.name + " isDisabledFieldEndTime ");
		let element = await this.getFieldEndTime();
		return await super.isElementDisabled(element);
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
				await this.clickButtonAddWhitelist();
			}
			return true;
		}
		catch (err) {
			logger.info("Error: " + err);
			return false;
		}
	}

	async isDisabledFieldMinCap(tier) {
		logger.info(this.name + "isDisabledFieldMinCap ");
		let element = await this.getFieldMinCap(tier)
		return await this.isElementDisabled(element);
	}

	async isDisabledFieldSupply() {
		logger.info(this.name + "isDisabledFieldSupply ");
		let element = await this.getFieldSupply()
		return await this.isElementDisabled(element);
	}
}

module.exports.TierPage = TierPage;
