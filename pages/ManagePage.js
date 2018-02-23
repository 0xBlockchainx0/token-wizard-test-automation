const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const by = require('selenium-webdriver/lib/by');
const page=require('./Page.js');
const Page=page.Page;
const By=by.By;
const utils=require('../utils//Utils.js');
const Utils=utils.Utils;
const buttonOk=By.xpath("/html/body/div[2]/div/div[3]/button[1]");

const modal=By.className("modal");
//const buttonOk=By.className("swal2-confirm swal2-styled");

const buttonDistribute=By.xpath("//*[contains(text(),'Distribute tokens')]");
const buttonFinalize=By.xpath("//*[contains(text(),'Finalize Crowdsale')]");
const buttonYesFinalize=By.className("swal2-confirm swal2-styled");

class ManagePage extends Page
{
    constructor(driver) {
        super(driver);
        this.URL;
        this.name="Manage page: ";

    }
    //https://wizard.poa.network/manage/0x7eB29E0922C87D728c81A9FAB66e97668c917108
async open(){
    logger.info(this.name+":");
    await super.open(this.URL);

}
async isAvailable(){

       logger.info(this.name+"Modal :");
       return (await super.isElementPresent(modal));
}
/////////////////////////////////
async isEnabledDistribute(){
    logger.info(this.name+"button Distribute :")
    if (!(await this.isPresentButtonDistribute()))
    {return false;}
    this.driver.sleep(3000);
    var s=await this.driver.findElement(buttonDistribute).getAttribute("className");
    if (s=="button button_disabled")
    {logger.info("present and disabled");
     return false;}
    else
    {   logger.info("present and enabled")
        return true;
    }

}
async isPresentButtonDistribute(){
    logger.info(this.name+"button Distribute :")
    var s=await super.isElementPresent(buttonDistribute);
    return s;
}

async clickButtonDistribute(){
     logger.info(this.name+"button Distribute :")
     await super.clickWithWait(buttonDistribute);
}
////////////////////////////////////////////////////
    async isEnabledFinalize(){
        logger.info(this.name+"button Finalize :");
        var button=await this.getButtonFinalize();
        this.driver.sleep(3000);
        var s=await button.getAttribute("className");

        //console.log("ClassNAme"+s);
        if (s=="button button_fill")
        {
            logger.info("present and enabled");
            return true;}
        else
        {   logger.info("disabled");
            return false;}

    }
    async getButtonFinalize() {

        var s = await super.findElementInArray(buttonFinalize, "button");
        return s;
    }

    async clickButtonFinalize(){
        logger.info(this.name+"button Finalize :");
        var button=await this.getButtonFinalize();
        //console.log("Button"+await button.getAttribute("className"));
        button.click();
    }


    async clickButtonYesFinalize(){
        logger.info(this.name+"confirm Finalize/Yes :");
        await super.clickWithWait(buttonYesFinalize);
    }

    async isPresentPopupYesFinalize()
    {  logger.info(this.name+"confirm Finalize/Yes :");
        return await super.isElementPresent(buttonYesFinalize);
    }



async isPresentButtonOK(){
    logger.info(this.name+"button OK :");
    return await super.isElementPresent(buttonOk);
}
async clickButtonOK(){
      logger.info(this.name+"button OK :");
      //await super.clickWithWait(buttonOk);
    await super.oneClick(buttonOk);

}
async confirmPopup(){
    logger.info(this.name+"confirm popup Distribute/Finalize :");
   // return true;
        var c=0;
        var limit=60;
        do {
            this.driver.sleep(1000);
            if (await this.isPresentButtonOK) {

                //await this.clickButtonOK();
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