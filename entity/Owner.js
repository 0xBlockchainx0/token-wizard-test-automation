const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const user=require("./User.js");
const User=user.User;

const meta=require('../pages/MetaMask.js');
const MetaMask=meta.MetaMask;

const wizardWelcome=require('../pages/WizardWelcome.js');
const WizardWelcome=wizardWelcome.WizardWelcome;
const wizStep1=require('../pages/WizardStep1.js');
const WizardStep1=wizStep1.WizardStep1;
const wizStep2=require('../pages/WizardStep2.js');
const WizardStep2=wizStep2.WizardStep2;
const wizStep3=require('../pages/WizardStep3.js');
const WizardStep3=wizStep3.WizardStep3;
const wizStep4=require('../pages/WizardStep4.js');
const WizardStep4=wizStep4.WizardStep4;
const tierpage=require('../pages/TierPage.js');
const TierPage=tierpage.TierPage;
const reservedTokensPage=require('../pages/ReservedTokensPage.js');
const ReservedTokensPage=reservedTokensPage.ReservedTokensPage;
const crowdPage=require('../pages/CrowdsalePage.js');
const CrowdsalePage=crowdPage.CrowdsalePage;
const investPage=require('../pages/InvestPage.js');
const InvestPage=investPage.InvestPage;
const managePage=require('../pages/ManagePage.js');
const ManagePage=managePage.ManagePage;


const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const fs = require('fs');
const currency= require('../entity/Currency.js');
const Currency=currency.Currency;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const timeLimitTransactions=80;
const startURL="https://wizard.poa.network/";


class Owner extends User
{
    constructor(driver,file){
        super(driver,file);

    }

    print(){
        logger.info("account:"+this.account);
        logger.info("privateKey:"+this.privateKey);
        logger.info("networkID:"+this.networkID);

}
  async balance(){
        return 0;
  }
  async openManagePage(crowdsale){
       var welcomePage=new WizardWelcome(this.driver);

       welcomePage.URL=startURL;
       await welcomePage.open();
       await  welcomePage.clickButtonChooseContract();
       var mngPage=new ManagePage(this.driver);
       var counter=0;

       do {this.driver.sleep(1000);
       if(counter++>30) break;
       } while(!await  mngPage.isAvailable());

       mngPage.URL=startURL+"manage/"+crowdsale.contractAddress;
       await mngPage.open();
       await mngPage.waitUntilLoaderGone();

       return mngPage;

   }

