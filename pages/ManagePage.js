const logger = require('../entity/Logger.js').logger
const key = require('selenium-webdriver').Key
const By = require('selenium-webdriver/lib/by').By
const Page = require('./Page.js').Page

const Utils = require('../utils/Utils.js').Utils;

const buttonFinalize = By.className("mng-FinalizeCrowdsaleStep_Button");
const buttonYesFinalize = By.className("swal2-confirm swal2-styled");
const buttonSave = By.xpath("//*[contains(text(),'Save')]")

class ManagePage extends Page {

	constructor(driver, crowdsale) {
		super(driver);
			}

	async getFieldMinCap(tier) {
		logger.info(this.name + "getFieldMinCap ");
		const locator = By.id("tiers[" + (tier - 1) + "].minCap");
		return await super.getElement(locator);
	}

	async isDisabledFieldMinCap(tier) {
		logger.info(this.name + "isDisabledFieldMinCap ");
		let element = await this.getFieldMinCap(tier)
		return await this.isElementDisabled(element);
	}

	async fillMinCap(tier, value) {
		logger.info(this.name + "fillMinCap , tier# " + tier + " ,value = " + value);
		let element = await this.getFieldMinCap(tier)
		return await super.clearField(element)
			&& await super.fillWithWait(element, value);
	}

}

module.exports = {
	ManagePage: ManagePage
}