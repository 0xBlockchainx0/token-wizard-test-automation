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
const adj="";
const buttonDistribute=By.xpath("//*[contains(text(),'Distribute reserved tokens')]");
const buttonFinalize=By.xpath("//*[contains(text(),'Finalize Crowdsale')]");
const buttonYesFinalize=By.className("swal2-confirm swal2-styled");
const buttonSave=By.className("no_arrow button button_fill");

const warningEndTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[2]/div[2]/p[2]");
const warningEndTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[2]/p[2]");
const warningStartTimeTier2=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[1]/div[2]/div[1]/p[2]");
const warningStartTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[4]/div/div[2]/div[2]/div[1]/p[2]");

class ManagePage extends Page  {

    constructor(driver,crowdsale) {
        super(driver);
        this.URL;
        this.name="Manage page: ";
        this.crowdsale=crowdsale;
	    this.fieldNameTier=[];
	    this.fieldWalletAddressTier=[];
	    this.fieldStartTimeTier=[];
	    this.fieldEndTimeTier=[];
	    this.fieldRateTier=[];
	    this.fieldSupplyTier=[];
	    this.fieldWhAddressTier=[];
	    this.fieldMinTier=[];
	    this.fieldMaxTier=[];
	    this.buttonAddWh=[];

	    this.buttonDistribute;
    }
    async initButtonDistribute() {
	    let locator = buttonDistribute;
	    let arr = await super.findWithWait(locator);
	    this.buttonDistribute=arr[1];

	   // console.log("LLL buttonDistribute"+ arr.length) ;
    }

    async initButtons(){
		let locator = By.className("button button_fill button_fill_plus");
		let arr = await super.findWithWait(locator);
		for (let i=0; i<arr.length;i++)
		    this.buttonAddWh[i]=arr[i];
	}

	async initInputs() {
		let locator = By.className("input");
		let arr = await super.findWithWait(locator);
		let amountTiers=1;
		let tierLength=6;

		if (arr.length>9) {
			amountTiers=2;}
		if ((arr.length>15)||(arr.length==9)) tierLength=9;
	    for (var i=0;i<amountTiers;i++) {
	         this.fieldNameTier[i]=arr[i*tierLength+0];
	         this.fieldWalletAddressTier[i]=arr[i*tierLength+1];
	         this.fieldStartTimeTier[i]=arr[i*tierLength+2];
	         this.fieldEndTimeTier[i]=arr[i*tierLength+3];
	         this.fieldRateTier[i]=arr[i*tierLength+4];
	         this.fieldSupplyTier[i]=arr[i*tierLength+5];
	         this.fieldWhAddressTier[i]=undefined;
	         this.fieldMinTier[i]=undefined;
	         this.fieldMaxTier[i]=undefined;

		    if ((tierLength==9)||(tierLength==18)) {
			     this.fieldWhAddressTier[i]=arr[i*tierLength+6];
			     this.fieldMinTier[i]=arr[i*tierLength+7];
			     this.fieldMaxTier[i]=arr[i*tierLength+8];
			}
	    }

	    if (arr.length==15) {
			this.fieldWhAddressTier[1]=arr[12];
			this.fieldMinTier[1]=arr[13];
			this.fieldMaxTier[1]=arr[14];
		}
    }

	async getNameTier(tier) {
	    await this.initInputs();
	    return await super.getAttribute(this.fieldNameTier[tier-1],"value");
    }

    async isDisabledNameTier(tier) {
	    await this.initInputs();
	    return await this.isElementDisabled(this.fieldNameTier[tier - 1]);
	}

	async getWalletAddressTier(tier) {
	    await this.initInputs();
	    return await super.getAttribute(this.fieldWalletAddressTier[tier-1],"value");
	}

	async isDisabledWalletAddressTier(tier) {
	    await this.initInputs();
	    return await this.isElementDisabled(this.fieldWalletAddressTier[tier - 1]);
	}

	async getRateTier(tier){
	    await this.initInputs();
	    return await super.getAttribute(this.fieldRateTier[tier-1],"value");
	}

	async getSupplyTier(tier){
	    await this.initInputs();
	    return await super.getAttribute(this.fieldSupplyTier[tier-1],"value");
	}

    async getStartTimeTier(tier){
    	await this.initInputs();
		return await super.getAttribute(this.fieldStartTimeTier[tier-1],"value");
	}

	async getEndTimeTier(tier){
	    await this.initInputs();
    	return await super.getAttribute(this.fieldEndTimeTier[tier-1],"value");
	}

    async clickButtonSave(){
	    logger.info(this.name+"button Save :");
	    return await super.clickWithWait(buttonSave);
    }

	async isPresentWarningStartTimeTier1(){
		try {
		logger.info(this.name+"red warning if data wrong :");
		let result=await super.getTextByLocatorFast(warningStartTimeTier1);
		logger.info("Text="+result);
			return (result!=="");
		}
		catch(err) {
			logger.info(err);
			 return false;
		}
	}

	async isPresentWarningStartTimeTier2() {
    	try {
		    logger.info(this.name + "red warning if data wrong :");
		    await this.driver.sleep(1000);
		    let result = await super.getTextByLocatorFast(warningStartTimeTier2);
		    logger.info("Text=" + result);
		    return (result!=="");
	    }
	    catch(err) {
    		logger.info (err);
    		return false;
    	}
	}

