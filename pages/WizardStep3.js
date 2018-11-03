const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const TierPage = require('../pages/TierPage.js').TierPage;

const buttonContinue = By.className("sw-ButtonContinue");
const buttonOK = By.className("swal2-confirm swal2-styled");
const buttonAddTier = By.className("ti-AddTierButton_PlusIcon");
const fieldWalletAddress = By.id("walletAddress");
const checkboxGasSafe = By.id('slow')
const checkboxGasNormal = By.id('normal')
const checkboxGasFast = By.id('fast')
const checkboxGasCustom = By.id('custom')
const fieldGasPriceCustom = By.id('gas-price-custom-value')
const inputFields = By.className('sw-InputField2 ')

class WizardStep3 extends Page {

    constructor(driver) {
        super(driver);
        this.title = "CROWDSALE SETUP";
        this.URL;
        this.tier;
        this.name = "WizardStep3 page: ";

        this.burnExcessYes;
        this.burnExcessNo;

        this.warningWalletAddress;
        this.warningCustomGasPrice;
        this.warningMincap;
    }

    async initWarnings() {
        logger.info(this.name + "initWarnings ");
        try {
            const locator = By.className("error");
            let array = await super.findWithWait(locator);
            this.warningWalletAddress = array[0];
            this.warningMincap = array[2];
            this.warningCustomGasPrice = array[1];
            return array;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async initCheckboxes() {
        logger.info(this.name + "initCheckboxes ");
        try {
            let locator = By.className("radio-inline");
            let array = await super.findWithWait(locator);
            this.burnExcessYes = array[0];
            this.burnExcessNo = array[1];
            return array;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async clickButtonContinue() {
        logger.info(this.name + "clickButtonContinue ");
        return await super.clickWithWait(buttonContinue);
    }

    async isDisabledButtonContinue() {
        logger.info(this.name + "isDisabledButtonContinue ");
        return await super.isElementDisabled(buttonContinue);
    }

    async fillWalletAddress(value) {
        logger.info(this.name + "field WalletAddress: ");
        return await super.clearField(fieldWalletAddress) &&
            await super.fillWithWait(fieldWalletAddress, value);
    }

    async clickCheckboxGasSafe() {
        logger.info(this.name + "clickCheckboxGasSafe ");
        try {
            await this.driver.executeScript("document.getElementById('slow').click();");
            return true;
        } catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    async clickCheckboxGasNormal() {
        logger.info(this.name + "clickCheckboxGasNormal ");
        try {
            await this.driver.executeScript("document.getElementById('normal').click();");
            return true;
        } catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    async clickCheckboxGasFast() {
        logger.info(this.name + "clickCheckboxGasFast ");
        try {
            await this.driver.executeScript("document.getElementById('fast').click();");
            return true;
        } catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    async clickCheckboxGasCustom() {
        logger.info(this.name + "clickCheckboxGasCustom ");
        try {
            await this.driver.executeScript("document.getElementById('custom').click();");
            return true;
        } catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    async isSelectedCheckboxGasSafe() {
        logger.info(this.name + "isSelectedCheckboxGasSafe: ");
        return await super.isElementSelected(checkboxGasSafe)
    }

    async isSelectedCheckboxGasNormal() {
        logger.info(this.name + "isSelectedCheckboxGasNormal: ");
        return await super.isElementSelected(checkboxGasNormal)
    }

    async isSelectedCheckboxGasFast() {
        logger.info(this.name + "isSelectedCheckboxGasFast: ");
        return await super.isElementSelected(checkboxGasFast)
    }

    async isSelectedCheckboxGasCustom() {
        logger.info(this.name + "isSelectedCheckboxGasCustom: ");
        return await super.isElementSelected(checkboxGasCustom)
    }

    async clickCheckboxBurnExcessNo() {
        logger.info(this.name + "clickCheckboxBurnExcessNo ");
        return (await this.initCheckboxes() !== null) &&
            await super.clickWithWait(this.burnExcessNo);
    }

    async clickCheckboxBurnExcessYes() {
        logger.info(this.name + "clickCheckboxBurnExcessYes ");
        return (await this.initCheckboxes() !== null)
            && await super.clickWithWait(this.burnExcessYes);
    }

    async isSelectedCheckboxBurnYes() {
        logger.info(this.name + "isSelectedCheckboxBurnYes: ");
        return (await this.initCheckboxes() !== null)
            && await super.isElementSelected(this.burnExcessYes)
    }

    async isSelectedCheckboxBurnNo() {
        logger.info(this.name + "isSelectedCheckboxBurnNo: ");
        return (await this.initCheckboxes() !== null)
            && await super.isElementSelected(this.burnExcessNo)
    }

    async fillGasPriceCustom(value) {
        logger.info(this.name + "fillGasPriceCustom ");
        return await super.clearField(fieldGasPriceCustom)
            && await super.fillWithWait(fieldGasPriceCustom, value);
    }

    async setBurnExcess(burnExcess) {
        logger.info(this.name + "setBurnExcess");
        if ( burnExcess ) return await this.clickCheckboxBurnExcessYes();
        else return await this.clickCheckboxBurnExcessNo();
    }

    async setGasPrice(value) {
        logger.info(this.name + "setGasPrice with value= " + value);
        return await this.clickCheckboxGasCustom() &&
            await this.fillGasPriceCustom(value);
    }

    async isDisplayedWarningCustomGasPrice() {
        logger.info(this.name + "isPresentWarningCustomGasPrice ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningCustomGasPrice) !== "");
    }

    async isDisplayedWarningWalletAddress() {
        logger.info(this.name + "isDisplayedWarningWalletAddress ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningWalletAddress) !== "");
    }

    async isDisplayedFieldWalletAddress() {
        logger.info(this.name + "isPresentFieldWalletAddress ");
        return await super.isElementDisplayed(fieldWalletAddress)
    }

    async waitUntilDisplayedFieldWalletAddress(Twaiting) {
        logger.info(this.name + "waitUntilDisplayedFieldWalletAddress: ");
        return await super.waitUntilDisplayed(fieldWalletAddress, Twaiting);
    }

    async getValueFieldWalletAddress() {
        logger.info(this.name + "getValueFieldWalletAddress ");
        return await super.getAttribute(fieldWalletAddress, "value");
    }

    async getValueFieldGasCustom() {
        logger.info(this.name + "getValueFieldGasCustom ");
        return await super.getAttribute(fieldGasPriceCustom, "value");
    }

    async isDisplayedFieldGasCustom() {
        logger.info(this.name + "isDisplayedFieldGasCustom ");
        return await super.isElementDisplayed(fieldGasPriceCustom)
    }

    async clickButtonOk() {
        logger.info(this.name + "clickButtonOk ");
        return await super.clickWithWait(buttonOK);
    }

    async isDisplayedButtonContinue() {
        logger.info(this.name + "isDisplayedButtonContinue ");
        return await super.isElementDisplayed(buttonContinue);
    }

    async waitUntilHasValue(field, Twait) {
        logger.info(this.name + "waitUntilHasValue " + field);
        try {
            const elements = await super.findWithWait(inputFields)
            let element
            switch ( field ) {
                case 'walletAddress':
                    element = (await super.findWithWait(fieldWalletAddress))[0];
                    break
                case 'gasPrice':
                    element = elements[1];
                    break
                default:
                    element = elements[0];
            }
            return await super.waitUntilHasValue(element, Twait)
        }
        catch ( err ) {
            logger.info(err)
            return false
        }
    }

    async fillPage(crowdsale, isFillBulkWhitelistAddresses, pathCSVWhitelist) {
        logger.info(this.name + "fillPage ");

        let result = await this.waitUntilLoaderGone()
            && await this.fillWalletAddress(crowdsale.walletAddress)
            && await this.setGasPrice(crowdsale.gasPrice)
            && await this.setBurnExcess(crowdsale.burnExcess);

        for ( let i = 0; i < crowdsale.tiers.length - 1; i++ ) {
            result = await new TierPage(this.driver, crowdsale.tiers[i]).fillTier(isFillBulkWhitelistAddresses, pathCSVWhitelist)
                && await this.clickButtonAddTier();
        }
        return result &&
            await new TierPage(this.driver, crowdsale.tiers[crowdsale.tiers.length - 1]).fillTier(isFillBulkWhitelistAddresses, pathCSVWhitelist);
    }

    async clickButtonAddTier() {
        logger.info(this.name + "clickButtonAddTier: ");
        return await super.clickWithWait(buttonAddTier);
    }

    async isEnabledButtonContinue() {
        logger.info(this.name + " isEnabledButtonContinue ");
        if ( await super.getAttribute(buttonContinue, "class") === "button button_fill" ) {
            logger.info("present and enabled");
            return true;
        }
        else {
            logger.info("present and disabled");
            return false;
        }
    }

    async getWarningText(field) {
        logger.info(this.name + "getWarningText " + field);
        try {
            const elements = await super.findWithWait(inputFields)
            let element
            switch ( field ) {
                case 'walletAddress':
                    element = elements[0];
                    break
                case 'gasPrice':
                    element = (await super.findWithWait(By.className('sw-GasPriceInput')))[0]
                    break
                default:
                    element = elements[0];
            }
            if ( !await super.waitUntilDisplayed(By.className('sw-Errors_Item'), 10) ) return ''
            const error = await this.getChildsByClassName('sw-Errors_Item', element)
            if ( (error === null) || (error === undefined) ) return ''
            else return await error[0].getText()
        }
        catch ( err ) {
            console.log(err)
            return ''
        }
    }
}

module.exports.WizardStep3 = WizardStep3;
