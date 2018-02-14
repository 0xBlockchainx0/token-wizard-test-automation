
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;

const buttonContinue=By.xpath("//*[@id=\"root\"]/div/section/div[3]/a");
const buttonDownload=By.xpath("//*[@id=\"root\"]/div/section/div[3]/div");
const blueScreen=By.xpath('//*[@id="root"]/div/section/div[4]/div[2]/div');
const modal=By.xpath("//*[@id=\"root\"]/div/section/div[4]/div/p");
const buttonOK=By.xpath('/html/body/div[2]/div/div[3]/button[1]');


class WizardStep4 extends page.Page{

    constructor(driver){
        super(driver);
        this.URL;


    }
async isPage(){
        return await super.isElementPresent(modal);
}
    clickButtonContinue(){
        super.clickWithWait(buttonContinue);

    }
    clickButtonDownload(){
        super.clickWithWait(buttonDownload);

    }
    clickButtonOk(){
        super.clickWithWait(buttonOK);
    }





}
module.exports={
    WizardStep4:WizardStep4,
    blueScreen:blueScreen,
    buttonContinue:buttonContinue
}
