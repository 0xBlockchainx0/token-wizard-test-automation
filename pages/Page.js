const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver'),
      by = require('selenium-webdriver/lib/by');
//const Alert = require('selenium-webdriver');
//const Alert=webdriver.Alert;
const By=by.By;
const loader=By.className("loading-container");
const titles=By.className("title");

const Twait=20000;
Twaittransaction=5000;

class Page {
	  constructor(driver) {
	    this.driver=driver;
	    this.pageTitle;
	  }

	  async initTitles() {
		try {
		  logger.info("init titles:");
		  let array = await this.findWithWait(titles);
		  this.pageTitle = array[0];
		  return array;
		}
		catch(err) {
	      logger.info("Page has no title");
		  return null;
		}
	  }


	async getPageTitle(element){
		logger.info("get title: ");
		let array = await this.initTitles();
		let result;
		if (array!=null) result = await this.getTextByElement(this.pageTitle);
		logger.info("result ");
        return result;
	}


	  async isElementDisabled(element) {
		logger.info("isElementDisabled :")
		try {
		  let field;
		  if (element.constructor.name!=="WebElement") {
		    field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		  }
			else field = element;

		  await this.driver.wait(webdriver.until.elementIsDisabled(field), 100);
		  logger.info("element disabled ");
		  return true;
		}
		catch(err) {
		  logger.info("Element enabled or does not present");
		  return false;
		}
	  }

	  async findElementInArray(locator,className) {
	    try {
			await this.driver.wait(webdriver.until.elementsLocated(locator), 10000, 'Element NOT present.Time out.\n');
			let arr = await this.driver.findElements(locator);
			for (let i = 0; i < arr.length; i++) {
			    let result = await arr[i].getAttribute("className");
			    if (result.includes(className)) return arr[i];
		    }
		}
		    catch(err) {
	            logger.info("Can't find "+ locator+ "in array of "+ className+".\n"+err);
	            return null;
		    }
	  }

	  async isElementPresentWithWait(element) {
	      logger.info("is element present with waiting :");
	      try {
	          await this.driver.wait(webdriver.until.elementLocated(element), Twaittransaction,'Element NOT present.Time out.\n');
	          logger.info(" element present");
	          return true;
		  }
	          catch(err) {
	              logger.info(" element NOT present, "+ err);
	              return false;
	          }
	  }

	  async isElementPresent(element) {
		  logger.info("is element present :");
	      try {
	      	let field;
		      if (element.constructor.name!=="WebElement") {
			      field =  await this.driver.findElement(element);
		      }
		      else field=element;
	          await field.isDisplayed();
		      logger.info(" element present");
		      return true;
	      }
	        catch (err) {
	            logger.info(" element NOT present");
	            return false;
	        }
	  }

	  async getTextByElement(element) {
	      logger.info("get text for element : ");
	      let result=await element.getText();
		  if(result.length<100) logger.info("text received: "+result);
	      return result;
	  }

	  async getAttribute(element,attr) {
	      logger.info("get attribute = "+attr+ "for element = "+element);
	      let field;
	      if (element.constructor.name!="WebElement") {
	          field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	      }
	          else field = element;
	      let result=await field.getAttribute(attr);
	      logger.info("received value= "+result);
	      return result;
	  }

	  async getTextByLocatorFast(locator) {
		  logger.info("get text for locator fast:");
		  try {
		      await this.driver.wait(webdriver.until.elementLocated(locator), 500, 'Element ' + locator + 'NOT present.Time out.\n');
		      let result=await this.driver.findElement(locator).getText();
		      logger.info("received text: "+result);
		      return result;
	      }
		      catch(err) {
	             return "";
		  }
	  }

	  async getTextByLocator(locator) {
		  logger.info("get text for locator ");
		  try {
		      await this.driver.wait(webdriver.until.elementLocated(locator), Twait, 'Element ' + locator + 'NOT present.Time out.\n');
		      let result=await this.driver.findElement(locator).getText();
		      logger.info("received text: "+result);
		      return result;
		  }
		     catch(err) {
			 return "";
		     }
	  }

	  async getURL() {
	      logger.info("get current page URL ");
	      return await this.driver.getCurrentUrl();
	  }

	  async open (url) {
	      logger.info("open  "+url);
	      await this.driver.get(url);
	      logger.info("Current URL: "+await this.driver.getCurrentUrl());
	      logger.info("Current HANDLE: "+await this.driver.getWindowHandle());
	      await this.driver.sleep(5000);
	  }

	  async clearField(element) {

		  logger.info("clear field :");
		  let field;
		  if (element.constructor.name!=="WebElement") {
			  field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		  }
		  else field = element;

		  let s="";
		  let counter=3;
		  do {
		  await field.click();
		  await this.driver.sleep(500);
		  for (let i=0;i<40;i++) {
		    await field.sendKeys(key.BACK_SPACE);
		  }
		  await this.driver.sleep(500);
		  s=await field.getAttribute('value');
		  } while ((s!="")&&(counter-->0));
	  }


