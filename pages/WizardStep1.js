const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const  buttonContinue= By.className("button button_fill");
//const  buttonContinue= By.xpath("//*[@id=\"root\"]/div/div[1]/section/div[3]/a/span");


class WizardStep1 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.name="WizardStep1 page: ";

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
