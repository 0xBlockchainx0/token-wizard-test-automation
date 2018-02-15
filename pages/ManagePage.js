const by = require('selenium-webdriver/lib/by');
const page=require('./Page.js');
const Page=page.Page;
const By=by.By;
const utils=require('../utils//Utils.js');
const Utils=utils.Utils;
const firstContract=By.xpath("//*[@id=\"root\"]/div/div[1]/section/div[3]/div/div[1]/div/div[2]/div[1]/div");
//const buttonOk=By.xpath("/html/body/div[2]/div/div[3]/button[1]");
const buttonOk=By.className("swal2-confirm swal2-styled");

const buttonDistribute=By.xpath("//*[@id=\"root\"]/div/section/div[1]/div/a/span");
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

       return (await super.isElementPresent(firstContract));
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

clickButtonDistribute(){
     super.clickWithWait(buttonDistribute);
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


    clickButtonYesFinalize(){
        super.clickWithWait(buttonYesFinalize);
    }





async isPresentButtonOK(){
    return await super.isElementPresent(buttonFinalize);
}
clickButtonOK(){
       super.clickWithWait(buttonOk);

}
confirmPopup(){

        var c=0;
        var limit=10;
        do {

            if (this.isPresentButtonOK) {
                this.clickButtonOK();
                return true;
            }
            this.driver.sleep(1000);
            c++;
            if(c>=limit){return false;}
        }while(true);
}









}
module.exports={
    ManagePage:ManagePage
}