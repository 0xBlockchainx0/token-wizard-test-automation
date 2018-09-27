const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const TITLES = require('../utils/constants.js').TITLES;
const By = require('selenium-webdriver/lib/by').By;
const buttonInvest = By.className("button button_fill");
const fieldExecID = By.className("hash");
const title = By.className('title')
const funds = By.className('total-funds-title')
const buttonContribute = By.className('button button_fill')


class CrowdsalePage extends Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.name = "Crowdsale page :";
    }


    async waitUntilShowUpTitle(Twaiting) {
        logger.info(this.name + "waitUntilShowUpTitle ");
        return await super.waitUntilDisplayed(title, Twaiting)
            && (await super.getTitleText() === TITLES.CROWDSALE_PAGE);
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
        const field = (await super.findWithWait(title))[1]
        return await super.getTextForElement(field);
    }

    async getContributors() {
        logger.info(this.name + "getContributors");
        const field = (await super.findWithWait(title))[2]
        return await super.getTextForElement(field);
    }

    async getRate() {
        logger.info(this.name + "getRate");
        const field = (await super.findWithWait(title))[3]
        return await super.getTextForElement(field);
    }

    async getTotalSupply() {
        logger.info(this.name + "getTotalSupply");
        const field = (await super.findWithWait(title))[4]
        return await super.getTextForElement(field);
    }

    async clickButtonContribute() {
        logger.info(this.name + "clickButtonContribute ");
        return await super.clickWithWait(buttonContribute);
    }



}

module.exports = {
    CrowdsalePage: CrowdsalePage
}
