const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const statusTimer = require('../utils/constants.js').statusTimer;

const buttonContribute = By.className("button button_fill");
const fieldContribute = By.id("contribute");
const buttonOk = By.className("swal2-confirm swal2-styled");
const fields = By.className("hashes-title");
const warningText = By.id("swal2-content");
const errorNotice = By.className("css-6bx4c3");
const countdownTimer = By.className("timer");
const countdownTimerValue = By.className("timer-count");
const countdownTimerStatus = By.className("timer-interval");
const error = By.className('error')
const fieldBalance = By.className('balance-title')

class ContributionPage extends Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.fieldExecutionID;
        this.fieldCurrentAccount;
        this.name = "Invest page :";
        this.timer = [];
        this.fieldMinContribution;
        this.fieldCrowdsaleName;
        this.fieldTicker;
        this.fieldTotalSupply;
        this.fieldMaxContribution;
    }

    async getStatusTimer() {
        logger.info(this.name + "getTimerStatus ");
        try {
            if ( !await this.waitUntilShowUpTimerStatus(120) ) return false;
            const array = await this.initTimerFields();
            const result = await super.getTextForElement(array[array.length - 1]);
            if ( result.includes(statusTimer.start) ) return statusTimer.start;
            else if ( result.includes(statusTimer.tier1) ) return statusTimer.tier1;
            else if ( result.includes(statusTimer.tier2) ) return statusTimer.tier2;
            else if ( result.includes(statusTimer.tier3) ) return statusTimer.tier3;
            else if ( result.includes(statusTimer.end) ) return statusTimer.end;
            else if ( result.includes(statusTimer.finalized) ) return statusTimer.finalized;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return false;
        }
    }

    async isCrowdsaleFinalized() {
        logger.info(this.name + "isCrowdsaleFinalized ");
        let status = await this.getStatusTimer();
        console.log(status)
        return (status === statusTimer.finalized);
    }

    async isCrowdsaleNotStarted() {
        logger.info(this.name + "isCrowdsaleNotStarted ");
        return (await this.getStatusTimer() === statusTimer.start);
    }

    async isCrowdsaleEnded() {
        logger.info(this.name + "isCrowdsaleEnded ");
        return (await this.getStatusTimer() === statusTimer.end);
    }

    async isCrowdsaleStarted() {
        logger.info(this.name + "isCrowdsaleStarted ");
        return (await this.getStatusTimer() !== statusTimer.start);
    }

    async isCurrentTier1() {
        logger.info(this.name + "isCurrentTier1 ");
        return (await this.getStatusTimer() === statusTimer.tier1);
    }

    async isCurrentTier2() {
        logger.info(this.name + "isCurrentTier2 ");
        return (await this.getStatusTimer() === statusTimer.tier2);
    }

    async isCurrentTier3() {
        logger.info(this.name + "isCurrentTier3 ");
        return (await this.getStatusTimer() === statusTimer.tier3);
    }

    async initTimerFields() {
        logger.info(this.name + "initTimerFields ");
        try {
            let array = await super.findWithWait(countdownTimerStatus);
            this.timer = array[0];
            return array;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return null;
        }
    }

    async initFields() {
        logger.info(this.name + "initFields ");
        try {
            let array = await super.findWithWait(fields);
            this.fieldCurrentAccount = array[0];
            this.fieldExecutionID = array[1];
            this.fieldCrowdsaleName = array[2];
            this.fieldTicker = array[3];
            this.fieldTotalSupply = array[4];
            this.fieldMinContribution = array[5];
            this.fieldMaxContribution = array[6];
            return array;
        }
        catch ( err ) {
            logger.info("Error " + err);
            return null;
        }
    }

    async isCrowdsaleTimeOver() {
        logger.info(this.name + " :isCrowdsaleTimeOver ");
        try {
            let arr = await super.findWithWait(countdownTimerValue, 20);
            let result = 0;
            for ( let i = 0; i < arr.length; i++ ) {
                result = result + parseInt((await this.getTextForElement(arr[i])));
            }
            if ( result < 0 ) result = 0;
            return (result === 0);
        }
        catch ( err ) {
            logger.info("Error " + err);
            return false;
        }
    }

    async getBalance() {
        logger.info(this.name + "getBalance ");
        return await super.getTextForElement(fieldBalance);
    }

    async isDisplayedError() {
        logger.info(this.name + "isPresentError ");
        return await super.isElementDisplayed(error);
    }

    async waitUntilShowUpError(Twaiting) {
        logger.info(this.name + "waitUntilShowUpError ");
        return await super.waitUntilDisplayed(error, Twaiting)
    }

    async waitUntilShowUpButtonOk(Twaiting) {
        logger.info(this.name + "waitUntilShowUpButtonOk ");
        return await super.waitUntilDisplayed(buttonOk, Twaiting)
    }

    async isDisplayedCountdownTimer() {
        logger.info(this.name + "isDisplayedCountdownTimer ");
        return await super.isElementDisplayed(countdownTimer);
    }

    async waitUntilShowUpCountdownTimer(Twaiting) {
        logger.info(this.name + "waitUntilShowUpCountdownTimer ");
        return (await super.waitUntilDisplayed(countdownTimer, Twaiting));
    }

    async waitUntilShowUpTimerStatus(Twaiting) {
        logger.info(this.name + "waitUntilShowUpTimerStatus ");
        return (await super.waitUntilDisplayed(countdownTimerStatus, Twaiting));
    }

    /*	async clickButtonOK() {
            logger.info(this.name + "clickButtonOK ");
            return await super.clickWithWait(buttonOk);
        }
    */
    async fillContribute(amount) {
        logger.info(this.name + "fillContribute");
        return await super.fillWithWait(fieldContribute, amount);
    }

    async clearContribute() {
        logger.info(this.name + "clearContribute");
        return await super.clearField(fieldContribute);
    }

    async clickButtonContribute() {
        logger.info(this.name + "clickButtonContribute");
        return await super.clickWithWait(buttonContribute);
    }

    async isDisabledButtonContribute() {
        logger.info(this.name + "isDisabledButtonContribute");
        return await super.isElementDisabled(buttonContribute);
    }

    async getWarningText() {
        logger.info(this.name + "getWarningText");
        return await super.getTextForElement(warningText);
    }

    async getErrorText() {
        logger.info(this.name + "getErrorText");
        return await super.getTextForElement(error);
    }

    async getProxyAddress() {
        logger.info(this.name + "getProxyAddress");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldExecutionID);
    }

    async getCurrentAccount() {
        logger.info(this.name + "getCurrentAccount ");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldCurrentAccount);
    }

    async getName() {
        logger.info(this.name + "getName ");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldCrowdsaleName);
    }

    async getTicker() {
        logger.info(this.name + "getTicker ");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldTicker);
    }

    async getMinContribution() {
        logger.info(this.name + "getMinContribution ");
        if ( await this.initFields() === null ) return false;
        let result = await super.getTextForElement(this.fieldMinContribution);
        if ( result === 'You are not allowed' ) return -1;
        let counter = 60;
        do {
            result = await super.getTextForElement(this.fieldMinContribution);
            result = parseFloat(result.split(" ")[0].trim());
            await this.driver.sleep(1000);
        }
        while ( (result === 0) && (counter-- > 0) )
        if ( counter > 0 ) return result;
        else return false;
    }

    async getMaxContribution() {
        logger.info(this.name + "getMaxContribution ");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldMaxContribution);
    }

    async getTotalSupply() {
        logger.info(this.name + "getTotalSupply ");
        return (await this.initFields() !== null) &&
            await super.getTextForElement(this.fieldTotalSupply);
    }



    async waitUntilShowUpErrorNotice(Twaiting) {
        logger.info(this.name + "waitUntilShowUpErrorNotice ");
        return await super.waitUntilDisplayed(errorNotice, Twaiting);
    }

    async getBalance() {
        logger.info(this.name + "getBalance ")
        return await super.getTextForElement(fieldBalance);
    }

    /*	async waitUntilShowUpWarning(Twaiting) {
            logger.info(this.name + "waitUntilShowUpWarning ");
            return await super.waitUntilDisplayed(buttonOk, Twaiting);
        }
        */
}

module.exports.InvestPage = ContributionPage;

