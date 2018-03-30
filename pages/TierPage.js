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

const buttonAdd=By.className("button button_fill button_fill_plus");

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
     //   if (this.number==0) {locator=fieldNameTier1;}
    //    else {locator=by.By.xpath(fieldName1+this.number+fieldName2);}
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
       // if (this.number==0) {locator=fieldSupplyTier1;}
        //else {locator=by.By.xpath(fieldSupply1+this.number+fieldSupply2);}
        await super.clearField(locator);
        await super.fillWithWait(locator,this.tier.supply);

    }

    async setModify() {
        logger.info(this.name+"checkbox Modify: ");
        await this.init();

	    if (this.tier.allowModify) {
		    await super.clickWithWait(this.checkboxModifyOn);
	    }

      /* let locator;
      if (this.number == 0)
            if (this.tier.allowModify) {
                locator = checkboxModifyOnTier1;
            }
            else {
                locator = checkboxModifyOffTier1;
            }
        else {

            if (this.tier.allowModify) {
            locator = by.By.xpath(checkboxModifyOn1 + this.number + checkboxModifyOn2);
            }
            else {
            locator = by.By.xpath(checkboxModifyOff1 + this.number + checkboxModifyOff2);
                 }
             }*/
        //await super.clickWithWait(locator);

    }
    async fillStartTime()
    {
	    await this.init();
        logger.info(this.name+"field StartTime: ");

	    let locator=this.fieldStartTimeTier;
       // if (this.number==0) {locator=fieldStartTimeTier1;}
       // else {locator=by.By.xpath(fieldStartTime1+this.number+fieldStartTime2);}
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


       //if (this.number==0) {locator=fieldEndTimeTier1;}
       // else {locator=by.By.xpath(fieldEndTime1+this.number+fieldEndTime2);}

	    var format=await Utils.getDateFormat(this.driver);

        if (! this.tier.endDate.includes("/"))
        {     //console.log(parseInt(this.tier.endDate));
	         this.tier.endTime=Utils.getTimeNear(parseInt(this.tier.endDate),"utc");
        	 this.tier.endDate=Utils.getDateNear(parseInt(this.tier.endDate),"utc");


	        // console.log("Time"+this.tier.endTime );
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

        for (var i=0;i<this.tier.whitelist.length;i++) {
            logger.info(this.name+"whitelist #"+i+": ");
            await this.fillAddress(this.tier.whitelist[i].address);
            await this.fillMin(this.tier.whitelist[i].min);
            await this.fillMax(this.tier.whitelist[i].max);
            await this.clickButtonAdd();


        }

    }
    async fillAddress(address){
	    await this.init();
        logger.info(this.name+"field Address: ");
        let locator=this.fieldWhAddressTier;
       // if (this.number==0) {locator=fieldAddressTier1;}
       // else {locator=by.By.xpath(fieldAddress1+this.number+fieldAddress2);}
        await super.fillWithWait(locator,address);
        //this.driver.sleep(500);


    }
    async fillMin(value){
	    await this.init();
        logger.info(this.name+"field Address: ");
        let locator=this.fieldMinTier;
       // if (this.number==0) {locator=fieldMinTier1;}
	    // else {locator=by.By.xpath(fieldMin1+this.number+fieldMin2);}
        await super.fillWithWait(locator,value);
    }
    async fillMax(value){
	    await this.init();
        logger.info(this.name+"field Max: ");
        let locator=this.fieldMaxTier;
       // if (this.number==0) {locator=fieldMaxTier1;}
       // else {locator=by.By.xpath(fieldMax1+this.number+fieldMax2);}
        await super.fillWithWait(locator,value);
    }
    async clickButtonAdd(){
        logger.info(this.name+"button Add: ");
       // let locator;
       // if (this.number==0) {locator=buttonAdd}
       // else {locator=By.xpath(buttonAdd1+this.number+buttonAdd2);}

        await super.clickWithWait(buttonAdd);
    }



}
module.exports.TierPage=TierPage;
