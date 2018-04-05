const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonContinue=By.xpath("//*[contains(text(),'Continue')]");
const modal=By.className("modal");
//const buttonOK=By.xpath('/html/body/div[2]/div/div[3]/button[1]');
const buttonOK=By.className("swal2-confirm swal2-styled");
const buttonSkipTransaction=By.className("no_image button button_fill");
const buttonYes=By.className("swal2-confirm swal2-styled");

class WizardStep4 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.name="WizardStep4 page: ";
        this.tokenContractAddress;
        this.fieldTokenABI;
    }

	async init(){

		var locator = By.className("input");
		var arr = await super.findWithWait(locator);
		this.tokenContractAddress = arr[2];
	}

	async initFields(){

		const fields=By.css("pre");
		var arr=await super.findWithWait(fields);
		this.fieldTokenABI=arr[1];

	}

	async getABI(){

		await this.initFields();
    	logger.info(this.name+": get ABI: ");
    	let element = this.fieldTokenABI;
    	let abi=await super.getTextByElement(element);
    	return abi;

	}


async isPresentModal(){
	logger.info(this.name+"Is present Modal: ");
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
	async isPresentButtonSkipTransaction(){
		logger.info(this.name+"Is present buttonSkipTransaction: ");
		return await super.isElementPresent(buttonSkipTransaction);

	}
	async clickButtonSkipTransaction(){
		logger.info(this.name+"buttonSkipTransaction: ");
		await this.driver.executeScript( "document.getElementsByClassName('no_image button button_fill')[0].click();");

	}

	async clickButtonYes(){
		logger.info(this.name+"clickButtonYes: ");
		await super.clickWithWait(buttonYes);
	}



}
module.exports={ WizardStep4:WizardStep4 }
