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
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const assert = require('assert');



class Test4 extends BaseTest {
    constructor(driver) {
        super(driver);
    }

    async run(){

        var b=false;
        var investorFile='./investors/investor1.json';
        var investor = new Investor(this.driver,investorFile);
        var url="https://wizard.poa.network/invest?addr=0xF17ECacECD45c8e89906362Dd5573FD813C971Ab&networkID=4";
        investor.setMetaMaskAccount();
        investor.open(url);



        var balance=await investor.getBalanceFromPage(url);
        console.log(balance);
        b=await investor.contribute(3);//buy ALL
        var newBalance=await investor.getBalanceFromPage(url);
        console.log(newBalance);

        assert.equal(b,true,"Test1->Investor->Contribution failed");



    }


}module.exports.Test4=Test4;
