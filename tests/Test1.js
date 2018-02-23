//const Web3 = require('web3');
const fs=require('fs');
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
        var ownerFile='./owners/owner3.json';
        var owner=new Owner(this.driver,ownerFile);
        var ownerFile1='./owners/owner1.json';
        var owner1=new Owner(this.driver,ownerFile1);
        var investorFile='./investors/investor3.json';
        var investor = new Investor(this.driver,investorFile);
        var investorFile1='./investors/investor1.json';
        var investor1 = new Investor(this.driver,investorFile1);

/////////////////////////////////////////////////////////////////////////
s = 'Owner <'+owner.name+'> can create crowdsale,no whitelist,reserved';
     try {
       var scenario='./scenarios/simple.json';
       var crowdsale = await owner.createCrowdsale(scenario);
       logger.info("TokenAddress:  " + crowdsale.tokenAddress);
       logger.info("ContractAddress:  " + crowdsale.contractAddress);
       logger.info("url:  " + crowdsale.url);
       b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
       assert.equal(b, true, 'Test FAILED. ' + s);
       logger.warn("Test PASSED. " + s);
        }
    catch(err){logger.error(err);logger.error("Test FAILED."+s); this.after()}
/////////////////////////////////////////////////////////////////////////////////////
s='Investor can NOT contribute from another network';
     try {
           await investor1.setMetaMaskAccount();
           await investor1.open(crowdsale.url);
           b=await investor1.confirmPopup();
           assert.equal(b, true, "Test1->Investor->can contribute from another network");
           b = await investor1.contribute(crowdsale.currency.tiers[0].supply/2);
           assert.equal(b, false, "Test1->Investor->Contribution");
           logger.warn("Test PASSED. " + s);
       }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
/////////////////////////////////////////////////////////////////////////
s='Investor can NOT contribute less than minCap in first transaction';
    try {
        await investor.setMetaMaskAccount();
        await investor.open(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.minCap * 0.5);
        assert.equal(b, false, "Test1->Investor->Contribution");
        logger.warn("Test PASSED. " + s);
        }
    catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
/////////////////////////////////////////////////////////////////////////
s='Investor can NOT contribute more than supply in tier';
       try {
          // investor.setMetaMaskAccount();
           await investor.open(crowdsale.url);
           b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
           assert.equal(b, false, "Test1->Investor->Contribution");
           logger.warn("Test PASSED. " + s);
       }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
/////////////////////////////////////////////////////////////////////////
s='Investor can contribute minCap';
       try {
         //  investor.setMetaMaskAccount();
           await investor.open(crowdsale.url);
           balance=await investor.getBalanceFromPage(crowdsale.url);
           b = await investor.contribute(crowdsale.currency.minCap);
           newBalance=await investor.getBalanceFromPage(crowdsale.url);
           b=b&&((newBalance-balance)==crowdsale.currency.minCap);
           assert.equal(b, true, "Test1->Investor->Contribution failed");
           logger.warn("Test PASSED. " + s);
       }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
/////////////////////////////////////////////////////////////////////////
s='Investor can contribute less than minCap after first transaction';
       try {
           //investor.setMetaMaskAccount();
           await investor.open(crowdsale.url);
           balance=await investor.getBalanceFromPage(crowdsale.url);
           contribution=crowdsale.currency.minCap+Math.pow(10,(-1)*crowdsale.currency.decimals);
           b = await investor.contribute(contribution);
           newBalance=await investor.getBalanceFromPage(crowdsale.url);
           b=b&&((newBalance-balance)==contribution);
           assert.equal(b, true, "Test1->Investor->Contribution failed");
           logger.warn("Test PASSED. " + s);
       }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
//////////////////////////////////////////////////////////////////////////////////////////////
s=' Owner can NOT distribute before  all tokens were sold';
//////////////////////////////////////////////////////////////////////////////////////////////
s=' Owner can NOT finalize before  all tokens were sold if crowdsale NOT ended ';
///////////////////////////////////////////////////////////////////////////////////////////////
s='Investor can contribute maximum';
       try {
           await investor.setMetaMaskAccount();
           await investor.open(crowdsale.url);
           balance=await investor.getBalanceFromPage(crowdsale.url);
           contribution=crowdsale.currency.tiers[0].supply-balance;
           b = await investor.contribute(contribution);
           newBalance=await investor.getBalanceFromPage(crowdsale.url);
           b=b&&((newBalance-balance)==contribution);
           assert.equal(b, true, "Test1->Investor->Contribution failed");
           logger.warn("Test PASSED. " + s);
       }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s);this.after()}
//////////////////////////////////////////////////////////////////////////////////////
s='NOT Owner can NOT distribute (after all tokens were sold)';
       try {
           await owner1.setMetaMaskAccount();
           b = await owner1.distribute(crowdsale);
           assert.equal(b, false, "Test1->Owner->Distribution allowed");
           logger.warn("Test PASSED. " + s);
           }
       catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
//////////////////////////////////////////////////////////////////////////////////////
      s='NOT Owner can NOT finalize (after all tokens were sold)';
      try {
          //owner1.setMetaMaskAccount();
          b = await owner1.finalize(crowdsale);
          assert.equal(b, false, "Test1->Owner->Finalization allowed");
          logger.warn("Test PASSED. " + s);
      }
      catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
//////////////////////////////////////////////////////////////////////////////////////
s='Owner can distribute (after all tokens were sold)';
      try {
          await owner.setMetaMaskAccount();
          b = await owner.distribute(crowdsale);
          assert.equal(b, true, "Test1->Owner->Distribution failed");
          logger.warn("Test PASSED. " + s);
      }
      catch(err){logger.error(err);logger.error(+"Test FAILED."+s); this.after()}
//////////////////////////////////////////////////////////////////////////////////////
s='Owner can  finalize (after all tokens were sold)';
      try {
          //owner1.setMetaMaskAccount();
          b = await owner.finalize(crowdsale);
          assert.equal(b, true, "Test1->Owner->Finalization failed");
          logger.warn("Test PASSED. " + s);
      }
      catch(err){logger.error(err);logger.error(+"Test FAILED."+s); }
//////////////////////////////////////////////////////////////////////////////////////





  }

after(){
    logger.log("Test end time:");
    // this.driver.close();
     //Utils.saveTestsResults();
     //Utils.deleteTempFiles();
    }
}
module.exports.Test1=Test1;



