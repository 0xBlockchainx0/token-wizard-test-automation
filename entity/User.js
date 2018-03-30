const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const deployRegistry= require("../contracts/DeployRegistry.js");
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
const Web3 = require('web3');

const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const fs = require('fs');
const currency= require('../entity/Currency.js');
const Currency=currency.Currency;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const timeLimitTransactions=80;


class User {
    constructor(driver,file){
        this.driver=driver;
        var obj=JSON.parse(fs.readFileSync(file,"utf8"));
        this.account=obj.account;
        this.privateKey=obj.privateKey;
        this.networkID=obj.networkID;
        //this.resultFile=resultFile;
        this.accN="undefined";//for MetaMaskPage only
        this.name=file;
    }


	async getTokenBalance(crowdsale){
    	logger.info("getTokenBalance: account="+this.account);
    	logger.info("token address="+crowdsale.tokenAddress);
    	logger.info("ABI: "+crowdsale.tokenContractAbi);
		try {
			var web3 = Utils.setNetwork(this.networkID);
			var tokenContract=JSON.parse(crowdsale.tokenContractAbi);
			var MyContract = new web3.eth.Contract(tokenContract, crowdsale.tokenAddress);

			var b = await MyContract.methods.balanceOf(this.account).call();
			//logger.info("Balance=" + b);
			return b;
		}
		catch(err){
			logger.info("Can not get balance");
			logger.info("Error:"+err);
			return 0;
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
	    //await Utils.takeScreenshoot(this.driver);
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
	    const  startURL=Utils.getStartURL();
     ////
     /* var welcomePage=new WizardWelcome(this.driver);

        welcomePage.URL=startURL;
        await welcomePage.open();
        await welcomePage.clickButtonChooseContract();

       /* var counter=0;

        do {await this.driver.sleep(1000);
            if(counter++>30) break;
        } while(!await  mngPage.isAvailable());
//*/
		var mngPage=new ManagePage(this.driver);
        mngPage.URL=startURL+"manage/"+crowdsale.contractAddress;
        await mngPage.open();
        await mngPage.waitUntilLoaderGone();
       // await Utils.takeScreenshoot(this.driver);
       if (await mngPage.isPresentButtonOK()) return false;
        return mngPage;

    }

    async getSupplyTier(tier)
	{
		logger.info("Get supply for tier #"+tier);
		let mngPage=new ManagePage(this.driver);
		mngPage.refresh();
		let s="";
		s=await mngPage.getSupplyTier(tier);
		logger.info("Value="+s);

		return s;

	}
	async getRateTier(tier)
	{
		logger.info("Get rate for tier #"+tier);
		let mngPage=new ManagePage(this.driver);
		mngPage.refresh();
		let s="";
		s=await mngPage.getRateTier(tier);
		logger.info("Value="+s);
		return s;

	}

	async getStartTime(tier){ //get endTime from tierpage,manage page should be open
		logger.info("Get start time of tier #"+tier);
		let mngPage=new ManagePage(this.driver);
        mngPage.refresh();
		let s=await mngPage.getStartTimeTier(tier);
		logger.info("Got value= "+s);
		return s;

	}

    async getEndTime(tier){ //get endTime from tierpage,manage page should be open
		logger.info("Get end time of tier #"+tier);
		let mngPage=new ManagePage(this.driver);
		mngPage.refresh();
		let s=await mngPage.getEndTimeTier(tier);
		logger.info("Got value= "+s);
		return s;

	}
	async changeRate(tier,value){

		logger.info("Change Rate for tier#" + tier);
		let mngPage=new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			await mngPage.fillRateTier(tier, value);
			await mngPage.clickButtonSave();
			var metaMask = new MetaMask(this.driver);
			await metaMask.doTransaction(5);
			this.driver.sleep(10000);
			await mngPage.waitUntilLoaderGone();
			var b = await this.confirmPopup();
			this.driver.sleep(20000);
			await mngPage.waitUntilLoaderGone();

			return b;
		}
		catch(err){
			logger.info("Can not change Rate for tier #"+ tier);
			logger.error("Error:"+err);
			return false;

		}
	}

