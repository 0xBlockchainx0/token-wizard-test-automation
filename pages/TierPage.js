const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const webdriver = require('selenium-webdriver');
const Utils = require('../utils/Utils.js').Utils;
const wizardStep3 = require("./WizardStep3.js");
const itemsRemove = By.className("sw-ButtonDelete ");
const buttonAddWhitelist = By.className("button button_fill button_fill_plus");

const whitelistContainerInner = By.className("sw-WhiteListTable_Row");
const buttonClearAll = "sw-ButtonCSV sw-ButtonCSV-clearall"
const buttonYesAlert = By.className("swal2-confirm swal2-styled");
const fieldMinRate = By.id("tiers[0].minRate");
const fieldMaxRate = By.id("tiers[0].maxRate");

const whitelistContainer = By.className("sw-WhitelistInputBlock")
const TIME_FORMAT = require('../utils/constants.js').TIME_FORMAT;
const inputFields = By.className('sw-InputField2 ')
let COUNT_TIERS = 0;
const timeAdjust = 0;//relative value  for tier time

class TierPage extends Page {

    constructor(driver, tier) {
        super(driver);
        this.URL;
        this.tier = tier;
        this.number = COUNT_TIERS++;
        this.name = "Tier #" + this.number + ": ";

        this.fieldAddressWhitelist;
        this.fieldMinWhitelist;
        this.fieldMaxWhitelist;
        this.checkboxModifyOn;
        this.checkboxModifyOff;
        this.checkboxWhitelistingYes;
        this.checkboxWhitelistingNo;
        this.itemsRemove = [];
        this.warningName;
        this.warningStartTime;
        this.warningEndTime;
        this.warningRate;
        this.warningSupply;
        this.warningRate;
        this.warningWhAddress;
        this.warningWhMin;
        this.warningWhMax;
    }

    static async setCountTiers(value) {
        COUNT_TIERS = value;
        return true;
    }

    async getFieldSetupName() {
        logger.info(this.name + "getFieldSetupName ");
        const locator = By.id("tiers[" + this.number + "].tier");
        return await super.getElement(locator);
    }

    async getValueFieldSetupName() {
        logger.info(this.name + "getValueFieldSetupName ");
        const field = await this.getFieldSetupName()
        return await super.getAttribute(field, "value");
    }

    async fillSetupName() {
        logger.info(this.name + "fillSetupName ");
        if ( this.tier.name === undefined ) return true;
        let element = await this.getFieldSetupName();
        return await super.clearField(element) &&
            await super.fillWithWait(element, this.tier.name);
    }

    async getFieldRate() {
        logger.info(this.name + "getFieldRate ");
        const locator = By.id("tiers[" + this.number + "].rate");
        return await super.getElement(locator);
    }

    async fillRate() {
        logger.info(this.name + "fillRate ");
        if ( this.tier.rate === undefined ) return true;
        let element = await this.getFieldRate();
        return await super.clearField(element) &&
            await super.fillWithWait(element, this.tier.rate);
    }

    async getValueFieldRate() {
        logger.info(this.name + "getValueFieldRate ");
        const field = await this.getFieldRate()
        return await super.getAttribute(field, "value");
    }

    async getFieldMinCap() {
        logger.info(this.name + "getFieldMinCap ");
        const locator = By.id("tiers[" + this.number + "].minCap");
        return await super.getElement(locator);
    }

    async fillMinCap(tier) {
        logger.info(this.name + "fillMinCap ");
        if ( this.tier.minCap === undefined ) return true;
        let element = await this.getFieldMinCap(tier);
        return await super.clearField(element) &&
            await super.fillWithWait(element, this.tier.minCap);
    }

    async getValueFieldMinCap() {
        logger.info(this.name + "getValueFieldMinCap ");
        const field = await this.getFieldMinCap()
        return await super.getAttribute(field, "value");
    }

    async getFieldSupply() {
        logger.info(this.name + "getFieldSupply ");
        const locator = By.id("tiers[" + this.number + "].supply");
        return await super.getElement(locator);
    }

    async getValueFieldSupply() {
        logger.info(this.name + "getValueFieldSupply ");
        const field = await this.getFieldSupply()
        return await super.getAttribute(field, "value");
    }

    async fillSupply() {
        logger.info(this.name + "fillSupply ");
        let element = await this.getFieldSupply();
        return await super.clearField(element) &&
            await super.fillWithWait(element, this.tier.supply);
    }

