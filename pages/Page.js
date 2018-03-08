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
const TTT=10;

class Page {

    constructor(driver){
        this.driver=driver;
        this.pageID;
        this.footer;
        this.header;
    }



     async   findElementInArray(locator,className)
        {
        	try {
		        await this.driver.wait(webdriver.until.elementsLocated(locator), 10000, 'Element NOT present.Time out.\n');
		        var arr = await this.driver.findElements(locator);
		        for (var i = 0; i < arr.length; i++) {
			        var s = await arr[i].getAttribute("className");
			        if (s.includes(className)) return arr[i];
		        }
	        }
	        catch(err){
        		logger.info("Can't find "+ locator+ "in array of "+ className+".\n"+err);
        		return null;
	        }


        }


        async isElementPresentWithWait(element){

    	try {
		    await this.driver.wait(webdriver.until.elementLocated(element), Twait/4,'Element NOT present.Time out.\n');
		    logger.info(" element present");
    		return true;
	    }

    	catch(err)
	    {

		    logger.info(" element NOT present "+ err);
		    return false;
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
	 //await Utils.takeScreenshoot(this.driver);
     return q;

     }





async getTextByElement(element)
{logger.info("get text ");
	await this.driver.sleep(TTT);
    return await element.getText();}



async getAttributeByLocator(locator,attr){
	await this.driver.sleep(TTT);
	logger.info("get attribute = "+attr+ "for element = "+locator);
	await this.driver.wait(webdriver.until.elementLocated(locator), Twait,'Element '+locator+'NOT present.Time out.\n');

	return await this.driver.findElement(locator).getAttribute(attr);

}



async getTextByLocator(locator)
{
	await this.driver.sleep(TTT);
  logger.info("get text ");
	await this.driver.wait(webdriver.until.elementLocated(locator), Twait,'Element '+locator+'NOT present.Time out.\n');
    return await this.driver.findElement(locator).getText();
}
async getURL()
{  await this.driver.sleep(TTT);
    logger.info("get current page URL ");

    return await this.driver.getCurrentUrl();
}
async open (url){

        logger.info("open  "+url);
        await this.driver.get(url);
	    logger.info("Current URL: "+await this.driver.getCurrentUrl());
     	logger.info("Current HANDLE: "+await this.driver.getWindowHandle());


	    await this.driver.sleep(5000);
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

	   await this.driver.sleep(TTT);
        logger.info("fill: value = "+address);
      await  field.sendKeys(address);

    }
	async  clickWithWaitIsElementEnabled(element) {

		await this.driver.sleep(TTT);
		logger.info("click");
		try{

			//let button = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			let button = await this.driver.wait(webdriver.until.elementIsEnabled(element), Twait);

			await button.click();}
		catch(err){logger.info("Can not click element"+ element);

			  }
	}


    async clickWithWait(element) {

	    await this.driver.sleep(TTT);
        logger.info("click");
        try{

        let button = await this.driver.wait(webdriver.until.elementLocated(element), Twait);


        await button.click();}
        catch(err){logger.info("Can not click element"+ element);
	                }
    }
async waitUntilLocated(element)
{
	try {
		await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	}
	catch(err){logger.info("Element "+ element+" has not appeared in"+ Twait+" sec.");
		 }

}
    async isDisabledElement(element)
    { try {
	    await this.driver.wait(webdriver.until.elementIsEnabled(element), Twait/2);
    }
    catch (err)
    {
	    logger.info("Element DISABLED"+ element+"\n"+err);

    }
    }
    async fillWithWait(element,k) {
	    await this.driver.sleep(TTT);
	    try {
		    logger.info("fill: value = " + k);
		    let field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		    await field.sendKeys(k);
	    }
	    catch(err){logger.info("Element "+ element+" has not appeared in"+ Twait+" sec.");
		     }

    }
    async refresh(){

	    await this.driver.sleep(TTT);
        logger.info("refresh");
        await this.driver.navigate().refresh();
	    //await this.driver.sleep(2000);
	    await Utils.takeScreenshoot(this.driver);
    }
    async findWithWait(element)
    {
	    await this.driver.sleep(TTT);
        logger.info("find");
	    try {
		    await this.driver.wait(webdriver.until.elementLocated(element), Twait);

		    return await this.driver.findElements(element);
	    }
    catch(err){logger.info("Element "+ element+" have not appeared in"+ Twait+" sec.");

	    return null;}

    }
    async clickTo(element){
	    await this.driver.sleep(TTT);
        logger.info("click");
       await  element.click();

    }

    async  isDisplayedLoader(){
    	//logger.info("DWECWHCHWOCHIWOIEJC");
	    await this.driver.sleep(TTT);
	    try {
		    var s = await this.driver.findElement(loader).getAttribute("className");

		    if (s == "loading-container notdisplayed") {
			    logger.info("NOT displayed"+",  s="+s);
			    return false;
		    }
		    else {
			    logger.info("displayed"+", s="+s);
			    return true;
		    }
	    }
	    catch (err){
		    logger.info("can't find loader. "+err);
		    return false;
	    }
    }



async waitUntilLoaderGone(){
	//await this.driver.sleep(TTT);

    logger.info("Loader :");

    let c=40;
    do{
    	this.driver.sleep(1000);await this.isDisplayedLoader();
    	if (c--<0) break;
    }
    while((await this.isDisplayedLoader()));
}

async switchToNextPage(){

	await this.driver.sleep(TTT);

        logger.info("switch to next tab");
        let dr=this.driver;
	let allHandles=[];
	let curHandle;
       try {
	       allHandles = await dr.getAllWindowHandles();
	       //if (allHandles.length>2) throw ("Browser has more than 2 windows")
	       curHandle = await dr.getWindowHandle();
	       if (allHandles.length>2){
	       	logger.info("Browser has more than 2 windows"+". \n"+ "Amount of window is "+ allHandles.length);
	       	var arr=[];
	       	arr[0]=allHandles[0];
	       	arr[1]=allHandles[1];
	       	allHandles=arr;
	       	logger.info("New allHandles.length="+allHandles.length);
	       }

	       let handle;
	       for (let i = 0; i < allHandles.length; i++) {

		       if (curHandle != allHandles[i]) {handle = allHandles[i];break;}

	       }
	          logger.info("Current handle  = "+ curHandle);
	          logger.info("Switch to handle  = "+ handle);
           await dr.switchTo().window(handle);
	       await this.driver.sleep(1000);
	      // await this.driver.sleep(TTT);

	       //await Utils.takeScreenshoot(this.driver);

       }
       catch (err){
       	logger.info("Can't switch to next tab "+err+". \n"+ "Amount of window is "+ allHandles.length);
       	logger.info("Current handle: "+curHandle);
	     /*for (let i = 0; i < allHandles.length; i++) {
		       await dr.switchTo().window(allHandles[i]);
		       logger.info("Handle #"+i+":   "+allHandles[i]);
		       logger.info("URL #"+i+": "+await this.driver.getCurrentUrl());

	       }*/


       }



    }





}
module.exports.Page=Page;
