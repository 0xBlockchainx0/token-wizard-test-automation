const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
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
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
const page=require('../pages/Page.js');
const Page=page.Page;
const testRA=require('../test/testRA.js');


const timeLimitTransactions=25;

class User {
  constructor(driver,file){
try{
	   this.driver = driver;
	   var obj = JSON.parse(fs.readFileSync(file, "utf8"));
	   this.account = obj.account;
	   this.privateKey = obj.privateKey;
	   this.networkID = obj.networkID;
	   this.accountOrderInMetamask = "undefined";//for MetaMaskPage only
	   this.name = file;
  } catch (err) {
   	   logger.info("can not create User instance");
   	   logger.info(err);
     }

  }

  async getTokenBalance(crowdsale) {
    logger.info("GetTokenBalance: account="+this.account);
    logger.info("Token address="+crowdsale.tokenAddress);
    try {
	  let web3 = Utils.setNetwork(this.networkID);
	  let tokenContract=crowdsale.tokenContractAbi;
	  let MyContract = new web3.eth.Contract(tokenContract, crowdsale.tokenAddress);
      return await MyContract.methods.balanceOf(this.account).call();
	}
	catch(err) {
	  logger.info("Can not get balance. "+err);
	  return 0;
	}
  }

  async setMetaMaskAccount() {
  	logger.info("Set Metamask account")
    let metaMask = new MetaMask(this.driver);
	if (this.accountOrderInMetamask =="undefined") {
      await metaMask.importAccount(this);
    }
      else {
		await metaMask.selectAccount(this);
	  }
  }

  print(){
    logger.info("account:"+this.account);
    logger.info("privateKey:"+this.privateKey);
    logger.info("networkID:"+this.networkID);
  }

  async openInvestPage(crowdsale) {
	await new Page(this.driver).open(crowdsale.url);
  }

  async openManagePage(crowdsale) {
  	logger.info("Open manage page")
    const  startURL=Utils.getStartURL();
    /* var welcomePage=new WizardWelcome(this.driver);
        welcomePage.URL=startURL;
        await welcomePage.activate();
        await welcomePage.clickButtonChooseContract();*/

	let mngPage=new ManagePage(this.driver);
    mngPage.URL=startURL+"manage/"+crowdsale.contractAddress;
    await mngPage.open();
    await mngPage.waitUntilLoaderGone();
    if (await mngPage.isPresentButtonOK()) return false;
    return mngPage;
  }

  async getSupplyTier(tier)	{
	logger.info("get Supply for tier #"+tier);
	let mngPage=new ManagePage(this.driver);
	await mngPage.refresh();
	let s=await mngPage.getSupplyTier(tier);
	logger.info("Received value="+s);
    return s;
  }

  async getRateTier(tier) {
    logger.info("get Rate for tier #"+tier);
	let mngPage=new ManagePage(this.driver);
	await mngPage.refresh();
	let s=await mngPage.getRateTier(tier);
	logger.info("Received value="+s);
	return s;
  }

  async getStartTime(tier){
    logger.info("get Start time of tier #"+tier);
	let mngPage=new ManagePage(this.driver);
    await mngPage.refresh();
	let s=await mngPage.getStartTimeTier(tier);
	logger.info("Received value="+s);
	return s;
  }

  async getEndTime(tier) {
	logger.info("get End time of tier #"+tier);
	let mngPage=new ManagePage(this.driver);
	await mngPage.refresh();
	let s=await mngPage.getEndTimeTier(tier);
	logger.info("Received value="+s);
	return s;
  }

  async changeRate(tier,value) {
    logger.info("change Rate for tier#" + tier);
	let mngPage=new ManagePage(this.driver);
	await mngPage.waitUntilLoaderGone();
	try {
	  await mngPage.fillRateTier(tier, value);
	  await mngPage.clickButtonSave();
	  let metaMask = new MetaMask(this.driver);
	  await metaMask.doTransaction(5);
	  await mngPage.waitUntilLoaderGone();
	  let result = await this.confirmPopup();
      await mngPage.waitUntilLoaderGone();
      return result;
	}
	catch(err){
	  logger.info("can not change Rate for tier #"+ tier+" ,err:"+err );
	  return false;
	}
  }

