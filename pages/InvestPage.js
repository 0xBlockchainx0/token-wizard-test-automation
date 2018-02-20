
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
const fieldBalance=By.className("balance-title");

const fields=By.className("hashes-title");

class InvestPage extends Page{

    constructor(driver){
        super(driver);
        this.URL;
        this.fieldTokenAddress;
        this.fieldContractAddress;
        this.fieldCurrentAccount;
    }
    async initFields(){
        var arr = await super.findWithWait(fields);
        this.fieldTokenAddress = arr[1];
        this.fieldContractAddress = arr[2];
        this.fieldCurrentAccount=arr[0];
    }
    async getBalance(){
        return  await super.getText(fieldBalance);
    }

    async isPresentWarning(){
        return (await super.isElementPresent(buttonOk));
    }

    clickButtonOK(){
        super.clickWithWait(buttonOk);
    }

    fillInvest(amount)
    {
        super.fillWithWait(fieldInvest,amount);
    }

    async clickButtonContribute(){

        super.clickWithWait(buttonContribute);
    }

     async getTokenAddress(){
       await  this.initFields();
        return  await super.getTextElement(this.fieldTokenAddress);
    }
    async getContractAddress(){
        await  this.initFields();
        return  await super.getTextElement(this.fieldContractAddress);
    }
    async getCurrentAccount(){
        await  this.initFields();
        return  await super.getTextElement(this.fieldCurrentAccount);
    }




}
module.exports.InvestPage=InvestPage;

