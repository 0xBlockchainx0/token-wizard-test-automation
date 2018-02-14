const user=require("./User.js");
const User=user.User;

const wizardWelcome=require('../pages/WizardWelcome.js');
const meta=require('../pages/MetaMask.js');

const wizStep1=require('../pages/WizardStep1.js');
const wizStep2=require('../pages/WizardStep2.js');
const wizStep3=require('../pages/WizardStep3.js');
const wizStep4=require('../pages/WizardStep4.js');

const tierpage=require('../pages/TierPage.js');
const TierPage=tierpage.TierPage;
const reservedTokensPage=require('../pages/ReservedTokensPage.js');
const ReservedTokensPage=reservedTokensPage.ReservedTokensPage;

const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const fs = require('fs');
const currency= require('../entity/Currency.js');
const Currency=currency.Currency;
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;
const crowdPage=require('../pages/CrowdsalePage.js');
const invest=require('../pages/InvestPage.js');
const StartBrowserWithMetamask=require('../utils/Utils.js');
const startBrowserWithMetamask=StartBrowserWithMetamask.startBrowserWithMetamask;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const timeLimitTransactions=80;
const buttonSubmit=require('../pages/MetaMask.js');
const buttonContinue=require('../pages/WizardStep4.js');

class Owner extends User
{
    constructor(driver,file){
        super(driver,file);

    }

    print(){
        console.log("account:"+this.account);
        console.log("privateKey:"+this.privateKey);
        console.log("networkID:"+this.networkID);

}

   openManage(){

   }

    distribute(){}

    finalize(){}


    getAmount(){}



    async createCrowdsale(scenarioFile){
        var utils=new Utils();
        var d=new Date();
        var outputDirectory="./results"+d.getTime();
        fs.mkdirSync(outputDirectory);
        fs.writeFileSync(outputDirectory+'/result.log', "Test start time:"+d.getTime());
        const startURL="https://wizard.poa.network/";
        var welcomePage = new wizardWelcome.WizardWelcome(this.driver,startURL);
        var wallet=new MetaMaskWallet();
        wallet.account=this.account;
        wallet.privateKey=this.privateKey;
        wallet.networkID=this.networkID;
        var metaMask = new meta.MetaMask(this.driver,wallet);
        var wizardStep1 = new wizStep1.WizardStep1(this.driver);
        var wizardStep2 = new wizStep2.WizardStep2(this.driver);
        var wizardStep3 = new wizStep3.WizardStep3(this.driver);
        var wizardStep4 = new wizStep4.WizardStep4(this.driver);
        var crowdsalePage = new crowdPage.CrowdsalePage(this.driver);
        var investPage = new invest.InvestPage(this.driver);
        var reservedTokens=new ReservedTokensPage(this.driver);
        var cur=Currency.createCurrency(scenarioFile);
        cur.print();
        var tiers=[];
        for (var i=0;i<cur.tiers.length;i++)
            tiers.push(new TierPage(this.driver,cur.tiers[i]));
        metaMask.setAccount(this);
        welcomePage.open();
        welcomePage.clickButtonNewCrowdsale();
        this.driver.sleep(2000);
        wizardStep1.clickButtonContinue();
        this.driver.sleep(500);
        wizardStep2.fillName(cur.name);
        wizardStep2.fillTicker(cur.ticker);
        wizardStep2.fillDecimals(cur.decimals);
        for (var i=0;i<cur.reservedTokens.length;i++)
        {
            reservedTokens.fillReservedTokens(cur.reservedTokens[i]);
            reservedTokens.clickButtonAddReservedTokens();
        }
        utils.zoom(this.driver,0.5);
        utils.takeScreenshoot(this.driver,outputDirectory);
        utils.zoom(this.driver,1);
        wizardStep2.clickButtonContinue();
        wizardStep3.fillWalletAddress(cur.walletAddress);
        wizardStep3.setGasPrice(cur.gasPrice);
        if (cur.whitelisting) wizardStep3.clickCheckboWhitelistYes();
        else (wizardStep3.fillMinCap(cur.minCap));
        utils.takeScreenshoot(this.driver,outputDirectory);
        for (var i=0;i<cur.tiers.length-1;i++)
        {
            tiers[i].fillTier();
            utils.takeScreenshoot(this.driver,outputDirectory);
            wizardStep3.clickButtonAddTier();
        }
        tiers[cur.tiers.length-1].fillTier();
        utils.takeScreenshoot(this.driver,outputDirectory);
        wizardStep3.clickButtonContinue();
        this.driver.sleep(2000);
        if (!(await wizardStep4.isPage()))throw new Error('incorrect data in tiers');

        var trCounter=0;
        var b=true;
        var timeLimit=timeLimitTransactions*cur.tiers.length;
        do {
            metaMask.switchToAnotherPage();
            this.driver.sleep(6000);
            metaMask.refresh();
            this.driver.sleep(1000);
            if ( await metaMask.isPresentButtonSubmit()) {
                metaMask.submitTransaction();
                trCounter++;
                console.log("Transaction#"+trCounter);
            }
            welcomePage.switchToAnotherPage();
            this.driver.sleep(1000);
            if (!(await wizardStep4.isPage())) {
                this.driver.sleep(2000);
                wizardStep4.clickButtonOk();
                b=false;
            }
            if((timeLimit--)==0)
            {  var s="Deployment failed.Transaction were done:"+ trCounter;
                fs.appendFileSync(outputDirectory+'/result.log',"\n"+s);
                console.log(s);
                b=false;}
        } while (b);

        utils.takeScreenshoot(this.driver,outputDirectory);
        wizardStep4.clickButtonContinue();
        this.driver.sleep(5000);
        utils.takeScreenshoot(this.driver,outputDirectory);

        b=true;
        var counter=30;

        do {
            try {
                this.driver.sleep(1000);
                crowdsalePage.clickButtonInvest();
                b=false;
            }
            catch (err){
                counter++;
            }
        } while (b);
        utils.takeScreenshoot(this.driver,outputDirectory);
        this.driver.getCurrentUrl().then((res)=>{
            console.log("Final invest page link: "+res);
            fs.appendFileSync(outputDirectory+'/result.log', "\n\Final invest page link: \""+res);
            fs.writeFileSync('./artifacts/result.log', res);//for circleci
        });
        s="Transaction were done: "+ trCounter;
        console.log(s);
        fs.appendFileSync(outputDirectory+'/result.log',s+'\n');
        fs.appendFileSync(outputDirectory+'/result.log', "Test end time:"+new Date().getTime()+'\n');

        e.waitUntilLoaderGone().then().catch();
        return
           await new Crowdsale(cur,
                               await investPage.getTokenAddress(),
                               await investPage.getContractAddress(),
                               await investPage.getURL()
                              );


    }





}
module.exports.Owner=Owner;