const user=require("./User.js");
const User=user.User;
const invest=require('../pages/InvestPage.js');
const InvestPage=invest.InvestPage;
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
      investPage.waitUntilLoaderGone();
      investPage.clickButtonContribute();
      if (await investPage.isPresentWarning()) {investPage.clickButtonOK();return false;}
      return true;
    }

    balanceTokens(tokenAddress){
        return 0;

    }


}
module.exports.Investor=Investor;