  async fillWhitelistTier(tier,address,min,max) {
	logger.info("fill whitelist for tier "+ tier);
	logger.info("Wh address="+address+" , min="+min+ ", max="+max);
	let mngPage=new ManagePage(this.driver);
	await mngPage.fillWhitelist(tier,address,min,max);
	let metaMask = new MetaMask(this.driver);
	let result=await metaMask.doTransaction(5);
	if (!result) return false;
	await mngPage.waitUntilLoaderGone();
	result = await this.confirmPopup();
	await mngPage.waitUntilLoaderGone();
	return result;
  }

  async changeSupply(tier,value){
    logger.info("change Supply for tier#" + tier);
	let mngPage=new ManagePage(this.driver);
	await mngPage.waitUntilLoaderGone();
	try {
	  await mngPage.fillSupplyTier(tier, value);
	  await mngPage.clickButtonSave();
	  let metaMask = new MetaMask(this.driver);
	  await metaMask.doTransaction(5);
	  await mngPage.waitUntilLoaderGone();
	  let result = await this.confirmPopup();
	  await mngPage.waitUntilLoaderGone();
      return result;
	}
	catch(err){
	  logger.info("can not change Supply for tier #"+ tier+" ,err:"+err );
	  return false;
	}
  }

  async changeEndTime(tier, newDate, newTime) {
    logger.info("change EndTime for tier#"+tier+", new date="+newDate+", new time="+newTime);
    let formatTimeBrowser=await Utils.getDateFormat(this.driver);
    if (formatTimeBrowser=="mdy") {
	  newDate=Utils.convertDateToMdy(newDate);
	  newTime=Utils.convertTimeToMdy(newTime);
	}
	let mngPage=new ManagePage(this.driver);
	await mngPage.waitUntilLoaderGone();
	try {
      let b=await mngPage.fillEndTimeTier(tier, newDate, newTime);
      if (!b) return false;
      if ( await mngPage.isPresentWarningEndTimeTier1()||
           await mngPage.isPresentWarningEndTimeTier2()
         ) {
        return false;
      }
	await mngPage.clickButtonSave();
	let metaMask = new MetaMask(this.driver);
	await metaMask.doTransaction(5);
	await mngPage.waitUntilLoaderGone();
    b = await this.confirmPopup();
	await mngPage.waitUntilLoaderGone();
	return b;
	}
	catch(err){
      logger.info("can not change Supply for tier #"+ tier+" ,err:"+err );
      return false;
	}
  }

  async changeStartTime(tier,newDate,newTime) {
  	logger.info("change StartTime for tier#"+tier+", new date="+newDate+", new time="+newTime);
	let formatTimeBrowser=await Utils.getDateFormat(this.driver);
  	if (formatTimeBrowser=="mdy") {
      newDate=Utils.convertDateToMdy(newDate);
	  newTime=Utils.convertTimeToMdy(newTime);
    }
    let mngPage=new ManagePage(this.driver);
    await mngPage.waitUntilLoaderGone();
    try {
      let result=await mngPage.fillStartTimeTier(tier, newDate, newTime);
      if (!result) return false;
      if ( await mngPage.isPresentWarningStartTimeTier1()||
	       await mngPage.isPresentWarningStartTimeTier2()
         )
        return false;
      await mngPage.clickButtonSave();
	  let metaMask = new MetaMask(this.driver);
	  await metaMask.doTransaction();
	  await mngPage.waitUntilLoaderGone();
      result = await this.confirmPopup();
	  await mngPage.waitUntilLoaderGone();
	  return result;
    }
	catch(err){
	  logger.info("can not change start time for tier #"+ tier+" ,err:"+err );
	  return false;
    }
  }