	  async clickWithWait(element) {
	    logger.info("click with wait" +element);
	    try {
	      let field;
		  if (element.constructor.name!=="WebElement") {
	        field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	      }
	        else field = element;
	        await field.click();
	       // await field.sendKeys(key.TAB);
	        return true;
	    }
	    catch(err) {
	      logger.info("Can not click element"+ element);
	      return false;
		}
	  }

	  async waitUntilLocated(element) {
	    logger.info("wait until located");
		try {
	      await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		}
		catch(err) {
		  logger.info("Element "+ element+" has not appeared in"+ Twait+" sec.");
		}

	  }

	  async fillWithWait(element,k) {
	    logger.info("fill with wait :");
	    try {
	      logger.info("fill:field: "+element +" with value = " + k);
	      let field;
		  if (element.constructor.name!="WebElement") {
	        field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		  }
		    else field = element;
		  await field.sendKeys(k);
		  return true;
	    }
	    catch(err) {
	      logger.info("Element "+ element+" has not appeared in"+ Twait+" sec.");
		  return false;
	    }
	  }

	  async refresh() {
	    logger.info("refresh :");
	    await this.driver.navigate().refresh();
	  }

	async findWithoutWait(element) {
		logger.info("find with wait ");
		try {
			await this.driver.wait(webdriver.until.elementLocated(element), 1000);
			return await this.driver.findElements(element);
		}
		catch(err) {
			logger.info("Element "+ element+" have not appeared in"+ 1000+" sec.");
			return null;
		}
	}

	  async findWithWait(element) {
	    logger.info("find with wait ");
		try {
		  await this.driver.wait(webdriver.until.elementLocated(element), Twait);
	      return await this.driver.findElements(element);
		}
	    catch(err) {
		  logger.info("Element "+ element+" have not appeared in"+ Twait+" sec.");
	      return null;
		}
	  }

	  async  isDisplayedLoader() {
	    logger.info("is loader displayed :");
		  try {
		    let s = await this.driver.findElement(loader).getAttribute("className");
	        if (s == "loading-container notdisplayed") {
			  logger.info("NOT displayed"+",  s="+s);
			  return false;
			}
			  else {
			    logger.info("displayed"+", s="+s);
			    return true;
			  }
		  }
		  catch (err) {
		    logger.info("can't find loader. "+err);
		    return false;
		  }
	  }

	  async waitUntilLoaderGone() {
	    logger.info("wait until loader gone :");
	    try {
		  let counter = 0;
		  let limit=40;
		  do {
			this.driver.sleep(1000);
			await this.isDisplayedLoader();
			if (counter++ > limit) throw ("Loading container displayed more than "+limit+" sec");
		  }	while ((await this.isDisplayedLoader()));
	    }
	    catch(err) {
	      logger.info(err);
		  await  this.refresh();
		  await this.driver.sleep(5000);
	    }

	  }

	  async goBack() {
	    logger.info("go back :")
		this.driver.navigate().back();
	  }

	  async switchToNextPage(){
	    logger.info("switch to next tab :");
	    let allHandles=[];
		let curHandle;
	    try {
		  allHandles = await this.driver.getAllWindowHandles();
		  curHandle = await this.driver.getWindowHandle();
		  if (allHandles.length>2) {
		    logger.info("Browser has more than 2 windows"+". \n"+ "Amount of window is "+ allHandles.length);
		    let arr=[];
		    arr[0]=allHandles[0];
		    arr[1]=allHandles[1];
		    allHandles=arr;
		    logger.info("New allHandles.length="+allHandles.length);
		  }
	      let handle;
	      for (let i = 0; i < allHandles.length; i++) {
	        if (curHandle != allHandles[i]) {
	          handle = allHandles[i];
	          break;
	        }
	      }
		  logger.info("Current handle  = "+ curHandle);
		  logger.info("Switch to handle  = "+ handle);
	      await this.driver.switchTo().window(handle);
	    }
	    catch (err){
	      logger.info("can't switch to next tab "+err+". \n"+ "amount of window is "+ allHandles.length);
	      logger.info("current handle: "+curHandle);
	    }
	  }


	  async isPresentAlert() {

	  	logger.info("isPresentAlert:")
        try {

	        let result = await this.driver.switchTo().alert().getText();
	        logger.info("alert text:  "+result);
	        return true;
        }
        catch (err) {

	        logger.info(err);
	        return false;
        }
	  }
	async acceptAlert() {

		logger.info("acceptAlert:")
		try {

			 this.driver.switchTo().alert().accept();
			 return true;
		}
		catch (err) {

			logger.info(err);
			return false;
		}
	}

}
module.exports.Page=Page;
