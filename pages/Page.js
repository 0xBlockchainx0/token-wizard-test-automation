const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');

const By=by.By;
const loader=By.className("loading-container");

const key = require('selenium-webdriver').Key;
const Twait=20000;


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
     try {
         //q = await this.driver.findElement(element).isDisplayed();

         var s=await this.driver.findElements(element);
        // console.log("lengfth"+s.length);
         if (s.length>0){q=true;logger.info(" element present");}
         else {q=false;logger.info(" element NOT present");}
     } catch (err) {
         q = false;
         logger.info(" element NOT present");
     }

     return q;

     }
async getTextByElement(element)
{logger.info("get text ");
    return await element.getText();}





async getTextByLocator(element)
{
  logger.info("get text ");
  return await this.driver.findElement(element).getText();
}
async getURL()
{
    logger.info("get current page URL ");
    return await this.driver.getCurrentUrl();
}
async open (url){
        logger.info("open  "+url);
        await this.driver.get(url);
}
async clearField(element,n){
    logger.info("clear");
    let field;
    if (n!=1) {
        field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
    }
    else field=element;
    const c=key.chord(key.CONTROL,"a");
    const action=this.driver.actions();
    //await action.click(field).perform();
    await action.click(field).perform();
    await this.driver.sleep(300);
    await action.sendKeys(c).perform();
    await this.driver.sleep(300);
    await action.sendKeys(key.DELETE).perform();
    await action.sendKeys(key.DELETE).perform();

}
async oneClick(element){
     await  this.driver.findElement(element).click();
}
async clickElement(element){
        logger.info("click");
        await element.click();
    }

   async  fillField(field,address){
        logger.info("fill: value = "+address);
      await  field.sendKeys(address);

    }


    async clickWithWait(element) {
        logger.info("click");
        try{
        let button = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
        await button.click();}
        catch(err){logger.info("Can not click element"+ button)}
    }


    async fillWithWait(element,k) {
        logger.info("fill: value = "+k);
        let field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
        await field.sendKeys(k);

    }
    async refresh(){
        logger.info("refresh");
        await this.driver.navigate().refresh();
    }
    async findWithWait(element)
    {
        logger.info("find");
        await this.driver.wait(webdriver.until.elementLocated(element), Twait);
        return await this.driver.findElements(element);
    }
    async clickTo(element){
        logger.info("click");
       await  element.click();

    }

    async  isDisplayedLoader(){
        var s=await this.driver.findElement(loader).getAttribute("className");
        if (s=="loading-container notdisplayed") {logger.info("displayed");return true;}
        else {logger.info("NOT displayed");return false;}
    }
async waitUntilLoaderGone(){
    logger.info("Modal :");
    do{ this.driver.sleep(1000);await this.isDisplayedLoader();}while(!(await this.isDisplayedLoader()));
}

async switchToNextPage(){
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



    }





}
module.exports.Page=Page;
