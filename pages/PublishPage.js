const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const copyArea = By.className('copy-area-container')
const fields = By.className('display-container')
const values = By.className('value')
const buttonContinue= By.className('button button_fill button_no_border')
const buttonDownload = By.className('button button_fill_secondary button_no_border')
const errorNotice = By.className("css-6bx4c3");
class PublishPage extends Page {

    constructor(driver) {
        super(driver);
        this.name = 'PublishPage '
    }

    async getAmountFields() {
        logger.info(this.name + "getAmountFields ");
        const arr = await super.findWithWait(fields)
        return arr.length
    }

    async getTextContract() {
        logger.info(this.name + "getTextContract ");
        const arr = await super.findWithWait(copyArea);
        const copy = await super.getChildsByClassName('copy', arr[0])
        const text = await super.getAttribute(copy[0], 'data-clipboard-text')
        return text
    }

    async getEncodedABI() {
        logger.info(this.name + "getEncodedABI ");
        const arr = await super.findWithWait(copyArea);
        const copy = await super.getChildsByClassName('copy', arr[1])
        const text = await super.getAttribute(copy[0], 'data-clipboard-text')
        return text
    }

    async getName() {
        logger.info(this.name + "getName ");
        const value = await super.findWithWait(values)
        return await value[0].getText()
    }

    async getTicker() {
        logger.info(this.name + "getTicker ");
        const value = await super.findWithWait(values)
        return await value[1].getText()
    }

    async getDecimals() {
        logger.info(this.name + "getDecimals ");
        const value = await super.findWithWait(values)
        return await value[2].getText()
    }

    async getSupply() {
        logger.info(this.name + "getSupply ");
        const value = await super.findWithWait(values)
        return await value[3].getText()
    }

    async getWalletAddress() {
        logger.info(this.name + "getWalletAddress ");
        const value = await super.findWithWait(values)
        return await value[4].getText()
    }

    async getCrowdsaleStartTime() {
        logger.info(this.name + "getStartTime ");
        const value = await super.findWithWait(values)
        return await value[5].getText()
    }

    async getCrowdsaleEndTime() {
        logger.info(this.name + "getStartTime ");
        const value = await super.findWithWait(values)
        return await value[6].getText()
    }
    async getTierStartTime(tier) {
        logger.info(this.name + "getTierStartTime ");
        const value = await super.findWithWait(values)
        return await value[7+7*(tier-1)].getText()
    }

    async getTierEndTime(tier) {
        logger.info(this.name + "getTierEndTime ");
        const value = await super.findWithWait(values)
        return await value[8+7*(tier-1)].getText()
    }

    async getRate(tier) {
        logger.info(this.name + "getRate ");
        const value = await super.findWithWait(values)
        return await value[9+7*(tier-1)].getText()
    }

    async getAllowModifying(tier) {
        logger.info(this.name + "getAllowModifying ");
        const value = await super.findWithWait(values)
        return await value[10+7*(tier-1)].getText()
    }

    async getMaxcap(tier) {
        logger.info(this.name + "getMaxcap ");
        const value = await super.findWithWait(values)
        return await value[11+7*(tier-1)].getText()
    }

    async getWhitelisting(tier) {
        logger.info(this.name + "getWhitelisting ");
        const value = await super.findWithWait(values)
        return await value[12+7*(tier-1)].getText()
    }

    async getMincap(tier) {
        logger.info(this.name + "getMincap ");
        const value = await super.findWithWait(values)
        return await value[13+7*(tier-1)].getText()
    }

    async getCompilerVersion() {
        logger.info(this.name + "getCompilerVersion ");
        const value = await super.findWithWait(values)
        return await value[21].getText()
    }

    async getContractName() {
        logger.info(this.name + "getContractName ");
        const value = await super.findWithWait(values)
        return await value[22].getText()
    }

    async getOptimized() {
        logger.info(this.name + "getOptimized ");
        const value = await super.findWithWait(values)
        return await value[23].getText()
    }

    async clickButtonContinue() {
        logger.info(this.name + "clickButtonContinue ");
        return await super.clickWithWait(buttonContinue);
    }

    async clickButtonDownload() {
        logger.info(this.name + "clickButtonDownload ");
        return await super.clickWithWait(buttonDownload);
    }

    async waitUntilShowUpErrorNotice(Twaiting) {
        logger.info(this.name + "waitUntilShowUpErrorNotice ");
        return await super.waitUntilDisplayed(errorNotice, Twaiting);
    }
}

module.exports = {
    PublishPage: PublishPage
}