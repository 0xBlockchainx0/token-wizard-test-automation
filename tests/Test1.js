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

class Test1 extends BaseTest {
    constructor(driver,outputPath) {
        super(driver);
        this.outputPath=outputPath;


    }
   // Ow8	Owner can create crowdsale with parameters:
   // single-tier, reserved tokens, no whitelist
   // Ow19	Owner can distribute tokens after crowdsale
   // Ow18	Owner can finalize crowdsale  after all tokens will sold
   //I14	Investor can buy if no whitelist in crowdsaleI14	Investor can buy if no whitelist in crowdsale
   //I15	Investors receive right amount of tokens after finalize


   async run() {
        var s="Test #1"+"\n"+
       " #Ow8 Owner can create crowdsale with parameters:\n"+
       "single-tier, reserved tokens, no whitelist.\n"+
       " #Ow19 Owner can distribute tokens after crowdsale. \n"+
       " #Ow18 Owner can finalize crowdsale  after all tokens will sold.\n"+
       " #I14  Investor can buy if no whitelist in crowdsale.\n"+
       " #I15  Investors receive right amount of tokens after finalization.\n"+
       " #I25  Reserved addresses receive right amount of tokens after distribution.\n"

        var b=false;
        if (!fs.existsSync(this.outputPath))
           fs.mkdirSync(this.outputPath);
        var outputPath=this.outputPath+"/result"+Utils.getDate();
        if (!fs.existsSync(outputPath))
           fs.mkdirSync(outputPath);
        var logFile=outputPath+"/Test1"+Utils.getDate()+".log";
        fs.writeFileSync(logFile, "Test start time:"+Utils.getDate()+"\n");
        fs.appendFileSync(logFile,s);
        var ownerFile='./owners/owner1.json';
        var owner=new Owner(this.driver,ownerFile);
        var investorFile='./investors/investor1.json';
        var investor = new Investor(this.driver,investorFile);

        var scenario='./scenarios/simple.json';
        fs.appendFileSync(logFile,'Owner: '+ownerFile+"\n");
        fs.appendFileSync(logFile,'Investor: '+investorFile+"\n");
        fs.appendFileSync(logFile,'Scenario: '+scenario+"\n");

        var crowdsale=await owner.createCrowdsale(scenario,outputPath,logFile);

        s= "TokenAddress:  "+crowdsale.tokenAddress+"\n"+
               "ContractAddress:  "+crowdsale.contractAddress+"\n"+
               "url:  "+crowdsale.url+"\n";
        fs.appendFileSync(logFile,s);

        investor.setMetaMaskAccount();
        investor.open(crowdsale.url);

        b=await investor.contribute(crowdsale.currency.tiers[0].supply);//buy ALL
        assert.equal(b,true,"Test1->Investor->Contribution failed");
        owner.setMetaMaskAccount();
        b=await owner.distribute(crowdsale);
        assert.equal(b,true,"Test1->Owner->Distribution failed");
        this.driver.sleep(5000);
        b=await owner.finalize(crowdsale);
        assert.equal(b,true,"Test1->Owner->Finalization failed");
       //var bal=crowdsale.currency.tiers[0].supply*(crowdsale.currency.supply/crowdsale.currency.rate);
       // var n=await owner.balance();
       // assert.equal(b,bal,"Test1->Owner->Wrong balance of token");
       // n=await investor.balanceTokens(crowdsale.tokenAddress);
       // assert.equal(b,crowdsale.currency.tiers[1].supply,"Test1->Investor->Wrong balance of token");
       fs.appendFileSync(logFile, "Test end time:"+Utils.getDate()+'\n');
}

}
module.exports.Test1=Test1;



