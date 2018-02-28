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
const user=require('../entity/User.js');
const User=user.User;

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
        var ownerFile='./users/user77_56B2.json';
        var owner=new User(this.driver,ownerFile);
        /*var investorFile='./investors/investor3.json';
        var investorFile1='./investors/investor1.json';
        var investorFile2='./investors/investor2.json';
        var owner=new Owner(this.driver,ownerFile);
        var owner1=new Owner(this.driver,ownerFile1);
        var investor = new Investor(this.driver,investorFile);
        var investor1 = new Investor(this.driver,investorFile1);
        var investor2 = new Investor(this.driver,investorFile2);*/
        var crowdsale=new Crowdsale();
	    crowdsale.contractAddress="0x7195ECb520A68f79036cda121fd69Ad7Bf56C65F";
	                             // 0x7195ECb520A68f79036cda121fd69Ad7Bf56C65F
        //crowdsale.url="https://wizard.oracles.org/manage/0x7195ECb520A68f79036cda121fd69Ad7Bf56C65F";

        await owner.setMetaMaskAccount();//77   5b2

        b=await owner.changeEndTime(crowdsale,1,"03/21/2023","12:14am");
	    //b=await owner.changeStartTime(crowdsale,2,"03/21/2010","12:16am");


	    await owner.confirmPopup();
        console.log("Bbbbbbbbb="+b);


        //  var balance=await investor.getBalanceFromPage(url);
        //logger.log("Old balance:"+balance);
       // b=await investor.contribute(1);//buy ALL
       // this.driver.sleep(1000);
       // var newBalance=await investor.getBalanceFromPage(url);
      // logger.log("New balance:"+newBalance);

       // assert.equal(b,true,"Test1->Investor->Contribution failed");



    }


}module.exports.Test4=Test4;
