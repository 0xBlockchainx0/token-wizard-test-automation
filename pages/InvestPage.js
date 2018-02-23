const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const page=require('./Page.js');
Page=page.Page;
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonContribute=By.className("button button_fill");

//const fieldTokenAddress=By.xpath("//*[@id=\"root\"]/div/div[1]/div[1]/div[1]/div[2]/div[2]/p[1]");
                                   //*[@id="root"]/div/div[1]/div/div[1]/div[1]/div[2]/div[3]/p[1]
//const fieldContractAddress=By.xpath("//*[@id=\"root\"]/div/div[1]/div[1]/div[1]/div[2]/div[3]/p[1]");
                                       //*[@id="root"]/div/div[1]/div[1]/div[1]/div[2]/div[3]/p[1]
const fieldInvest=By.className("invest-form-input");
const buttonOk=By.className("swal2-confirm swal2-styled");
// /html/body/div[2]/div/div[3]/button[1]

const fieldBalance=By.className("balance-title");

const fields=By.className("hashes-title");
const warningText=By.id("swal2-content");
const errorNotice=By.className("css-6bx4c3");

class InvestPage extends Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.fieldTokenAddress;
        this.fieldContractAddress;
        this.fieldCurrentAccount;
        this.name="Invest page :"
    }
    async initFields(){
        var arr = await super.findWithWait(fields);
        this.fieldTokenAddress = arr[1];
        this.fieldContractAddress = arr[2];
        this.fieldCurrentAccount=arr[0];
    }
    async getBalance(){
        logger.info(this.name+"get Balance :");
        return  await super.getTextByLocator(fieldBalance);
    }
    async isPresentError(){
        logger.info(this.name+"Error text :");
        return (await super.isElementPresent(errorNotice));
    }
    async isPresentWarning(){
        logger.info(this.name+"Warning  :");
        return (await super.isElementPresent(buttonOk));
    }

   async  clickButtonOK(){
        logger.info(this.name+"button OK :");
     // await  super.clickWithWait(buttonOk);
      await super.oneClick(buttonOk);
    }

    async fillInvest(amount)
    {   logger.info(this.name+"field Contribute :");
       await super.fillWithWait(fieldInvest,amount);
    }

    async clickButtonContribute(){
        logger.info(this.name+"button Contribute :");
        await super.clickWithWait(buttonContribute);
    }
async getWarningText(){
    logger.info(this.name+"Warning text :");
    return  await super.getTextByLocator(warningText);

}
    async getErrorText(){
        logger.info(this.name+"Error text :");
        return  await super.getTextByLocator(errorNotice);

    }

     async getTokenAddress(){
        logger.info(this.name+"field TokenAddress :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldTokenAddress);
    }
    async getContractAddress(){
        logger.info(this.name+"field ContractAddress :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldContractAddress);
    }
    async getCurrentAccount(){
        logger.info(this.name+"field CurrentAccount :");
        await  this.initFields();
        return  await super.getTextByElement(this.fieldCurrentAccount);
    }




}
module.exports.InvestPage=InvestPage;

