const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const meta=require('../pages/MetaMask.js');
const MetaMask=meta.MetaMask;
const page=require('../pages/Page.js');
const Page=page.Page;
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


class User {
    constructor(driver,file,resultFile){
        this.driver=driver;
        var obj=JSON.parse(fs.readFileSync(file,"utf8"));
        this.account=obj.account;
        this.privateKey=obj.privateKey;
        this.networkID=obj.networkID;
        this.resultFile=resultFile;
        this.accN="undefined";//for MetaMaskPage only
        this.name=file;
    }

    async addWhitelistMngPage(tier, min, max){
try {
	let mngPage = new ManagePage(this.driver);
	switch (tier) {
		case 1: {
			await mngPage.fillWhitelistTier1(this.account, min, max);
			break;
		}
		case 2: {
			await mngPage.fillWhitelistTier2(this.account, min, max);
			break;
		}
		default:
			return false;
	}

	await Utils.takeScreenshoot(this.driver);
	await mngPage.clickButtonSave();
	var metaMask = new MetaMask(this.driver);
	await metaMask.doTransaction();
	await mngPage.waitUntilLoaderGone();
	await Utils.takeScreenshoot(this.driver);
	var b = await this.confirmPopup();
	await mngPage.waitUntilLoaderGone();
	return b;
}
catch(err){
	logger.info("Can not fill out whitelist for tier #"+ tier);
	logger.error("Error:"+err);
	return false;

}



    }


    async setMetaMaskAccount(){
        var metaMask = new MetaMask(this.driver);
	    await Utils.takeScreenshoot(this.driver);
        if (this.accN =="undefined")
        {    //console.log("import    accN="+this.accN);//!!!!!
            logger.info("import");
        await metaMask.importAccount(this);
        }
        else
        {logger.info("select");
           // console.log("select    accN="+this.accN);//!!!!!
       await metaMask.selectAccount(this);
        }
    }

    async open(url){

        await new Page(this.driver).open(url);
	    await Utils.takeScreenshoot(this.driver);
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
        const  startURL=Utils.getStartURL();
        welcomePage.URL=startURL;
        await welcomePage.open();
        await  welcomePage.clickButtonChooseContract();
        await Utils.takeScreenshoot(this.driver);
        var mngPage=new ManagePage(this.driver);
        var counter=0;

        do {await this.driver.sleep(1000);
            if(counter++>30) break;
        } while(!await  mngPage.isAvailable());

        mngPage.URL=startURL+"manage/"+crowdsale.contractAddress;
        await mngPage.open();
        await mngPage.waitUntilLoaderGone();
        await Utils.takeScreenshoot(this.driver);

        return mngPage;

    }
	async getStartTime(tier){ //get endTime from tierpage,manage page should be open
		let mngPage=new ManagePage(this.driver);
		let s="";
		switch(tier)
		{
			case 1:{s=await mngPage.getStartTimeTier1();break;}
			case 2:{s=await mngPage.getStartTimeTier2();break;}
			default: break;
		}
		return s;

	}

    async getEndTime(tier){ //get endTime from tierpage,manage page should be open
		let mngPage=new ManagePage(this.driver);
		let s="";
		switch(tier)
		{
			case 1:{s=await mngPage.getEndTimeTier1();break;}
			case 2:{s=await mngPage.getEndTimeTier2();break;}
			default: break;
		}
		return s;

	}

