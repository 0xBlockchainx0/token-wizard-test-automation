const baseTest=require('./BaseTest.js');
const BaseTest=baseTest.BaseTest;
const owner=require('../entity/Owner.js');
const Owner=owner.Owner;
const investPage=require('../pages/InvestPage.js');
const InvestPage=investPage.InvestPage;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
by = require('selenium-webdriver/lib/by');
const By=by.By;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const currency=require('../entity/Currency.js');
const Currency=currency.Currency;
const assert = require('assert');

class Test3 extends BaseTest
{
    constructor(driver) {
        super(driver);


    }
    async run()
    {

        var cr=new Crowdsale();
        cr.contractAddress="0x5Aa23F2F974432Cd9a631F713944C9077bacb60f";
        cr.tokenAddress="0xA293D65251E7690dB079489F34c2e541AF410e4d";//yes finalize,yes distribute button


        var ownerFile='./owners/owner1.json';
        var owner=new Owner(this.driver,ownerFile);
        owner.setMetaMaskAccount();
        var b;

        //b=await owner.distribute(cr);
        //assert.equal(b,true,"Test1->Owner->Distribution failed");
        b=await owner.finalize(cr);
        assert.equal(b,true,"Test1->Owner->Finalization failed");

    }

}
module.exports.Test3=Test3;