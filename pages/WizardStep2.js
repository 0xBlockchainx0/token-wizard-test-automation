
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
        this.warningName;
	    this.warningTicker;
	    this.warningDecimals;
	    this.warningAddress;
	    this.warningValue;
	    this.title="TOKEN SETUP";

    }
    async init(){
try {
	var locator = By.className("input");
	var arr = await super.findWithWait(locator);
	this.fieldName = arr[0];
	this.fieldTicker = arr[1];
	this.fieldDecimals = arr[2];
    return arr;
}

    catch(err){
		    logger.info(this.name+": dont contain input elements");
		    return null;
	    }
    }

async initWarnings(){
    	try {
		    logger.info(this.name + " :init warnings:");
		    const locator = By.xpath("//p[@style='color: red; font-weight: bold; font-size: 12px; width: 100%; height: 10px;']");
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
	    await super.clearField(this.fieldTicker);
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
	await super.clearField(this.fieldDecimals);
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

    async isPresentWarningName(){
    	await this.initWarnings();
    	let s=await super.getTextByElement(this.warningName);
    	if (s!="") return true;
    	else return false;
    }

	async isPresentWarningTicker(){
		await this.initWarnings();
		let s=await super.getTextByElement(this.warningTicker);
		if (s!="") return true;
		else return false;
	}

	async isPresentWarningDecimals(){
		await this.initWarnings();
		let s=await super.getTextByElement(this.warningDecimals);
		if (s!="") return true;
		else return false;
	}


	async getFieldDecimals(){
		logger.info(this.name+"getFieldDecimals: ");
		try {
			await this.init();
			let s = super.getAttribute(this.fieldDecimals, "value");
			return s;
		}
		catch (err)
		{
			logger.info(err);
			return "";
		}
	}

	async isDisabledDecimals(){

		await this.init();
		return await super.isElementDisabled(this.fieldDecimals);
	}

}
module.exports.WizardStep2=WizardStep2;