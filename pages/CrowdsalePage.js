const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const Page=page.Page;
const webdriver = require('selenium-webdriver'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonInvest=By.className("button button_fill");

class CrowdsalePage extends Page {

    constructor(driver){
        super(driver);
        this.URL;
        this.name="Crowdsale page :";
    }
   async isPresentButtonInvest() {
	   logger.info(this.name+" button Invest :");
	   return super.isElementPresent(buttonInvest);
   }
   async  clickButtonInvest() {
        logger.info(this.name+"button Invest :");
        await super.clickWithWait(buttonInvest);
   }

}
module.exports={
    CrowdsalePage:CrowdsalePage
}