    async fillMinRate() {
        logger.info(this.name + "fillMinRate ");
        if ( this.tier.minRate === undefined ) return true;
        return await super.clearField(fieldMinRate) &&
            await super.fillWithWait(fieldMinRate, this.tier.minRate);
    }

    async fillMaxRate() {
        logger.info(this.name + "fillMaxRate ");
        if ( this.tier.maxRate === undefined ) return true;
        return await super.clearField(fieldMaxRate) &&
            await super.fillWithWait(fieldMaxRate, this.tier.maxRate);
    }

    async getFieldStartTime() {
        logger.info(this.name + "getFieldStartTime ");
        const locator = By.id("tiers[" + this.number + "].startTime");
        return await super.getElement(locator);
    }

    async getValueFieldStartTime() {
        logger.info(this.name + "getValueFieldStartTime ");
        const field = await this.getFieldStartTime()
        return await super.getAttribute(field, "value");
    }

    async fillStartTime() {
        logger.info(this.name + "fillStartTime ");
        if ( this.tier.startDate === "" ) return true;
        const locator = await this.getFieldStartTime();
        const format = await Utils.getDateFormat(this.driver);
        let startTime = this.tier.startTime
        let startDate = this.tier.startDate
        if ( ! startDate.includes("/") ) {
            startTime = Utils.getTimeWithAdjust(timeAdjust + parseInt(startTime), format);
            startDate = Utils.getDateWithAdjust(timeAdjust + parseInt(startDate), format);
        } else if ( format === TIME_FORMAT.MDY ) {
            startTime = Utils.convertTimeToMdy(startTime);
            startDate = Utils.convertDateToMdy(startDate);
        }

        return await super.clickWithWait(locator)
            && await super.fillWithWait(locator, startDate)
            && await super.pressKey(key.TAB, 1)
            && await super.fillWithWait(locator, startTime)
    }

    async getFieldEndTime() {
        logger.info(this.name + "getFieldEndTime ");
        const locator = By.id("tiers[" + this.number + "].endTime");
        return await super.getElement(locator);
    }

    async getValueFieldEndTime() {
        logger.info(this.name + "getValueFieldEndTime ");
        const field = await this.getFieldEndTime()
        return await super.getAttribute(field, "value");
    }

    async fillEndTime() {
        logger.info(this.name + "fillEndTime ");
        if ( this.tier.endDate === "" ) return true;
        const locator = await this.getFieldEndTime();
        const format = await Utils.getDateFormat(this.driver);
        let endTime = this.tier.endTime
        let endDate = this.tier.endDate
        if ( ! endDate.includes("/") ) {
            endTime = Utils.getTimeWithAdjust(timeAdjust + parseInt(endTime), format);
            endDate = Utils.getDateWithAdjust(timeAdjust + parseInt(endDate), format);
        } else if ( format === TIME_FORMAT.MDY ) {
            endTime = Utils.convertTimeToMdy(endTime);
            endDate = Utils.convertDateToMdy(endDate);
        }
        return await super.clickWithWait(locator) &&
            await super.fillWithWait(locator, endDate) &&
            await super.pressKey(key.TAB, 1) &&
            await super.fillWithWait(locator, endTime);
    }

