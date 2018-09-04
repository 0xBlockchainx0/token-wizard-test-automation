const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const buttonNewCrowdsale = By.className("hm-Home_BtnNew");
const buttonChooseContract = By.className("hm-Home_BtnChoose");
const crowdsaleList = By.className('sw-ModalWindow');
const crowdsaleListEmpty = By.className('sw-EmptyContentTextOnly');
const crowdsaleListAddressOwner = By.className('text-bold');
const crowdsaleListCloseButton = By.className('sw-ModalWindow_CloseButton');

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

	async open() {
		logger.info(this.name + ": open");
		return await super.open(this.URL);
	}

	async waitUntilDisplayedButtonNewCrowdsale(Twaiting) {
		logger.info(this.name + "waitUntilDisplayedButtonNewCrowdsale: ");
		return await super.waitUntilDisplayed(buttonNewCrowdsale, Twaiting);
	}

	async isDisplayedButtonNewCrowdsale() {
		logger.info(this.name + ": isDisplayedButtonNewCrowdsale:");
		return await super.isElementDisplayed(buttonNewCrowdsale);
	}

	async isDisplayedButtonChooseContract() {
		logger.info(this.name + ": isDisplayedButtonChooseContract");
		return await super.isElementDisplayed(buttonChooseContract);
	}

	async openWithAlertConfirmation() {
		logger.info(this.name + " openWithAlertConfirmation ");
		if (await  this.open(this.URL) === false) {
			return !await super.acceptAlert();

		}
		else return true;
	}

	async getCrowdsaleList() {
        logger.info(this.name + " getCrowdsaleList ");
        return await super.getElement(crowdsaleList)
    }

    async getCrowdsaleListEmpty() {
        logger.info(this.name + " getCrowdsaleListEmpty ");
        return await super.getElement(crowdsaleListEmpty)
    }

    async getCrowdsaleListAddressOwner() {
        logger.info(this.name + " getCrowdsaleListAddressOwner ");
        return await super.getElement(crowdsaleListAddressOwner)
    }

    async getCrowdsaleListCloseButton() {
        logger.info(this.name + " getCrowdsaleListCloseButton ");
        return await super.getElement(crowdsaleListCloseButton)
    }
}

module.exports.WizardWelcome = WizardWelcome;
