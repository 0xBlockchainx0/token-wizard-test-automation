const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const copyArea = By.className('copy-area-container')
const fields = By.className('display-container')

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
        const copy = await super.getChildFromElementByClassName('copy',arr[0])
        const text = await super.getAttribute(copy[0],'data-clipboard-text')
        return text
    }

    async getEncodedABI() {
        logger.info(this.name + "getEncodedABI ");
        const arr = await super.findWithWait(copyArea);
        const copy = await super.getChildFromElementByClassName('copy',arr[1])
        const text = await super.getAttribute(copy[0],'data-clipboard-text')
        return text
    }
}

module.exports = {
    PublishPage: PublishPage
}