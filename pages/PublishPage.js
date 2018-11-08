const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const TITLES = require('../utils/constants.js').TITLES;
const textArea = By.className('pb-DisplayTextArea_Content')
const fields = By.className('display-container')
const values = By.className('pb-DisplayField_Value pb-DisplayField_Value-MobileTextSizeMedium')
const valuesTime = By.className('pb-DisplayField_Value pb-DisplayField_Value-MobileTextSizeSmall')

const buttonContinue= By.className('sw-ButtonContinue_Text')
const buttonDownload = By.className('sw-ButtonDownload ')
const errorNotice = By.className("css-6bx4c3");
class PublishPage extends Page {

    constructor(driver) {
        super(driver);
        this.name = 'PublishPage '
        this.title = TITLES.PUBLISH_PAGE
    }

    async getAmountFields() {
        logger.info(this.name + "getAmountFields ");
        const arr = await super.findWithWait(fields)
        return arr.length
    }

    async getTextContract() {
        logger.info(this.name + "getTextContract ");
        const array = await super.findWithWait(textArea);
        const text = await super.getTextForElement(array[0])
        return text
    }

    async getEncodedABI() {
        logger.info(this.name + "getEncodedABI ");
        const array = await super.findWithWait(textArea);
        const text = await super.getTextForElement(array[1])
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
        logger.info(this.name + "getCrowdsaleStartTime ");
        const value = await super.findWithWait(valuesTime)
        return await value[0].getText()
    }

    async getCrowdsaleEndTime() {
        logger.info(this.name + "getCrowdsaleEndTime ");
        const value = await super.findWithWait(valuesTime)
        return await value[1].getText()
    }
    async getTierStartTime(tier) {
        logger.info(this.name + "getTierStartTime ");
        const value = await super.findWithWait(valuesTime)
        return await value[2+2*(tier-1)].getText()
    }

    async getTierEndTime(tier) {
        logger.info(this.name + "getTierEndTime ");
        const value = await super.findWithWait(valuesTime)
        return await value[3+2*(tier-1)].getText()
    }

    async getWhitelisting(tier) {
        logger.info(this.name + "getWhitelisting ");
        const value = await super.findWithWait(values)
        return await value[5+5*(tier-1)].getText()
    }

    async getAllowModifying(tier) {
        logger.info(this.name + "getAllowModifying ");
        const value = await super.findWithWait(values)
        return await value[6+5*(tier-1)].getText()
    }

    async getMincap(tier) {
        logger.info(this.name + "getMincap ");
        const value = await super.findWithWait(values)
        return await value[7+5*(tier-1)].getText()
    }

    async getMaxcap(tier) {
        logger.info(this.name + "getMaxcap ");
        const value = await super.findWithWait(values)
        return await value[8+5*(tier-1)].getText()
    }

    async getRate(tier) {
        logger.info(this.name + "getRate ");
        const value = await super.findWithWait(values)
        return await value[9+5*(tier-1)].getText()
    }

    async getCompilerVersion() {
        logger.info(this.name + "getCompilerVersion ");
        const value = await super.findWithWait(values)
        return await value[15].getText()
    }

    async getContractName() {
        logger.info(this.name + "getContractName ");
        const value = await super.findWithWait(values)
        return await value[16].getText()
    }

    async getOptimized() {
        logger.info(this.name + "getOptimized ");
        const value = await super.findWithWait(values)
        return await value[17].getText()
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