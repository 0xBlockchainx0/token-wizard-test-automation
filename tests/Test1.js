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
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;

class Test1 extends BaseTest {
    constructor(driver) {
        super(driver);


    }
    async run() {

        var account='./owners/owner1.json';
        var scenario='./scenarios/T1RnWy.json';
        var own=new Owner(this.driver,account);
        var crowdsale=await own.createCrowdsale(scenario);
        console.log("TokenAddress"+crowdsale.tokenAddress);
        console.log("ContractAddress"+crowdsale.contractAddress);
        console.log("url"+crowdsale.url);
        own.openManage();



}

}
module.exports.Test1=Test1;


