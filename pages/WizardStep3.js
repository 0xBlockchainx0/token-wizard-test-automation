const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
/*
//const adj="div[1]/";
const adj="";

//const fieldWalletAddress=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[1]/input");
//var fieldWalletAddress;
//const fieldMinCap=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[1]/input");
//var fieldMinCap;

const boxGasPriceSafe=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[1]/label/span");
const boxGasPriceNormal=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[2]/label/span");
const boxGasPriceFast=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[3]/label/span");
const boxGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[4]/label/span");
                                           //*[@id="root"]/div/section/div[2]/div[2]/div[2]/div[2]/div[4]/label/span
//const fieldGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[5]/input");
                               //*[@id="root"]/div/section/div[2]/div[2]/div[2]/div[2]/div[5]/input

//const buttonContinue=By.xpath("//*[@id=\"root\"]/div/section/div[4]/a");

//*[@id="root"]/div/section/div[4]/div
const boxWhitelistingYes=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[1]/span");
                                            //*[@id="root"]/div/section/div[2]/div[2]/div[3]/div[2]/div/label[1]/span
const boxWhitelistingNo=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[2]/span");
*/

const buttonContinue=By.xpath("//*[contains(text(),'Continue')]");
const buttonAddTier=By.className("button button_fill_secondary");
let flagCustom=false;
let flagWHitelising=false;

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
        await super.clearField(this.fieldWalletAddress);
        await super.fillWithWait(this.fieldWalletAddress,address);
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


}
module.exports.WizardStep3=WizardStep3;
