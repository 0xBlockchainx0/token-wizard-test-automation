
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




async isPresentFieldName(){
        logger.info(this.name+"is present field name: ");
        var locator = By.className("input");
		var arr=await this.driver.findElements(locator);
		if (arr.length>0)return true;
		else return false;

    }

    async fillName(name){
        try{
    	logger.info(this.name+"field Name: ");
        await this.init();
        await super.clearField(this.fieldName);
        await super.fillField(this.fieldName,name);
        return true;}
        catch (err)
        {logger.info(err);
         return false;}
}
async fillTicker(name){
    try {
	    logger.info(this.name + "field Ticker: ");
	    await this.init();
	    await super.fillField(this.fieldTicker, name);
	    return true;
    }
catch (err)
	{logger.info(err);
		return false;}
}
async fillDecimals(name) {
    	try{
	logger.info(this.name + "field Decimals: ");
	await this.init();
	await super.fillField(this.fieldDecimals, name);
	return true;
}
catch (err)
	{logger.info(err);
		return false;}
}


async clickButtonContinue(){
    logger.info(this.name+"button Continue: ");
    await super.clickWithWait(buttonContinue);
}
	async isPresentButtonContinue(){
		var b=await super.isElementPresent(buttonContinue);
		logger.info(this.name+": is present button Continue: "+b);
		return b;

	}

}
module.exports.WizardStep2=WizardStep2;