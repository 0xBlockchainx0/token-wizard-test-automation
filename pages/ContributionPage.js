const logger = require('../entity/Logger.js').logger;
const Page = require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const statusTimer = require('../utils/constants.js').statusTimer;
const QRaddress = By.className('cnt-QRPaymentProcess_HashContainer')
const QRdata = By.className('cnt-QRPaymentProcess_txData')
const buttonContribute = By.className("cnt-ContributeForm_ContributeButton");
const fieldContribute = By.id("contribute");
const buttonOk = By.className("swal2-confirm swal2-styled");
const fieldBalance = By.className("ba-BalanceTokens_Title");
const countdownTimer = By.className("cnt-CountdownTimer");
const countdownTimerValue = By.className("cnt-CountdownTimer_Time");
const countdownTimerStatus = By.className("cnt-CountdownTimer_Message");
const paymentOption = By.className('sw_Select')
const optionQR = By.css('#root > div > div:nth-child(1) > section > div.st-StepContent > div.cnt-Contribute_Contents > div.cnt-Contribute_BalanceBlock > form > select > option:nth-child(2)')
const optionWallet = By.css('#root > div > div:nth-child(1) > section > div.st-StepContent > div.cnt-Contribute_Contents > div.cnt-Contribute_BalanceBlock > form > select > option:nth-child(1)')
const fieldsAddresses = By.className('cnt-ContributeDataList_ItemDataValue')
const fields = By.className("cnt-ContributeDataColumns_ItemTitle");
const warningText = By.id("swal2-content");
const errorNotice = By.className("css-6bx4c3");


class ContributionPage extends Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.fieldExecutionID;
        this.fieldCurrentAccount;
        this.name = "Invest page :";
        this.timer = [];
        this.fieldMinContribution;
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
            this.fieldMinContribution = array[5];
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

    async isPresentError() {
        logger.info(this.name + "isPresentError ");
        return await super.isElementDisplayed(errorNotice);
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


    async fillContribute(amount) {
        logger.info(this.name + "fillContribute");
        return await super.fillWithWait(fieldContribute, amount);
    }

    async clickButtonContribute() {
        logger.info(this.name + "clickButtonContribute");
        return await super.clickWithWait(buttonContribute);
    }
    async getPaymentOption() {
        logger.info(this.name + "getPaymentOption");
        return (await super.findWithWait(paymentOption))[0]
    }
    async clickQRoption() {
        logger.info(this.name + "clickQRoption");
        return await super.clickWithWait(optionQR);
    }

    async clickWalletOption() {
        logger.info(this.name + "clickWalletOption");
        return await super.clickWithWait(optionWallet);
    }

    async isDisabledButtonContribute() {
        logger.info(this.name + " isDisabledButtonContribute ");
        const element = await super.findWithWait(buttonContribute)
        return await super.isElementDisabled(element[0]);
    }

    async getErrorText() {
        logger.info(this.name + "getErrorText");
        return await super.getTextForElement(errorNotice);
    }

    async getProxyAddress() {
        logger.info(this.name + "getProxyAddress")
        const fields = await super.findWithWait(fieldsAddresses)
        return await super.getTextForElement(fields[1]);
    }

    async getCurrentAccount() {
        logger.info(this.name + "getCurrentAccount ");
        const fields = await super.findWithWait(fieldsAddresses)
        return await super.getTextForElement(fields[0]);
    }

    async getQRaddress() {
        logger.info(this.name + "getQRaddress ");
        const fields = await super.findWithWait(QRaddress)
        return await super.getTextForElement(fields[0]);
    }

    async getQRdata() {
        logger.info(this.name + "getQRdata ");
        const fields = await super.findWithWait(QRdata)
        return await super.getTextForElement(fields[0]);
    }

    async getFieldsText(field) {
        logger.info(this.name + "getField ");
        const elements = await super.findWithWait(fields)
        let element
        switch ( field ) {
            case 'name':
                element = elements[0];
                break;
            case 'ticker':
                element = elements[1];
                break;
            case 'supply':
                element = elements[2];
                break;
            case 'minContribution':
                element = elements[3];
                break;
            case 'maxContribution':
                element = elements[4];
                break;
            default:
                element = elements[0];
                break;
        }
        return await super.getTextForElement(element);
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

    async waitUntilShowUpErrorNotice(Twaiting) {
        logger.info(this.name + "waitUntilShowUpErrorNotice ");
        return await super.waitUntilDisplayed(errorNotice, Twaiting);
    }

    async getWarningText(field) {
        logger.info(this.name + "getWarningText " + field);
        const error = By.className('sw-Errors_Item')
        try {
            if ( !await super.waitUntilDisplayed(error, 10) ) return ''
            const errors = await super.findWithWait(error)
            return await errors[0].getText()
        }
        catch ( err ) {
            console.log(err)
            return ''
        }
    }

    async waitUntilHasValue(field, Twait) {
        logger.info(this.name + "waitUntilHasValue " + field);
        try {
            const element =  await super.fillWithWait(fieldContribute);
            return await super.waitUntilHasValue(element, Twait)
        }
        catch ( err ) {
            logger.info(err)
            return false
        }
    }
}

module.exports.InvestPage = ContributionPage;

