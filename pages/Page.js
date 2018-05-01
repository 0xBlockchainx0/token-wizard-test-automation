const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const loader=By.className("loading-container");
const loaderNotDisplayed = By.className("loading-container notdisplayed");
const titles=By.className("title");

const Twait=20000;
const Twaittransaction=5000;

class Page {

	constructor(driver) {
		this.driver=driver;
	}

	async clickKey(key, times) {
		logger.info("click key "+key+" "+times+" times")
		try {
			const action=this.driver.actions();
			for (let i=0;i<times;i++)
				await action.sendKeys(key).perform();
			return true;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}


	async waitUntilDisplayed(element, Twaiting) {
		logger.info("wait until displayed");
		let counter = Twaiting;
		if (counter === undefined) 	counter = 180;
		try {
			do {
				await this.driver.sleep(333);
				if (await this.isElementDisplayed(element)) return true;
			} while (counter-- > 0);
			return false;
		} catch(err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async waitUntilLocated(element, Twaiting) {
		logger.info("wait until located");
		let counter = Twaiting;
		if (counter === undefined) 	counter = 180;
		try {
			do {
				await this.driver.sleep(333);
				if (await this.isElementLocated(element)) return true;
			} while (counter-- > 0);

			return false;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async isElementLocated(element) {
		logger.info("is element located: ");
		return (await this.driver.findElements(element)).length >0;
	}

	async isElementDisplayed(element) {
		logger.info("is element displayed: ");
		try {
			if (element.constructor.name !== "WebElement") {
			  return await this.driver.findElement(element).isDisplayed();
			}
			else
			  return element.isDisplayed();
		} catch (err) {
			logger.info("Error "+err);
			return false;
		}
	}

	async isElementDisabled(element) {
		logger.info("is element disabled :" +element);
		try {
		  let field;
		  if (element.constructor.name !== "WebElement") {
		    field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
		  }
			else field = element;

		  return await this.driver.wait(webdriver.until.elementIsDisabled(field), 100);
		}
		catch(err) {
		  logger.info("element enabled or does not present");
		  return false;
		}
	}

	async getAttribute(element,attr) {
		logger.info("get attribute = "+attr+ "for element = "+element);
		try {
			let field;
			if (element.constructor.name !== "WebElement") {
				field = await this.driver.wait(webdriver.until.elementLocated(element), Twait);
			}
			else field = element;
			let result = await field.getAttribute(attr);
			logger.info("received value= " + result);
			return result;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async getTextForElement(element,Twaiting) {
		logger.info("get text for element : ");
		try {
			if (Twaiting === undefined) Twaiting = 180;
			let field;
			if (element.constructor.name !== "WebElement") {
				field = await this.driver.wait(webdriver.until.elementLocated(element), Twaiting);
			}
			else field = element;
			let result = await field.getText();
			if (result.length < 100) logger.info("text received: " + result);
			return result;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async getUrl() {
		logger.info("get current page URL ");
		return await this.driver.getCurrentUrl();
	}

	async open (url) {
		logger.info("open: "+url);
		try {
			await this.driver.get(url);
			logger.info("Current URL: " + await this.driver.getCurrentUrl());
			logger.info("Current HANDLE: " + await this.driver.getWindowHandle());
			return true;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async  isDisplayedLoader() {
		logger.info("is loader displayed :");
		try {
			return await this.isElementDisplayed(loaderNotDisplayed);
		}
		catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}

	async waitUntilLoaderGone() {
		logger.info("wait until loader gone :");
		return await this.waitUntilLocated(loaderNotDisplayed);
	}

	async refresh() {
		logger.info("refresh :");
		try {
			await this.driver.navigate().refresh();
			return true;
		} catch (err) {
			logger.info("Error: "+err);
			return false;
		}
	}


//////////////////weird
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





	  async goBack() {
	    logger.info("go back :");
		this.driver.navigate().back();
	  }

	async switchToNextPage() {
		logger.info("switch to next tab :");
		let allHandles=[];
		let curHandle;
		try {
			allHandles = await this.driver.getAllWindowHandles();
			curHandle = await this.driver.getWindowHandle();
			if (allHandles.length>2) {
				let arr=[];
				arr[0]=allHandles[0];
				arr[1]=allHandles[1];
				allHandles=arr;
				logger.info("Browser has " + allHandles.length+" tabs");
			}
			let handle;
			for (let i = 0; i < allHandles.length; i++) {
				if (curHandle !== allHandles[i]) {
					handle = allHandles[i];
					break;
				}
			}
			await this.driver.switchTo().window(handle);
			logger.info("Current handle  = "+ curHandle);
			logger.info("Switch to handle  = "+ handle);
			await this.driver.sleep(500);
			return true;

		} catch (err) {
			logger.info("can't switch to next tab "+err);
			logger.info("current handle: "+curHandle);
			return false;
		}
	}




}
module.exports.Page=Page;
