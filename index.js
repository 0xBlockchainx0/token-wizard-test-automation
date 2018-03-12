
const os = require('os');
const test1=require('./tests/Test1.js');
const Test1=test1.Test1;
const test2=require('./tests/Test2.js');
const Test2=test2.Test2;
const test3=require('./tests/Test3.js');
const Test3=test3.Test3;
const test4=require('./tests/Test4.js');
const Test4=test4.Test4;

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
const fs = require('fs-extra');
const assert = require('assert');
const Logger= require('./entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
///////////////////////////////////////
//address="0x9E963042D581D262AdE4E31541360e7FDAeE70C6";
//address="0x56B2e3C3cFf7f3921Dc2e0F8B8e20d1eEc29216b";

let n=Math.round(10*Math.random());
console.log(n);

//////////////////////////
var GoogleSpreadsheet = require('google-spreadsheet');

//xrun();

async function srun(){
	var doc = new GoogleSpreadsheet('1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs');
	var sheet;

}

async function xrun(){
	var driver;
	var util=new Utils();
	driver= await util.startBrowserWithMetamask();
	//await driver.get("https://docs.google.com/spreadsheets/d/1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs/edit#gid=0");

	//
     await driver.get("https://docs.google.com/spreadsheets/d/1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs/edit#gid=0&range=A2");
  // await driver.get("https://docs.google.com/spreadsheets/d/1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs/edit#gid=0&range=A2");
    var el=By.className("cell-input");
  //var el=By.xpath("//*[@id=\"t-formula-bar-input\"]/div");
    var s=await driver.findElement(el).sendKeys("wdwdewed");
    console.log(s);
   var t=await s.getText();
   console.log("SSSSS="+t);
}
//run();

async function run() {


 // @Before Tests


    var driver;
    var util=new Utils();
    driver= await util.startBrowserWithMetamask();
    var mtMask = new MetaMask(driver);
    await mtMask.open();//return activated Metamask and empty page

    var test1 = new Test1(driver,Utils.getOutputPath());
  // var d=await Utils.getDateFormat(driver);
 //  console.log(d);
    //test1.run().then().catch();

    var test3 = new Test3(driver,Utils.getOutputPath());
  //test3.run().then().catch();
    var test4 = new Test4(driver,Utils.getOutputPath());
  // test4.run().then().catch();

  //@After suit
   // driver.close();




}






