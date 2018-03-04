const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;

const buttonContinue=By.xpath("//*[@id=\"root\"]/div/section/div[3]/a");
const buttonDownload=By.xpath("//*[@id=\"root\"]/div/section/div[3]/div");
const blueScreen=By.xpath('//*[@id="root"]/div/section/div[4]/div[2]/div');
//const modal=By.xpath("//*[@id=\"root\"]/div/section/div[4]/div/p");
const modal=By.className("modal");
const buttonOK=By.xpath('/html/body/div[2]/div/div[3]/button[1]');


class WizardStep4 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.name="WizardStep4 page: "

    }
async isPage(){
        return await super.isElementPresent(modal);
}
    async clickButtonContinue(){
        logger.info(this.name+"buttonContinue: ");
       await  super.clickWithWait(buttonContinue);

    }

    async clickButtonOk(){
        logger.info(this.name+"buttonOK: ");
        await super.clickWithWait(buttonOK);
    }
    async isPresentButtonOk(){
	    logger.info(this.name+"Is present buttonOK: ");
	    return await super.isElementPresent(buttonOK);

    }





}
module.exports={
    WizardStep4:WizardStep4
    }