  async distribute(crowdsale) {

  	logger.info(this.account + ": distribution:");

  	let mngPage=await this.openManagePage(crowdsale);
  	await mngPage.refresh();
	  logger.info("Snapshot:");
	  logger.info("Time now: "+Utils.getDate());
	  logger.info("Start time: "+await mngPage.getStartTimeTier(1));
	  logger.info("End time: "+await mngPage.getEndTimeTier(1));
	  logger.info("isDistributionEnabled: "+await mngPage.isEnabledDistribute());
	  logger.info("isFinalizeEnabled: "+await mngPage.isEnabledFinalize());
	  logger.info("walletAddress: "+await mngPage.getWalletAddressTier(1));

	  await mngPage.waitUntilLoaderGone();
	  await this.driver.sleep(3000);
	  if (await mngPage.isEnabledFinalize())
	  	  await mngPage.clickButtonFinalize();

	  //await Utils.zoom(this.driver,0.5);
	  //await Utils.takeScreenshoot(this.driver,"manage1");
	  //await Utils.zoom(this.driver,1);

	  await mngPage.waitUntilLoaderGone();
	await mngPage.refresh();
	await this.driver.sleep(3000);
	let result=false;
	for (let i=0;i<2;i++) {
	  result=(await mngPage.isEnabledDistribute())||result;
	}
	//await Utils.zoom(this.driver,0.5);

	//await Utils.takeScreenshoot(this.driver,"manage2");
	//await Utils.zoom(this.driver,1);

    if (result) {
      await mngPage.clickButtonDistribute();
    }
      else {
	    await mngPage.clickButtonDistribute();
	    return false;
	  }
    let metaMask = new meta.MetaMask(this.driver);
    await metaMask.doTransaction(10);
    await mngPage.waitUntilLoaderGone();
    result = await mngPage.confirmPopup();
    return true;
  }

  async finalize(crowdsale) {
    logger.info(this.account + ": finalize:");
    await this.openManagePage(crowdsale);
    let mngPage=new ManagePage(this.driver);
    await mngPage.waitUntilLoaderGone();
    await this.driver.sleep(3000);
    await mngPage.refresh();
    await this.driver.sleep(3000);
	await mngPage.clickButtonDistribute();
    await mngPage.refresh();
    await this.driver.sleep(3000);
    if ( await mngPage.isEnabledFinalize()) {
      await mngPage.clickButtonFinalize();
    }
      else {
    	return false;
      }
    let counter=0;
    do {
      if (counter++>20) return false;
      await this.driver.sleep(1000);
    } while(!(await mngPage.isPresentPopupYesFinalize()));
    await mngPage.clickButtonYesFinalize();
    let metaMask = new meta.MetaMask(this.driver);
    await metaMask.doTransaction(5);
    await mngPage.waitUntilLoaderGone();
    await mngPage.confirmPopup();
    return true;
  }