    async initItemsRemove() {
        logger.info(this.name + "initItemsRemove ");
        try {
            let array = await super.findWithWait(itemsRemove);
            for ( let i = 0; i < array.length; i++ ) {
                this.itemsRemove[i] = array[i];
            }
            return array;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async initWhitelistFields(Twait) {
        logger.info(this.name + "initWhitelistFields ");
        try {
            if ( Twait === undefined ) Twait = 180
            const containers = await super.findWithWait(whitelistContainer, Twait);
            const array = await this.getChildsByClassName("sw-TextField", containers[this.number]);
            if ( array === null ) return null;
            else {
                this.fieldAddressWhitelist = array[0];
                this.fieldMinWhitelist = array[1];
                this.fieldMaxWhitelist = array[2];
            }
            return array;
        }
        catch ( err ) {
            logger.info(err);
            return null;
        }
    }

    async initCheckboxes() {
        logger.info(this.name + "initCheckboxes ");
        try {
            //const tier = By.className('sw-TierBlock')
            const tier = By.className('sw-BorderedBlock sw-BorderedBlock-TierBlocksWhitelistCapped')
            const containers = await super.findWithWait(tier)
            const array = await super.getChildsByClassName('sw-RadioButton_Button', containers[this.number]);
            if ( array.length > 2 ) {
                this.checkboxModifyOn = array[2];
                this.checkboxModifyOff = array[3];
                this.checkboxWhitelistingYes = array[0];
                this.checkboxWhitelistingNo = array[1];
            }
            else { //if DUTCH
                this.checkboxWhitelistingYes = array[0];
                this.checkboxWhitelistingNo = array[1];
            }
            return array;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return null;
        }
    }

    async fillAddress(address) {
        logger.info(this.name + "fillAddress ");
        return (await this.initWhitelistFields() !== null)
            && (this.fieldAddressWhitelist !== undefined)
            && await super.clearField(this.fieldAddressWhitelist) &&
            await super.fillWithWait(this.fieldAddressWhitelist, address);
    }

    async fillMin(value) {
        logger.info(this.name + "fillMin ");
        return (await this.initWhitelistFields() !== null)
            && (this.fieldMinWhitelist !== undefined) &&
            await super.clearField(this.fieldMinWhitelist) &&
            await super.fillWithWait(this.fieldMinWhitelist, value);
    }

    async fillMax(value) {
        logger.info(this.name + "fillMax  ");
        return (await this.initWhitelistFields() !== null)
            && (this.fieldMaxWhitelist !== undefined)
            && await super.clearField(this.fieldMaxWhitelist)
            && await super.fillWithWait(this.fieldMaxWhitelist, value);
    }

    async getButtonAddWhitelist() {
        logger.info(this.name + "getButtonAddWhitelist ");
        const containers = await super.findWithWait(whitelistContainer);

        let element = await this.getChildsByClassName("sw-ButtonPlus", containers[this.number]);
        return element[0];
    }

    async clickButtonAddWhitelist() {
        logger.info(this.name + "clickButtonAddWhitelist ");
        const element = await this.getButtonAddWhitelist();
        return await super.clickWithWait(element);
    }

    async setWhitelisting() {
        logger.info(this.name + "setWhitelisting ");
        if ( !this.tier.isWhitelisted ) return true;
        return (await this.initCheckboxes() !== null)
            && await super.waitUntilDisplayed(this.checkboxWhitelistingYes)
            && await super.clickWithWait(this.checkboxWhitelistingYes);
    }

    async setModify() {
        logger.info(this.name + "setModify ");
        if ( (this.tier.allowModify === undefined) || (!this.tier.allowModify) ) return true;
        return (await this.initCheckboxes() !== null)
            && await super.clickWithWait(this.checkboxModifyOn);
    }

    async removeWhiteList(number) {
        logger.info(this.name + "removeWhiteList ");
        return await this.initItemsRemove() &&
            await super.clickWithWait(this.itemsRemove[number]);
    }

    async isDisplayedWhitelistContainer() {
        logger.info(this.name + "isDisplayedWhitelistContainer ");
        return (await this.initWhitelistFields(10) !== null)
            && await this.waitUntilDisplayed(this.fieldAddressWhitelist, 10)
    }

    async amountAddedWhitelist(Twaiting) {
        logger.info(this.name + "amountAddedWhitelist ");
        try {
            let array = await super.findWithWait(whitelistContainerInner, Twaiting);
            let length = 0;
            if ( array !== null ) length = array.length;
            logger.info("Whitelisted addresses added=" + length);
            return length;
        }
        catch ( err ) {
            return 0;
        }
    }

    async clickButtonClearAll() {
        logger.info(this.name + "clickButtonClearAll:");
        try {
            await this.driver.executeScript("document.getElementsByClassName('" + buttonClearAll + "')[0].click();");
            return true;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return false;
        }
    }

    async clickButtonYesAlert() {
        return await super.clickWithWait(buttonYesAlert);
    }

    async waitUntilShowUpPopupConfirm(Twaiting) {
        logger.info("waitUntilShowUpPopupConfirm: ");
        return await this.waitUntilDisplayed(buttonYesAlert, Twaiting);
    }

    async isPresentWarningName() {
        logger.info(this.name + "isPresentWarningName");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningMincap) !== "");
    }