	async fillWhitelistTier(tier,address,min,max)
{
	logger.info("Fill whitelist for tier "+ tier);
	logger.info("Wh address="+address+" , min="+min+ ", max="+max);
	let mngPage=new ManagePage(this.driver);
	await mngPage.fillWhitelist(tier,address,min,max);
	var metaMask = new MetaMask(this.driver);
	var b=await metaMask.doTransaction(5);
	if (!b) return false;
	//if (tier==1) b=await metaMask.doTransaction(5);
	//if (!b) return false;
	await mngPage.waitUntilLoaderGone();
	b = await this.confirmPopup();
	await mngPage.waitUntilLoaderGone();
	return b;

}

	async changeSupply(tier,value){

		logger.info("Change Supply for tier#" + tier);
		let mngPage=new ManagePage(this.driver);
		await mngPage.waitUntilLoaderGone();
		try {
			await mngPage.fillSupplyTier(tier, value);
			await mngPage.clickButtonSave();
			var metaMask = new MetaMask(this.driver);
			await metaMask.doTransaction(5);
			await mngPage.waitUntilLoaderGone();
			var b = await this.confirmPopup();
			await mngPage.waitUntilLoaderGone();

			return b;
		}
		catch(err){
			logger.info("Can not change Supply for tier #"+ tier);
			logger.error("Error:"+err);
			return false;

		}
	}