  async createCrowdsale(crowdsale,Tfactor,option) {

  	logger.info("create crowdsale:")
	let refreshCount=5;
	if ((this.networkID!=8545)&&(this.networkID!=77)) refreshCount=15;

    const  startURL=Utils.getStartURL();
	const welcomePage = new WizardWelcome(this.driver,startURL);
	const metaMask = new MetaMask(this.driver);
	const wizardStep1 = new WizardStep1(this.driver);
	const wizardStep2 = new WizardStep2(this.driver);
	const wizardStep3 = new WizardStep3(this.driver);

	WizardStep3.setCountTiers(0);
	WizardStep3.setFlagCustom(false);
	WizardStep3.setFlagWHitelising(false);

	const wizardStep4 = new WizardStep4(this.driver);
	const crowdsalePage = new CrowdsalePage(this.driver);
	const investPage = new InvestPage(this.driver);
	const reservedTokens=new ReservedTokensPage(this.driver);

    let tiers=[];
    for (let i=0;i<crowdsale.tiers.length;i++)
      tiers.push(new TierPage(this.driver,crowdsale.tiers[i]));
    await  welcomePage.open();
    await  welcomePage.clickButtonNewCrowdsale();
    let count=30;
    do {
      await this.driver.sleep(1000);
      if  ((await wizardStep1.isPresentButtonContinue()) &&
          !(await wizardStep2.isPresentFieldName()) )
      {
       	await wizardStep1.clickButtonContinue();
      }
        else break;
    } while (count-->0)

    do { await  wizardStep2.fillName(crowdsale.name);
    } while(await wizardStep2.isPresentWarningName());

    do { await wizardStep2.fillTicker(crowdsale.ticker);
    } while(await wizardStep2.isPresentWarningTicker());

    do { await wizardStep2.fillDecimals(crowdsale.decimals);
    } while(await wizardStep2.isPresentWarningDecimals());

    if (option=='reserved') {
    	await testRA.fillReservedTokens(this.driver); //for testing bundle of reserved addresses
    }
      else
        for (var i=0;i<crowdsale.reservedTokens.length;i++) {
          await reservedTokens.fillReservedTokens(crowdsale.reservedTokens[i]);
          await reservedTokens.clickButtonAddReservedTokens();
        }

    await wizardStep2.clickButtonContinue();
    await wizardStep3.waitUntilLoaderGone();
	do { await wizardStep3.fillWalletAddress(crowdsale.walletAddress);
    } while (await wizardStep3.isPresentWarningWalletAddress());

	await wizardStep3.setGasPrice(crowdsale.gasPrice);
	if (crowdsale.whitelisting) {
	  await wizardStep3.clickCheckboxWhitelistYes();
	} else {
		do { await wizardStep3.fillMinCap(crowdsale.minCap);
		} while(await wizardStep3.isPresentWarningMincap())
	  };

    for (var i = 0; i < crowdsale.tiers.length - 1; i++) {
      await tiers[i].fillTier();
      await wizardStep3.clickButtonAddTier();
    }
    await tiers[crowdsale.tiers.length - 1].fillTier();
    count=30;
    do {
      await this.driver.sleep(1000);
      if  ((await wizardStep3.isPresentButtonContinue()) &&
          !(await wizardStep4.isPresentModal()) )
      {
        await wizardStep3.clickButtonContinue();
	  }
	    else break;
	  if (count==1) {
	    logger.info("Incorrect data in tiers");
		//await wizardStep3.printWarnings();
		return null;
	  }
	} while (count-->0);

    let counterTransactions=0;
    let skippedTransactions=0;
    let isContinue=true;
    let result=false;
    let timeLimit=timeLimitTransactions*crowdsale.tiers.length;

    do  {
      result=await metaMask.doTransaction(refreshCount);
	  counterTransactions++;
      if (!result) {
	    logger.info("Transaction #"+counterTransactions+" didn't appear.");
	  }
	    else {
          logger.info("Transaction# "+counterTransactions+" is successfull");
        }
      await this.driver.sleep(Tfactor*500);//anyway won't be faster than start time
      if (await wizardStep4.isPresentButtonSkipTransaction()) {
        await wizardStep4.clickButtonSkipTransaction();

        await this.driver.sleep(1000);
        await wizardStep4.clickButtonYes();
        logger.info("Transaction #"+ (counterTransactions+1)+" is skipped.");
        counterTransactions++;
	    skippedTransactions++;
	  }
	    else {
          if (!(await wizardStep4.isPresentModal())) {
	        await wizardStep4.waitUntilLoaderGone();
			await wizardStep4.clickButtonOk();
			isContinue = false;
		  }
	    }

	  if (skippedTransactions>5) {
	    logger.info("Deployment failed because too many skipped transaction."+
		            "\n"+"Transaction were done:"+ (counterTransactions-skippedTransactions)+
		            "\n"+ "Transaction were skipped: "+skippedTransactions);
	    isContinue=false;
      }

	  if((timeLimit--)==0) {
      	logger.info("Deployment failed because time expired."+"\n"+
	                " Transaction were done:"+ (counterTransactions-skippedTransactions)+
                    "\n"+ "Transaction were skipped: "+skippedTransactions);
        isContinue=false;
      }

    } while (isContinue);

    logger.info("Crowdsale created."+"\n"+" Transaction were done:"+
	             (counterTransactions-skippedTransactions)+
	             "\n"+ "Transaction were skipped: "+skippedTransactions);

	await this.driver.sleep(5000);
	const abi=await wizardStep4.getABI();

    await wizardStep4.clickButtonContinue();
    await wizardStep4.waitUntilLoaderGone();
    await  this.driver.sleep(1000);

	do { await crowdsalePage.clickButtonInvest();}
    while (! await investPage.isPresentCountdownTimer())

    const  urlInvestPage=await investPage.getURL();
    await investPage.waitUntilLoaderGone();
    const tokenAddress=await investPage.getTokenAddress();
    const contractAddress=await investPage.getContractAddress();
	logger.info(JSON.stringify(abi));
    logger.info("Final invest page link: "+urlInvestPage);
    logger.info("token address: "+tokenAddress);
    logger.info("contract address: "+contractAddress);
    crowdsale.tokenAddress=tokenAddress;
    crowdsale.contractAddress=contractAddress;
    crowdsale.url=urlInvestPage;
    crowdsale.tokenContractAbi=abi;
	return crowdsale;
  }

