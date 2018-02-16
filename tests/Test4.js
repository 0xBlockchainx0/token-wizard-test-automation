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


class Test4 extends BaseTest {
    constructor(driver) {
        super(driver);
    }

    async run(){



        var wallet=new MetaMaskWallet();
        wallet.account="0xF16AB2EA0a7F7B28C267cbA3Ed211Ea5c6e27411";
        wallet.privateKey="03c06a9fab22fe0add145e337c5a8251e140f74468d72eab17ec7419ab812cd0";
        wallet.networkID="4";
        var metaMask = new MetaMask(this.driver,wallet);
        metaMask.switchToAnotherPage();
        metaMask.createAccount();
        metaMask.createAccount();
        metaMask.switchToAnotherPage();

        var investorFile='./investors/investor1.json';
        var investor = new Investor(this.driver,investorFile);

        metaMask.setAccount(investor);



    }


}module.exports.Test4=Test4;
