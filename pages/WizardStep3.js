const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const warningWalletAddress=By.xpath('//*[@id="root"]/div/section/div[2]/div[2]/div[2]/div[1]/p[2]');
const buttonContinue=By.xpath("//*[contains(text(),'Continue')]");
const buttonAddTier=By.className("button button_fill_secondary");
let flagCustom=false;
let flagWHitelising=false;
var COUNT_TIERS=0;
class WizardStep3 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.tier;
        this.name="WizardStep3 page: ";
        this.boxGasPriceSafe;
	    this.boxGasPriceNormal;
	    this.boxGasPriceFast;
	    this.boxGasPriceCustom;
	    this.boxWhitelistingYes;
	    this.boxWhitelistingNo;
	    this.fieldGasPriceCustom  ;
	    this.fieldWalletAddress;
	    this.fieldMinCap;
    }
static getFlagCustom(){return flagCustom;}
static getFlagWHitelising(){return flagWHitelising;}
static setFlagCustom(value){flagCustom=value;}
static setFlagWHitelising(value){flagWHitelising=value;}
static getCountTiers(){return COUNT_TIERS}
static setCountTiers(value){COUNT_TIERS=value}

	async init(){

		var locator = By.className("input");
		var arr = await super.findWithWait(locator);
		this.fieldWalletAddress = arr[0];
		if (flagCustom)
        { this.fieldMinCap=arr[2];
          this.fieldGasPriceCustom=arr[1];
         }
          else
        { this.fieldMinCap=arr[1];
          }

	}

async initCheckboxes(){

	var locator = By.className("radio-inline");
	var arr = await super.findWithWait(locator);
	this.boxGasPriceSafe=arr[0];
	this.boxGasPriceNormal=arr[1];
	this.boxGasPriceFast=arr[2];
	this.boxGasPriceCustom=arr[3];
	this.boxWhitelistingYes=arr[4];
	this.boxWhitelistingNo=arr[5];

}

    async clickButtonContinue(){
        logger.info(this.name+"button Continue: ");
        await super.clickWithWait(buttonContinue);

    }
   async  fillWalletAddress(address){
	    await this.init();
        logger.info(this.name+"field WalletAddress: ");
		do {
            await super.clearField(this.fieldWalletAddress);

	        await super.fillWithWait(this.fieldWalletAddress, address);
	        await this.driver.sleep(1000);
        }
        while (await this.isPresentWarningWalletAddress())
    }


    async clickCheckboxGasPriceSafe()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceSafe: ");
        await super.clickWithWait(this.boxGasPriceSafe);
	    flagCustom=false;
    }
    async clickCheckboxGasPriceNormal()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceNormal: ");
        await super.clickWithWait(this.boxGasPriceNormal);
	    flagCustom=false;
    }
    async clickCheckboxGasPriceFast()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceFast: ");
        await super.clickWithWait(this.boxGasPriceFast);
	    flagCustom=false;
    }
    async clickCheckboxGasPriceCustom()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceCustom: ");
        await super.clickWithWait(this.boxGasPriceCustom);
	    flagCustom=true;

    }
    async fillGasPriceCustom(value){
	    await this.init();
        logger.info(this.name+"GasPriceCustom: ");
        await super.clearField(this.fieldGasPriceCustom,1);
        await super.fillWithWait(this.fieldGasPriceCustom,value);
    }
    async clickCheckboxWhitelistYes()
    {   await this.initCheckboxes();
        logger.info(this.name+"CheckboxWhitelistYes: ");
        await super.clickWithWait(this.boxWhitelistingYes);
        flagWHitelising=true;
    }


    async clickButtonAddTier()
    {
        logger.info(this.name+"ButtonAddTier: ");
        await super.clickWithWait(buttonAddTier);
    }

    async setGasPrice(value){
        logger.info(this.name+"setGasPrice: =" + value);
    switch(value){
       case 2:{await this.clickCheckboxGasPriceSafe();break;}
       case 4:{await this.clickCheckboxGasPriceNormal();break;}
       case 30:{await this.clickCheckboxGasPriceFast();break;}
       default:{
           await this.clickCheckboxGasPriceCustom();
           await this.fillGasPriceCustom(value);
            }
            }
    }

    async fillMinCap(value){
	    await this.init();
        logger.info(this.name+"MinCap: ");
        await super.clearField(this.fieldMinCap,1);
        await super.fillWithWait(this.fieldMinCap,value);
    }


    async isPresentWarningWalletAddress(){
    	var b=false;
		try {
			logger.info(this.name+"red warning if data wrong :");
			//await this.driver.sleep(1000);
			var s=await super.getTextByLocatorFast(warningWalletAddress);
			logger.info("text received ="+s);
			return (s!="");
		}
		catch(err){
			logger.info("Can not find red warning for wallet address")
			console.log(err); return false;}

    }


}
module.exports.WizardStep3=WizardStep3;