  async confirmPopup(){
    logger.info("confirm popup");
    let investPage = new InvestPage(this.driver);
    await this.driver.sleep(1000);
    let counter=10;
    while(counter-->0) {
      await this.driver.sleep(1000);
      if (await investPage.isPresentWarning()) {
        await this.driver.sleep(1000);
        await investPage.clickButtonOK();
        return true;
      }
      return false;
    }
  }

  async  contribute(amount){
    logger.info(" contribution = "+amount);
    const investPage = new InvestPage(this.driver);
    await investPage.waitUntilLoaderGone();
    await investPage.fillInvest(amount);
    await investPage.clickButtonContribute();
    let counter=0;
    let isContinue=true;
    let timeLimit=2;
    do {
      await this.driver.sleep(500);
      if (await investPage.isPresentWarning()) {
        await logger.info(this.name+": warning:"+await investPage.getWarningText());
        return false;
      }
      if (await investPage.isPresentError()) {
        await logger.info(this.name+": error:"+await investPage.getErrorText());
        return false;
      }
      counter++;
      if (counter>=timeLimit) {
        isContinue=false;
      }
    } while(isContinue);

    let result=await new MetaMask(this.driver).doTransaction(5);
    if (!result) {
    	return false;
    }
    await investPage.waitUntilLoaderGone();
    counter=0;
    timeLimit=5;
    while(counter++<timeLimit) {
      await this.driver.sleep(500);
      if (await investPage.isPresentWarning()) {
        await investPage.clickButtonOK();
        await investPage.waitUntilLoaderGone();
        await this.driver.sleep(2000);
        return true;
      }
    }
    return false;
  }

  async getBalanceFromInvestPage(crowdsale) {
  	logger.info("get balance from "+crowdsale.url);
    const investPage = new InvestPage(this.driver);
    const curURL=await investPage.getURL();
    if(crowdsale.url!=curURL) await investPage.open(crowdsale.url);
    await investPage.waitUntilLoaderGone();
    await this.driver.sleep(2000);
	await investPage.refresh();
	await this.driver.sleep(1000);
	await investPage.refresh();
	await this.driver.sleep(2000);
    let result=await investPage.getBalance();
    let arr=result.split(" ");
	result=arr[0].trim();
    logger.info("received "+ result);
    return result;
  }

}
module.exports.User=User;
