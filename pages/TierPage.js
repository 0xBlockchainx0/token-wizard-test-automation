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
var COUNT_TIERS=0;
//const adj="div[1]/";
const adj="";
const fieldAddressTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div[2]/div[2]/div/div[1]/div[1]/input");
const fieldAddress1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldAddress2="]/div[2]/div[2]/div/div[1]/div[1]/input";

const fieldMinTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div[2]/div[2]/div/div[1]/div[2]/input");
const fieldMin1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldMin2="]/div[2]/div[2]/div/div[1]/div[2]/input";

const fieldMaxTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div[2]/div[2]/div/div[1]/div[3]/input");
const fieldMax1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldMax2="]/div[2]/div[2]/div/div[1]/div[3]/input";

const buttonAdd=By.className("button button_fill button_fill_plus");
const buttonAdd1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const buttonAdd2="]/div[2]/div[2]/div/div[2]/div";

const fieldNameTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[1]/div[1]/input\n");
const checkboxModifyOffTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[1]/div[2]/div/label[2]/span\n");
const checkboxModifyOnTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[1]/div[2]/div/label[1]/span");
const fieldRateTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[1]/input");

const fieldSupplyTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[3]/div[2]/input");
const fieldStartTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[1]/input");
const fieldEndTimeTier1=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[3]/div/div[2]/div[2]/input");

const fieldName1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldName2="]/div/div[1]/div[1]/input";
const fieldRate1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldRate2="]/div/div[3]/div[1]/input";


const fieldSupply1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldSupply2="]/div/div[3]/div[2]/input\n";

const checkboxModifyOn1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const checkboxModifyOn2="]/div/div[1]/div[2]/div/label[1]/span\n";
const checkboxModifyOff1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const checkboxModifyOff2="]/div/div[1]/div[2]/div/label[2]/span\n";

const fieldStartTime1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldStartTime2="]/div/div[2]/div[1]/input";

const fieldEndTime1="//*[@id=\"root\"]/div/"+adj+"section/div[4]/div[";
const fieldEndTime2="]/div/div[2]/div[2]/input";



class TierPage extends page.Page{

    constructor(driver,tier){
        super(driver);
        this.URL;
        this.tier=tier;
        this.number=COUNT_TIERS++;
        this.name="Tier #"+this.number+": ";
    }
    print(){
        //console.log(typeof(this.tier));
    }

    async fillTier()
    {   logger.info(this.name+"fill tier: ");
        await this.fillSetupName();
        await this.fillRate();
        await this.fillSupply();
        await this.setModify();
        await this.fillStartTime();
        await this.fillEndTime();
        if (this.tier.whitelist!=null) await this.fillWhitelist();

    }

    async fillSetupName()
    {
        logger.info(this.name+"field SetupName: ");
        let locator;
        if (this.number==0) {locator=fieldNameTier1;}
        else {locator=by.By.xpath(fieldName1+this.number+fieldName2);}
        await super.clearField(locator);
        await  super.fillWithWait(locator,this.tier.name);

    }
    async fillRate()
    {   logger.info(this.name+"field Rate: ");
        let locator;
        if (this.number==0) {locator=fieldRateTier1;}
        else {locator=by.By.xpath(fieldRate1+this.number+fieldRate2);}
        await super.clearField(locator);
        await super.fillWithWait(locator,this.tier.rate);
    }
    async fillSupply()
    {   logger.info(this.name+"field Supply: ");
        let locator;
        if (this.number==0) {locator=fieldSupplyTier1;}
        else {locator=by.By.xpath(fieldSupply1+this.number+fieldSupply2);}
        await super.clearField(locator);
        await super.fillWithWait(locator,this.tier.supply);

    }

    async setModify() {
        logger.info(this.name+"checkbox Modify: ");
        let locator;
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
             }
        await super.clickWithWait(locator);

    }
    async fillStartTime()
    {
        logger.info(this.name+"field StartTime: ");

	    let locator;
        if (this.number==0) {locator=fieldStartTimeTier1;}
        else {locator=by.By.xpath(fieldStartTime1+this.number+fieldStartTime2);}
	    var format=await Utils.getDateFormat(this.driver);

	    if((this.tier.startDate==""))
	    {
		    this.tier.startDate=Utils.getDateNear(100000,format);
		    this.tier.startTime=Utils.getTimeNear(100000,format);

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
        logger.info(this.name+"field EndTime: ");

        let locator;


       if (this.number==0) {locator=fieldEndTimeTier1;}
        else {locator=by.By.xpath(fieldEndTime1+this.number+fieldEndTime2);}

	    var format=await Utils.getDateFormat(this.driver);

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
        logger.info(this.name+"field Address: ");
        let locator;
        if (this.number==0) {locator=fieldAddressTier1;}
        else {locator=by.By.xpath(fieldAddress1+this.number+fieldAddress2);}
        await super.fillWithWait(locator,address);
        //this.driver.sleep(500);


    }
    async fillMin(value){
        logger.info(this.name+"field Address: ");
        let locator;
        if (this.number==0) {locator=fieldMinTier1;}
        else {locator=by.By.xpath(fieldMin1+this.number+fieldMin2);}
        await super.fillWithWait(locator,value);
    }
    async fillMax(value){
        logger.info(this.name+"field Max: ");
        let locator;
        if (this.number==0) {locator=fieldMaxTier1;}
        else {locator=by.By.xpath(fieldMax1+this.number+fieldMax2);}
        await super.fillWithWait(locator,value);
    }
    async clickButtonAdd(){
        logger.info(this.name+"button Add: ");
        let locator;
        if (this.number==0) {locator=buttonAdd}
        else {locator=By.xpath(buttonAdd1+this.number+buttonAdd2);}

        await super.clickWithWait(locator);
    }



}
module.exports.TierPage=TierPage;
