
const page=require('./Page.js');
Page=page.Page;
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const buttonContribute=By.xpath('//*[@id="root"]/div/div[1]/div[1]/div[2]/form/div[2]/a');
const fieldTokenAddress=By.xpath("//*[@id=\"root\"]/div/div[1]/div[1]/div[1]/div[2]/div[2]/p[1]");
const fieldContractAddress=By.xpath("//*[@id=\"root\"]/div/div[1]/div[1]/div[1]/div[2]/div[3]/p[1]");
const fieldInvest=By.className("invest-form-input");
const buttonOk=By.className("swal2-confirm swal2-styled");

class InvestPage extends Page{

    constructor(driver){
        super(driver);
        this.URL;

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

    clickButtonContribute(){
        super.clickWithWait(buttonContribute);
    }

     getTokenAddress(){

        return  super.getText(fieldTokenAddress);
    }
    getContractAddress(){

        return  super.getText(fieldContractAddress);
    }




}
module.exports.InvestPage=InvestPage;

