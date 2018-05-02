const logger = require('../entity/Logger.js').logger;
const key = require('selenium-webdriver').Key;
const Page =require('./Page.js').Page;
const By = require('selenium-webdriver/lib/by').By;
const Utils = require('../utils/Utils.js').Utils;
const wizardStep3 = require("./WizardStep3.js");
const itemsRemove = By.className("item-remove");
const buttonAdd = By.className("button button_fill button_fill_plus");
const WhitelistContainer = By.className("white-list-item-container-inner");
const buttonClearAll = By.className("fa fa-trash");
const buttonYesAlert = By.className("swal2-confirm swal2-styled");

let COUNT_TIERS;

class TierPage extends Page {

    constructor(driver,tier) {
        super(driver);
        this.URL;
        this.tier=tier;

        COUNT_TIERS=wizardStep3.WizardStep3.getCountTiers();
        this.number=COUNT_TIERS++;
	    wizardStep3.WizardStep3.setCountTiers(COUNT_TIERS);

	    this.name="Tier #"+this.number+": ";

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

    async getFieldSetupName () {
	    logger.info(this.name+"getFieldSetupName ");
    	const locator = By.id("tiers[" + this.number +"].tier");
    	return await super.getElement(locator);
    }

	async fillSetupName() {
		logger.info(this.name+"fillSetupName ");
		let element = await this.getFieldSetupName();
	 	return await super.clearField(element) &&
			   await super.fillWithWait(element,this.tier.name);
	}

	async getFieldRate () {
		logger.info(this.name+"getFieldRate ");
		const locator = By.id("tiers[" + this.number +"].rate");
		return await super.getElement(locator);
	}

	async fillRate() {
		logger.info(this.name+"fillRate ");
		let element = await this.getFieldRate();
		return await super.clearField(element) &&
			   await super.fillWithWait(element,this.tier.rate);
	}

	async getFieldSupply () {
		logger.info(this.name+"getFieldSupply ");
		const locator = By.id("tiers[" + this.number +"].supply");
		return await super.getElement(locator);
	}

	async fillSupply() {
		logger.info(this.name+"fillSupply ");
		let element = await this.getFieldSupply();
		return await super.clearField(element) &&
			   await super.fillWithWait(element,this.tier.supply);
	}

	async getFieldStartTime () {
		logger.info(this.name+"getFieldStartTime ");
		const locator = By.id("tiers[" + this.number +"].startTime");
		return await super.getElement(locator);
	}

	async fillStartTime() {
		logger.info(this.name+"fillStartTime ");
    	//if(this.tier.startDate === "") return true;
		let locator = await this.getFieldStartTime();
		let format=await Utils.getDateFormat(this.driver);
		if (this.tier.startDate === "") {
			this.tier.startDate=Utils.getDateWithAdjust(80000,format);
			this.tier.startTime=Utils.getTimeWithAdjust(80000,format);
		}
		else
			if (format === "mdy") {
				this.tier.startDate=Utils.convertDateToMdy(this.tier.startDate);
				this.tier.startTime=Utils.convertTimeToMdy(this.tier.startTime);
		}
		return await super.clickWithWait(locator) &&
               await super.fillWithWait(locator,this.tier.startDate) &&
			   await super.pressKey(key.TAB,1) &&
			   await super.fillWithWait(locator,this.tier.startTime);
	}

	async getFieldEndTime () {
		logger.info(this.name+"getFieldEndTime ");
		const locator = By.id("tiers[" + this.number +"].endTime");
		return await super.getElement(locator);
	}

	async fillEndTime()	{
		logger.info(this.name+"fillEndTime ");
		//if (this.tier.endDate === "") return true;
		let locator = await this.getFieldEndTime();
		let format=await Utils.getDateFormat(this.driver);
		if (! this.tier.endDate.includes("/")) {
			this.tier.endTime=Utils.getTimeWithAdjust(parseInt(this.tier.endDate),"utc");
			this.tier.endDate=Utils.getDateWithAdjust(parseInt(this.tier.endDate),"utc");
		}
		else
			if (format === "mdy") {
				this.tier.endDate=Utils.convertDateToMdy(this.tier.endDate);
				this.tier.endTime=Utils.convertTimeToMdy(this.tier.endTime);
			}
		return await super.clickWithWait(locator) &&
			   await super.fillWithWait(locator,this.tier.endDate) &&
			   await super.pressKey(key.TAB,1) &&
		       await super.fillWithWait(locator,this.tier.endTime);
	}

	async initItemsRemove() {
		logger.info(this.name+"initItemsRemove ");
		try {
			let array = await super.findWithWait(itemsRemove);
			for (let i = 0; i < array.length; i++) {
				this.itemsRemove[i] = array[i];
			}
			return array;
		}
		catch(err) {
			logger.info("Error: " + err);
			return null;
		}
	}

	async initWhitelistFields() {
		logger.info(this.name+"initWhitelistContainer ");
		let locator = By.className("input");
		let array = await super.findWithWait(locator);
		if ((await super.findWithWait(WhitelistContainer)).length() >0 ) {
			this.fieldWhAddressTier = array[8];
			this.fieldMinTier = array[9];
			this.fieldMaxTier = array[10];
		}

		//if (await super.findWithWait(WhitelistContainer)) && (await )

		return array;
	}



////////////////////////

	async initCheckboxes() {
		logger.info(this.name + "initCheckboxes ");
		try {
			const locator = By.className("radio-inline");
			let array = await super.findWithWait(locator);
			this.checkboxModifyOn = array[6 + 2 * this.number];
			this.checkboxModifyOff = array[7 + 2 * this.number];
		}
		catch(err){
			logger.info("Error: " + err);
			return null;
		}
	}

	async initWarnings() {
		logger.info(this.name + "initWarnings ");
		try {
			const locator = By.xpath("//p[@style='color: red; font-weight: bold; font-size: 12px; width: 100%; height: 10px;']");
			let array = await super.findWithWait(locator);
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
			return array;
		}
		catch(err){
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





    async setModify() {
        logger.info(this.name+"checkbox Modify: ");
        await this.init();

	    if (this.tier.allowModify) {
		    await super.clickWithWait(this.checkboxModifyOn);
	    }

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
        await super.clickWithWait(buttonAdd);
    }
	async removeWhiteList(number)
	{
		await this.initItemsRemove();
		await super.clickWithWait(this.itemsRemove[number]);

	}

	async amountAddedWhitelist(){
		try {
			let arr = await this.initWhitelistContainer()
			logger.info("Whitelisted addresses added=" + arr.length);
			return arr.length;
		}
		catch(err){
			return 0;
		}

	}
async clickButtonClearAll(){
	await super.clickWithWait(buttonClearAll);
}
	async clickButtonYesAlert(){
		await super.clickWithWait(buttonYesAlert);

	}


	async isPresentWarningName(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningName);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningStartTime(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningStartTime);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningEndTime(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningEndTime);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningRate(){
		logger.info(this.name + "is present warning :");
		return false;

		await this.initWarnings();
		let s = await super.getTextForElement(this.warningRate);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningSupply(){
		logger.info(this.name + "is present warning :");
		return false;
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningSupply);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhAddress(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningWhAddress);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhMin(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningWhMin);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningWhMax(){
		logger.info(this.name + "is present warning :");
		return false;
		await this.initWarnings();
		let s = await super.getTextForElement(this.warningWhMax);
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
