const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const adj="div[1]/";
//const adj="";
const fieldWalletAddress=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[1]/input");

const fieldMinCap=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[1]/input");
const boxGasPriceSafe=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[1]/label/span");
const boxGasPriceNormal=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[2]/label/span");
const boxGasPriceFast=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[3]/label/span");
const boxGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[4]/label/span");
const fieldGasPriceCustom=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[2]/div[2]/div[5]/input");

const buttonContinue=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[5]/div/a");
const buttonAddTier=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[5]/div/div");
const boxWhitelistingYes=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[1]/span");
const boxWhitelistingNo=By.xpath("//*[@id=\"root\"]/div/"+adj+"section/div[2]/div[2]/div[3]/div[2]/div/label[2]/span");
class WizardStep3 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.tier;
        this.name="WizardStep3 page: ";

    }

    async clickButtonContinue(){
        logger.info(this.name+"button Continue: ");
        await super.clickWithWait(buttonContinue);

    }
   async  fillWalletAddress(address){
        logger.info(this.name+"field WalletAddress: ");
        await super.clearField(fieldWalletAddress);
        await super.fillWithWait(fieldWalletAddress,address);
    }


    async clickCheckboxGasPriceSafe()
    {
        logger.info(this.name+"CheckboxGasPriceSafe: ");
        await super.clickWithWait(boxGasPriceSafe);
    }
    async clickCheckboxGasPriceNormal()
    {
        logger.info(this.name+"CheckboxGasPriceNormal: ");
        await super.clickWithWait(boxGasPriceNormal);
    }
    async clickCheckboxGasPriceFast()
    {
        logger.info(this.name+"CheckboxGasPriceFast: ");
        await super.clickWithWait(boxGasPriceFast);
    }
    async clickCheckboxGasPriceCustom()
    {
        logger.info(this.name+"CheckboxGasPriceCustom: ");
        await super.clickWithWait(boxGasPriceCustom);
    }
    async fillGasPriceCustom(value){
        logger.info(this.name+"GasPriceCustom: ");
        await super.clearField(fieldGasPriceCustom);
        await super.fillWithWait(fieldGasPriceCustom,value);
    }
    async clickCheckboxWhitelistYes()
    {   logger.info(this.name+"CheckboxWhitelistYes: ");
        await super.clickWithWait(boxWhitelistingYes);
    }


    async clickButtonAddTier()
    {
        logger.info(this.name+"ButtonAddTier: ");
        await super.clickWithWait(buttonAddTier);
    }

    async setGasPrice(value){
        logger.info(this.name+"setGasPrice: ");
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
        logger.info(this.name+"MinCap: ");
        await super.clearField(fieldMinCap);
        await super.fillWithWait(fieldMinCap,value);
    }


}
module.exports.WizardStep3=WizardStep3;
