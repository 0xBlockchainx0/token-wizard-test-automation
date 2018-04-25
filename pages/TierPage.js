const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const key = require('selenium-webdriver').Key;
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const wizardStep3=require("./WizardStep3.js");
var COUNT_TIERS;
const itemsRemove=By.className("item-remove");
const buttonAdd=By.className("button button_fill button_fill_plus");
const WhitelistContainer=By.className("white-list-item-container-inner");
const buttonYesAlert=By.className("swal2-confirm swal2-styled");




class TierPage extends page.Page {

    constructor(driver,tier){
        super(driver);
        this.URL;
        this.tier=tier;
	    COUNT_TIERS=wizardStep3.WizardStep3.getCountTiers();
        this.number=COUNT_TIERS++;
	    wizardStep3.WizardStep3.setCountTiers(COUNT_TIERS);
        this.name="Tier #"+this.number+": ";

	    this.fieldNameTier;
	    this.fieldStartTimeTier;
	    this.fieldEndTimeTier;
	    this.fieldRateTier;
	    this.fieldSupplyTier;
	    this.fieldWhAddressTier;
	    this.fieldMinTier;
	    this.fieldMaxTier;
	    this.checkboxModifyOn;
	    this.checkboxModifyOff;
	    this.itemsRemove=[];
	    this.warningName;
	    this.warningStartTime;
	    this.warningEndTime;
	    this.warningRate;
	    this.warningSupply;
	    this.warningRate;
	    this.warningWhAddress;
	    this.warningWhMin;
	    this.warningWhMax;
    }


	async initWarnings(){
		try {
			logger.info(this.name + " :init warnings:");
			const locator = By.xpath("//p[@style='color: red; font-weight: bold; font-size: 12px; width: 100%; height: 10px;']");
			var arr = await super.findWithWait(locator);

			let ci_tresh=2;
			let ci_mult=5;

			if (wizardStep3.WizardStep3.getFlagCustom()) ci_tresh=3;
			if (wizardStep3.WizardStep3.getFlagWHitelising()) ci_mult=8;
			this.warningName = arr[ci_tresh+(this.number)*ci_mult];
			this.warningStartTime=arr[ci_tresh+(this.number)*ci_mult+1];
			this.warningEndTime=arr[ci_tresh+(this.number)*ci_mult+2];
			this.warningRate=arr[ci_tresh+(this.number)*ci_mult+3];
			this.warningSupply=arr[ci_tresh+(this.number)*ci_mult+4];
			this.warningWhAddress=arr[ci_tresh+(this.number)*ci_mult+5];
			this.warningWhMin=arr[ci_tresh+(this.number)*ci_mult+6];
			this.warningWhMax=arr[ci_tresh+(this.number)*ci_mult+7];
			return arr;
		}
		catch(err){
			logger.info(this.name+": dont contain warning elements");
			return null;
		}
	}






	async initItemsRemove(){
		var arr = await super.findWithWait(itemsRemove);
		for (var i=0;i<arr.length;i++)
		{
			this.itemsRemove[i]=arr[i];
		}

		return arr;
	}
	async initWhitelistContainer(){

		var arr = await super.findWithoutWait(WhitelistContainer);
		return arr;

	}
	async isPresentWhitelistContainer(){
    	await this.init();
    	if (this.fieldWhAddressTier!= undefined) return true;
    	else return false;
	}



	async init() {
try {
	let locator = By.className("input");
	let arr = await super.findWithWait(locator);
	let ci_tresh = 2;
	let ci_mult = 5;

	if (wizardStep3.WizardStep3.getFlagCustom()) ci_tresh = 3;
	if (wizardStep3.WizardStep3.getFlagWHitelising()) ci_mult = 8;

	this.fieldNameTier = arr[ci_tresh + (this.number) * ci_mult];
	this.fieldStartTimeTier = arr[ci_tresh + (this.number) * ci_mult + 1];
	this.fieldEndTimeTier = arr[ci_tresh + (this.number) * ci_mult + 2];
	this.fieldRateTier = arr[ci_tresh + (this.number) * ci_mult + 3];
	this.fieldSupplyTier = arr[ci_tresh + (this.number) * ci_mult + 4];
	this.fieldWhAddressTier = arr[ci_tresh + (this.number) * ci_mult + 5];
	this.fieldMinTier = arr[ci_tresh + (this.number) * ci_mult + 6];
	this.fieldMaxTier = arr[ci_tresh + (this.number) * ci_mult + 7];
	return arr;
}
catch(err) {
	logger.info(this.name+": dont contain warning elements");
	return null;

}

	}



