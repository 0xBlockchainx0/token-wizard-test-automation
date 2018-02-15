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


class Test1 extends BaseTest {
    constructor(driver) {
        super(driver);


    }
    async run() {


        var ownerFile='./owners/owner1.json';
        var own=new Owner(this.driver,ownerFile);
        var investorFile='./investors/investor1.json';
        var investor = new Investor(this.driver,investorFile);

        var scenario='./scenarios/T1RnWy.json';
        //var crowdsale=await own.createCrowdsale(scenario);
crowdsale.url="https://wizard.poa.network/invest?addr=0xEFd615B84Bb5452162B608D5Af322fE967264f59&networkID=4";

        investor.setMetaMaskAccount();
        investor.open(crowdsale.url)

        var z=await investor.contribute(4);
console.log(z);
        return;
        own.setMetaMaskAccount();
        var b=await own.finalize(crowdsale);
        console.log(b);


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



}

}
module.exports.Test1=Test1;


