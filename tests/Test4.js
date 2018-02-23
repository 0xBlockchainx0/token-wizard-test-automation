const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;


const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;
const baseTest=require('./BaseTest.js');
const BaseTest=baseTest.BaseTest;
const owner=require('../entity/Owner.js');
const Owner=owner.Owner;
const investor=require('../entity/Investor.js');
const Investor=investor.Investor;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const assert = require('assert');



class Test4 extends BaseTest {
    constructor(driver) {
        super(driver);
    }

    async run(){

        var b=false;
        var ownerFile='./owners/owner3.json';
        var ownerFile1='./owners/owner1.json';
        var investorFile='./investors/investor3.json';
        var investorFile1='./investors/investor1.json';
        var investorFile2='./investors/investor2.json';
        var owner=new Owner(this.driver,ownerFile);
        var owner1=new Owner(this.driver,ownerFile1);
        var investor = new Investor(this.driver,investorFile);
        var investor1 = new Investor(this.driver,investorFile1);
        var investor2 = new Investor(this.driver,investorFile2);
        var url="https://wizard.poa.network/invest?addr=0x3c740De3314880784A40255Ae8DdCe4c227D7eeb&networkID=77";

        await investor.setMetaMaskAccount();//77   5b2

        await investor1.setMetaMaskAccount();//4   4ca
        await investor.setMetaMaskAccount();//77   5b2

        await investor2.setMetaMaskAccount();//77      27f
//await owner.selectAccount()


        await owner1.setMetaMaskAccount();//4      f16


        //  var balance=await investor.getBalanceFromPage(url);
        //logger.log("Old balance:"+balance);
       // b=await investor.contribute(1);//buy ALL
       // this.driver.sleep(1000);
       // var newBalance=await investor.getBalanceFromPage(url);
      // logger.log("New balance:"+newBalance);

       // assert.equal(b,true,"Test1->Investor->Contribution failed");



    }


}module.exports.Test4=Test4;
