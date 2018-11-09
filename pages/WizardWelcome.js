const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonNewCrowdsale = By.className("hm-ButtonCreateCrowdsale");
const buttonChooseContract = By.className("hm-ButtonChooseCrowdsale");
const buttonResume = By.className('hm-ButtonResumeCrowdsale')
const buttonCancel = By.className('hm-ButtonCancelCrowdsale')

class WizardWelcome extends Page {

	constructor(driver, URL) {
		super(driver);
		this.URL = URL;
		this.name = "WizardWelcome page: ";
	}

	async clickButtonNewCrowdsale() {
		logger.info(this.name + "clickButtonNewCrowdsale");
		return await super.clickWithWait(buttonNewCrowdsale);
	}

	async clickButtonChooseContract() {
		logger.info(this.name + "clickButtonChooseContract");
		return await  super.clickWithWait(buttonChooseContract);
	}

    async clickButtonResume() {
        logger.info(this.name + "clickButtonResume");
        return await super.clickWithWait(buttonResume);
    }

    async clickButtonCancel() {
        logger.info(this.name + "clickButtonCancel");
        return await super.clickWithWait(buttonCancel);
    }

	async open() {
		logger.info(this.name + ": open");
		return await super.open(this.URL);
	}

	async waitUntilDisplayedButtonNewCrowdsale(Twaiting) {
		logger.info(this.name + "waitUntilDisplayedButtonNewCrowdsale: ");
		return await super.waitUntilDisplayed(buttonNewCrowdsale, Twaiting);
	}

    async waitUntilDisplayedButtonResume(Twaiting) {
        logger.info(this.name + "waitUntilDisplayedButtonResume: ");
        return await super.waitUntilDisplayed(buttonResume, Twaiting);
    }

    async isDisplayedButtonNewCrowdsale() {
		logger.info(this.name + ": isDisplayedButtonNewCrowdsale:");
		return await super.isElementDisplayed(buttonNewCrowdsale);
	}

    async isDisplayedButtonResume() {
        logger.info(this.name + ": isDisplayedButtonResume:");
        return await super.isElementDisplayed(buttonResume);
    }

    async isDisplayedButtonCancel() {
        logger.info(this.name + ": isDisplayedButtonCancel:");
        return await super.isElementDisplayed(buttonCancel);
    }

	async isDisplayedButtonChooseContract() {
		logger.info(this.name + ": isDisplayedButtonChooseContract");
		return await super.isElementDisplayed(buttonChooseContract);
	}

	async openWithAlertConfirmation() {
		logger.info(this.name + " openWithAlertConfirmation ");
		if (await  this.open(this.URL) === false) {
			return ! await super.acceptAlert();
		}
		else return true;
	}
}

module.exports.WizardWelcome = WizardWelcome;