	async changeEndTime(crowdsale,tier,newDate,newTime) {
		logger.info("Change EndTime for tier#" + tier);
		var format=await Utils.getDateFormat(this.driver);
    	if (format=="mdy") {
			newDate=Utils.convertDateToMdy(newDate);
			newTime=Utils.convertTimeToMdy(newTime);

		}


		//var mngPage = await this.openManagePage(crowdsale);
		let mngPage=new ManagePage(this.driver);

		await mngPage.waitUntilLoaderGone();
		try {
			switch (tier) {
				case 1: {
					await mngPage.fillEndTimeTier1(newDate,newTime);
					break;
				}
				case 2: {
					await mngPage.fillEndTimeTier2(newDate,newTime);
					break;
				}
				default:
					return false;
			}
			await Utils.takeScreenshoot(this.driver);


			//await this.driver.sleep(1000);
			if (await mngPage.isPresentWarningEndTimeTier1()||await mngPage.isPresentWarningEndTimeTier2()) return false;
			await mngPage.clickButtonSave();
			var metaMask = new MetaMask(this.driver);
			await metaMask.doTransaction();
			await mngPage.waitUntilLoaderGone();

			var b = await this.confirmPopup();
			await Utils.takeScreenshoot(this.driver);
			await mngPage.waitUntilLoaderGone();

			return b;


			return true;
		}
		catch(err){
			logger.info("Can not change end time for tier #"+ tier);
			logger.error("Error:"+err);
			return false;

		}
	}

    async changeStartTime(crowdsale,tier,newDate,newTime)
    {
        logger.info("Change startTime for tier#"+tier);
	    var format=await Utils.getDateFormat(this.driver);
	    if (format=="mdy") {
		    newDate=Utils.convertDateToMdy(newDate);
		    newTime=Utils.convertTimeToMdy(newTime);

	    }
	    //var mngPage=await this.openManagePage(crowdsale);
	    let mngPage=new ManagePage(this.driver);

	    await mngPage.waitUntilLoaderGone();
	    try{
	    switch (tier) {
		    case 1: {
			    await mngPage.fillStartTimeTier1(newDate,newTime);
			    break;
		    }
		    case 2: {
			    await mngPage.fillStartTimeTier2(newDate,newTime);
			    break;
		    }
		    default:
			    return false;
	        }

		    await Utils.takeScreenshoot(this.driver);
//await this.driver.sleep(1000);
		    if (await mngPage.isPresentWarningStartTimeTier1()||await mngPage.isPresentWarningStartTimeTier2())
		    	    return false;
		    await mngPage.clickButtonSave();
		    var metaMask = new MetaMask(this.driver);
		    await metaMask.doTransaction();
		    await mngPage.waitUntilLoaderGone();

		    var b = await this.confirmPopup();
		    await Utils.takeScreenshoot(this.driver);
		    await mngPage.waitUntilLoaderGone();
		    return b;


		    return true;
	    }
	    catch(err){
	        logger.info("Can not change start time for tier #"+ tier);
		    logger.error("Error:"+err);
	        return false;

            }



    }



    async distribute(crowdsale){

        var mngPage=await this.openManagePage(crowdsale);
       await  Utils.takeScreenshoot(this.driver);
       await  this.driver.sleep(5000);
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
        await Utils.takeScreenshoot(this.driver);
        var b= await mngPage.confirmPopup();
        return true;
    }

    async finalize(crowdsale){

        await this.openManagePage(crowdsale);
        await Utils.takeScreenshoot(this.driver);
        var mngPage=new ManagePage(this.driver);
	    await Utils.takeScreenshoot(this.driver);
        await mngPage.waitUntilLoaderGone();

        if ( await mngPage.isEnabledFinalize())
        {
            await mngPage.clickButtonFinalize();
        }
        else  {return false;}


        var counter=0;
        do{
            if (counter++>50) return false;
            await this.driver.sleep(1000);

        }
        while(!(await mngPage.isPresentPopupYesFinalize()));
        await Utils.takeScreenshoot(this.driver);
        await this.driver.sleep(1000);
        await mngPage.clickButtonYesFinalize();
        await this.driver.sleep(3000);
        var metaMask = new meta.MetaMask(this.driver);
        await metaMask.doTransaction();
        await mngPage.waitUntilLoaderGone();
        //Utils.takeScreenshoot(this.driver);
        var b= await mngPage.confirmPopup();
        return true;
    }


    getAmount(){}

