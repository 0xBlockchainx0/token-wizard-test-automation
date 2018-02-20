const by = require('selenium-webdriver/lib/by');
const page=require('./Page.js');
const Page=page.Page;
const By=by.By;
const utils=require('../utils//Utils.js');
const Utils=utils.Utils;
//const buttonOk=By.xpath("/html/body/div[2]/div/div[3]/button[1]");

const modal=By.className("modal");
const buttonOk=By.className("swal2-confirm swal2-styled");

const buttonDistribute=By.xpath("//*[contains(text(),'Distribute tokens')]");
const buttonFinalize=By.xpath("//*[contains(text(),'Finalize Crowdsale')]");
const buttonYesFinalize=By.className("swal2-confirm swal2-styled");

class ManagePage extends Page
{
    constructor(driver) {
        super(driver);
        this.URL;

    }
    //https://wizard.poa.network/manage/0x7eB29E0922C87D728c81A9FAB66e97668c917108
open(){

this.driver.get(this.URL);

}
async isAvailable(){

       return (await super.isElementPresent(modal));
}
/////////////////////////////////
async isEnabledDistribute(){

    if (!(await this.isPresentButtonDistribute())) return false;
    this.driver.sleep(3000);
    var s=await this.driver.findElement(buttonDistribute).getAttribute("className");
    if (s=="button button_disabled") return false;
    else return true;

}
async isPresentButtonDistribute(){

    var s=await super.isElementPresent(buttonDistribute);
    return s;
}

async clickButtonDistribute(){
     await super.clickWithWait(buttonDistribute);
}
////////////////////////////////////////////////////
    async isEnabledFinalize(){

        var button=await this.getButtonFinalize();
        this.driver.sleep(3000);
        var s=await button.getAttribute("className");

        //console.log("ClassNAme"+s);
        if (s=="button button_fill") return true;
        else return false;

    }
    async getButtonFinalize() {

        var s = await super.findElementInArray(buttonFinalize, "button");
        return s;
    }

    async clickButtonFinalize(){
        var button=await this.getButtonFinalize();
        //console.log("Button"+await button.getAttribute("className"));
        button.click();
    }


    async clickButtonYesFinalize(){
        await super.clickWithWait(buttonYesFinalize);
    }

    async isPresentPopupYesFinalize()
    {
        return await super.isElementPresent(buttonYesFinalize);
    }



async isPresentButtonOK(){
    return await super.isElementPresent(buttonOk);
}
async clickButtonOK(){
      await super.clickWithWait(buttonOk);

}
async confirmPopup(){

        var c=0;
        var limit=30;
        do {
            this.driver.sleep(1000);
            if (await this.isPresentButtonOK) {
                this.driver.sleep(2000);
                await this.clickButtonOK();
                return true;
            }

            c++;
            if(c>=limit){return false;}
        }while(true);
}









}
module.exports={
    ManagePage:ManagePage
}