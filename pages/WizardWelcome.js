const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonNewCrowdsale=By.className("button button_fill");
const buttonChooseContract=By.className("button button_outline");

class WizardWelcome extends page.Page{

    constructor(driver,URL){
        super(driver);
        this.URL=URL;
        this.name="WizardWelcome page: ";

    }

    async clickButtonNewCrowdsale(){
        logger.info(this.name+"button NewCrowdsale");
        await super.clickWithWait(buttonNewCrowdsale);



    }
    async clickButtonChooseContract(){
        logger.info(this.name+"button ChooseContract");
       await  super.clickWithWait(buttonChooseContract);
        }

    async open()
    {
      logger.info(this.name+":open " + this.URL);
      await   super.open(this.URL);
      return await super.getURL();

    }

	async openWithAlertConfirmation() {
		logger.info(this.name+": openWithAlertConfirmation");
		try {
			await   super.open(this.URL);
			return true;
        }
        catch(err) {
		    await super.acceptAlert();
		    return false;
        }



    }

    async isPresentButtonNewCrowdsale(){
	    return await super.isElementPresent(buttonNewCrowdsale);
    }
	async isPresentButtonChooseContract(){
		return await super.isElementPresent(buttonChooseContract);
	}
	async isPage(){
        return await super.isElementPresent(buttonNewCrowdsale) &&  await super.isElementPresent(buttonChooseContract);
    }



}
module.exports.WizardWelcome=WizardWelcome;
