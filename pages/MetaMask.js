const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const key = require('selenium-webdriver').Key;
const page=require('./Page.js');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
//"chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn//popup.html"
const IDMetaMask="nkbihfbeogaeaoehlefnkodbefgpgknn";
const URL="chrome-extension://"+IDMetaMask+"//popup.html";
const passMetaMask="kindzadza";
const fieldEnterPass= By.xpath("//*[@id=\"password-box\"]");
const buttonUnlock=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/button");
const buttonBuy= By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div[2]/button[1]");
const buttonSend= By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div[2]/button[2]");

//const buttonSubmit=By.xpath("//*[@id=\"pending-tx-form\"]/div[3]/input");
const buttonSubmit=By.className("confirm btn-green");


const fieldGasPrise=By.xpath("//*[@id=\"pending-tx-form\"]/div[1]/div[2]/div[3]/div[2]/div/div/input");
///////Imported from TestCircle//////
const buttonAccept=By.xpath('//*[@id="app-content"]/div/div[4]/div/button');

const agreement=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div/p[1]/strong");
const fieldNewPass=By.xpath("//*[@id=\"password-box\"]");
const fieldConfirmPass=By.xpath("//*[@id=\"password-box-confirm\"]");
const buttonCreate=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button");
const fieldSecretWords=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/textarea");
const buttonIveCopied=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button[1]");
//const popupNetwork=By.xpath("//*[@id=\"network_component\"]/div/i");
const popupNetwork=By.className("network-name");
//const popupRinkeby=By.className("menu-icon golden-square");
const popupRinkeby=By.css("Rinkeby Test Network");


const popupAccount=By.xpath("//*[@id=\"app-content\"]/div/div[1]/div/div[2]/span/div");
const popupImportAccount=By.xpath("//*[@id=\"app-content\"]/div/div[1]/div/div[2]/span/div/div/span/div/li[3]/span");
const popupImportAccountCSS="#app-content > div > div.full-width > div > div:nth-child(2) > span > div > div > span > div > li:nth-child(4) > span";
const fieldPrivateKey=By.xpath("//*[@id=\"private-key-box\"]");
const pass="qwerty12345";
const buttonImport=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/button");
const secretWords="mask divorce brief insane improve effort ranch forest width accuse wall ride";
const amountEth=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div[2]/div[1]/div/div/div[1]/div[1]");
const fieldNewRPCURL=By.id("new_rpc");
const buttonSave=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/div/div[2]/button");
//const arrowBackRPCURL=By.className("fa fa-arrow-left fa-lg cursor-pointer");
const arrowBackRPCURL=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/i");

const iconQuestionMark=By.className("fa fa-question-circle fa-lg");
const iconChangeAccount=By.className("cursor-pointer color-orange accounts-selector");


var accN=1;
//var lengthNetworkMenu=6;
//var sokolAdded=0;
//var poaAdded=0;
var networks=[0,3,42,4,8545]



class MetaMask extends page.Page{

    constructor(driver){
        super(driver);
        this.URL=URL;
       // this.wallet=wallet;
        this.name="Metamask :"


    }
	async isPresentIconQuestionMark()
	{   logger.info(this.name+"isPresentIconQuestionMark Submit :");
		return await super.isElementPresent(iconQuestionMark);
	}

    async setGasPriceTransaction(price){
        logger.info(this.name+"field GasPrice :");
        await super.fillWithWait(fieldGasPrise,price);
    }


    async clickButtonSubmit(){
        logger.info(this.name+"button Submit :");
       // await super.clickWithWaitIsElementEnabled(buttonSubmit);
	    await super.clickWithWait(buttonSubmit);

    }
    async clickPopupNetwork(){
        logger.info(this.name+"menu Network :");
        await super.clickWithWait(popupNetwork);

    }

    async submitTransaction(){
        logger.info(this.name+"button Submit Transaction :");
        await this.clickButtonSubmit();

    }

    async unlock() {

        await super.fillWithWait(fieldEnterPass,passMetaMask);
        await super.clickWithWait(buttonUnlock);
}

