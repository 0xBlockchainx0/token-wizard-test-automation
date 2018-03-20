const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const key = require('selenium-webdriver').Key;
const by = require('selenium-webdriver/lib/by');
const page=require('./Page.js');
const Page=page.Page;
const By=by.By;
const utils=require('../utils//Utils.js');
const Utils=utils.Utils;
const buttonOk=By.xpath("/html/body/div[2]/div/div[3]/button[1]");

const modal=By.className("modal");
//const buttonOk=By.className("swal2-confirm swal2-styled");
//const adj="div[1]/";
const adj="";
const buttonDistribute=By.xpath("//*[contains(text(),'Distribute tokens')]");
const buttonFinalize=By.xpath("//*[contains(text(),'Finalize Crowdsale')]");
const buttonYesFinalize=By.className("swal2-confirm swal2-styled");
const buttonSave=By.className("no-arrow button button_fill");

const fieldStartTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[2]/div[1]/input");
const fieldEndTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[2]/div[2]/input");

const fieldWhAddressTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/div[1]/div[1]/div[1]/input");
const fieldWhMinTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/div[1]/div[1]/div[2]/input");
const fieldWhMaxTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/div[1]/div[1]/div[3]/input");

const warningEndTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[2]/div[2]/p[2]");
const warningEndTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[2]/p[2]");

const warningStartTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[1]/p[2]");

const warningStartTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/p[2]");

const fieldStartTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[1]/input");
const fieldEndTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[2]/input");

const fieldWhAddressTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/div[1]/div[1]/input");
const fieldWhMinTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/div[1]/div[2]/input");
const fieldWhMaxTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/div[1]/div[3]/input");

const buttonWhAddTier1=By.xpath("//*[@id=\"root\"]/div/section/div[3]/div/div[3]/div[2]/div[1]/div[2]/div");

const buttonWhAddTier2=By.xpath("//*[@id=\"root\"]/div/section/div[4]/div/div[2]/div[2]/div[1]/div[2]/div");
//const fieldWhAddressTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/div[1]/div[1]/div[1]/input");
//const fieldWhAddressTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/div[1]/div[1]/input");

//const fieldMinTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/div[1]/div[1]/div[2]/input");
//const fieldMinTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/div[1]/div[2]/input");



class ManagePage extends Page
{
    constructor(driver) {
        super(driver);
        this.URL;
        this.name="Manage page: ";

    }
	async getStartTimeTier1(){
		return await super.getAttributeByLocator(fieldStartTimeTier1,"value");

	}
	async getStartTimeTier2(){
		return await super.getAttributeByLocator(fieldStartTimeTier2,"value");

	}

	async getEndTimeTier1(){
    	return await super.getAttributeByLocator(fieldEndTimeTier1,"value");

	}
	async getEndTimeTier2(){
		return await super.getAttributeByLocator(fieldEndTimeTier2,"value");

	}

    async clickButtonSave(){
	    logger.info(this.name+"button Save :");
	    await super.clickWithWait(buttonSave);


    }
	async isPresentWarningStartTimeTier1(){
		try {
		logger.info(this.name+"red warning if data wrong :");
		await this.driver.sleep(1000);
		var s=await super.getTextByLocator(warningStartTimeTier1);
		logger.info("Text="+s);
			return (s!="");
		}
		catch(err){console.log(err); return false;}

	}
	async isPresentWarningStartTimeTier2(){
    	try {
		    logger.info(this.name + "red warning if data wrong :");
		    await this.driver.sleep(1000);
		    var s = await super.getTextByLocator(warningStartTimeTier2);
		    logger.info("Text=" + s);
		    return (s!="");
	    }
	    catch(err){console.log(err);return false;}


	}

	async isPresentWarningEndTimeTier2(){
		logger.info(this.name+"red warning if data wrong :");
		await this.driver.sleep(1000);
		var s=await super.getTextByLocator(warningEndTimeTier2);
		logger.info("Text="+s);

		return (s!="");
	}
    async isPresentWarningEndTimeTier1(){
	    logger.info(this.name+"red warning if data wrong :");
    	await this.driver.sleep(1000);
    	var s=await super.getTextByLocator(warningEndTimeTier1);
    	logger.info("Text="+s);

    	return (s!="");
    }
async fillWhitelistTier1(address,min,max)
   { try {
   	   if (!(await super.isElementPresentWithWait(fieldWhAddressTier1))){throw ("WhiteList address field  not present");}
	   logger.info(this.name + "add address in whitelist, tier #1 :");
	   await super.fillWithWait(fieldWhAddressTier1, address);
	   await super.fillWithWait(fieldWhMinTier1, min);
	   await super.fillWithWait(fieldWhMaxTier1, max);
	   await super.clickWithWait(buttonWhAddTier1);
	   return true;
   }
   catch(err)
   {logger.info("Can't fill out whitelist. Field DISABLED.\n"+err);
   return false;}



   }
async fillWhitelistTier2(address,min,max)
	{
		try {
			if (!(await super.isElementPresentWithWait(fieldWhAddressTier1))){throw ("WhiteList address field  not present");}
			logger.info(this.name + "add address in whitelist, tier #2 :");
			await super.fillWithWait(fieldWhAddressTier2, address);
			await super.fillWithWait(fieldWhMinTier2, min);
			await super.fillWithWait(fieldWhMaxTier2, max);
			await super.clickWithWait(buttonWhAddTier2);
			return true;
		}
	catch(err)
		{logger.info("Can't fill out whitelist. Field DISABLED.\n"+err);
		return false;x}


	}
    async fillEndTimeTier1(date,time){
          logger.info(this.name+"fill end time, tier #1 :");
	    await super.fillWithWait(fieldEndTimeTier1,date);
          const action=this.driver.actions();
	    await action.sendKeys(key.TAB).perform();
	await super.fillWithWait(fieldEndTimeTier1,time);
    }

