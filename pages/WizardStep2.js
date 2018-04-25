
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
const fieldName=By.id("name");
const fieldTicker=By.id("ticker");;
const fieldDecimals=By.id("decimals");;

class WizardStep2 extends page.Page {

    constructor(driver) {
        super(driver);
        this.URL;
        this.name="WizardStep2 page: ";
        this.warningName;
	    this.warningTicker;
	    this.warningDecimals;
	    this.warningAddress;
	    this.warningValue;
	    this.title="TOKEN SETUP";


    }


async initWarnings(){
    	try {
		    logger.info(this.name + " :init warnings:");
		    const locator = By.className("error");
		    var arr = await super.findWithWait(locator);
		    this.warningName = arr[0];
		    this.warningTicker = arr[1];
		    this.warningDecimals = arr[2];
		    return arr;
	    }
	    catch(err){
    		logger.info(this.name+": dont contain warning elements");
    		return null;
	    }
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
	    await super.clearField(fieldName);
        await super.fillWithWait(fieldName,name);
       // return true;
        }
        catch (err) {
         logger.info(err);
         return false;
        }
}
async fillTicker(name){
    try {
	    logger.info(this.name + "field Ticker: ");
	    await super.clearField(fieldTicker);
	    await super.fillWithWait(fieldTicker, name);
	    return true;
    }
catch (err)
	{logger.info(err);
		return false;}
}
async fillDecimals(name) {
    	try{
	logger.info(this.name + "field Decimals: ");
	await super.clearField(fieldDecimals);
	await super.fillWithWait(fieldDecimals, name);
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

    async isPresentWarningName(){

	    return false;


    	await this.initWarnings();
    	let s=await super.getTextByElement(this.warningName);
    	if (s!="") return true;
    	else return false;
    }

	async isPresentWarningTicker(){
    	return false;
		await this.initWarnings();
		let s=await super.getTextByElement(this.warningTicker);
		if (s!="") return true;
		else return false;
	}

	async isPresentWarningDecimals(){

		return false;

		await this.initWarnings();
		let s=await super.getTextByElement(this.warningDecimals);
		if (s!="") return true;
		else return false;
	}


	async getFieldDecimals(){
		logger.info(this.name+"getFieldDecimals: ");
		try {

			let s = super.getAttribute(fieldDecimals, "value");
			return s;
		}
		catch (err)
		{
			logger.info(err);
			return "";
		}
	}

	async isDisabledDecimals(){


		return await super.isElementDisabled(fieldDecimals);
	}


}
module.exports.WizardStep2=WizardStep2;