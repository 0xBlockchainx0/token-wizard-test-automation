const fs = require('fs');
const page=require('../pages/Page.js');
Page=page.Page;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
class User {
    constructor(driver,file){
        this.driver=driver;
        var obj=JSON.parse(fs.readFileSync(file,"utf8"));
        this.account=obj.account;
        this.privateKey=obj.privateKey;
        this.networkID=obj.networkID;
    }

    setMetaMaskAccount(){

        var metaMask = new MetaMask(this.driver);
        metaMask.setAccount(this)
    }
    open(url){
        new Page(this.driver).open(url);
    }
}
module.exports.User=User;