    async createCrowdsale(scenarioFile){


        const  startURL=Utils.getStartURL();
        var welcomePage = new wizardWelcome.WizardWelcome(this.driver,startURL);

        var metaMask = new MetaMask(this.driver);
        var wizardStep1 = new WizardStep1(this.driver);
        var wizardStep2 = new WizardStep2(this.driver);
        var wizardStep3 = new WizardStep3(this.driver);
        var wizardStep4 = new WizardStep4(this.driver);
        var crowdsalePage = new CrowdsalePage(this.driver);
        var investPage = new InvestPage(this.driver);
        var reservedTokens=new ReservedTokensPage(this.driver);
        var cur=Currency.createCurrency(scenarioFile);
	     //console.log ("HSHHSHHSH"+cur.tiers[0].whitelist[0].min);
	    //cur.print();
	   // return;
        //cur.print();
        var tiers=[];
        for (var i=0;i<cur.tiers.length;i++)
            tiers.push(new TierPage(this.driver,cur.tiers[i]));



        await  welcomePage.open();
        // await this.driver.sleep(1000);
        await Utils.takeScreenshoot(this.driver);
        await  welcomePage.clickButtonNewCrowdsale();
        await Utils.takeScreenshoot(this.driver);
        await this.driver.sleep(3000);
        await  wizardStep1.clickButtonContinue();
        //await this.driver.sleep(500);
	   await  Utils.takeScreenshoot(this.driver);
        await wizardStep2.fillName(cur.name);
        await wizardStep2.fillTicker(cur.ticker);
        await wizardStep2.fillDecimals(cur.decimals);
        for (var i=0;i<cur.reservedTokens.length;i++)
        {
            await reservedTokens.fillReservedTokens(cur.reservedTokens[i]);
            // await this.driver.sleep(1000);
            await reservedTokens.clickButtonAddReservedTokens();
            // await this.driver.sleep(1000);

        }
        await Utils.zoom(this.driver,0.5);
        await Utils.takeScreenshoot(this.driver);
        await Utils.zoom(this.driver,1);

        await wizardStep2.clickButtonContinue();
        await wizardStep3.fillWalletAddress(cur.walletAddress);

        await wizardStep3.setGasPrice(cur.gasPrice);
	    await Utils.takeScreenshoot(this.driver);
        if (cur.whitelisting) await wizardStep3.clickCheckboxWhitelistYes();
        else (await wizardStep3.fillMinCap(cur.minCap));
        await Utils.takeScreenshoot(this.driver);
        for (var i=0;i<cur.tiers.length-1;i++)
        {
            await tiers[i].fillTier();
            await Utils.takeScreenshoot(this.driver);
            await wizardStep3.clickButtonAddTier();
        }
        await tiers[cur.tiers.length-1].fillTier();
        await Utils.takeScreenshoot(this.driver);



        await wizardStep3.clickButtonContinue();
        await this.driver.sleep(5000);
	    await Utils.takeScreenshoot(this.driver);
        if (!(await wizardStep4.isPage())) {
            logger.info("Incorrect data in tiers");
            throw ('Incorrect data in tiers');
        }
////////////////////////////////////////////////////////////////////
        var trCounter=0;
        var skippedTr=0;
        var b=true;
        var z=false;
        var timeLimit=timeLimitTransactions*cur.tiers.length;
        do {
           z=await metaMask.doTransaction();
	        trCounter++;
           if (!z) {

	           logger.info("Transaction #"+trCounter+" didn't appear.");
	           //b=false;
	            }
	           else {

	           logger.info("Transaction# "+trCounter+" is successfull");
           }

	        await this.driver.sleep(5000);//1000
	        if (!(await wizardStep4.isNotPresentButtonSkipTransaction()))
	        {
		        await Utils.takeScreenshoot(this.driver);
		        await wizardStep4.clickButtonSkipTransaction();

		        await wizardStep4.clickButtonYes();
		        logger.info("Transaction #"+ trCounter+" is skipped.");
		        console.log("Transaction #"+ trCounter+" is skipped.");
		        skippedTr++;
		        await this.driver.sleep(5000);//1000
	        }   else


            if (!(await wizardStep4.isPage())) {//if modal NOT present
                //await this.driver.sleep(10000);
                await wizardStep4.waitUntilLoaderGone();
	            await Utils.takeScreenshoot(this.driver);
	            // await this.driver.sleep(5000);
		            await wizardStep4.clickButtonOk();

                b=false;
            }

            if (skippedTr>5)
            {
	            var s="Deployment failed because too many skipped transaction."+"\n"+"Transaction were done:"+ (trCounter-skippedTr)+
		            "\n"+ "Transaction were skipped: "+skippedTr;
	            logger.info(s);
	            b=false;
            }

	        if((timeLimit--)==0)
            {   var s="Deployment failed because time expired."+"\n"+" Transaction were done:"+ (trCounter-skippedTr)+
            "\n"+ "Transaction were skipped: "+skippedTr;
                logger.info(s);
                b=false;}
        } while (b);
        logger.info("Crowdsale created."+"\n"+" Transaction were done:"+ (trCounter-skippedTr)+
	    "\n"+ "Transaction were skipped: "+skippedTr);
//////////////////////////////////////////////////////////////////
        await Utils.takeScreenshoot(this.driver);
        await this.driver.sleep(5000);
        await wizardStep4.clickButtonContinue();
        await this.driver.sleep(5000);
        await Utils.takeScreenshoot(this.driver);
        await wizardStep4.waitUntilLoaderGone();
        b=true;
        var counter=50;

        do {
            try {
               await  this.driver.sleep(1000);
                await crowdsalePage.clickButtonInvest();
                b=false;
            }
            catch (err){
                counter++;
            }
        } while (b);
       await Utils.takeScreenshoot(this.driver);

        const  ur=await investPage.getURL();
        logger.info("Final invest page link: "+ur);
        logger.info("Transaction were done: "+ trCounter);

        await investPage.waitUntilLoaderGone();
        //await  this.driver.sleep(10000);
        await Utils.takeScreenshoot(this.driver);
        const addr=await investPage.getTokenAddress();
        const contr=await investPage.getContractAddress();
        const  cr=new Crowdsale(cur,addr,contr,ur);

        return cr;
    }
    async confirmPopup(){

        let investPage = new InvestPage(this.driver);
        await this.driver.sleep(2000);
        let c=50;
        while(c-->0) {
            await this.driver.sleep(1000);
            if (await investPage.isPresentWarning()) {
                await Utils.takeScreenshoot(this.driver);
                await investPage.clickButtonOK();
                return true;
            }
            await Utils.takeScreenshoot(this.driver);
            return false;
        }

    }


