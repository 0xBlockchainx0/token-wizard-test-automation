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
const buttonSubmit=By.className("confirm btn-green");
const buttonReject=By.className("cancel btn-red");
const buttonRejectAll=By.className("cancel btn-red");
const buttonAccept=By.xpath('//*[@id="app-content"]/div/div[4]/div/button');
const agreement=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div/p[1]/strong");
const fieldNewPass=By.xpath("//*[@id=\"password-box\"]");
const fieldConfirmPass=By.xpath("//*[@id=\"password-box-confirm\"]");
const buttonCreate=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button");
const buttonIveCopied=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/button[1]");
const popupNetwork=By.className("network-name");
const popupAccount=By.xpath("//*[@id=\"app-content\"]/div/div[1]/div/div[2]/span/div");
const fieldPrivateKey=By.xpath("//*[@id=\"private-key-box\"]");
const pass="qwerty12345";
const buttonImport=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/button");
const fieldNewRPCURL=By.id("new_rpc");
const buttonSave=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/div/div[2]/button");
const arrowBackRPCURL=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/i");
const iconChangeAccount=By.className("cursor-pointer color-orange accounts-selector");

var accN=1;
var networks=[0,3,42,4,8545]

class MetaMask extends page.Page {

    constructor(driver){
        super(driver);
        this.driver=driver;
        this.URL=URL;
        this.name="Metamask :"
    }

    async clickButtonSubmit(){
        logger.info(this.name+"button Submit :");
        await super.clickWithWait(buttonSubmit);

    }
    async submitTransaction(){
        logger.info(this.name+"button Submit Transaction :");
        await this.clickButtonSubmit();

    }

	async activate()
	{
		await this.switchToNextPage();
		logger.info(this.name+"activate: "+this.URL);

		await this.driver.get(this.URL);
		await this.driver.sleep(2000);
		logger.info("Button Accept");
		await super.clickWithWait(buttonAccept);
		var agr= await this.driver.findElement(agreement);
		const action=this.driver.actions();
		await action.click(agr).perform();
		logger.info("Listing agreement");

		for (var i=0;i<15;i++) {

			await action.sendKeys(key.TAB).perform();

		}
		logger.info("Button 2nd Accept");
		await super.clickWithWait(buttonAccept);
		logger.info("Fill password");
		let cc=50;
		do {
			await this.driver.sleep(1000);
			if (super.isElementPresentWithWait(fieldNewPass))
			  break;
		} while(cc-->0);
		if (cc<=0) throw Error("Metamask haven't downloaded");
		await super.clickWithWait(fieldNewPass);
		await super.clickWithWait(fieldNewPass);
		await super.clickWithWait(fieldNewPass);
		await super.fillWithWait(fieldNewPass,pass);
		logger.info("Confirm password");
		await super.fillWithWait(fieldConfirmPass,pass);
		logger.info("Button create");
		await super.clickWithWait(buttonCreate);
		await this.driver.sleep(2000);
		logger.info("Button I've copied");
		await super.clickWithWait(buttonIveCopied);
		await this.switchToNextPage();

	}


    async importAccount(user){
       logger.info(this.name+"import account :");
       await  super.switchToNextPage();

       await  this.chooseProvider(user.networkID);

       await  this.clickImportAccount();
       await  super.fillWithWait(fieldPrivateKey,user.privateKey);
       await  this.driver.sleep(1000);
       await  super.clickWithWait(buttonImport);
        user.accountOrderInMetamask=accN-1;


       await super.switchToNextPage();
    }

    async selectAccount(user){
        logger.info(this.name+"select account :");
         await  this.switchToNextPage();
       // this.clickImportAccount();
        await  this.chooseProvider(user.networkID);
        await super.clickWithWait(popupAccount);
        await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(user.accountOrderInMetamask)+"].click();");

        await this.driver.sleep(1000);//!!!!!!!!!!!!!!!
        await this.switchToNextPage();
    }

     async clickImportAccount(){
        logger.info(this.name+" button ImportAccount :");
        await  super.clickWithWait(popupAccount);
        await this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(accN+1)+"].click();");
        accN++;
    }

	async doTransaction(refreshCount) {
	    logger.info(this.name+"wait and submit transaction :");
	    await this.switchToNextPage();
	    var counter=0;
		var timeLimit=15;
	    if (refreshCount!=undefined) timeLimit=refreshCount;
	    do {
	        await this.refresh();
		    await super.waitUntilLocated(iconChangeAccount);
            if (await this.isElementPresentWithWait(buttonSubmit)) {
	        await this.submitTransaction();
            await  this.switchToNextPage();
            return true;
	        }
	        counter++;
	        logger.info("counter #"+ counter);
		    logger.info("Time limit " +timeLimit);

	        if (counter>=timeLimit) {
	            await this.switchToNextPage();
	            return false;
	        }
        } while(true);
    }

	 async chooseProvider(provider) {
	    logger.info(this.name+"select provider :");
	    await super.clickWithWait(popupNetwork);
	    let n=networks.indexOf(provider);
	    //console.log("Provider="+provider+"  n="+n)
	    if (n<0) await this.addNetwork(provider);
	    else
	    await this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["+n+"].click();");
	}

     async addNetwork(provider) {
        await  this.driver.sleep(1000);//5000
        logger.info(this.name+"add network :");
        let url;

        switch(provider) {
            case 77: {
            url="https://sokol.poa.network";
            networks.push(77);
            break;
            }
            case 99: {
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
        return;
     }
     async clickButtonReject(){

		     logger.info(this.name+": button Reject :");
		     return await super.clickWithWait(buttonReject);
     }

     async rejectTransaction(refreshCount) {

	     logger.info(this.name+"wait and reject transaction :");
	     await this.switchToNextPage();
	     let counter=0;
	     let timeLimit=15;
	     if (refreshCount!=undefined) timeLimit=refreshCount;
	     do {
		     await this.refresh();
		     await super.waitUntilLocated(iconChangeAccount);
		     if (await this.isElementPresentWithWait(buttonReject)) {
			     await this.clickButtonReject();
			     await this.switchToNextPage();
			     return true;
		     }
		     counter++;
		     logger.info("counter #"+ counter);
		     logger.info("Time limit " +timeLimit);

		     if (counter>=timeLimit) {
			     await this.switchToNextPage();
			     return false;
		     }
	     } while(true);
     }



}

module.exports={
    MetaMask:MetaMask


}
