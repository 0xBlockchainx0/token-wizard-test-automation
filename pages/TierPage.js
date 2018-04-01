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
const wizardStep3=require("./WizardStep3.js");
const Utils=utils.Utils;

var COUNT_TIERS;
const itemsRemove=By.className("item-remove");
const buttonAdd=By.className("button button_fill button_fill_plus");
const WhitelistContainer=By.className("white-list-item-container-inner");
const buttonClearAll=By.className("fa fa-trash");
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

		var arr = await super.findWithWait(WhitelistContainer);
		return arr;

	}



	async init(){

		var locator = By.className("input");
		var arr = await super.findWithWait(locator);
		let ci_tresh=2;
		let ci_mult=5;

		if (wizardStep3.WizardStep3.getFlagCustom()) ci_tresh=3;
		if (wizardStep3.WizardStep3.getFlagWHitelising()) ci_mult=8;

		this.fieldNameTier = arr[ci_tresh+(this.number)*ci_mult];
		this.fieldStartTimeTier=arr[ci_tresh+(this.number)*ci_mult+1];
		this.fieldEndTimeTier=arr[ci_tresh+(this.number)*ci_mult+2];
		this.fieldRateTier=arr[ci_tresh+(this.number)*ci_mult+3];
		this.fieldSupplyTier=arr[ci_tresh+(this.number)*ci_mult+4];
		this.fieldWhAddressTier=arr[ci_tresh+(this.number)*ci_mult+5];
		this.fieldMinTier=arr[ci_tresh+(this.number)*ci_mult+6];
		this.fieldMaxTier=arr[ci_tresh+(this.number)*ci_mult+7];

		locator = By.className("radio-inline");
		arr = await super.findWithWait(locator);

		this.checkboxModifyOn=arr[6+2*this.number];
		this.checkboxModifyOff=arr[7+2*this.number];

	}

	async fillTier()
    {   logger.info(this.name+"fill tier: ");

        await this.fillRate();
	    await this.fillSetupName();
        await this.fillSupply();
        await this.setModify();
        await this.fillStartTime();
        await this.fillEndTime();
        //await this.driver.sleep(3000);
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
    {   await this.init();
    	logger.info(this.name+"field Rate: ");
        let locator=this.fieldRateTier;
        //if (this.number==0) {locator=fieldRateTier1;}
        //else {locator=by.By.xpath(fieldRate1+this.number+fieldRate2);}
        await super.clearField(locator);
        await super.fillWithWait(locator,this.tier.rate);
    }

    async fillSupply()
    {  await this.init();
    	logger.info(this.name+"field Supply: ");
        let locator=this.fieldSupplyTier;
        await super.clearField(locator);
        await super.fillWithWait(locator,this.tier.supply);

    }

    async setModify() {
        logger.info(this.name+"checkbox Modify: ");
        await this.init();

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
		    this.tier.startDate=Utils.getDateNear(80000,format);
		    this.tier.startTime=Utils.getTimeNear(80000,format);

	    } else
	    if (format=="mdy") {
	        this.tier.startDate=Utils.convertDateToMdy(this.tier.startDate);
		    this.tier.startTime=Utils.convertTimeToMdy(this.tier.startTime);

	    }
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
	         this.tier.endTime=Utils.getTimeNear(parseInt(this.tier.endDate),"utc");
        	 this.tier.endDate=Utils.getDateNear(parseInt(this.tier.endDate),"utc");
        }


        if((this.tier.endDate=="")) return;
	    else
	    if (format=="mdy") {
		    this.tier.endDate=Utils.convertDateToMdy(this.tier.endDate);
		    this.tier.endTime=Utils.convertTimeToMdy(this.tier.endTime);

	    }

	    await super.fillWithWait(locator,this.tier.endDate);
        const action=this.driver.actions();
        await action.sendKeys(key.TAB).perform();
        await super.fillWithWait(locator,this.tier.endTime);



    }

    async fillWhitelist(){

    	try {
		    for (var i = 0; i < this.tier.whitelist.length; i++) {
			    logger.info(this.name + "whitelist #" + i + ": ");
			    await this.fillAddress(this.tier.whitelist[i].address);
			    await this.fillMin(this.tier.whitelist[i].min);
			    await this.fillMax(this.tier.whitelist[i].max);
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
        await super.fillWithWait(locator,address);

    }
    async fillMin(value){
	    await this.init();
        logger.info(this.name+"field Address: ");
        let locator=this.fieldMinTier;
        await super.fillWithWait(locator,value);
    }
    async fillMax(value){
	    await this.init();
        logger.info(this.name+"field Max: ");
        let locator=this.fieldMaxTier;
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
			logger.info("Reserved tokens added=" + arr.length);
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

}
module.exports.TierPage=TierPage;