    async isPresentWarningStartTime() {
        logger.info(this.name + "isPresentWarningStartTime ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningStartTime) !== "");
    }

    async isPresentWarningEndTime() {
        logger.info(this.name + "isPresentWarningEndTime ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningEndTime) !== "");
    }

    async isPresentWarningRate() {
        logger.info(this.name + "isPresentWarningRate ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningRate) !== "");
    }

    async isPresentWarningSupply() {
        logger.info(this.name + "isPresentWarningSupply ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningSupply) !== "");
    }

    async isPresentWarningWhAddress() {
        logger.info(this.name + "isPresentWarningWhAddress ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningWhAddress) !== "");
    }

    async isPresentWarningWhMin() {
        logger.info(this.name + "isPresentWarningWhMin ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningWhMin) !== "");
    }

    async isPresentWarningWhMax() {
        logger.info(this.name + "isPresentWarningWhMax ");
        return false;
        return (await this.initWarnings() !== null) &&
            (await super.getTextForElement(this.warningWhMax) !== "");
    }

    async uploadWhitelistCSVFile(path) {
        logger.info(this.name + "uploadWhitelistCSVFile ");
        if ( path === undefined ) path = "./public/whitelistAddressesTestValidation.csv";
        try {
            path = await Utils.getPathToFileInPWD(path);
            logger.info(this.name + ": uploadWhitelistCSVFile: from path: " + path);
            const locator = By.xpath('//input[@type="file"]');
            let element = await this.driver.findElement(locator);
            await element.sendKeys(path);
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async initWarnings() {
        logger.info(this.name + "initWarnings ");
        try {
            const locator = By.className("error");
            let array = await super.findWithWait(locator);
            let ci_tresh = 2;
            let ci_mult = 5;
            if ( wizardStep3.WizardStep3.getFlagCustom() ) ci_tresh = 3;
            if ( wizardStep3.WizardStep3.getFlagWHitelising() ) ci_mult = 8;
            this.warningName = arr[ci_tresh + (this.number) * ci_mult];
            this.warningStartTime = arr[ci_tresh + (this.number) * ci_mult + 1];
            this.warningEndTime = arr[ci_tresh + (this.number) * ci_mult + 2];
            this.warningRate = arr[ci_tresh + (this.number) * ci_mult + 3];
            this.warningSupply = arr[ci_tresh + (this.number) * ci_mult + 4];
            this.warningWhAddress = arr[ci_tresh + (this.number) * ci_mult + 5];
            this.warningWhMin = arr[ci_tresh + (this.number) * ci_mult + 6];
            this.warningWhMax = arr[ci_tresh + (this.number) * ci_mult + 7];
            return array;
        }
        catch ( err ) {
            logger.info(this.name + ": dont contain warning elements");
            return null;
        }
    }

    async fillTier(isFillBulkWhitelistAddresses, pathCSVWhitelist) {
        logger.info(this.name + "fillTier ");
        await Utils.delay(2000)
        return await this.setModify()
        && await this.fillSupply()
        && await this.fillMinCap()
        && await this.setWhitelisting()
        && await this.fillMinRate()
        && await this.fillMaxRate()
        && await this.fillRate()
        && await this.fillSetupName()
        && await this.fillEndTime()
        && await this.fillStartTime()
        && (isFillBulkWhitelistAddresses) ? await this.fillBulkWhitelist(pathCSVWhitelist) : await this.fillWhitelist();

    }

    async fillBulkWhitelist(pathCSVWhitelist) {
        logger.info(this.name + " fillBulkWhitelist ");
        return await this.uploadWhitelistCSVFile(pathCSVWhitelist)
            && await this.clickButtonYesAlert();
    }

    async isDisabledFieldEndTime() {
        logger.info(this.name + " isDisabledFieldEndTime ");
        let element = await this.getFieldEndTime();
        return await super.isElementDisabled(element);
    }

    async fillWhitelist() {
        logger.info(this.name + "fillWhitelist ");
        try {
            for ( let i = 0; i < this.tier.whitelist.length; i++ ) {
                logger.info(this.name + "fillWhitelist #" + i + ": ");
                do {
                    await this.fillAddress(this.tier.whitelist[i].address);
                } while ( await this.isPresentWarningWhAddress() );
                do {
                    await this.fillMin(this.tier.whitelist[i].min);
                } while ( await this.isPresentWarningWhMin() );
                do {
                    await this.fillMax(this.tier.whitelist[i].max);
                } while ( await this.isPresentWarningWhMax() );
                await this.clickButtonAddWhitelist();
            }
            return true;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    async isDisabledFieldMinCap(tier) {
        logger.info(this.name + "isDisabledFieldMinCap ");
        let element = await this.getFieldMinCap(tier)
        return await this.isElementDisabled(element);
    }

    async isDisabledFieldSupply() {
        logger.info(this.name + "isDisabledFieldSupply ");
        let element = await this.getFieldSupply()
        return await this.isElementDisabled(element);
    }

    async getCheckboxAllowModifyOn() {
        logger.info(this.name + "getCheckboxAllowModifyOn ");
        const locator = By.id("tiers[" + this.number + "].updatable.allow_modifying_on");
        return await super.getElement(locator);
    }

    async getCheckboxAllowModifyOff() {
        logger.info(this.name + "getCheckboxAllowModifyOff ");
        const locator = By.id("tiers[" + this.number + "].updatable.allow_modifying_off");
        return await super.getElement(locator);
    }

    async getCheckboxWhitelistYes() {
        logger.info(this.name + "getCheckboxWhitelistYes ");
        const locator = By.id("tiers[" + this.number + "].whitelistEnabled.enable_whitelisting_yes");
        return await super.getElement(locator);
    }

    async getCheckboxWhitelistNo() {
        logger.info(this.name + "getCheckboxWhitelistNo ");
        const locator = By.id("tiers[" + this.number + "].whitelistEnabled.enable_whitelisting_no");
        return await super.getElement(locator);
    }

    async clickCheckboxAllowModifyYes() {
        logger.info(this.name + "clickCheckboxAllowModifyYes ");
        return (await this.initCheckboxes() !== null)
            && await super.clickWithWait(this.checkboxModifyOn)

    }

    async isSelectedCheckboxAllowModifyYes() {
        logger.info(this.name + "isSelectedCheckboxAllowModifyYes ");
        return await super.isElementSelected(await this.getCheckboxAllowModifyOn())
    }

    async clickCheckboxAllowModifyNo() {
        logger.info(this.name + "clickCheckboxAllowModifyNo ");
        return (await this.initCheckboxes() !== null)
            && await super.findWithWait(this.checkboxModifyOff)
    }

    async isSelectedCheckboxAllowModifyNo() {
        logger.info(this.name + "isSelectedCheckboxAllowModifyNo ");
        return await super.isElementSelected(await this.getCheckboxAllowModifyOff())
    }

    async clickCheckboxWhitelistNo() {
        logger.info(this.name + "clickCheckboxWhitelistNo ");
        return await super.clickWithWait(await this.getCheckboxWhitelistNo());
    }

    async isSelectedCheckboxWhitelistNo() {
        logger.info(this.name + "isSelectedCheckboxWhitelistNo ");
        return await super.isElementSelected(await this.getCheckboxWhitelistNo())
    }

    async clickCheckboxWhitelistYes() {
        logger.info(this.name + "clickCheckboxWhitelistYes ");
        return (await this.initCheckboxes() !== null)
            && await super.clickWithWait(this.checkboxWhitelistingYes)
    }

    async isSelectedCheckboxWhitelistYes() {
        logger.info(this.name + "isSelectedCheckboxWhitelistYes ");
        return await super.isElementSelected(await this.getCheckboxWhitelistYes())
    }

    async waitUntilHasValue(field, Twait) {
        logger.info(this.name + "waitUntilHasValue " + field);
        try {
            const tierBlock = (await super.findWithWait(By.className('sw-TierBlock')))[0]
            const elements = await super.getChildsByClassName('sw-TextField', tierBlock)
            let element
            switch ( field ) {
                case 'name':
                    element = elements[0];
                    break
                case 'startTime':
                    element = elements[1];
                    break
                case 'endTime':
                    element = elements[2];
                    break
                case 'rate':
                    element = elements[3];
                    break
                case 'supply':
                    element = elements[4];
                    break
                case 'minCap':
                    element = elements[5];
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

    async getWarningText(field) {
        logger.info(this.name + "getWarningText " + field);
        try {
            const tierBlock = (await super.findWithWait(By.className('sw-TierBlock')))[0]
            const elements = await super.getChildsByClassName('sw-InputField2', tierBlock)
            let element
            switch ( field ) {
                case 'name':
                    element = elements[0];
                    break
                case 'startTime':
                    element = elements[1];
                    break
                case 'endTime':
                    element = elements[2];
                    break
                case 'rate':
                    element = elements[3];
                    break
                case 'supply':
                    element = elements[4];
                    break
                case 'minCap':
                    element = elements[5];
                    break
                default:
                    element = elements[0];
            }
            if ( !await super.waitUntilDisplayed(By.className('sw-Errors_Item'), 10) ) return ''
            const errors = await this.getChildsByClassName('sw-Errors_Item', element)
            let text = ''
            if ( (errors === null) || (errors === undefined) ) return ''
            else {
                for ( let i = 0; i < errors.length; i++ ) {
                    text += await errors[i].getText()
                }
                return text
            }
        }
        catch ( err ) {
            console.log(err)
            return ''
        }
    }
}

module.exports.TierPage = TierPage;
