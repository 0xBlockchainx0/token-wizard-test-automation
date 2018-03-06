//const Web3 = require('web3');
const fs=require('fs');
const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const By=by.By;
const baseTest=require('./BaseTest.js');
const BaseTest=baseTest.BaseTest;
const user=require('../entity/User.js');
const User=user.User;
const investor=require('../entity/Investor.js');
const Investor=investor.Investor;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const crowdsale=require('../entity/Crowdsale.js');
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const assert = require('assert');
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;






class Test1 extends BaseTest {
    constructor(driver,outputPath) {
        super(driver);
        this.outputPath=outputPath;


    }
  async run() {

        var b=false;
        var balance=0;
        var newBalance=0;
        var contribution=0;
        var s="Test start time:"+Utils.getDate();
        logger.info(s);
        var ownerFile='./users/user77_27F2.json';
        var owner=new User(this.driver,ownerFile);

/////////////////////////////////////////////////////////////////////////
s = 'Owner <'+owner.name+'> can create crowdsale,no whitelist,reserved';

      var scenario='./scenarios/T2RyWyMy_0020.json';
	 //var scenario='./scenarios/simple.json';
	  //var scenario='./scenarios/testSuite2.json';
	 // var scenario='./scenarios/T3RnWn.json';
       await owner.setMetaMaskAccount();
       var crowdsale = await owner.createCrowdsale(scenario);
       //logger.info("TokenAddress:  " + crowdsale.tokenAddress);
       //logger.info("ContractAddress:  " + crowdsale.contractAddress);
       //logger.info("url:  " + crowdsale.url);
      // b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
      /// assert.equal(b, true, 'Test FAILED. ' + s);
      // logger.warn("Test PASSED. " + s);


  }

after(){
    //logger.log("Test end time:");
    // this.driver.close();
     //Utils.saveTestsResults();
     //Utils.deleteTempFiles();
    }
}
module.exports.Test1=Test1;



