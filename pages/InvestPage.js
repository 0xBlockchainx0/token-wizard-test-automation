const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const Page=page.Page;
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonContribute=By.className("button button_fill");
const fieldInvest=By.className("invest-form-input");
const buttonOk=By.className("swal2-confirm swal2-styled");
const fieldBalance=By.className("balance-title");
const fields=By.className("hashes-title");
const warningText=By.id("swal2-content");
const errorNotice=By.className("css-6bx4c3");
const countdownTimer=By.className("timer");
const countdownTimerValue=By.className("timer-count");

class InvestPage extends Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.fieldTokenAddress;
        this.fieldContractAddress;
        this.fieldCurrentAccount;
        this.name="Invest page :";
        this.timer=[];
    }

    async initTimer() {
	   logger.info(this.name+ ":init countdown timer : ");
        try  {
		    let arr = await super.findWithWait(countdownTimer);
		    this.timer = arr[0];
		    return arr;
	    }
        catch(err) {
		    logger.info(this.name+": dont contain countdown timer ");
		    return null;
	    }
    }

    async initFields() {
        var arr = await super.findWithWait(fields);
        this.fieldTokenAddress = arr[1];
        this.fieldContractAddress = arr[2];
        this.fieldCurrentAccount=arr[0];
    }

    async isCrowdsaleTimeOver() {
        try {
	        logger.info(this.name + " :isCrowdsaleTimeOver:");
	        let arr = await super.findWithWait(countdownTimerValue);
	        let result = 0;
	        for (let i = 0; i < arr.length; i++) {
		        result = result + parseInt((await this.getTextByElement(arr[i])));
	        }
            if (result<0) result=0;

	        return (result===0);
        }
        catch (err) {
            logger.info("Can not find timer");
            return false;
        }
    }

    async getBalance(){

        logger.info(this.name+"get Balance :");
        //await this.driver.sleep(5000);
        return  await super.getTextByLocator(fieldBalance);
    }
    async isPresentError(){
        logger.info(this.name+"Error text :");
        return (await super.isElementPresent(errorNotice));
    }
    async isPresentWarning(){
        logger.info(this.name+"Warning  :");
        return (await super.isElementPresent(buttonOk));
    }
	async isPresentCountdownTimer(){
		logger.info(this.name+"countdown timer  :");
		return (await super.isElementPresent(countdownTimer));
	}

   async  clickButtonOK(){
        logger.info(this.name+"button OK :");
      await  super.clickWithWait(buttonOk);

    }

    async fillInvest(amount) {
       logger.info(this.name+"field Contribute :");
       await super.fillWithWait(fieldInvest,amount);
    }

    async clickButtonContribute(){
        logger.info(this.name+"button Contribute :");
        await super.clickWithWait(buttonContribute);
    }
    async getWarningText() {
        logger.info(this.name+"Warning text :");
        return  await super.getTextByLocator(warningText);
    }

    async getErrorText() {
        logger.info(this.name+"Error text :");
        return  await super.getTextByLocator(errorNotice);
    }

     async getTokenAddress() {
        logger.info(this.name+"field TokenAddress :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldTokenAddress);
    }

    async getContractAddress() {
        logger.info(this.name+"field ContractAddress :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldContractAddress);
    }

    async getCurrentAccount(){
        logger.info(this.name+"field CurrentAccount :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldCurrentAccount);
    }

}
module.exports.InvestPage=InvestPage;

