

const test1=require('./tests/Test1.js');
const Test1=test1.Test1;
const test2=require('./tests/Test2.js');
const Test2=test2.Test2;
const test3=require('./tests/Test3.js');
const Test3=test3.Test3;

const utils=require('./utils/Utils.js');
const Utils=utils.Utils;
const page=require('./pages/Page.js');
const wizardWelcome=require('./pages/WizardWelcome.js');
const metaMask=require('./pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const currency= require('./entity/Currency.js');
const Currency=currency.Currency;
const metaMaskWallet=require('./entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const tierpage=require('./pages/TierPage.js');
const TierPage=tierpage.TierPage;
const Web3 = require('web3');
const fs = require('fs');
///////////////////////////////////////
createPOACrowdsale('config.json');
//ttt();

function ttt(){
  var util=new Utils();
   var  driver=util.startBrowser();
    //var test3=new Test3(driver);
   driver.get("https://wizard.poa.network/invest?addr=0xcB82AF7fD8Baa5A144Eaa90101c4901D987f9bf5&networkID=4");

}
function createPOACrowdsale(configFile) {
    if (!fs.existsSync("./artifacts"))
    fs.mkdirSync("./artifacts");//for CIRCLECI
    var driver;
    var util=new Utils();
   if (util.getInstallMetamask(configFile))
        driver = util.startBrowserWithMetamask();
    else
        driver=util.startBrowser();
   // var testManage = new Test2(driver,configFile);
    //testManage.run();
    var wallet=new MetaMaskWallet();
    wallet.account=this.account;
    wallet.privateKey=this.privateKey;
    wallet.networkID=this.networkID;
    var mtMask = new MetaMask(driver,wallet);
    mtMask.open();//return activated Metamask and empty page


    var testWizard = new Test1(driver);
  //  testWizard.run().then().catch();
    var test = new Test3(driver);
    test.run().then().catch();



}

module.exports={
    createPOACrowdsale:createPOACrowdsale
}




