const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonContinue = By.xpath("//*[contains(text(),'Continue')]");
const fieldName = By.id("name");
const fieldTicker = By.id("ticker");
const fieldDecimals = By.id("decimals");
const fieldSupply = By.id("supply");

class WizardStep2 extends Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.name="WizardStep2 page: ";
        this.warningName;
	    this.warningTicker;
	    this.warningDecimals;
	    this.warningAddress;
	    this.warningValue;
	    this.warningSupply;
	    this.title="TOKEN SETUP";
    }

    async initWarnings() {
	    logger.info(this.name + " :init warnings");
    	try {
		    const locator = By.className("error");
		    let array = await super.findWithWait(locator);
		    this.warningName = array[0];
		    this.warningTicker = array[1];
		    this.warningDecimals = array[2];
		    this.warningSupply = array[3];
		    return array;
	    }
	    catch(err) {
    		logger.info("Error: " + err);
    		return null;
	    }
	}

    async isDisplayedFieldName() {
        logger.info(this.name+"isDisplayedFieldName ");
        return await this.isElementDisplayed(fieldName);
    }

    async fillName(value) {
       	logger.info(this.name+"fillName with value=" + value);
	    return await this.clearField(fieldName) &&
               await super.fillWithWait(fieldName,value);
    }

	async fillTicker(value) {
	    logger.info(this.name + "fillTicker with value=" + value);
	    return await super.clearField(fieldTicker) &&
	           await super.fillWithWait(fieldTicker, value);
	}

	async fillDecimals(value) {
    	logger.info(this.name + "fillDecimals with value=" + value);
		return await super.fillWithWait(fieldDecimals, value);
	}

	async fillSupply(value) {
		logger.info(this.name + "fillSupply with value=" + value);
		return await super.clearField(fieldSupply) &&
			   await super.fillWithWait(fieldSupply, value);
	}

	async clickButtonContinue() {
	    logger.info(this.name+"clickButtonContinue ");
	    return await super.clickWithWait(buttonContinue);
	}

	async isDisplayedButtonContinue() {
		logger.info(this.name+"isPresentButtonContinue ");
		return await super.isElementDisplayed(buttonContinue);
	}

    async isDisplayedWarningName() {
	    logger.info(this.name+"isDisplayedWarningName ");
	    return false;
    	await this.initWarnings();
    	if ((await super.getTextForElement(this.warningName)) != "") return true;
    	else return false;
    }

	async isDisplayedWarningTicker() {
		logger.info(this.name+"isDisplayedWarningTicker ");
    	return false;
		await this.initWarnings();
		if ((await super.getTextForElement(this.warningTicker)) != "") return true;
		else return false;
	}

	async isDisplayedWarningDecimals() {
		logger.info(this.name+"isDisplayedWarningDecimals ");
		return false;
		await this.initWarnings();
		if ((await super.getTextForElement(this.warningDecimals)) != "") return true;
		else return false;
	}

	async isDisplayedWarningSupply() {
		logger.info(this.name+"isDisplayedWarningSupply ");
		return false;
		await this.initWarnings();
		if ((await super.getTextForElement(this.warningSupply)) != "") return true;
		else return false;
	}

	async getFieldDecimals() {
		logger.info(this.name+"getFieldDecimals ");
		return super.getAttribute(fieldDecimals, "value");
	}

	async isDisabledDecimals() {
		logger.info(this.name+"isDisabledDecimals ");
		return await super.isElementDisabled(fieldDecimals);
	}
}
module.exports.WizardStep2=WizardStep2;