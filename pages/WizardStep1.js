const logger= require('../entity/Logger.js').logger;
const Page=require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const  buttonContinue= By.className("sw-ButtonContinue_Text");
const checkboxWhitelistWithCap =By.id('white-list-with-cap');
const checkboxDutchAuction = By.id('dutch-auction');

class WizardStep1 extends Page {

    constructor(driver){
        super(driver);
        this.name = "WizardStep1 page: ";
	    this.title="CROWDSALE CONTRACT";
	    this.checkboxWhitelistWithCap;
	    this.checkboxDutchAuction;
	}

    async initCheckboxes() {
		try {
			logger.info(this.name + "initCheckboxes ");
			let locator = By.className("st-StrategyItem_Radio");
			let array = await super.findWithWait(locator);
			this.checkboxWhitelistWithCap = array[0];
			this.checkboxDutchAuction = array[1];
			return array;
		} catch(err){
			logger.info("Error: " + err);
			return null;
		}
	}

    async isSelectedCheckboxWhitelistWithCap() {
        logger.info(this.name + "isSelectedCheckboxWhitelistWithCap: ");
        return super.isElementSelected(checkboxWhitelistWithCap)
	}

    async isSelectedCheckboxDutchAuction() {
        logger.info(this.name + "isSelectedCheckboxDutchAuction: ");
        return super.isElementSelected(checkboxDutchAuction)
    }

    async isDisplayedButtonContinue() {
	    logger.info(this.name+": isDisplayedButtonContinue: ");
        return  await super.isElementDisplayed(buttonContinue);
    }

    async clickButtonContinue() {
        logger.info(this.name+"clickButtonContinue: ");
        return await super.clickWithWait(buttonContinue);
    }

    async clickCheckboxWhitelistWithCap() {
	    logger.info(this.name + "clickCheckboxWhitelistWithCap: ");
	    await this.initCheckboxes();
        return await super.clickWithWait(this.checkboxWhitelistWithCap);
    }

	async clickCheckboxDutchAuction() {
		logger.info(this.name + "clickCheckboxDutchAuction: ");
		return (await this.initCheckboxes() !== null ) &&
			await super.clickWithWait(this.checkboxDutchAuction);
	}

	async waitUntilDisplayedButtonContinue() {
		logger.info(this.name + "waitUntilDisplayedButtonContinue: ");
		return await super.waitUntilDisplayed(buttonContinue);
	}

	async waitUntilDisplayedCheckboxDutchAuction() {
		logger.info(this.name + "waitUntilDisplayedCheckboxDutchAuction: ");
		return (await this.initCheckboxes() !== null ) &&
			await super.waitUntilDisplayed(this.checkboxDutchAuction);
	}

    async waitUntilDisplayedCheckboxWhitelistWithCap() {
        logger.info(this.name + "waitUntilDisplayedCheckboxWhitelistWithCap: ");
        return (await this.initCheckboxes() !== null ) &&
            await super.waitUntilDisplayed(this.checkboxWhitelistWithCap);
    }
}
module.exports.WizardStep1=WizardStep1;
