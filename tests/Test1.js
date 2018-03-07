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
var b;
        var balance=0;
        var newBalance=0;
        var contribution=0;
        var cr=new Crowdsale();
	    cr.contractAddress="0x281dc6e17B63F78482E24eD7f9418903Fb185283";
	//  cr.url="https://wizard.poa.network/invest?addr=0x281dc6e17B63F78482E24eD7f9418903Fb185283&networkID=77";

        var ownerFile='./users2/user77_a3e8.json';
        var user77_a3e8=new User(this.driver,ownerFile);
	    var user77_AAcdFile='./users2/user77_AAcd.json';
	    var user77_AAcd=new User(this.driver,user77_AAcdFile);

	  var user77_a75CFile='./users2/user77_a75C.json';
	  var user77_a75C=new User(this.driver,user77_a75CFile);

	  var user77_AbDEFile='./users2/user77_AbDE.json';
	  var user77_AbDE=new User(this.driver,user77_AbDEFile);

	  var user77_d3E4File='./users/user77_d3E4.json';
	  var user77_d3E4=new User(this.driver,user77_d3E4File);

/////////////////////////////////////////////////////////////////////////
	//'Owner can modify start time of tier if tier has not started yet'

			  b=false;
			  var owner = user77_a3e8;//Owner
			  await owner.setMetaMaskAccount();//77   5b2
			  await owner.openManagePage(cr);
			  let newTime=Utils.getTimeNear(120000,"utc");//"12:30";
			  let newDate=Utils.getDateNear(120000,"utc");//"21/03/2020";
			  b=await owner.changeStartTime(cr,1,newDate,newTime);
			  var s=await owner.getStartTime(1);//# of tier, mngPage should be open
			  b=b&&Utils.compare(s,newDate,newTime);
			  assert.equal(b, true, 'Test FAILED. Owner can NOT modify start time of tier if tier has not started yet');
			  logger.info('Test PASSED. Owner can modify start time of tier if tier has not started yet');






  }


}
module.exports.Test1=Test1;



