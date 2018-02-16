const baseTest=require('./BaseTest.js');
const BaseTest=baseTest.BaseTest;
const investPage=require('../pages/InvestPage.js');
const InvestPage=investPage.InvestPage;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
by = require('selenium-webdriver/lib/by');
const By=by.By;

class Test3 extends BaseTest
{
    constructor(driver) {
        super(driver);


    }
    async run()
    {
        var wallet=new MetaMaskWallet();
        wallet.account="0xF16AB2EA0a7F7B28C267cbA3Ed211Ea5c6e27411";
        wallet.privateKey="03c06a9fab22fe0add145e337c5a8251e140f74468d72eab17ec7419ab812cd0";
        wallet.networkID="4";
        var metaMask = new MetaMask(this.driver,wallet);
        metaMask.switchToAnotherPage();
        metaMask.chooseProvider(4);
        metaMask.switchToAnotherPage();

        var e=new InvestPage(this.driver);
        Utils.open("https://wizard.poa.network/invest?addr=0xcB82AF7fD8Baa5A144Eaa90101c4901D987f9bf5&networkID=4")

        e.waitUntilLoaderGone().then().catch();
        console.log(await e.getTokenAddress());
        console.log(await e.getContractAddress());
        console.log(await e.getURL());






    }

}
module.exports.Test3=Test3;