    async fillEndTimeTier2(date,time){
	    logger.info(this.name+"fill end time, tier #2 :");
	    await super.fillWithWait(fieldEndTimeTier2,date);
	    const action=this.driver.actions();
	    await action.sendKeys(key.TAB).perform();
		await super.fillWithWait(fieldEndTimeTier2,time);
	}
	async fillStartTimeTier1(date,time){
		logger.info(this.name+"fill start time, tier #1 :");
		await super.fillWithWait(fieldStartTimeTier1,date);
		const action=this.driver.actions();
		await action.sendKeys(key.TAB).perform();
		await super.fillWithWait(fieldStartTimeTier1,time);
	}
	async fillStartTimeTier2(date,time){
		logger.info(this.name+"fill start time, tier #2 :");
		await super.fillWithWait(fieldStartTimeTier2,date);
		const action=this.driver.actions();
		await action.sendKeys(key.TAB).perform();
		await super.fillWithWait(fieldStartTimeTier2,time);
	}



	async open(){
    logger.info(this.name+":");
    await super.open(this.URL);

}
async isAvailable(){

       logger.info(this.name+"Modal :");
       return (await super.isElementPresent(modal));
}
/////////////////////////////////
async isEnabledDistribute(){
	//await this.driver.sleep(3000);
    logger.info(this.name+"button Distribute :")
    if (!(await this.isPresentButtonDistribute()))
    {return false;}
    //await this.driver.sleep(3000);
    var s=await this.driver.findElement(buttonDistribute).getAttribute("className");///!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (s=="button button_disabled")
    {logger.info("present and disabled");
     return false;}
    else
    {   logger.info("present and enabled")
        return true;
    }

}
async isPresentButtonDistribute(){
    logger.info(this.name+"button Distribute :");
    var s=await super.isElementPresent(buttonDistribute);
    return s;
}

async clickButtonDistribute(){
     logger.info(this.name+"button Distribute :");
     await super.clickWithWait(buttonDistribute);
}
////////////////////////////////////////////////////
    async isEnabledFinalize(){
        logger.info(this.name+"button Finalize :");
        var button=await this.getButtonFinalize();
        //await this.driver.sleep(3000);
        var s=await button.getAttribute("className");

        //console.log("ClassNAme"+s);
        if (s=="button button_fill")
        {
            logger.info("present and enabled");
            return true;}
        else
        {   logger.info("disabled");
            return false;}

    }
    async getButtonFinalize() {

        var s = await super.findElementInArray(buttonFinalize, "button");
        return s;
    }

    async clickButtonFinalize(){
        logger.info(this.name+"button Finalize :");
        var button=await this.getButtonFinalize();
        //console.log("Button"+await button.getAttribute("className"));
        button.click();
    }


    async clickButtonYesFinalize(){
        logger.info(this.name+"confirm Finalize/Yes :");
        await super.clickWithWait(buttonYesFinalize);
    }

    async isPresentPopupYesFinalize()
    {  logger.info(this.name+"confirm Finalize/Yes :");
        return await super.isElementPresent(buttonYesFinalize);
    }



async isPresentButtonOK(){
    logger.info(this.name+"button OK :");
    return await super.isElementPresent(buttonOk);
}
async clickButtonOK(){
      logger.info(this.name+"button OK :");
      await super.clickWithWait(buttonOk);
   // await super.oneClick(buttonOk);

}
async confirmPopup(){
    logger.info(this.name+"confirm popup Distribute/Finalize :");
   // return true;
        var c=0;
        var limit=10;
        do {
            await this.driver.sleep(1000);
            if (await this.isPresentButtonOK()) {

                await this.clickButtonOK();
                return true;
            }

            c++;
            if(c>=limit){return false;}

        }while(true);
}









}
module.exports={
    ManagePage:ManagePage
}