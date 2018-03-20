
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonContinue=By.xpath("//*[contains(text(),'Continue')]");


class WizardStep2 extends page.Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.fieldName;
        this.fieldTicker;
        this.fieldDecimals;
        this.name="WizardStep2 page: ";

    }

    async init(){

        var locator = By.className("input");
        var arr = await super.findWithWait(locator);
        this.fieldName = arr[0];
        this.fieldTicker = arr[1];
        this.fieldDecimals = arr[2];
    }



    async fillName(name){
        logger.info(this.name+"field Name: ");
        await this.init();
        await super.clearField(this.fieldName);
        await super.fillField(this.fieldName,name);
}
async fillTicker(name){
    logger.info(this.name+"field Ticker: ");
    await this.init();
    await super.fillField(this.fieldTicker,name);
}
async fillDecimals(name){
    logger.info(this.name+"field Decimals: ");
    await this.init();
    await super.fillField(this.fieldDecimals,name);
}


async clickButtonContinue(){
    logger.info(this.name+"button Continue: ");
    await super.clickWithWait(buttonContinue);
}


}
module.exports.WizardStep2=WizardStep2;