   /* async distribute(crowdsale){

        var mngPage=await this.openManagePage(crowdsale);

        this.driver.sleep(5000);
        // logger.info(("Present:"+await mngPage.isPresentButtonDistribute());
        //  logger.info(("Enabled"+await mngPage.isEnabledDistribute());
        if ( await mngPage.isEnabledDistribute())
                 {
                     await mngPage.clickButtonDistribute();
                 }
           else  {return false;}
        var metaMask = new meta.MetaMask(this.driver);
        await metaMask.doTransaction();
        await mngPage.waitUntilLoaderGone();

        var b= await mngPage.confirmPopup();
        return true;
      }

    async finalize(crowdsale){

        await this.openManagePage(crowdsale);
        var mngPage=new ManagePage(this.driver);
        await mngPage.waitUntilLoaderGone();

        if ( await mngPage.isEnabledFinalize())
        {
            await mngPage.clickButtonFinalize();
        }
        else  {return false;}


        var counter=0;
        do{
            if (counter++>50) return false;
            this.driver.sleep(1000);

        }
        while(!(await mngPage.isPresentPopupYesFinalize()));
        this.driver.sleep(1000);
        await mngPage.clickButtonYesFinalize();
        this.driver.sleep(3000);
        var metaMask = new meta.MetaMask(this.driver);
        await metaMask.doTransaction();
        await mngPage.waitUntilLoaderGone();
        var b= await mngPage.confirmPopup();
        return true;
    }


    getAmount(){}

    async createCrowdsale(scenarioFile){

        var utils=new Utils();

        var welcomePage = new wizardWelcome.WizardWelcome(this.driver,startURL);
       // var wallet=new MetaMaskWallet();
       // wallet.account=this.account;
       // wallet.privateKey=this.privateKey;
       // wallet.networkID=this.networkID;
        var metaMask = new MetaMask(this.driver);
        var wizardStep1 = new WizardStep1(this.driver);
        var wizardStep2 = new WizardStep2(this.driver);
        var wizardStep3 = new WizardStep3(this.driver);
        var wizardStep4 = new WizardStep4(this.driver);
        var crowdsalePage = new CrowdsalePage(this.driver);
        var investPage = new InvestPage(this.driver);
        var reservedTokens=new ReservedTokensPage(this.driver);
        var cur=Currency.createCurrency(scenarioFile);
        cur.print();
        var tiers=[];
        for (var i=0;i<cur.tiers.length;i++)
            tiers.push(new TierPage(this.driver,cur.tiers[i]));

        //await metaMask.importAccount(this);

        await  welcomePage.open();
       // this.driver.sleep(1000);
        await  welcomePage.clickButtonNewCrowdsale();
        await this.driver.sleep(3000);
        await  wizardStep1.clickButtonContinue();
        //this.driver.sleep(500);
        await wizardStep2.fillName(cur.name);
        await wizardStep2.fillTicker(cur.ticker);
        await wizardStep2.fillDecimals(cur.decimals);
        for (var i=0;i<cur.reservedTokens.length;i++)
        {
            await reservedTokens.fillReservedTokens(cur.reservedTokens[i]);
           // this.driver.sleep(1000);
            await reservedTokens.clickButtonAddReservedTokens();
           // this.driver.sleep(1000);

        }
        await Utils.zoom(this.driver,0.5);
        utils.takeScreenshoot(this.driver,tempOutputPath);
        await Utils.zoom(this.driver,1);

        await wizardStep2.clickButtonContinue();
        await wizardStep3.fillWalletAddress(cur.walletAddress);

        await wizardStep3.setGasPrice(cur.gasPrice);
        if (cur.whitelisting) await wizardStep3.clickCheckboxWhitelistYes();
        else (await wizardStep3.fillMinCap(cur.minCap));
        utils.takeScreenshoot(this.driver,tempOutputPath);
        for (var i=0;i<cur.tiers.length-1;i++)
        {
            await tiers[i].fillTier();
            utils.takeScreenshoot(this.driver,tempOutputPath);
            await wizardStep3.clickButtonAddTier();
        }
        await tiers[cur.tiers.length-1].fillTier();
        utils.takeScreenshoot(this.driver,tempOutputPath);
        await wizardStep3.clickButtonContinue();
        await this.driver.sleep(5000);

        if (!(await wizardStep4.isPage())) {
            logger.info("Incorrect data in tiers");
            throw ('Incorrect data in tiers');
        }
////////////////////////////////////////////////////////////////////
        var trCounter=0;
        var b=true;
        var timeLimit=timeLimitTransactions*cur.tiers.length;
        do {
            await metaMask.switchToNextPage();
            await  this.driver.sleep(4000);
            await metaMask.refresh();
            await this.driver.sleep(1000);
            if ( await metaMask.isPresentButtonSubmit()) {
                await metaMask.submitTransaction();
                trCounter++;
                logger.info("Transaction# "+trCounter);
            }
            await welcomePage.switchToNextPage();
            await this.driver.sleep(1000);
            if (!(await wizardStep4.isPage())) {
                await this.driver.sleep(2000);
                await wizardStep4.clickButtonOk();
                b=false;
            }
            if((timeLimit--)==0)
            {   var s="Deployment failed.Transaction were done:"+ trCounter;
                logger.info(s);
                b=false;}
        } while (b);
//////////////////////////////////////////////////////////////////
        utils.takeScreenshoot(this.driver,tempOutputPath);
        await this.driver.sleep(5000);
        await wizardStep4.clickButtonContinue();
        this.driver.sleep(5000);
        utils.takeScreenshoot(this.driver,tempOutputPath);
        await wizardStep4.waitUntilLoaderGone();
        b=true;
        var counter=50;

        do {
            try {
                this.driver.sleep(1000);
                await crowdsalePage.clickButtonInvest();
                b=false;
            }
            catch (err){
                counter++;
            }
        } while (b);
        utils.takeScreenshoot(this.driver,tempOutputPath);

        const  ur=await investPage.getURL();
        logger.info("Final invest page link: "+ur);
        logger.info("Transaction were done: "+ trCounter);

        await investPage.waitUntilLoaderGone();
       //await  this.driver.sleep(10000);
        const addr=await investPage.getTokenAddress();
        const contr=await investPage.getContractAddress();

        const  cr=new Crowdsale(cur,addr,contr,ur);
       return cr;
    }
    */




}
module.exports.Owner=Owner;