    async  contribute(amount){
        var investPage = new InvestPage(this.driver);
        await investPage.waitUntilLoaderGone();
        await investPage.fillInvest(amount);
        await Utils.takeScreenshoot(this.driver);
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
                await Utils.takeScreenshoot(this.driver);
                //await investPage.clickButtonOK();
                return false;}
            //Check if Error present(transaction failed)->return false
            if (await investPage.isPresentError()) {
                var text=await investPage.getErrorText();
                logger.info(this.name+text);
                await Utils.takeScreenshoot(this.driver);
                //await investPage.clickButtonOK();
                return false;}

            counter++;
            if (counter>=timeLimit) {
                await Utils.takeScreenshoot(this.driver);
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
            await this.driver.sleep(1000);
            if (await investPage.isPresentWarning()) {
                await Utils.takeScreenshoot(this.driver);
                await investPage.clickButtonOK();
                return true;
            }

        }
        await Utils.takeScreenshoot(this.driver);
        return false;
    }
    async getBalanceFromPage(url)
    {
        var investPage = new InvestPage(this.driver);
        var curURL=await investPage.getURL();
        if(url!=curURL) await investPage.open(url);
        await investPage.waitUntilLoaderGone();
        await Utils.takeScreenshoot(this.driver);
        await this.driver.sleep(2000);
        let s=await investPage.getBalance();
        let arr=s.split(" ");
        s=arr[0].trim();
        return s;



    }
    balanceTokens(tokenAddress){
        return 0;

    }





}
module.exports.User=User;
