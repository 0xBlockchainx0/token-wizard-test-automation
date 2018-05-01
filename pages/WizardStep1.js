const logger= require('../entity/Logger.js').logger;
const Page=require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const  buttonContinue= By.className("button button_fill");

class WizardStep1 extends Page {

    constructor(driver){
        super(driver);
        this.name = "WizardStep1 page: ";
	    this.title="CROWDSALE CONTRACT";
    }

    async isPresentButtonContinue(){
	    logger.info(this.name+": is present button Continue: ");
        var b=await super.isElementDisplayed(buttonContinue);
        logger.info(this.name+": is present button Continue: "+b);
		return b;

    }

    async clickButtonContinue(){
        logger.info(this.name+"buttonContinue");
       await super.clickWithWait(buttonContinue);


    }
   async  open(){
        logger.info(this.name+"open");
        await  this.driver.get(this.URL);

    }




}
module.exports.WizardStep1=WizardStep1;
