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
        var userFile1="./users/user77_41B.json";
        var owner=new User(this.driver,ownerFile);
        var owner1=new User(this.driver,userFile1);

        /*var investorFile='./investors/investor3.json';
        var investorFile1='./investors/investor1.json';
        var investorFile2='./investors/investor2.json';
        var owner=new Owner(this.driver,ownerFile);
        var owner1=new Owner(this.driver,ownerFile1);
        var investor = new Investor(this.driver,investorFile);
        var investor1 = new Investor(this.driver,investorFile1);
        var investor2 = new Investor(this.driver,investorFile2);*/
	    var user77_d13cFile = './users/user77_d13c.json';//whitelisted in tier#1 but will buy in tier #2 only
	    var user77_d13c = new User(this.driver, user77_d13cFile);

	    var user77_d3E4File = './users/user77_d3E4.json';
	    var user77_d3E4=new User(this.driver, user77_d3E4File);


        var crowdsale=new Crowdsale();
	    crowdsale.contractAddress="0xa5B93685bFc3CfBA2AaABD14C58853D4F6345624";
	                             // 0x7195ECb520A68f79036cda121fd69Ad7Bf56C65F
        //crowdsale.url="https://wizard.oracles.org/manage/0x7195ECb520A68f79036cda121fd69Ad7Bf56C65F";

        await owner.setMetaMaskAccount();//77   5b2
	    await owner.openManagePage(crowdsale);
        var whOwner=user77_d3E4;

        var b=await whOwner.addWhitelistMngPage(1,5,77);//tier#1
        console.log("B="+b);










        //let newTime=Utils.getTimeNear(1200000,"utc");//"12:30";
       // let newDate=Utils.getDateNear(1200000,"utc");//"21/03/2020";
        //b=await owner1.changeStartTime(crowdsale,2,newDate,newTime);
       // var ss=await owner1.getStartTime(2);//# of tier, mngPage should be open
        //console.log("SSSSSS"+ss);
        //ss=Utils.compare(ss,newDate,newTime);
        //console.log(ss);
        //b=b&&ss;


	   // b=await owner.changeStartTime(crowdsale,2,"03/21/2010","12:16am");


	   // await owner.confirmPopup();


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
