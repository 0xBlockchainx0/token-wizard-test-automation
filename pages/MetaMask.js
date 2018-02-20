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
const buttonSubmit=By.xpath("//*[@id=\"pending-tx-form\"]/div[3]/input");
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
const pass="kindzadza";
const buttonImport=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/button");
const secretWords="mask divorce brief insane improve effort ranch forest width accuse wall ride";
const amountEth=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div/div[2]/div[1]/div/div/div[1]/div[1]");
const fieldNewRPCURL=By.id("new_rpc");
const buttonSave=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[3]/div/div[2]/button");
//const arrowBackRPCURL=By.className("fa fa-arrow-left fa-lg cursor-pointer");
const arrowBackRPCURL=By.xpath("//*[@id=\"app-content\"]/div/div[4]/div/div[1]/i");
var accN=1;
var lengthNetworkMenu=6;
var networks=[];




class MetaMask extends page.Page{

    constructor(driver,wallet){
        super(driver);
        this.URL=URL;
        this.wallet=wallet;


    }
    isButtonSubmitPresent(){}
    setGasPriceTransaction(price){
        super.fillWithWait(fieldGasPrise,price);
    }


    clickButtonSubmit(){
        super.clickWithWait(buttonSubmit);

    }
    clickPopupNetwork(){
        super.clickWithWait(popupNetwork);

    }
     isReadyTransaction(){
        return this.isElementPresent(buttonSubmit);
    }
    submitTransaction(){
        this.clickButtonSubmit();

    }

    unlock() {
    //this.open();
    super.fillWithWait(fieldEnterPass,passMetaMask);
    super.clickWithWait(buttonUnlock);
}

    open()
    {

        this.driver.get(this.URL);
        super.clickWithWait(buttonAccept);
        const action=this.driver.actions();

        action.click(this.driver.findElement(agreement)).perform();

        for (var i=0;i<9;i++) {
            action.sendKeys(key.TAB).perform();

        }
        super.clickWithWait(buttonAccept);
        super.fillWithWait(fieldNewPass,pass);
        super.fillWithWait(fieldConfirmPass,pass);
        super.clickWithWait(buttonCreate);
        this.driver.sleep(1500);
        super.clickWithWait(buttonIveCopied);
        this.switchToAnotherPage();

    }
    clickDotMenu(){
        super.clickWithWait(dotMenu);
    }


    getAddressWallet(){
        //super.clickWithWait(addrWallet);
        return this.driver.findElement(addrWallet).getText();

    }
    importAccount(user){
        this.switchToAnotherPage();
        this.chooseProvider(user.networkID);
        this.clickImportAccount();
        super.fillWithWait(fieldPrivateKey,user.privateKey);
        this.driver.sleep(1500);
        super.clickWithWait(buttonImport);
        user.accN=accN-1;
        this.switchToAnotherPage();
    }

    selectAccount(user){
        this.switchToAnotherPage();
       // this.clickImportAccount();
        super.clickWithWait(popupAccount);
        this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(user.accN)+"].click();");
        this.switchToAnotherPage();
    }

    clickImportAccount(){
        super.clickWithWait(popupAccount);
        this.driver.executeScript( "document.getElementsByClassName('dropdown-menu-item')["+(accN+1)+"].click();");
        accN++;


    }

/*activate(user){


    this.chooseProvider(user.networkID);
    this.clickImportAccount();

    super.fillWithWait(fieldPrivateKey,this.owner.privateKey);
    this.driver.sleep(1500);
    super.clickWithWait(buttonImport);

}*/

async doTransaction(){
    this.switchToAnotherPage();
    var counter=0;
    var timeLimit=10;
    do {

        this.driver.sleep(4000);
        this.refresh();
        this.driver.sleep(500);
        if (await this.isPresentButtonSubmit()) {
            this.submitTransaction();
            this.switchToAnotherPage();
            return true;
        }
        counter++;
        if (counter>=timeLimit) {
            this.switchToAnotherPage();
            return false;
        }
        } while(true);

}


async isPresentButtonSubmit()
{
    return await super.isElementPresent(buttonSubmit);
}

chooseProvider(provider){
    super.clickWithWait(popupNetwork);

        var n;
switch(provider)
{
    case 0:{n=0;break;} //Olympic=>Main
    case 1:{n=0;break;} //Main
    case 2:{n=0;break;} //Mordern=>Main
    case 3:{n=1;break;} //Ropsten
    case 4:{n=3;break;} //Rinkeby
    case 8545:{n=4;break;} //localhost8545
    case 42:{n=2;break;} //Kovan
    default:{

        this.addNetwork(provider);
    }
}
if (n<=4)this.driver.executeScript("document.getElementsByClassName('dropdown-menu-item')["+n+"].click();");

}
    addNetwork(provider){
        var url;

        switch(provider)
        {
            case 77:{url="https://sokol.poa.network";break;}//Sokol
            case 99:{url="https://core.poa.network";break;} //POA
            case 7762959:{url="https://sokol.poa.network";break;} //Musicoin=>SOKOL
            default:{throw("RPC Network not found. Check 'networkID' in scenario(owner,investor) file");}
        }
        this.driver.executeScript("" +
            "document.getElementsByClassName('dropdown-menu-item')["+(lengthNetworkMenu-1)+"].click();");
        super.fillWithWait(fieldNewRPCURL,url);
        super.clickWithWait(buttonSave);

        this.driver.sleep(1000);
        super.clickWithWait(arrowBackRPCURL);
        lengthNetworkMenu++;




    };

    createAccount(){
        super.clickWithWait(popupAccount);
        this.driver.executeScript(
            "document.getElementsByClassName('dropdown-menu-item')["+accN+"].click();");
        accN++;

    }


}

module.exports={
    MetaMask:MetaMask,
    buttonSubmit:buttonSubmit

}