	async initCheckboxes(){
    	try {
		    let locator = By.className("radio-inline");
		    let arr = await super.findWithWait(locator);

		    this.checkboxModifyOn = arr[6 + 2 * this.number];
		    this.checkboxModifyOff = arr[7 + 2 * this.number];
		    return arr;
	    }
	    catch(err) {
		    logger.info(this.name+": dont contain warning elements");
		    return null;
	    }


	}

	async fillTier()
    {   logger.info(this.name+"fill tier: ");

	    do {
		    await this.fillRate();

	    }
	    while(await this.isPresentWarningRate());

	    do {
		    await this.fillSetupName();

	    }
	    while(await this.isPresentWarningName());

	    do {
	    	await this.fillSupply();

	    }
	    while(await this.isPresentWarningSupply());

	     do {
		    await this.fillStartTime();
	    }
	    while(await this.isPresentWarningStartTime());
	    do {
	    	await this.fillEndTime();
	    }
	    while(await this.isPresentWarningEndTime());

	    await this.setModify();


        if (this.tier.whitelist!=null) await this.fillWhitelist();

    }

    async fillSetupName()
    {
    	await this.init();
        logger.info(this.name+"field SetupName: ");
        let locator=this.fieldNameTier;
        await super.clearField(locator);
        await  super.fillWithWait(locator,this.tier.name);

    }

    async fillRate()
    {
    	let arr = await this.init();
	    //console.log(arr.length);

    	logger.info(this.name+"field Rate: ");
    	//console.log(this.fieldRateTier);
        let locator=this.fieldRateTier;
	    //console.log(locator.constructor.name);
        await super.clearField(locator);
        //console.log(this.tier.rate);
        let result=await super.fillWithWait(locator,this.tier.rate);
        //await this.driver.sleep(10000);
        return result;
    }

    async fillSupply()
    {  await this.init();
    	logger.info(this.name+"field Supply: ");
        let locator=this.fieldSupplyTier;
       // await super.clearField(locator);
	    let result = await super.fillWithWait(locator,this.tier.supply);
	    //await this.driver.sleep(10000);
	    return result;

    }

    async setModify() {
        logger.info(this.name+"checkbox Modify: ");
        await this.initCheckboxes();

	    if (this.tier.allowModify) {
		    await super.clickWithWait(this.checkboxModifyOn);
	    }

    }
    async fillStartTime()
    {
	    await this.init();
        logger.info(this.name+"field StartTime: ");

	    let locator=this.fieldStartTimeTier;
	    var format=await Utils.getDateFormat(this.driver);



	    if((this.tier.startDate==""))
	    {
		    this.tier.startDate=Utils.getDateWithAdjust(80000,format);
		    this.tier.startTime=Utils.getTimeWithAdjust(80000,format);

	    } else
	    if (format=="mdy") {
	        this.tier.startDate=Utils.convertDateToMdy(this.tier.startDate);
		    this.tier.startTime=Utils.convertTimeToMdy(this.tier.startTime);

	    }
	    await super.clickWithWait(locator);
	    await super.fillWithWait(locator,this.tier.startDate);
        const action=this.driver.actions();
        await action.sendKeys(key.TAB).perform();
        await super.fillWithWait(locator,this.tier.startTime);


    }
    async fillEndTime()
    {
	    await this.init();
        logger.info(this.name+"field EndTime: ");

        let locator=this.fieldEndTimeTier;
        var format=await Utils.getDateFormat(this.driver);

        if (! this.tier.endDate.includes("/"))
        {
	         this.tier.endTime=Utils.getTimeWithAdjust(parseInt(this.tier.endDate),"utc");
        	 this.tier.endDate=Utils.getDateWithAdjust(parseInt(this.tier.endDate),"utc");
        }


        if((this.tier.endDate=="")) return;
	    else
	    if (format=="mdy") {
		    this.tier.endDate=Utils.convertDateToMdy(this.tier.endDate);
		    this.tier.endTime=Utils.convertTimeToMdy(this.tier.endTime);

	    }
	    await super.clickWithWait(locator);
	    await super.fillWithWait(locator,this.tier.endDate);
        const action=this.driver.actions();
        await action.sendKeys(key.TAB).perform();
        await super.fillWithWait(locator,this.tier.endTime);



    }