   async open()
    {
        logger.info(this.name+"open: ");
        await this.driver.get(this.URL);
        await super.clickWithWait(buttonAccept);
        var agr= await this.driver.findElement(agreement);
        const action=this.driver.actions();
        await action.click(agr).perform();


        for (var i=0;i<9;i++) {

           await action.sendKeys(key.TAB).perform();

        }
        await super.clickWithWait(buttonAccept);
        await super.fillWithWait(fieldNewPass,pass);
        await super.fillWithWait(fieldConfirmPass,pass);
        await super.clickWithWait(buttonCreate);
        await this.driver.sleep(500);
        await super.clickWithWait(buttonIveCopied);
        await this.switchToNextPage();

    }
   async  clickDotMenu(){
        await super.clickWithWait(dotMenu);
    }


    async setAccount(user){
        let b=false;
        for (var i=0;i<networks.length;i++)
        {
            if (networks[i]==user.networkID) {b=true;break;}
        }
        if (b) await this.selectAccount(user);
        else await this.importAccount(user);


    }






   async importAccount(user){
        //this.driver.sleep(1000);

       logger.info(this.name+"import account :");
       await  this.switchToNextPage();

       await  this.chooseProvider(user.networkID);

       await  this.clickImportAccount();
       await  super.fillWithWait(fieldPrivateKey,user.privateKey);
       await  this.driver.sleep(1000);
       await  super.clickWithWait(buttonImport);
        user.accN=accN-1;


       await this.switchToNextPage();
    }

    async selectAccount(user){
        logger.info(this.name+"select account :");
         await  this.switchToNextPage();
       // this.clickImportAccount();
        await  this.chooseProvider(user.networkID);
        await super.clickWithWait(popupAccount);
        await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(user.accN)+"].click();");

        await this.driver.sleep(1000);//!!!!!!!!!!!!!!!
        await this.switchToNextPage();
    }

     async clickImportAccount(){
        logger.info(this.name+" button ImportAccount :");
        await  super.clickWithWait(popupAccount);
        await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(accN+1)+"].click();");
        accN++;


    }


async doTransaction(refreshCount){
    logger.info(this.name+"wait and submit transaction :");
    await this.switchToNextPage();
    var counter=0;
	var timeLimit=5;
    if (refreshCount!=undefined) timeLimit=refreshCount;
    do {

        await this.driver.sleep(1000);
        await this.refresh();
        await this.driver.sleep(1000);
	    await super.waitUntilLocated(iconChangeAccount);
	    //await Utils.takeScreenshoot(this.driver);

        if (await this.isElementPresentWithWait(buttonSubmit)) {
	        await this.driver.sleep(500);
            await this.submitTransaction();
            await  this.switchToNextPage();
            return true;
        }
        counter++;
        logger.info("counter #"+ counter);
	    logger.info("Time limit " +timeLimit);
	    //logger.info( timeLimit);

        if (counter>=timeLimit) {
            await this.switchToNextPage();

            return false;
        }
        } while(true);

}


async isPresentButtonSubmit()
{   logger.info(this.name+"button Submit :");
    return await super.isElementPresent(buttonSubmit);
}

 async chooseProvider(provider){
    logger.info(this.name+"select provider :");
    await super.clickWithWait(popupNetwork);
    let n=networks.indexOf(provider);
    //console.log("Provider="+provider+"  n="+n)
    if (n<0) await this.addNetwork(provider);
    else
    await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["+n+"].click();");

}
     async addNetwork(provider){
         this.driver.sleep(5000);
        logger.info(this.name+"add network :");
        var url;

        switch(provider)
        {
            case 77:{url="https://sokol.poa.network";
            networks.push(77);
            break;

            }//Sokol
            case 99:{
                url="https://core.poa.network";
                networks.push(99);
                break;} //POA
            case 7762959:{url="https://sokol.poa.network";break;} //Musicoin=>SOKOL
            default:{throw("RPC Network not found. Check 'networkID' in scenario(owner,investor) file");}
        }
        await this.driver.executeScript("" +
            "document.getElementsByClassName('dropdown-menu-item')["+(networks.length-1)+"].click();");
         logger.info(this.name+"select network from menu :");
         await this.driver.sleep(5000);////////!!!!!!!!!!!!
        await super.fillWithWait(fieldNewRPCURL,url);
	     await this.driver.sleep(5000);////////!!!!!!!!!!!!
        await super.clickWithWait(buttonSave);

        await this.driver.sleep(1000);
        await super.clickWithWait(arrowBackRPCURL);
        //lengthNetworkMenu++;
        return;
    };

}

module.exports={
    MetaMask:MetaMask


}
