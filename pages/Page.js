const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');

const By=by.By;
const loader=By.className("loading-container");

const key = require('selenium-webdriver').Key;
const Twait=20000;
const TTT=1000;

class Page {

    constructor(driver){
        this.driver=driver;
        this.pageID;
        this.footer;
        this.header;
    }



     async   findElementInArray(locator,className)
        {
            var arr=await this.driver.findElements(locator);
            for (var i=0;i<arr.length;i++)
            {
                var s=await arr[i].getAttribute("className");
                if (s.includes(className)) return arr[i];
            }


        }


 async  isElementPresent(element) {
     var q;

     await this.driver.sleep(TTT);
     try {
         q = await this.driver.findElement(element).isDisplayed();
	     logger.info(" element present");
        // var s=await this.driver.findElements(element);
        // console.log("lengfth"+s.length);
        // if (s.length>0){q=true;logger.info(" element present");}
         //else {q=false;logger.info(" element NOT present");}
     } catch (err) {
         q = false;
         logger.info(" element NOT present");
     }
	 Utils.takeScreenshoot(this.driver);
     return q;

     }
async getTextByElement(element)
{logger.info("get text ");
	await this.driver.sleep(TTT);
    return await element.getText();}

async getAttributeByLocator(locator,attr){
	await this.driver.sleep(TTT);
	logger.info("get attribute value ");
	return await this.driver.findElement(locator).getAttribute(attr);

}



async getTextByLocator(element)
{
	await this.driver.sleep(TTT);
  logger.info("get text ");
  return await this.driver.findElement(element).getText();
}
async getURL()
{  await this.driver.sleep(TTT);
    logger.info("get current page URL ");
    return await this.driver.getCurrentUrl();
}
async open (url){
	await this.driver.sleep(TTT);
        logger.info("open  "+url);
        await this.driver.get(url);
}
async clearField(element,n){
	await this.driver.sleep(2000);
    logger.info("clear");
    let field;
    if (n!=1) {

        field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);}
    else field=element;
    await field.clear();
    /*
    const c=key.chord(key.CONTROL,"a");
    const action=this.driver.actions();
    //await action.click(field).perform();
    await action.click(field).perform();
    await this.driver.sleep(300);
    await action.sendKeys(c).perform();
    await this.driver.sleep(300);
    await action.sendKeys(key.DELETE).perform();
    await action.sendKeys(key.DELETE).perform();*/

}
async oneClick(element){
	await this.driver.sleep(TTT);
     await  this.driver.findElement(element).click();
}
async clickElement(element){
	await this.driver.sleep(TTT);
        logger.info("click");
        await element.click();
    }

   async  fillField(field,address){
	   Utils.takeScreenshoot(this.driver);
	   await this.driver.sleep(TTT);
        logger.info("fill: value = "+address);
      await  field.sendKeys(address);

    }
	async  clickWithWaitIsElementEnabled(element) {
		Utils.takeScreenshoot(this.driver);
		await this.driver.sleep(TTT);
		logger.info("click");
		try{

			//let button = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			let button = await this.driver.wait(webdriver.until.elementIsEnabled(element), Twait);
			Utils.takeScreenshoot(this.driver);
			await button.click();}
		catch(err){logger.info("Can not click element"+ button);
			Utils.takeScreenshoot(this.driver);  }
	}


    async clickWithWait(element) {
	    Utils.takeScreenshoot(this.driver);
	    await this.driver.sleep(TTT);
        logger.info("click");
        try{

        let button = await this.driver.wait(webdriver.until.elementLocated(element), Twait);

        Utils.takeScreenshoot(this.driver);
        await button.click();}
        catch(err){logger.info("Can not click element"+ button);
	               Utils.takeScreenshoot(this.driver);  }
    }


    async fillWithWait(element,k) {
	    await this.driver.sleep(TTT);
        logger.info("fill: value = "+k);
        let field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
        await field.sendKeys(k);
	    Utils.takeScreenshoot(this.driver);

    }
    async refresh(){
	    await this.driver.sleep(TTT);
        logger.info("refresh");
        await this.driver.navigate().refresh();
	    Utils.takeScreenshoot(this.driver);
    }
    async findWithWait(element)
    {
	    await this.driver.sleep(TTT);
        logger.info("find");
        await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	    Utils.takeScreenshoot(this.driver);
        return await this.driver.findElements(element);
    }
    async clickTo(element){
	    await this.driver.sleep(TTT);
        logger.info("click");
       await  element.click();

    }

    async  isDisplayedLoader(){
	    await this.driver.sleep(TTT);
        var s=await this.driver.findElement(loader).getAttribute("className");
	    Utils.takeScreenshoot(this.driver);
        if (s=="loading-container notdisplayed") {
            logger.info("displayed");return true;}
        else {logger.info("NOT displayed");return false;}
    }



async waitUntilLoaderGone(){
	//await this.driver.sleep(TTT);
	Utils.takeScreenshoot(this.driver);
    logger.info("Modal :");

    let c=40;
    do{
    	this.driver.sleep(1000);await this.isDisplayedLoader();
    	if (c--<0) break;
    }
    while(!(await this.isDisplayedLoader()));
}

async switchToNextPage(){
	await this.driver.sleep(TTT);
	Utils.takeScreenshoot(this.driver);
        logger.info("switch to another tab");
        let dr=this.driver;
        let allHandles=await dr.getAllWindowHandles();
        let curHandle=await dr.getWindowHandle();
        let handle;
        for (let i=0;i<allHandles.length;i++)
        {
            if (curHandle!=allHandles[i]) handle=allHandles[i];
        }
        await dr.switchTo().window(handle);
	    Utils.takeScreenshoot(this.driver);



    }





}
module.exports.Page=Page;