	async changeEndTime(tier,newDate,newTime) {

		var b=false;
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
			b=await mngPage.fillEndTimeTier(tier, newDate, newTime);
			if (!b) return false;

			if (await mngPage.isPresentWarningEndTimeTier1()||await mngPage.isPresentWarningEndTimeTier2())
			{return false;}
			await mngPage.clickButtonSave();
			var metaMask = new MetaMask(this.driver);
			await metaMask.doTransaction(5);
			await mngPage.waitUntilLoaderGone();

			var b = await this.confirmPopup();
			//await Utils.takeScreenshoot(this.driver);
			await mngPage.waitUntilLoaderGone();

			return b;

		}
		catch(err){
			logger.info("Can not change end time for tier #"+ tier);
			logger.error("Error:"+err);
			return false;

		}
	}

    async changeStartTime(tier,newDate,newTime)
    {

        var b=false;
    	logger.info("Change startTime for tier#"+tier);
	    var format=await Utils.getDateFormat(this.driver);
	    if (format=="mdy") {
		    newDate=Utils.convertDateToMdy(newDate);
		    newTime=Utils.convertTimeToMdy(newTime);

	    }
	    //var mngPage=await this.openManagePage(crowdsale);
	    let mngPage=new ManagePage(this.driver);

	    await mngPage.waitUntilLoaderGone();
	    try {
		    logger.info("Change start time to: "+newDate+ "  " +newTime);
		    var b=await mngPage.fillStartTimeTier(tier, newDate, newTime);
            if (!b) return false;

		    if (await mngPage.isPresentWarningStartTimeTier1()||await mngPage.isPresentWarningStartTimeTier2())
		    	    return false;
		    await mngPage.clickButtonSave();
		    var metaMask = new MetaMask(this.driver);
		    await metaMask.doTransaction();
		    await mngPage.waitUntilLoaderGone();

		    b = await this.confirmPopup();
		    //await Utils.takeScreenshoot(this.driver);
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
	    logger.info(this.account + " distribution");
	    logger.info(this. account+" balance = "+ Utils.getBalance(this));
        var mngPage=await this.openManagePage(crowdsale);
		await mngPage.waitUntilLoaderGone();
		await this.driver.sleep(3000);
		await mngPage.refresh();
		await this.driver.sleep(3000);


        if ( await mngPage.isEnabledDistribute())
        {
            await mngPage.clickButtonDistribute();
        }
        else  {return false;}
        var metaMask = new meta.MetaMask(this.driver);
        await metaMask.doTransaction(5);
        await mngPage.waitUntilLoaderGone();
       // await Utils.takeScreenshoot(this.driver);
        var b= await mngPage.confirmPopup();
        return true;
    }

    async finalize(crowdsale){
	    logger.info(this.account + " finalization");
	    logger.info(this. account+" balance = "+ Utils.getBalance(this));
        await this.openManagePage(crowdsale);
        var mngPage=new ManagePage(this.driver);
        await mngPage.waitUntilLoaderGone();
        await this.driver.sleep(3000);
        await mngPage.refresh();
		await this.driver.sleep(3000);
		await mngPage.clickButtonDistribute();
		await mngPage.refresh();
		await this.driver.sleep(3000);

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
        //await Utils.takeScreenshoot(this.driver);
       // await this.driver.sleep(1000);
        await mngPage.clickButtonYesFinalize();
        //await this.driver.sleep(3000);
        var metaMask = new meta.MetaMask(this.driver);
        await metaMask.doTransaction(5);
        await mngPage.waitUntilLoaderGone();
        //Utils.takeScreenshoot(this.driver);
        var b= await mngPage.confirmPopup();
        return true;
    }


    getAmount(){}

    async createCrowdsale(scenarioFile,Tfactor){


        const  startURL=Utils.getStartURL();
        var welcomePage = new wizardWelcome.WizardWelcome(this.driver,startURL);

        var metaMask = new MetaMask(this.driver);
        var wizardStep1 = new WizardStep1(this.driver);
        var wizardStep2 = new WizardStep2(this.driver);
        var wizardStep3 = new WizardStep3(this.driver);

		WizardStep3.setCountTiers(0);
		WizardStep3.setFlagCustom(false);
		WizardStep3.setFlagWHitelising(false);

        var wizardStep4 = new WizardStep4(this.driver);
        var crowdsalePage = new CrowdsalePage(this.driver);
        var investPage = new InvestPage(this.driver);
        var reservedTokens=new ReservedTokensPage(this.driver);
        var cur=Currency.createCurrency(scenarioFile);

        var tiers=[];
        for (var i=0;i<cur.tiers.length;i++)
            tiers.push(new TierPage(this.driver,cur.tiers[i]));

        await  welcomePage.open();

        await  welcomePage.clickButtonNewCrowdsale();
        let count=10;
        do {
	        await this.driver.sleep(1000);

	        if  ((await wizardStep1.isPresentButtonContinue()) &&
	               !(await wizardStep2.isPresentFieldName()) )
	        {

	        	await wizardStep1.clickButtonContinue();

	        }
	        else break;
        }
        while (count-->0)

		await  wizardStep2.fillName(cur.name);
        await wizardStep2.fillTicker(cur.ticker);
        await wizardStep2.fillDecimals(cur.decimals);
        for (var i=0;i<cur.reservedTokens.length;i++)
        {
            await reservedTokens.fillReservedTokens(cur.reservedTokens[i]);
            // await this.driver.sleep(1000);
            await reservedTokens.clickButtonAddReservedTokens();
            // await this.driver.sleep(1000);

        }


        await wizardStep2.clickButtonContinue();
	    // await this.driver.sleep(3000);
        await wizardStep3.fillWalletAddress(cur.walletAddress);

        await wizardStep3.setGasPrice(cur.gasPrice);
	    //await Utils.takeScreenshoot(this.driver);
        if (cur.whitelisting) await wizardStep3.clickCheckboxWhitelistYes();
        else (await wizardStep3.fillMinCap(cur.minCap));
        //await Utils.takeScreenshoot(this.driver);
        for (var i=0;i<cur.tiers.length-1;i++)
        {
            await tiers[i].fillTier();
            //await Utils.takeScreenshoot(this.driver);
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
        do
          {
           z=await metaMask.doTransaction(5);
	        trCounter++;
           if (!z) {

	           logger.info("Transaction #"+trCounter+" didn't appear.");
	           //b=false;
	            }
	           else {

	           logger.info("Transaction# "+trCounter+" is successfull");
           }

	      await this.driver.sleep(Tfactor*500);//anyway won't be faster than start time
	        if ((await wizardStep4.isPresentButtonSkipTransaction()))
	        {

		        await wizardStep4.clickButtonSkipTransaction();
		        await this.driver.sleep(1000);
		        await wizardStep4.clickButtonYes();
		        logger.info("Transaction #"+ (trCounter+1)+" is skipped.");
		        console.log("Transaction #"+ (trCounter+1)+" is skipped.");
		        trCounter++;
		        skippedTr++;
		        //await this.driver.sleep(5000);//1000
	        }
	        else {
		       // await this.driver.sleep(1000);
		        if (!(await wizardStep4.isPage())) {//if modal NOT present
			        //await this.driver.sleep(10000);

			        await wizardStep4.waitUntilLoaderGone();
			       // await Utils.takeScreenshoot(this.driver);
			        // await this.driver.sleep(5000);
			        await wizardStep4.clickButtonOk();

			        b = false;
		        }
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
	         // console.log("timeLimit="+timeLimit);

        } while (b);

        logger.info("Crowdsale created."+"\n"+" Transaction were done:"+ (trCounter-skippedTr)+
	    "\n"+ "Transaction were skipped: "+skippedTr);
//////////////////////////////////////////////////////////////////
       // await Utils.takeScreenshoot(this.driver);


        await this.driver.sleep(5000);
	    const abi=await wizardStep4.getABI(cur.tiers.length);
	   logger.info(abi);

        await wizardStep4.clickButtonContinue();

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
        const  cr=new Crowdsale(cur,addr,contr,ur,abi);

        return cr;
    }
    async confirmPopup(){
        logger.info("Confirm popup");
        let investPage = new InvestPage(this.driver);
        await this.driver.sleep(1000);
        let c=10;
        while(c-->0) {
            await this.driver.sleep(1000);
            if (await investPage.isPresentWarning()) {

	            await this.driver.sleep(1000);
                await investPage.clickButtonOK();
                return true;
            }
           // await Utils.takeScreenshoot(this.driver);
            return false;
        }

    }


    async  contribute(amount){
    	logger.info(this.account + " contribution = "+amount);
    	logger.info(this. account+" balance = "+ Utils.getBalance(this));
        var investPage = new InvestPage(this.driver);
        await investPage.waitUntilLoaderGone();
        await investPage.fillInvest(amount);
        //await Utils.takeScreenshoot(this.driver);
        await investPage.clickButtonContribute();
        var counter=0;
        var d=true;
        var timeLimit=2;
        do {

            await this.driver.sleep(500);
            //Check if Warning present(wrong start time)->return false
            if (await investPage.isPresentWarning()) {
                var text=await investPage.getWarningText();
                logger.info(this.name+": warning:"+text);
                //await Utils.takeScreenshoot(this.driver);
                //await investPage.clickButtonOK();
                return false;}
            //Check if Error present(transaction failed)->return false
            if (await investPage.isPresentError()) {
                var text=await investPage.getErrorText();
                logger.info(this.name+": error:"+text);
               // await Utils.takeScreenshoot(this.driver);
                //await investPage.clickButtonOK();
                return false;}

            counter++;
            if (counter>=timeLimit) {
                //await Utils.takeScreenshoot(this.driver);
                d=false;
            }
        } while(d);



        var b=await new MetaMask(this.driver).doTransaction(5);

        if (!b) {  return false;}
////////////////////////////////////////////////////Added check if crowdsale NOT started and it failed
        await investPage.waitUntilLoaderGone();
        counter=0;
        var timeLimit=5;
        while(counter++<timeLimit) {
            await this.driver.sleep(500);
            if (await investPage.isPresentWarning()) {
                //await Utils.takeScreenshoot(this.driver);
                await investPage.clickButtonOK();
	            await investPage.waitUntilLoaderGone();
                await this.driver.sleep(3000);
                return true;
            }

        }
       // await Utils.takeScreenshoot(this.driver);
        return false;
    }


    async getBalanceFromPage(url)
    {   logger.info("Get balance from "+url);
        var investPage = new InvestPage(this.driver);

        var curURL=await investPage.getURL();
        if(url!=curURL) await investPage.open(url);
        await investPage.waitUntilLoaderGone();
        //await Utils.takeScreenshoot(this.driver);
	    //await investPage.refresh();
	    await this.driver.sleep(2000);
	    await investPage.refresh();
	    await this.driver.sleep(2000);
	   // await investPage.refresh();
	   // await this.driver.sleep(2000);
        let s=await investPage.getBalance();

        let arr=s.split(" ");
        s=arr[0].trim();
        logger.info("Received "+ s);

        return s;



    }






}
module.exports.User=User;
