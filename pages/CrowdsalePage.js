const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonInvest = By.className("button button_fill");

class CrowdsalePage extends Page {

	constructor(driver) {
		super(driver);
		this.URL;
		this.name = "Crowdsale page :";
	}

	async isDisplayedButtonInvest() {
		logger.info(this.name + " isDisplayedButtonInvest ");
		return super.isElementDisplayed(buttonInvest);
	}

	async clickButtonInvest() {
		logger.info(this.name + "clickButtonInvest ");
		return await super.clickWithWait(buttonInvest);
	}

}

module.exports = {
	CrowdsalePage: CrowdsalePage
}