    async fillWhitelist(){

    	try {


		    for (var i = 0; i < this.tier.whitelist.length; i++) {
			    logger.info(this.name + "whitelist #" + i + ": ");

			    do {
				    await this.fillAddress(this.tier.whitelist[i].address);
			    }
			    while(await this.isPresentWarningWhAddress());
			    do {
				    await this.fillMin(this.tier.whitelist[i].min);
			    }
			    while(await this.isPresentWarningWhMin());
			    do {
				    await this.fillMax(this.tier.whitelist[i].max);
			    }
			    while(await this.isPresentWarningWhMax());
			    await this.clickButtonAdd();
		    }
		    return true;
	    }
	    catch (err){return false;}

    }
    async fillAddress(address){
	    await this.init();
        logger.info(this.name+"field Address: ");
        let locator=this.fieldWhAddressTier;

	    await super.clearField(this.fieldWhAddressTier);
        await super.fillWithWait(locator,address);

    }
    async fillMin(value){
	    await this.init();
        logger.info(this.name+"field Address: ");
        let locator=this.fieldMinTier;
	    await super.clearField(this.fieldMinTier);
        await super.fillWithWait(locator,value);
    }
    async fillMax(value){
	    await this.init();
        logger.info(this.name+"field Max: ");
        let locator=this.fieldMaxTier;
	    await super.clearField(this.fieldMaxTier);
        await super.fillWithWait(locator,value);
    }
    async clickButtonAdd(){
        logger.info(this.name+"button Add: ");
        return await super.clickWithWait(buttonAdd);
    }
	async removeWhiteList(number)
	{
		await this.initItemsRemove();
		await super.clickWithWait(this.itemsRemove[number]);

	}

	async amountAddedWhitelist(){
		try {
			let arr = await this.initWhitelistContainer();
			logger.info("Whitelisted addresses added=" + arr.length);
			return arr.length;
		}
		catch(err){
			return 0;
		}

	}

    async clickButtonClearAll() {

	    logger.info(this.name+": clickButtonClearAll:");
    	try {

	         await this.driver.executeScript("document.getElementsByClassName('fa fa-trash')[0].click();");
             return true;
        }
	        catch (err) {
    		logger.info(err);
	            return false;
		    }

	}


	async clickButtonYesAlert() {
		try {
			logger.info(this.name+": clickButtonYesAlert:");
			await super.clickWithWait(buttonYesAlert);
			return true;
		}
		catch (err) {
			return false;
		}
	}


	async isPresentWarningName(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningName);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningStartTime(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningStartTime);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningEndTime(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningEndTime);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningRate(){
		logger.info(this.name + "is present warning :");
		return false;

		await this.initWarnings();
		let s = await super.getTextByElement(this.warningRate);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningSupply(){
		logger.info(this.name + "is present warning :");
		return false;
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningSupply);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhAddress(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningWhAddress);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhMin(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningWhMin);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhMax(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningWhMax);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}

	async uploadWhitelistCSVFile(){

		try {
			let path = await Utils.getPathToFileInPWD("bulkWhitelist.csv");
			logger.info(this.name+": uploadWhitelistCSVFile: from path: "+path);
			const locator=By.xpath('//input[@type="file"]');
			let element = await this.driver.findElement(locator);
			await element.sendKeys(path);

			return true;
		}
		catch (err){
			logger.info(err);
			return false;
		}

	}


}
module.exports.TierPage=TierPage;
