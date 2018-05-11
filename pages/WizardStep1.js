const logger= require('../entity/Logger.js').logger;
const Page=require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const  buttonContinue= By.className("button button_fill");

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
			let locator = By.className("radio");
			let array = await super.findWithWait(locator);
			this.checkboxWhitelistWithCap = array[0];
			this.checkboxDutchAuction = array[1];
			return array;
		} catch(err){
			logger.info("Error: " + err);
			return null;
		}
	}

    async isDisplayedButtonContinue() {
	    logger.info(this.name+": isDisplayedButtonContinue: ");
        return  await super.isElementDisplayed(buttonContinue);
    }

    async clickButtonContinue() {
        logger.info(this.name+"clickButtonContinue: ");
        return await super.clickWithWait(buttonContinue);
    }

    async  open() {
        logger.info(this.name+"open");
        return  await  super.open (this.URL);
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
}
module.exports.WizardStep1=WizardStep1;