	async isPresentWarningEndTimeTier2(){
		logger.info(this.name+"red warning if data wrong :");
		await this.driver.sleep(1000);
		let result=await super.getTextByLocatorFast(warningEndTimeTier2);
		logger.info("Text="+result);
		return (result!=="");
	}
    async isPresentWarningEndTimeTier1(){
	    logger.info(this.name+"red warning if data wrong :");
    	await this.driver.sleep(500);
    	var result=await super.getTextByLocatorFast(warningEndTimeTier1);
    	logger.info("Text="+result);
    	return (result!=="");
    }



	async fillWhitelist(tier,address,min,max) {

	    await this.initInputs();
	    try {
	       if (this.fieldWhAddressTier[tier-1]==undefined) {
	        throw ("WhiteList address field  not present");
	       }

		   logger.info(this.name + "add address in whitelist, tier #1 :");
	       await super.fillWithWait(this.fieldMinTier[tier-1], min);
	       await super.fillWithWait(this.fieldMaxTier[tier-1], max);
	       await super.fillWithWait(this.fieldWhAddressTier[tier-1], address);
	       await this.initButtons();
	       await super.clickWithWait(this.buttonAddWh[tier-1]);
		   return await this.clickButtonSave();

	    }
	       catch(err) {
	    	logger.info("Can't fill out whitelist. Field DISABLED."+err);
	        return false;
	       }
	}

    async fillEndTimeTier(tier,date,time) {
	    await this.initInputs();
	    logger.info(this.name+"fill end time, tier #"+tier+":");
        if( await this.isElementDisabled(this.fieldEndTimeTier[tier-1]))
        	return false;
	    await super.fillWithWait(this.fieldEndTimeTier[tier-1],date);
	    const action=this.driver.actions();
	    await action.sendKeys(key.TAB).perform();
        await super.fillWithWait(this.fieldEndTimeTier[tier-1],time);
	    return true;
    }


	async fillStartTimeTier(tier,date,time) {
	    await this.initInputs();
	 	logger.info(this.name+"fill start time,tier #"+tier+":");
	    if( await this.isElementDisabled(this.fieldStartTimeTier[tier-1]))
	    	return false;
		await super.fillWithWait(this.fieldStartTimeTier[tier-1],date);
		const action=this.driver.actions();
		await action.sendKeys(key.TAB).perform();
		await super.fillWithWait(this.fieldStartTimeTier[tier-1],time);
		return true;
	}

	async fillRateTier(tier,rate) {
		await this.initInputs();
		logger.info(this.name+"fill Rate,tier #"+tier+":");
		await super.clearField(this.fieldRateTier[tier-1]);
		await super.fillWithWait(this.fieldRateTier[tier-1],rate);
    }

    async fillSupplyTier(tier,rate) {
		await this.initInputs();
		logger.info(this.name+"fill Supply,tier #"+tier+":");
		await super.clearField(this.fieldSupplyTier[tier-1]);
		await super.fillWithWait(this.fieldSupplyTier[tier-1],rate);
	}

	async open() {
	    logger.info(this.name+":");
	    await super.open(this.URL);
	}

	async isEnabledDistribute() {

		logger.info(this.name + "button Distribute :");
		await this.initButtonDistribute();
		await this.refresh();
		await this.driver.sleep(2000);
		if (!(await this.isPresentButtonDistribute())) {
			logger.info("not present");
			return false;
		}

		await this.driver.sleep(1000);
		let result =await this.buttonDistribute.getAttribute("class");
		logger.info("class name= " + result);


		if (result === "button button_disabled") {
			logger.info("present and disabled");
			return false;
		}
		else {
			logger.info("present and enabled");
			return true;
		}
	}

	async isPresentButtonDistribute() {

	    logger.info(this.name+"button Distribute :");
		await this.initButtonDistribute();
	    return await super.isElementPresent(this.buttonDistribute);

	}

	async clickButtonDistribute() {
	     logger.info(this.name+"button Distribute :");
	    await this.initButtonDistribute();
	     await super.clickWithWait(this.buttonDistribute);
	}

	async isEnabledFinalize(){
        logger.info(this.name+"button Finalize :");
        let button=await this.getButtonFinalize();
        let result=await button.getAttribute("class");
        if (result==="button button_fill") {
            logger.info("present and enabled");
            return true;
        }
            else {
	            logger.info("present and enabled");
                return false;
            }
    }

    async getButtonFinalize() {
        return await super.findElementInArray(buttonFinalize, "button");
    }

    async clickButtonFinalize() {
        logger.info(this.name+"button Finalize :");
        let button=await this.getButtonFinalize();
        button.click();
    }

    async clickButtonYesFinalize() {
        logger.info(this.name+"confirm Finalize/Yes :");
        await super.clickWithWait(buttonYesFinalize);
    }

    async isPresentPopupYesFinalize() {
    	logger.info(this.name+"confirm Finalize/Yes :");
        return await super.isElementPresent(buttonYesFinalize);
    }

	async isPresentButtonOK(){
	    logger.info(this.name+"button OK :");
	    return await super.isElementPresent(buttonOk);
	}

	async clickButtonOK() {
		logger.info(this.name + "button OK :");
		await super.clickWithWait(buttonOk);
	}

	async confirmPopup(){
	    logger.info(this.name+"confirm popup Distribute/Finalize :");
	    let result=0;
	    let limit=10;
	    do {
	       await this.driver.sleep(1000);
	       if (await this.isPresentButtonOK()) {
	          await this.clickButtonOK();
	          return true;
	       }
	       result++;
	       if(result>=limit) {
	       	   return false;
	       }
	       } while(true);
	}

}
module.exports={
    ManagePage:ManagePage
}
