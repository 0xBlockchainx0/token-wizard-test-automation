const logger = require('../entity/Logger.js').logger
const Page = require('./Page.js').Page
const By = require('selenium-webdriver/lib/by').By

const buttonContinue = By.className('sw-ButtonContinue_Text')
const buttonCancel = By.className('button button_outline')
const crowdsaleList = By.className('sw-FlexTable_Body sw-FlexTable_Body-scrollable sw-FlexTable_Body-crowdsale m-b-15')
const crowdsaleListRow = By.className('sw-FlexTable_Row sw-FlexTable_Row-selectable')

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
        const array = await this.findWithWait(crowdsaleList)
        const addresses = await super.getChildsByClassName('sw-FlexTable_Td',array[0])
        return await super.getTextForElement(addresses[number])
    }

    async getRow(number) {
        logger.info(this.name + " getRow ")
        const array = await this.findWithWait(crowdsaleListRow)
        return array[number]
    }

    async getNumberCrowdsales() {
        logger.info(this.name + " getNumberCrowdsales ")
        const array = await this.findWithWait(crowdsaleListRow)
        return array.length
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


 /*

    async getCrowdsaleListEmpty(wait) {
        logger.info(this.name + " getCrowdsaleListEmpty ");
        return await super.getElement(crowdsaleListEmpty,wait)
    }

    async getCrowdsaleListAddressOwner(wait) {
        logger.info(this.name + " getCrowdsaleListAddressOwner ");
        return await super.getElement(crowdsaleListAddressOwner,wait)
    }

    async getCrowdsaleListCloseButton(wait) {
        logger.info(this.name + " getCrowdsaleListCloseButton ");
        return await super.getElement(crowdsaleListCloseButton,wait)
    }
*/
}
module.exports.CrowdsaleList = CrowdsaleList