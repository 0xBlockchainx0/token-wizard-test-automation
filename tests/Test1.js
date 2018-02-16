//const Web3 = require('web3');
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
const assert = require('assert');

class Test1 extends BaseTest {
    constructor(driver) {
        super(driver);


    }
   // Ow8	Owner can create crowdsale with parameters:
   // single-tier, no reserved tokens, no whitelist
   //Ow19	Owner can distribute tokens after crowdsale
   // Ow18	Owner can finalize crowdsale  after end time of latest tier
   //I14	Investor can buy if no whitelist in crowdsaleI14	Investor can buy if no whitelist in crowdsale
   //I15	Investors receive right amount of tokens after finalize


   async run() {

        var b=false;
        var ownerFile='./owners/owner1.json';
        var owner=new Owner(this.driver,ownerFile);
        var investorFile='./investors/investor1.json';
        var investor = new Investor(this.driver,investorFile);

        var scenario='./scenarios/T1RnWn_0005.json';
        var crowdsale=await owner.createCrowdsale(scenario);

        console.log("Currency"+crowdsale.currency.print());
        console.log("TokenAddress"+crowdsale.tokenAddress);
        console.log("ContractAddress"+crowdsale.contractAddress);
        console.log("url"+crowdsale.url);

        investor.setMetaMaskAccount();
        investor.open(crowdsale.url)

        b=await investor.contribute(crowdsale.currency.tiers[1].supply);//buy ALL
        assert.equal(b,true,"Test1->Investor->Contribution failed");
        owner.setMetaMaskAccount();
        b=await owner.finalize(crowdsale);
        assert.equal(b,true,"Test1->Owner->Finalization failed");
        var bal=crowdsale.currency.tiers[1].supply*(crowdsale.currency.supply/crowdsale.currency.rate);
        var n=await owner.balance();
        assert.equal(b,bal,"Test1->Owner->Wrong balance of token");
        n=await investor.balanceTokens(crowdsale.tokenAddress);
        assert.equal(b,crowdsale.currency.tiers[1].supply,"Test1->Investor->Wrong balance of token");

}

}
module.exports.Test1=Test1;


// https://wizard.poa.network/manage/0x011C0608e9858f22564C31199438f9a732B6f157
// crowdsale.contractAddress="0x72A02BB92714c8c675785cD2f6748220e66243c2";
//crowdsale.tokenAddress="0x89F0d1E1a12CAC229b71F687939e7bE7b45CF249";//yes finalize,no distribute button
//crowdsale.contractAddress="0x41ED3972fEBFa8d62B201eE3184D6Cf09766E440";
//crowdsale.tokenAddress="0xd81838C299a2074478fBBb5e32B120Aa44025680";//yes finalize,yes distribute button


/*
        var scenario='./scenarios/T1RnWy.json';

        var crowdsale=await own.createCrowdsale(scenario);
        console.log("TokenAddress"+crowdsale.tokenAddress);
        console.log("ContractAddress"+crowdsale.contractAddress);
        console.log("url"+crowdsale.url);
       */

//crowdsale.url="https://wizard.poa.network/invest?addr=0xEFd615B84Bb5452162B608D5Af322fE967264f59&networkID=4";
//console.log("Hello!");


