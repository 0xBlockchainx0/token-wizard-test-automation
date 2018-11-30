const logger = require('../entity/Logger.js').logger
const Page = require('./Page.js').Page
const By = require('selenium-webdriver/lib/by').By

const buttonContinue = By.className('sw-ButtonContinue')
const buttonCancel = By.className('button button_outline')
const crowdsaleList = By.className('st-StepContent')
const crowdsaleListRow = By.className('mng-CrowdsalesList_ItemContent')

const crowdsaleListEmpty = By.className('sw-EmptyContentTextOnly')
const crowdsaleListAddressOwner = By.className('text-bold')
const crowdsaleListCloseButton = By.className('sw-ModalWindow_CloseButton')


class CrowdsaleList extends Page {

    async getCrowdsaleList(wait) {
        logger.info(this.name + " getCrowdsaleList ")
        return await super.getElement(crowdsaleList,wait)
    }

    async getButtonCancel(wait) {
        logger.info(this.name + " getButtonCancel ")
        return await super.getElement(buttonCancel,wait)
    }

    async getAddress(number) {
        logger.info(this.name + " getCrowdsaleAddress ")
        const addresses = await this.findWithWait(crowdsaleListRow)
        return await super.getTextForElement(addresses[number])
    }

    async getRow(number) {
        logger.info(this.name + " getRow ")
        const array = await this.findWithWait(crowdsaleListRow)
        return array[number]
    }

    async getNumberCrowdsales(Twait) {
        logger.info(this.name + " getNumberCrowdsales ")
        const array = await this.findWithWait(crowdsaleListRow,Twait)
        return array ? array.length : 0
    }

    async isDisplayedButtonContinue() {
        logger.info(this.name + ": isDisplayedButtonContinue ")
        return await super.isElementDisplayed(buttonContinue)
    }

    async clickButtonContinue() {
        logger.info(this.name + "clickButtonContinue ")
        return await super.clickWithWait(buttonContinue)
    }

    async isDisabledButtonContinue() {
        logger.info(this.name + "isDisabledButtonContinue ")
        return await super.isElementDisabled(buttonContinue)
    }


    async getCrowdsaleListEmpty(wait) {
        logger.info(this.name + " getCrowdsaleListEmpty ");
        return await super.getElement(crowdsaleListEmpty,wait)
    }

    async getCrowdsaleListAddressOwner(wait) {
        logger.info(this.name + " getCrowdsaleListAddressOwner ");
        return (await super.findWithWait(crowdsaleListAddressOwner,wait))[0].getText()
    }

    async getCrowdsaleListCloseButton(wait) {
        logger.info(this.name + " getCrowdsaleListCloseButton ");
        return await super.getElement(crowdsaleListCloseButton,wait)
    }

}
module.exports.CrowdsaleList = CrowdsaleList