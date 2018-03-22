const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

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
  /*  print() {
       logger.info("account:" + this.account);
        logger.info("privateKey:" + this.privateKey);
        logger.info("networkID:" + this.networkID);

    }


async confirmPopup(){

   let investPage = new InvestPage(this.driver);
   await this.driver.sleep(2000);
   let c=50;
   while(c-->0) {
       await this.driver.sleep(1000);
       if (await investPage.isPresentWarning()) {
           await investPage.clickButtonOK();
           return true;
       }
   return false;
   }

}


   async  contribute(amount){


      var investPage = new InvestPage(this.driver);
      await investPage.waitUntilLoaderGone();
      await investPage.fillInvest(amount);
      await investPage.clickButtonContribute();

     // await investPage.waitUntilLoaderGone();
       var counter=0;
       var d=true;
       var timeLimit=10;
       do {

           await this.driver.sleep(1000);
           //Check if Warning present(wrong start time)->return false
           if (await investPage.isPresentWarning()) {
               var text=await investPage.getWarningText();
               logger.info(this.name+text);
               //await investPage.clickButtonOK();
               return false;}
           //Check if Error present(transaction failed)->return false
           if (await investPage.isPresentError()) {
               var text=await investPage.getErrorText();
               logger.info(this.name+text);
               //await investPage.clickButtonOK();
               return false;}

           counter++;
           if (counter>=timeLimit) {
             d=false;
           }
       } while(d);



      var b=await new MetaMask(this.driver).doTransaction();

      if (!b) {  return false;}
////////////////////////////////////////////////////Added check if crowdsale NOT started and it failed
     await investPage.waitUntilLoaderGone();
       counter=0;
       var timeLimit=50;
       while(counter++<timeLimit) {
              this.driver.sleep(1000);
              if (await investPage.isPresentWarning()) {
              await investPage.clickButtonOK();
               return true;
           }

         }
     return false;
    }
    async getBalanceFromPage(url)
    {
        var investPage = new InvestPage(this.driver);
        var curURL=await investPage.getURL();
        if(url!=curURL) await investPage.open(url);
        await investPage.waitUntilLoaderGone();
        await this.driver.sleep(2000);
        let s=await investPage.getBalance();
        let arr=s.split(" ");
        s=arr[0].trim();
        return s;



    }
    balanceTokens(tokenAddress){
        return 0;

    }

*/
}
module.exports.Investor=Investor;