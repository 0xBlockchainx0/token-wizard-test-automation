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
const Twait=14000;
Twaittransaction=5000;


class Page {

    constructor(driver){
        this.driver=driver;
        this.pageID;
        this.footer;
        this.header;
        this.pageTitle;


    }

	async initTitles(){
		try{
			logger.info("init titles");
			var locator = By.className("title");
			var arr = await this.findWithWait(locator);
			this.pageTitle=arr[0];
			return arr;
		}
		catch(err){
            logger.info("Page has no title");
			return null;
		}

	}

    async getTitleText(){
    	let arr=await this.initTitles();

    	if (arr!=null){
		    let s=await  this.getTextByElement(this.pageTitle);
    	    return s;}
    	    else return "";
    }


	async isElementDisabled(element)
	{
		logger.info("isElementDisabled ")
		try{
			let field;
			if (element.constructor.name!="WebElement")
			{
				field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			}
			else field = element;

			var b= await this.driver.wait(webdriver.until.elementIsDisabled(field), 100);
			logger.info("Element disabled ")
			return true;
		}
		catch(err){
			logger.info("Element enabled or does not present")
			logger.info("Error: "+err);
			return false;
		}

	}

     async findElementInArray(locator,className)
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
		    await this.driver.wait(webdriver.until.elementLocated(element), Twaittransaction,'Element NOT present.Time out.\n');
		    logger.info(" element present");
    		return true;
	    }

    	catch(err)
	    {

		    logger.info(" element NOT present "+ err);
		    return false;
	    }

        }

     async isElementPresent(element) {
     var q;

     try {
         q = await this.driver.findElement(element).isDisplayed();
	     logger.info(" element present");

     } catch (err) {
         q = false;
         logger.info(" element NOT present");
     }
     logger.info(q)
     return q;

     }



    async getTextByElement(element)
     {
	   logger.info("get text ");
       var s=await element.getText();
	   if(s.length<100) logger.info("Text received: "+s);
       return s;
     }



     async getAttribute(element,attr){

	    logger.info("get attribute = "+attr+ "for element = "+element);
	    let field;
		if (element.constructor.name!="WebElement")
		 {
			field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		 }
		  else field = element;
		  let s=await field.getAttribute(attr);
		  logger.info("Got value= "+s);
	    return s;

    }
	async getTextByLocatorFast(locator)
	{
		logger.info("get text ");
		let s="";
		try {
			await
			this.driver.wait(webdriver.until.elementLocated(locator), 500, 'Element ' + locator + 'NOT present.Time out.\n');
		s=await this.driver.findElement(locator).getText();
		logger.info("got text: "+s);
		return s;

		}
		catch(err){

			return s="";
		}
	}

async getTextByLocator(locator)
{
	//await this.driver.sleep(7000);
  logger.info("get text ");
	await this.driver.wait(webdriver.until.elementLocated(locator), Twait,'Element '+locator+'NOT present.Time out.\n');
    return await this.driver.findElement(locator).getText();
}
async getURL()
{
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
    	logger.info("Class name="+element.constructor.name);
	let c=10;
	let s="empty";
    	do {
    		logger.info("clear");
		    let field;
		   // if (n != 1)
		   if (element.constructor.name!="WebElement")
		    {

			    field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		    }
		    else field = element;
		    await field.clear();
		    await this.driver.sleep(1000);
		    await field.clear();
		   // await field.clear();

		    s=await this.getTextByElement(field);
		    if (s=="") {logger.info("Break with c="+c+", s="+s); break;}
		    logger.info("Field  contains:"+s);
		    s=s.trim();
		    c--;

	    } while((c>0))

    }


   async  fillField(field,address){

    	logger.info("fill: value = "+address);
      await  field.sendKeys(address);

    }

    async clickWithWait(element) {

        logger.info("click" +element);
        try{

	        let field;
	        if (element.constructor.name!="WebElement")
	        {

		        field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	        }
	        else field = element;

        await field.click();
        return true;
        }
        catch(err){logger.info("Can not click element"+ element);
        return false;
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

    async fillWithWait(element,k) {

	    try {
		    logger.info("fill:field: "+element +" with value = " + k);

		    let field;
		    // if (n != 1)
		    if (element.constructor.name!="WebElement")
		    {

			    field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		    }
		    else field = element;
		    await field.sendKeys(k);
		    return true;

	    }
	    catch(err){
	    	logger.info("Element "+ element+" has not appeared in"+ Twait+" sec.");
		         return false; }

    }


    async refresh(){


        logger.info("refresh");
        await this.driver.navigate().refresh();
	    await Utils.takeScreenshoot(this.driver);
    }
    async findWithWait(element)
    {
        logger.info("find");
	    try {
		    await this.driver.wait(webdriver.until.elementLocated(element), Twait);

		    return await this.driver.findElements(element);
	    }
    catch(err){logger.info("Element "+ element+" have not appeared in"+ Twait+" sec.");

	    return null;}

    }
    async clickTo(element){
        logger.info("click");
       await  element.click();

    }

    async  isDisplayedLoader(){

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

    logger.info("Loader :");
try {
	let c = 0;
	let limit=40;
	do {
		this.driver.sleep(1000);
		await this.isDisplayedLoader();
		if (c++ > limit) throw ("Loading container displayed more than "+limit+" sec");
	}
	while ((await this.isDisplayedLoader()));

}
catch(err){
	console.log(err);
   await  this.refresh();
    await this.driver.sleep(5000);
}

    }

    async goBack(){
	    this.driver.navigate().back();
    }

async switchToNextPage(){

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
       }
       catch (err){
       	logger.info("Can't switch to next tab "+err+". \n"+ "Amount of window is "+ allHandles.length);
       	logger.info("Current handle: "+curHandle);
       	}
 }

}
module.exports.Page=Page;
