const user=require("./User.js");
const User=user.User;
const invest=require('../pages/InvestPage.js');
const InvestPage=invest.InvestPage;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
class Investor extends User
{
    constructor(driver,file){
        super(driver,file);

    }
    print(){
        console.log("account:"+this.account);
        console.log("privateKey:"+this.privateKey);
        console.log("networkID:"+this.networkID);

    }
   async  contribute(amount){
      var investPage = new InvestPage(this.driver);
      investPage.fillInvest(amount);
      await investPage.waitUntilLoaderGone();
      await investPage.clickButtonContribute();

      await new MetaMask(this.driver).doTransaction();

       var counter=0;
       var timeLimit=20;
       do {

           this.driver.sleep(3000);
           //investPage.refresh();
           if (await investPage.isPresentWarning()) {investPage.clickButtonOK();return true;}

           counter++;
           if (counter>=timeLimit) {
               investPage.switchToAnotherPage();
               return false;
           }
       } while(true);
     return true;
    }
    async getBalanceFromPage(url)
    {
        var investPage = new InvestPage(this.driver);
        var curURL=await investPage.getURL();
        if(url!=curURL) investPage.open(url);
        await investPage.waitUntilLoaderGone();
        this.driver.sleep(2000);
        let s=await investPage.getBalance();
        let arr=s.split(" ");
        s=arr[0].trim();
        return s;



    }
    balanceTokens(tokenAddress){
        return 0;

    }


}
module.exports.Investor=Investor;