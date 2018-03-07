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

const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const assert = require('assert');
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;






class Test1 extends BaseTest {
    constructor(driver,outputPath) {
        super(driver);
        this.outputPath=outputPath;


    }
  async run() {

var investor;
var min;
var max;

        var balance=0;
        var newBalance=0;
        var contribution=0;
        var cr=new Crowdsale();
	    cr.contractAddress="0x57E2680e98B45b543Ed3DC4Ccb7123382e96fA26";

        var ownerFile='./users2/user77_a3e8.json';
        var user77_a3e8=new User(this.driver,ownerFile);
	    var user77_AAcdFile='./users2/user77_AAcd.json';
	    var user77_AAcd=new User(this.driver,user77_AAcdFile);
	    var URL="https://wizard.poa.network/manage/0x57E2680e98B45b543Ed3DC4Ccb7123382e96fA26";
	  // /
	 // 'Owner can add whitelist if tier has not finished yet'
/////////////////////////////////////////////////////////////////////////

	  var b=false;
	  var owner = user77_a3e8;//Owner
	  await owner.setMetaMaskAccount();
	  await owner.openManagePage(cr);
	  investor=user77_AAcd;//Whitelisted investor #3 ,
                           //will be added in tier 1 from manage page
	  min=5;
	  max=77;
	  b=await investor.addWhitelistMngPage(1,min,max);//tier#1, Min,Max
	 // assert.equal(b, true, 'Test FAILED. Owner can NOT add whitelist if tier has not finished yet');
	  //logger.info('Test PASSED. Owner can add whitelist if tier has not finished yet');
console.log("BBB="+b);







  }


}
module.exports.Test1=Test1;



