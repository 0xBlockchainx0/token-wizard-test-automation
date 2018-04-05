const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;

const buttonContinue=By.xpath("//*[contains(text(),'Continue')]");
const buttonAddTier=By.className("button button_fill_secondary");
const buttonOK=By.className("swal2-confirm swal2-styled");

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
        this.title="CROWDSALE SETUP";
	    this.warningWalletAddress;
	    this.warningCustomGasPrice;
	    this.warningMincap;




    }
static getFlagCustom(){return flagCustom;}
static getFlagWHitelising(){return flagWHitelising;}
static setFlagCustom(value){flagCustom=value;}
static setFlagWHitelising(value){flagWHitelising=value;}
static getCountTiers(){return COUNT_TIERS}
static setCountTiers(value){COUNT_TIERS=value}

async printWarnings(){
    	var arr=await this.initWarnings();
    	for (var i=0;i<arr.length;i++)
	    {
	    	logger.info(i+" : "+ await super.getTextByElement(arr[i]));
	    }
}
	async initWarnings(){
		try {
			logger.info(this.name + " :init warnings:");
			const locator = By.xpath("//p[@style='color: red; font-weight: bold; font-size: 12px; width: 100%; height: 10px;']");
			var arr = await super.findWithWait(locator);
			this.warningWalletAddress = arr[0];
			if (flagCustom)
			{ this.warningMincap=arr[2];
				this.warningCustomGasPrice=arr[1];
			}
			else
			{ this.warningMincap=arr[1];
			}
			return arr;
		}
		catch(err){
			logger.info(this.name+": dont contain warning elements");
			return null;
		}
	}


	async init(){
try{
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

          return arr;}
	catch(err)
		{return null;}

	}

async initCheckboxes(){
try {
	var locator = By.className("radio-inline");
	var arr = await super.findWithWait(locator);
	this.boxGasPriceSafe = arr[0];
	this.boxGasPriceNormal = arr[1];
	this.boxGasPriceFast = arr[2];
	this.boxGasPriceCustom = arr[3];
	this.boxWhitelistingYes = arr[4];
	this.boxWhitelistingNo = arr[5];
	return arr;
}
catch(err)
{return null;}

}

    async clickButtonContinue(){
        logger.info(this.name+"button Continue: ");
        return await super.clickWithWait(buttonContinue);

    }
   async  fillWalletAddress(address){
	    await this.init();
        logger.info(this.name+"field WalletAddress: ");
        await super.clearField(this.fieldWalletAddress);
	    await super.fillWithWait(this.fieldWalletAddress, address);
    }


    async clickCheckboxGasPriceSafe()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceSafe: ");
	    flagCustom=false;
	    return await super.clickWithWait(this.boxGasPriceSafe);

    }
    async clickCheckboxGasPriceNormal()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceNormal: ");
	    flagCustom=false;
	    return  await super.clickWithWait(this.boxGasPriceNormal);

    }
    async clickCheckboxGasPriceFast()
    {
	    await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceFast: ");
	    flagCustom=false;
	    return await super.clickWithWait(this.boxGasPriceFast);
    }
    async clickCheckboxGasPriceCustom()
    {

    	await this.initCheckboxes();
        logger.info(this.name+"CheckboxGasPriceCustom: ");
	    flagCustom=true;
        return await super.clickWithWait(this.boxGasPriceCustom);


    }
    async fillGasPriceCustom(value){
	    await this.init();
        logger.info(this.name+"GasPriceCustom: ");

        await super.clearField(this.fieldGasPriceCustom,1);

        let b=await super.fillWithWait(this.fieldGasPriceCustom,value);
        return b;
    }
    async clickCheckboxWhitelistYes()
    {   await this.initCheckboxes();
        logger.info(this.name+"CheckboxWhitelistYes: ");
	    flagWHitelising=true;
        return await super.clickWithWait(this.boxWhitelistingYes);

    }
	async clickCheckboxWhitelistNo()
	{   await this.initCheckboxes();
		logger.info(this.name+"CheckboxWhitelistNo: ");
		flagWHitelising=false;
		return await super.clickWithWait(this.boxWhitelistingNo);

	}

    async clickButtonAddTier()
    {
        logger.info(this.name+"ButtonAddTier: ");
       return await super.clickWithWait(buttonAddTier);
    }

    async setGasPrice(value){
        logger.info(this.name+"setGasPrice: =" + value);
    switch(value){
       case 1:{await this.clickCheckboxGasPriceSafe();break;}
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
	async isPresentWarningMincap(){
		logger.info(this.name + "is present warning :");
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningMincap);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}
	async isPresentWarningCustomGasPrice(){
		logger.info(this.name + "is present warning :");
		await this.initWarnings();
		let s = await super.getTextByElement(this.warningCustomGasPrice);
		if (s != "") { logger.info("present");return true;}
		else {logger.info("not present");return false;}
	}

    async isPresentWarningWalletAddress() {
	    logger.info(this.name + "is present warning :");
	    await this.initWarnings();
	    let s = await super.getTextByElement(this.warningWalletAddress);
	    if (s != "") { logger.info("present");return true;}
	    else {logger.info("not present");return false;}
    }

	async isPresentFieldWalletAddress(){
		var arr=await this.init();
		if (arr==null) return false;
		logger.info(arr.length);
		if (arr.length>0)return true;
		else return false;

	}

	async uploadCSV(){
		logger.info('Upload CSV');
     try {

	     const loc=By.xpath('//input[@type="file"]');
	     var el = this.driver.findElement(loc);
	     //el.sendKeys("/home/travis/build/dennis00010011b/travistest/node_modules/token-wizard-test-automation/MyWhitelist.csv");
	     el.sendKeys("/home/travis/build/poanetwork/token-wizard/submodules/token-wizard-test-automation/MyWhitelist.csv");
	     //el.sendKeys("/Users/person/WebstormProjects/token-wizard-test-automation/MyWhitelist.csv")

	     return true;
     }
     catch (err){
     	logger.info(err);
     	return false;
     }

	}

async getFieldWalletAddress(){
	logger.info(this.name+"getFieldWalletAddress: ");
    try {
	    await this.init();
	    let s = super.getAttribute(this.fieldWalletAddress, "value");
	    return s;
    }
    catch (err)
    {
    	logger.info(err);
    	return "";
    }
}

async clickButtonOk(){
    	logger.info("Confirm popup");
    	await super.clickWithWait(buttonOK);

}

	async isPresentButtonContinue(){
		var b=await super.isElementPresent(buttonContinue);
		logger.info(this.name+": is present button Continue: "+b);
		return b;

	}


}
module.exports.WizardStep3=WizardStep3;
