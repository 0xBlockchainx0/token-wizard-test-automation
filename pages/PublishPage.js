const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const copyArea = By.className('copy-area-container')
const fields = By.className('display-container')
const values = By.className('value')

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
        const copy = await super.getChildFromElementByClassName('copy', arr[0])
        const text = await super.getAttribute(copy[0], 'data-clipboard-text')
        return text
    }

    async getEncodedABI() {
        logger.info(this.name + "getEncodedABI ");
        const arr = await super.findWithWait(copyArea);
        const copy = await super.getChildFromElementByClassName('copy', arr[1])
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


}

module.exports = {
    PublishPage: PublishPage
}