const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const TITLES = require('../utils/constants.js').TITLES;
const By = require('selenium-webdriver/lib/by').By;


const fieldExecID = By.className("cs-CrowdsaleID_HashText")
const title = By.className('st-StepInfo_Title')
const funds = By.className('cs-CrowdsaleProgress_FundsTitle')
const buttonContribute = By.className('sw-ButtonContinue_Text')
const values = By.className('cs-CrowdsaleSummaryItem_Title')


class CrowdsalePage extends Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.name = "Crowdsale page :";
        this.title = TITLES.CROWDSALE_PAGE
    }


    async waitUntilShowUpTitle(Twaiting) {
        logger.info(this.name + "waitUntilShowUpTitle ");
        return ((await super.getTitleText()).toString() === TITLES.CROWDSALE_PAGE);
    }

    async isDisplayedButtonInvest() {
        logger.info(this.name + " isDisplayedButtonInvest ");
        return await super.isElementDisplayed(buttonInvest);
    }

    async clickButtonInvest() {
        logger.info(this.name + "clickButtonInvest ");
        return await super.clickWithWait(buttonInvest);
    }

    async getProxyAddress() {
        logger.info(this.name + "getProxyAddress");
        return await super.getTextForElement(fieldExecID);
    }

    async getRaisedFunds() {
        logger.info(this.name + "getRaisedFunds");
        const field = (await super.findWithWait(funds))[0]
        return await super.getTextForElement(field);
    }

    async getGoalFunds() {
        logger.info(this.name + "getGoalFunds");
        const field = (await super.findWithWait(funds))[1]
        return await super.getTextForElement(field);
    }
    async getTokensClaimed() {
        logger.info(this.name + "getTokensClaimed");
        const field = (await super.findWithWait(values))[0]
        return await super.getTextForElement(field);
    }

    async getContributors() {
        logger.info(this.name + "getContributors");
        const field = (await super.findWithWait(values))[1]
        return await super.getTextForElement(field);
    }

    async getRate() {
        logger.info(this.name + "getRate");
        const field = (await super.findWithWait(values))[2]
        return await super.getTextForElement(field);
    }

    async getTotalSupply() {
        logger.info(this.name + "getTotalSupply");
        const field = (await super.findWithWait(values))[3]
        return await super.getTextForElement(field);
    }

    async getFieldsContent() {
        logger.info(this.name + "getFieldsContent")
        const val = await super.findWithWait(values)
        const array = []
        for ( let i = 0; i < val.length; i++ ) {
            array[i] = await val[i].getText()
        }
        return array
    }

    async clickButtonContribute() {
        logger.info(this.name + "clickButtonContribute ");
        return await super.clickWithWait(buttonContribute);
    }



}

module.exports = {
    CrowdsalePage: CrowdsalePage
}
