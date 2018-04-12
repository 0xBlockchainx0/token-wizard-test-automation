
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');
///////////////////////////////////////////////////////
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
const invstPage=require('../pages/InvestPage.js');
const InvestPage=invstPage.InvestPage;
const managePage=require('../pages/ManagePage.js');
const ManagePage=managePage.ManagePage;

////////////////////////////////////////////////////////
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const tempOutputFile=Logger.tempOutputFile;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const mtMask=require('../pages/MetaMask.js');
const MetaMask=mtMask.MetaMask;
const user=require("../entity/User.js");
const User=user.User;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;

const supplyTier1=200;
const rateTier1=500;
const mincapForInvestor2=20;
const maxForInvestor2=200;
const minReservedAddress=15;
const maxReservedAddress=50;

const smallAmount=0.1;
const significantAmount=12345678900;
const endTimeForTestEarlier="11:23";
const endDateForTestEarlier="01/07/2049";
const endTimeForTestLater="11:23";
const endDateForTestLater="01/07/2050";




test.describe('POA token-wizard. Test suite #1',  async function() {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File='./users/user8545_56B2.json';//Owner
	const user8545_F16AFile='./users/user8545_F16A.json';//Investor1 - whitelisted before deployment
	const user8545_f5aAFile='./users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile= './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time
	const scenarioWhNoMdNoRt1Tr1 = './scenarios/testSuite1.json';
	const scenarioWhYMdYRt1Tr1 = './scenarios/testSuite2.json';
	const scenarioForUItests = './scenarios/ReservedTokens.json';

	let driver ;
	let Owner ;
	let Investor1;
	let Investor2;
	let ReservedAddress;

	let metaMask;
	let welcomePage;
	let wizardStep1 ;
	let wizardStep2;
	let wizardStep3;
	let tierPage;
	let reservedTokensPage;
    let investPage;
	let startURL;
	let crowdsaleForUItests;
	let crowdsaleForE2Etests1;
	let crowdsaleForE2Etests2;
/////////////////////////////////////////////////////////////////////////

	test.before(async function() {
		startURL==await Utils.getStartURL();
		crowdsaleForUItests= await Utils.getCrowdsaleInstance(scenarioForUItests);
		 crowdsaleForE2Etests1=await  Utils.getCrowdsaleInstance(scenarioWhNoMdNoRt1Tr1);
		crowdsaleForE2Etests2=await  Utils.getCrowdsaleInstance(scenarioWhYMdYRt1Tr1);


		logger.info("Version 2.1.2");
		driver = await Utils.startBrowserWithMetamask();
		console.log("FFFEKEMFLKEM");
		console.log(user8545_56B2File);

		Owner = new User (driver,user8545_56B2File);
		Investor1 = new User (driver,user8545_F16AFile);
		Investor2 = new User (driver,user8545_f5aAFile);
		ReservedAddress = new User (driver,user8545_ecDFFile);

    	await Utils.increaseBalance(Owner,20);
		await Utils.increaseBalance(Investor1,20);
		await Utils.increaseBalance(Investor2,20);
		await Utils.increaseBalance(ReservedAddress,20);
		// await deployRegistry(Owner.account);
		logger.info("Roles:");
		logger.info("Owner = "+Owner.account);
		logger.info("Owner's balance = :"+await Utils.getBalance(Owner)/1e18);
		logger.info("Investor1  = "+Investor1.account);
		logger.info("Investor1 balance = :"+await Utils.getBalance(Investor1)/1e18);
		logger.info("Investor2  = :"+Investor2.account);
		logger.info("Investor2 balance = :"+await Utils.getBalance(Investor2)/1e18);
		logger.info("Reserved address  = :"+ReservedAddress.account);
		logger.info("ReservedAddress balance = :"+await Utils.getBalance(ReservedAddress)/1e18);

		metaMask = new MetaMask(driver);
		await metaMask.activate();//return activated Metamask and empty page

		welcomePage = new WizardWelcome(driver,startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		investPage = new InvestPage(driver);
		reservedTokensPage=new ReservedTokensPage(driver);
		tierPage=new TierPage(driver,crowdsaleForUItests.tiers[0]);

	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		await Utils.sendEmail(tempOutputFile);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});


//////////////////////////////////////////////////////////////////////////////

	test.it('Owner  can create crowdsale(scenario testSuite1.json),1 tier, not modifiable, no whitelist,1 reserved',
		async function () {
            console.log("testr");
			let owner = Owner;
			await owner.setMetaMaskAccount();
			let Tfactor=10;
			await owner.createCrowdsale(crowdsaleForE2Etests1,Tfactor);
			logger.info("TokenAddress:  " + crowdsaleForE2Etests1.tokenAddress);
			logger.info("ContractAddress:  " + crowdsaleForE2Etests1.contractAddress);
			logger.info("url:  " + crowdsaleForE2Etests1.url);
			let result = (crowdsaleForE2Etests1.tokenAddress != "") &&
				         (crowdsaleForE2Etests1.contractAddress != "") &&
				         (crowdsaleForE2Etests1.url != "");
			return await assert.equal(result, true, "Test FAILED. Crowdsale has NOT created ");


		});

	test.it('Disabled to modify the end time if crowdsale is not modifiable',
		async function () {
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests1);
			let adjust = 80000000;
			let newTime=Utils.getTimeWithAdjust(adjust,"utc");
			let newDate=Utils.getDateWithAdjust(adjust,"utc");
			let tierNumber=1;
			let result=await owner.changeEndTime(tierNumber,newDate, newTime);

			return await assert.equal(result, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');

	});

	test.it('Investor can NOT buy less than mincap in first transaction',
		async function() {
			let investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests1);

			let contribution=crowdsaleForE2Etests1.minCap * 0.5;
			let result = await investor.contribute(contribution);

			return await assert.equal(result, false, "Test FAILED. Investor can buy less than minCap in first transaction");

	});

	test.it('Investor can buy amount equal mincap',
		async function () {
			let investor = Investor1;
			let contribution = crowdsaleForE2Etests1.minCap;
			await investor.openInvestPage(crowdsaleForE2Etests1);
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
	});

	test.it('Invest page:  displayed correct balance after purchase',
		async function () {
			let investor = Investor1;
			let contribution = crowdsaleForE2Etests1.minCap;
			await investor.openInvestPage(crowdsaleForE2Etests1);
			let balance = await investor.getBalanceFromInvestPage(crowdsaleForE2Etests1);
			let result = (balance == contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
	});

	test.it('Investor not able to buy amount significally  more than total supply',
		async function() {

		    let investor = Investor1;
		    await investor.openInvestPage(crowdsaleForE2Etests1);
		    let contribution = significantAmount;
		    let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor is able to buy amount significally  more than total supply");
	});

	test.it('Investor can buy less than mincap after first transaction',
		async function() {
		    let investor = Investor1;
		    await investor.openInvestPage(crowdsaleForE2Etests1);
		    let contribution = smallAmount;
		    let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
	});

	test.it('Crowdsale finishes in time',
		async function() {
			let investor = Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests1);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			driver.sleep(5000);
			let result=(counter>0);
    		return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
	});

	test.it('Is disabled to buy after crowdsale time expired',
		async function() {

			let investor = Investor1;

			let contribution=crowdsaleForE2Etests1.tiers[0].supply;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
	});

	test.it('Owner able to distribute if crowdsale time expired but not all tokens were sold',
		async function() {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsaleForE2Etests1);
			return await assert.equal(result, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
	});

	test.it('Reserved address has received correct quantity of tokens after distribution',
		async function() {

			let newBalance=await ReservedAddress.getTokenBalance(crowdsaleForE2Etests1)/1e18;
			let balance=crowdsaleForE2Etests1.reservedTokens[0].value;
			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
	});

	test.it('Owner able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function() {

			let owner = Owner;
			let result  = await owner.finalize(crowdsaleForE2Etests1);
			return await assert.equal(result , true, "Test FAILED.'Owner can NOT finalize ");
	});

	test.it('Investor has received correct quantity of tokens after finalization', async function() {

		let investor=Investor1;
		let newBalance=await investor.getTokenBalance(crowdsaleForE2Etests1)/1e18;
		let balance=crowdsaleForE2Etests1.minCap+smallAmount;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		logger.info("Difference = "+(newBalance-balance));
		return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
	});
////////////////// TEST SUITE 2 /////////////////////////////////////////////////

	test.it('Owner  can create crowdsale(scenario testSuite2.json): 1 tier,' +
		' 1 whitelist address,2 reserved addresses, modifiable',
		async function () {

			let owner = Owner;//Owner
			await owner.setMetaMaskAccount();
			let Tfactor=1;
			await owner.createCrowdsale(crowdsaleForE2Etests2,Tfactor);
			logger.info("TokenAddress:  " + crowdsaleForE2Etests2.tokenAddress);
			logger.info("ContractAddress:  " + crowdsaleForE2Etests2.contractAddress);
			logger.info("url:  " + crowdsaleForE2Etests2.url);
			let result = (crowdsaleForE2Etests2.tokenAddress != "") &&
				         (crowdsaleForE2Etests2.contractAddress != "") &&
				         (crowdsaleForE2Etests2.url != "");

			return await assert.equal(result, true, 'Test FAILED. Crowdsale has NOT created ');
	});

	test.it('Whitelisted investor NOT able to buy before start of crowdsale ',
		async function () {

			let investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].min;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can not buy before the crowdsale started");
	});


	test.it('Disabled to modify the name of tier ',
		async function () {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			let mngPage=await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result =await mngPage.isDisabledNameTier(tierNumber);
			return await assert.equal(result,true,"Test FAILED. Enabled to modify the name of tier");
	});

	test.it( "Tier's name  matches given value",
		async function () {

			let owner = Owner;
			let mngPage=await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let tierName=await mngPage.getNameTier(tierNumber);
			return await assert.equal(tierName,crowdsaleForE2Etests2.tiers[0].name,"Test FAILED. Tier's name does NOT match given value");
	});

	test.it('Disabled to modify the wallet address ',
		async function () {
			let owner = Owner;
			let mngPage=await owner.openManagePage(crowdsaleForE2Etests2);

			let tierNumber=1;
			let result=await mngPage.isDisabledWalletAddressTier(tierNumber);
			return await assert.equal(result,true,"Test FAILED. Enabled to modify the wallet address of tier");
	});


	test.it("Tier's wallet address matches given value",
		async function () {

			let owner = Owner;
			let mngPage=await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let walletAddress=await mngPage.getWalletAddressTier(tierNumber);

			return await assert.equal(walletAddress,crowdsaleForE2Etests2.walletAddress,"Test FAILED. Tier's wallet address does NOT matches given value")
	});

	test.it('Owner is able to add whitelisted address before start of crowdsale',
		async function () {

			let owner = Owner;
			let investor=Investor2;

			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result = await owner.fillWhitelistTier(tierNumber,investor.account,mincapForInvestor2,maxForInvestor2);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
	});


	test.it.skip('Owner is able to modify the rate before start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result=await owner.changeRate(tierNumber,rateTier1);//500
			assert.equal(result,true,'Test FAILED.Owner is NOT able to modify the rate before start of crowdsale ');

	});

	test.it('Manage page:  rate changed  after modifying',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let rate=await owner.getRateTier(tierNumber);
			return await assert.equal(rate, crowdsaleForE2Etests2.tiers[0].rate, 'Test FAILED.New value of rate does not match given value');

	});

	test.it('Owner is able to modify the total supply before start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result = await owner.changeSupply(tierNumber,supplyTier1);
			return await assert.equal(result,true,'Test FAILED.Owner can NOT modify the total supply before start of crowdsale ');
	});

	test.it('Manage page:  total supply changed  suitably  after changing',
		async function () {
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let balance=await owner.getSupplyTier(tierNumber);
			return await assert.equal(balance, supplyTier1, 'Test FAILED. New value of supply does not match given value ');
	});

	test.it('Owner is able to modify the start time  before start of crowdsale ',
		async function () {
			let adjust = 90000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);

			let result = await owner.changeStartTime(tierNumber, newDate, newTime);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the start time of tier#1 before start ');
	});

	test.it('Owner is able to modify the end time before start of crowdsale',
		async function () {
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result = await owner.changeEndTime(tierNumber, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED. Owner is NOT able to modify the end time before start of crowdsale');
	});

	test.it('Manage page:  end time changed  after modifying ',
		async function () {
        	let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let endTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compare(endTime, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
	});

	test.it('Warning present if end time earlier than start time',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let adjust=100;
			let newTime=Utils.getTimeWithAdjust(adjust,"utc");
			let newDate=Utils.getDateWithAdjust(adjust,"utc");
			let tierNumber=1;
			let result = await owner.changeEndTime(tierNumber,newDate,newTime);
			return await assert.equal(result, false, 'Test FAILED. Allowed to set  end time earlier than start time ');
	});

	test.it('Warning present if not owner open manage page ',
		async function () {

			let owner = Investor1;
			await owner.setMetaMaskAccount();
			let result = await owner.openManagePage(crowdsaleForE2Etests2);
			return await assert.equal(result, false, 'Test FAILED.Warning "NOT OWNER" doesnt present');
	});

	test.it('Disabled to modify the start time if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsaleForE2Etests2);
			let adjust=120000;
			let newTime=Utils.getTimeWithAdjust(adjust,"utc");
			let newDate=Utils.getDateWithAdjust(adjust,"utc");
			let tierNumber=1;
			let result = await owner.changeStartTime(tierNumber,newDate,newTime);
			return await assert.equal(result, false, 'Test FAILED. Owner can  modify start time of tier#1 if tier has begun');

	});

	test.it('Disabled to modify the total supply if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);

			let tierNumber=1;
			let result = await owner.changeSupply(tierNumber,supplyTier1);
			return await assert.equal(result,false,'Test FAILED.Owner able to modify the total supply after start of crowdsale ');
	});

	test.it('Disabled to modify the rate if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result=await owner.changeRate(tierNumber,rateTier1);//200
			return await assert.equal(result,false,'Test FAILED.Owner able to modify the rate after start of crowdsale ');
	});

	test.it('Owner is able to modify the end time after start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);

			let tierNumber=1;
			let result=await owner.changeEndTime(tierNumber,endDateForTestLater, endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

	});

	test.it('Manage page:  end time changed  after modifying ',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
            let tierNumber=1;
			let result=await  owner.getEndTime(tierNumber);
			result=Utils.compare(result,endDateForTestLater,endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED. End time is changed but doest match the given value');
	});


	test.it('Owner is able to add whitelisted address if crowdsale has begun',
		async function () {
			let owner = Owner;
			let investor=ReservedAddress;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result= await owner.fillWhitelistTier(tierNumber,investor.account,minReservedAddress,maxReservedAddress);
			return await assert.equal(result , true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');

	});

	test.it('Whitelisted investor is NOT able to buy less than min in first transaction',
		async function() {

			let investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let result = await investor.contribute(crowdsaleForE2Etests2.tiers[0].whitelist[0].min * 0.5);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");

	});

	test.it('Whitelisted investor can buy amount equal min',
		async function() {

			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].min;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result,true,'Test FAILED. Investor can not buy amount = min');
	});

	test.it('Whitelisted investor is able to buy less than min after first transaction',
		async function() {
			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].min-2;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

	});

	test.it('Whitelisted investor is  NOT able to buy more than assigned max',
		async function() {

			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than assigned max");

	});

	test.it('Whitelisted investor is able to buy assigned max',
		async function() {

			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);

			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].max-
							 2*crowdsaleForE2Etests2.tiers[0].whitelist[0].min+2;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can not buy  assigned max");

	});

	test.it('Whitelisted investor is NOT able to buy more than total supply in tier',
		async function() {

			let investor=Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let result = await investor.contribute(crowdsaleForE2Etests2.tiers[0].supply+1);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than supply in tier");

	});

	test.it('Owner is NOT able to distribute before all tokens are sold and crowdsale is not finished ',
		async function() {

			let owner=Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsaleForE2Etests2);
			return await assert.equal(result, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");

	});

	test.it('Owner is NOT able to finalize before  all tokens are sold and crowdsale is not finished ',
		async function() {

			let owner=Owner;
			let result  = await owner.finalize(crowdsaleForE2Etests2);
			return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");

	});

	test.it('Whitelisted investor able to buy total supply ',
		async function() {

			let investor=Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=supplyTier1-crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can not buy total supply");
	});

	test.it('Whitelisted investor is NOT able to buy if all tokens were sold',
		async function () {

			let investor=ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=minReservedAddress;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result,false, "Test FAILED.Investor can not buy if all tokens were sold");

	});

	test.it('Owner able to distribute after all tokens were sold but crowdsale is not finished',
		async function() {

			let owner=Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsaleForE2Etests2);
			return await assert.equal(result, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");

	});

	test.it('Reserved address has received correct QUANTITY of tokens after distribution',
		async function() {

			let owner=Owner;
			let newBalance = await owner.getTokenBalance(crowdsaleForE2Etests2)/1e18;
			let balance = crowdsaleForE2Etests2.reservedTokens[1].value;//1e18
			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );

	});

	test.it('Reserved address has received correct PERCENT of tokens after distribution',
		async function() {

			let owner=ReservedAddress;

			let newBalance=await owner.getTokenBalance(crowdsaleForE2Etests2)/1e18;
			let balance = crowdsaleForE2Etests2.reservedTokens[0].value*supplyTier1/100;

			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );

	});

	test.it('Not Owner is NOT able to finalize (after all tokens were sold)',
		async function() {

			let owner=ReservedAddress;
			await owner.setMetaMaskAccount();
			let result  = await owner.finalize(crowdsaleForE2Etests2);
			return await assert.equal(result, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");

	});

	test.it('Owner able to finalize (after all tokens were sold)', async function() {

		let owner=Owner;
		await owner.setMetaMaskAccount();
		let result  = await owner.finalize(crowdsaleForE2Etests2);
		return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");

	});


	test.it('Disabled to buy after finalization of crowdsale',
		async function () {

			let investor=ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=minReservedAddress;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy if crowdsale is finalized");
	});

	test.it('Investor #1 has received correct amount of tokens after finalization',
		async function() {

			let investor=Investor1;
			let newBalance=await investor.getTokenBalance(crowdsaleForE2Etests2)/1e18;
			let balance=crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance);

	});

	test.it('Investor #2 has received correct amount of tokens after finalization', async function() {

		let investor=Investor2;
		let newBalance=await investor.getTokenBalance(crowdsaleForE2Etests2)/1e18;
		let balance=supplyTier1-crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );


	});

});
/*	test.it.skip('User is able to activate wizard welcome page:'+startURL ,
		async function () {
		    let result = await  welcomePage.open();
			return await assert.equal(result, startURL, "Test FAILED. User can not activate Wizard ");

		});
/*
	test.it.skip('Welcome page: button NewCrowdsale present ',
		async function () {
			result = await welcomePage.isPresentButtonNewCrowdsale();
			assert.equal(result, true, "Test FAILED. Button NewCrowdsale not present ");
			logger.info("Test PASSED. Button NewCrowdsale present");
		});

	test.it.skip('Welcome page: button ChooseContract present ',
		async function () {
			result = await welcomePage.isPresentButtonChooseContract();
			assert.equal(result, true, "Test FAILED. button ChooseContract not present ");
			logger.info("Test PASSED. Button ChooseContract present");
		});

	test.it.skip('Welcome page: user is able to activate Step1 by clicking button NewCrowdsale ',
		async function () {
			await welcomePage.clickButtonNewCrowdsale();
			result = await wizardStep1.isPresentButtonContinue();
			assert.equal(result, true, "Test FAILED. User is not able to activate Step1 by clicking button NewCrowdsale");
			logger.error("Test PASSED. User is able to activate Step2 by clicking button NewCrowdsale");

		});
	test.it.skip('Wizard step#1: user is able to activate Step2 by clicking button Continue ',
		async function () {
		let count=10;
			do {
				await driver.sleep(1000);
				if  ((await wizardStep1.isPresentButtonContinue()) &&
					!(await wizardStep2.isPresentFieldName()) )
				{
					await wizardStep1.clickButtonContinue();
				}
				else break;
			}
			while (count-->0)
			result=await wizardStep2.isPresentFieldName();
			assert.equal(result, true, "Test FAILED. User is not able to activate Step2 by clicking button Continue");
			logger.error("Test PASSED. User is able to activate Step2 by clicking button Continue");

		});

	////////////////////////// S T E P 2 //////////////////////////////////////////////////////////////////////////////


	test.it.skip('Wizard step#2: user able to fill out field Ticker with valid data',
		async function () {
			await wizardStep2.fillTicker("test");
			b=await wizardStep2.isPresentWarningTicker();
			assert.equal(b, false, "Test FAILED. Wizard step#2: user is not  able to fill out field Ticker with valid data ");

		});

///////Name////
	test.it.skip("Wizard step#2: warning is presented if field Name  is empty ",
		async function () {
			await wizardStep2.fillName(" ");
			b=await wizardStep2.isPresentWarningName();

			assert.equal(b, true, "Test FAILED. Wizard step#2: warning doesnt present if  field Name empty");

		});


	test.it.skip('Wizard step#2: warning is presented if Name length more than 30 symbols',
		async function () {
			await wizardStep2.fillName("012345678901234567890123456789q");
			b=await wizardStep2.isPresentWarningName();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning doesnt present if Name length more than 30 symbols");

		});
	test.it.skip("Wizard step#2: user is not able to proceed if name's warning is presented ",
		async function () {
			await wizardStep2.clickButtonContinue();
			b=await wizardStep2.getTitleText();
			b=(b==wizardStep2.title);
			if (!b)  await wizardStep3.goBack();
			assert.equal(b, true, "Test FAILED. Wizard step#2: user is  able to proceed if name's warning presented");
		});

	test.it.skip('Wizard step#2: user able to fill Name field with valid data',
		async function () {
			await wizardStep2.fillName(currencyForE2Etests.name);
			b=await wizardStep2.isPresentWarningName();
			assert.equal(b, false, "Test FAILED. Wizard step#2: user able to fill Name field with valid data ");

		});

	////Ticker////

	test.it.skip("Wizard step#2: warning is presented if field Ticker is empty ",
		async function () {
			await wizardStep2.fillTicker(" ");
			b=await wizardStep2.isPresentWarningTicker();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if field Ticker  empty ");

		});
	test.it.skip('Wizard step#2: warning is presented if field Ticker length more than 5 symbols',
		async function () {
			await wizardStep2.fillTicker("qwerty");
			b=await wizardStep2.isPresentWarningTicker();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present  if field Ticker length more than 5 symbols");

		});
	test.it.skip('Wizard step#2: warning is presented if field Ticker contains special symbols',
		async function () {
			await wizardStep2.fillTicker("qwer$");
			b=await wizardStep2.isPresentWarningTicker();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present  if field Ticker length more than 5 symbols");

		});

	test.it.skip("Wizard step#2: user is not able to proceed if ticker's warning is presented ",
		async function () {
			await wizardStep2.clickButtonContinue();
			b=await wizardStep2.getTitleText();
			b=(b==wizardStep2.title);
			if (!b)  await wizardStep3.goBack();
			assert.equal(b, true, "Test FAILED. Wizard step#2: user is  able to proceed if ticker's warning presented");
		});


	test.it.skip('Wizard step#2: user able to fill Ticker field with valid data',
		async function () {
			await wizardStep2.fillTicker(currencyForE2Etests.ticker);
			b=await wizardStep2.isPresentWarningName();
			assert.equal(b, false, "Test FAILED. Wizard step#2: user able to fill Name field with valid data ");

		});
///////Decimals/////

	test.it.skip("Wizard step#2: warning is presented if  Decimals more than 18 ",
		async function () {
			await wizardStep2.fillDecimals("19");
			b=await wizardStep2.isPresentWarningDecimals();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if field Decimals empty ");

		});

	test.it.skip("Wizard step#2: disable to fill out Decimals with negative value ",
		async function () {
			await wizardStep2.fillDecimals("-2");
			b=await wizardStep2.getFieldDecimals();
			assert.equal(b,"2", "Test FAILED. Wizard step#2: enable to fill out Decimals with negative value ");

		});
	test.it.skip("Wizard step#2: disable to fill out Decimals with non-number value ",
		async function () {
			await wizardStep2.fillDecimals("qwerty");
			b=await wizardStep2.getFieldDecimals();
			assert.equal(b,"", "Test FAILED. Wizard step#2: enable to fill out Decimals with non-number value ");

		});


	test.it.skip("Wizard step#2: disable to fill out Decimals with negative value ",
		async function () {
			await wizardStep2.fillDecimals("-2");
			b=await wizardStep2.getFieldDecimals();
			assert.equal(b,"2", "Test FAILED. Wizard step#2: enable to fill out Decimals with negative value ");

		});
	test.it.skip("Wizard step#2: user is not able to proceed if Decimals field empty ",
		async function () {
			await wizardStep2.fillDecimals("");
			await wizardStep2.clickButtonContinue();
			b=await wizardStep2.getTitleText();
			b=(b==wizardStep2.title);
			if (!b)  await wizardStep3.goBack();
			assert.equal(b, true, "Test FAILED. Wizard step#2: user is  able to proceed if Decimals field empty ");
		});
	test.it.skip('Wizard step#2: user able to fill out field Decimals with valid data',
		async function () {
			await wizardStep2.fillDecimals(currencyForE2Etests.decimals);
			b=await wizardStep2.isPresentWarningDecimals();
			assert.equal(b, false, "Test FAILED. Wizard step#2: user is not able to fill Decimals  field with valid data ");

		});

/////////// Reserved
	test.it.skip("Wizard step#2: warnings are presented if user try to add empty reserved token ",
		async function () {
			await reservedTokensPage.clickButtonAddReservedTokens();
			b=(await reservedTokensPage.isPresentWarningAddress())&&(await reservedTokensPage.isPresentWarningValue());
			assert.equal(b, true, "Test FAILED. Wizard step#2: warnings are not  presented if user try to add empty reserved token ");

		});
	test.it.skip("Wizard step#2: warnings are disappeared if user fill out address and value fields with valid data ",
		async function () {
			await reservedTokensPage.fillAddress(currencyForUItests.reservedTokens[0].address);
			await reservedTokensPage.fillValue(currencyForUItests.reservedTokens[0].value);
			b=(await reservedTokensPage.isPresentWarningAddress())||(await reservedTokensPage.isPresentWarningValue());
			assert.equal(b, false, "Test FAILED. Wizard step#2: warnings are presented if user fill out address and value fields with valid data ");

		});

	test.it.skip("Wizard step#2: warning is presented if address of reserved tokens is invalid ",
		async function () {
			await reservedTokensPage.fillAddress("qwertyuiopasdfghjklz");
			b=await reservedTokensPage.isPresentWarningAddress();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if address of reserved tokens is invalid ");

		});

	test.it.skip("Wizard step#2: user is not able to add reserved tokens if address is invalid ",
		async function () {
			await reservedTokensPage.clickButtonAddReservedTokens();
			newBalance=await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(newBalance, 0, "Test FAILED. Wizard step#2: user is not able to add reserved tokens if address is invalid");

		});

	test.it.skip("Wizard step#2: warning present if value of reserved tokens  is negative ",
		async function () {
			await reservedTokensPage.fillValue("-123");
			b=await reservedTokensPage.isPresentWarningValue();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if address of reserved tokens is negative ");

		});
	test.it.skip("Wizard step#2: user is not able to add reserved tokens if value is invalid ",
		async function () {
		await reservedTokensPage.fillAddress(currencyForUItests.reservedTokens[0].address);
		await reservedTokensPage.clickButtonAddReservedTokens();
		newBalance=await reservedTokensPage.amountAddedReservedTokens();
		assert.equal(newBalance, 0, "Test FAILED. Wizard step#2: user is not able to add reserved tokens if address is invalid");

		});

	test.it.skip('Wizard step#2: user is able to add reserved tokens ',
		async function () {
			b=false;
			for (var i=0;i<currencyForUItests.reservedTokens.length;i++)
			{
				await reservedTokensPage.fillReservedTokens(currencyForUItests.reservedTokens[i]);
				await reservedTokensPage.clickButtonAddReservedTokens();
			}
			b=await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(b, currencyForUItests.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
			logger.error("Test PASSED. Wizard step#2: user is able to add reserved tokens");

		});

	test.it.skip('Wizard step#2: field Decimals disabled if reserved tokens added ',
		async function () {

			b = await wizardStep2.isDisabledDecimals();
			assert.equal(b, true, "Wizard step#2: field Decimals enabled if reserved tokens added ");
		});

	test.it.skip('Wizard step#2: user is able to remove one of reserved tokens ',
		async function () {
			b=false;
			balance=await reservedTokensPage.amountAddedReservedTokens();
			contribution=currencyForUItests.reservedTokens.length-1;
			await reservedTokensPage.removeReservedTokens(contribution);
			newBalance=await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(balance, newBalance+1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
			logger.error("Test PASSED. Wizard step#2: user is able to add reserved tokens");

		});

	test.it.skip('Wizard step#2: ClearAll button present ',
		async function () {

			b = await reservedTokensPage.isPresentButtonClearAll();
			assert.equal(b, true, "Test FAILED.ClearAll button is NOT present");
		});

	test.it.skip('Wizard step#2: Alert present after clicking ClearAll and button No present',
		async function () {
			await reservedTokensPage.clickButtonClearAll();
			b = await reservedTokensPage.isPresentButtonNoAlert();
			assert.equal(b, true, "Test FAILED.Alert does NOT present after select ClearAll or button No does NOT present");
		});
	test.it.skip('Wizard step#2: User able to click button No and warning disappear ',
		async function () {

			await  reservedTokensPage.clickButtonNoAlert();
			await driver.sleep(2000);
			b = await reservedTokensPage.isPresentButtonYesAlert();
			assert.equal(b, false, "Test FAILED.User is not able to click button No or warning does not disappear");
		});

	test.it.skip('Wizard step#2: Alert present after select ClearAll and button Yes present',
		async function () {
			await reservedTokensPage.clickButtonClearAll();
			b = await reservedTokensPage.isPresentButtonYesAlert();
			assert.equal(b, true, "Test FAILED.Alert does NOT present after select ClearAll or button Yes does NOT present");
		});

	test.it.skip('Wizard step#2: user is able bulk delete of reserved tokens ',
		async function () {
			await reservedTokensPage.clickButtonYesAlert();
			await driver.sleep(2000);
			newBalance = await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(newBalance, 0, "Wizard step#2: user is NOT able bulk delete of reserved tokens");
			logger.error("Test PASSED. Wizard step#2: user is able bulk delete of reserved tokens");

		});

	test.it.skip('Wizard step#2: field Decimals enabled if no reserved tokens',
		async function () {

			b = await wizardStep2.isDisabledDecimals();
			assert.equal(b, false, "Wizard step#2: field Decimals disabled  after deletion of reserved tokens");
		});
	test.it.skip('Wizard step#2: user is able to add one reserved tokens address after deletion ',
		async function () {
			b=false;
			for (var i=0;i<currencyForE2Etests.reservedTokens.length;i++)
			{
				await reservedTokensPage.fillReservedTokens(currencyForE2Etests.reservedTokens[i]);
				await reservedTokensPage.clickButtonAddReservedTokens();
			}
			b=await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(b, currencyForE2Etests.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens after deletion");
			logger.error("Test PASSED. Wizard step#2: user is able to add reserved tokens after deletion");

		});

	test.it.skip('Wizard step#2: button Continue present ',
		async function () {
			b=false;
			b=await wizardStep2.isPresentButtonContinue();

			assert.equal(b, true, "Test FAILED. Wizard step#2: button Continue  not present ");

		});
	test.it.skip('Wizard step#2: user is able to activate Step3 by clicking button Continue ',
		async function () {
			b=false;
			await wizardStep2.clickButtonContinue();
			await driver.sleep(2000);
			b=await wizardStep3.isPresentFieldWalletAddress();
			assert.equal(b, true, "Test FAILED. User is not able to activate Step2 by clicking button Continue");
			logger.error("Test PASSED. User is able to activate Step3 by clicking button Continue");

		});

	test.it.skip('Wizard step#3: field Wallet address contains the metamask account address  ',
		async function () {

			s=await wizardStep3.getFieldWalletAddress();
			b=(s==Owner.account);
			assert.equal(b, true, "Test FAILED. Wallet address does not match the metamask account address ");

		});

	test.it.skip('Wizard step#3: User is able to set "Safe and cheap gasprice" checkbox ',
		async function () {
			b=await wizardStep3.clickCheckboxGasPriceSafe();
			assert.equal(b, true, "Test FAILED. Wizard step#3: 'Safe and cheap' Gas price checkbox does not set by default");

		});
	test.it.skip('Wizard step#3: User is able to set "Normal Gasprice" checkbox',
		async function () {

			b=await wizardStep3.clickCheckboxGasPriceNormal();
			assert.equal(b, true, 'Test FAILED. User is not able to set "Normal Gasprice" checkbox');

		});
	test.it.skip('Wizard step#3: User is able to set "Fast Gasprice" checkbox',
		async function () {

			b=await wizardStep3.clickCheckboxGasPriceFast();
			assert.equal(b, true, 'Test FAILED. User is not able to set "Fast Gasprice" checkbox');

		});
	test.it.skip('Wizard step#3: User is able to set "Custom Gasprice" checkbox',
		async function () {

			b=await wizardStep3.clickCheckboxGasPriceCustom();
			assert.equal(b, true, 'Test FAILED. User is not able to set "Custom Gasprice" checkbox');

		});

	test.it.skip('Wizard step#3: User is able to fill "Custom Gasprice" with valid value',
		async function () {

			b=await wizardStep3.fillGasPriceCustom(currencyForE2Etests.gasPrice);
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to fill "Custom Gasprice" with valid value');

		});
	test.it.skip('Wizard step#3: User is able to set checkbox  "Whitelist disabled" ',
		async function () {
			b=true;
			b=await wizardStep3.clickCheckboxWhitelistNo();
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist disabled"');

		});
	test.it.skip('Wizard step#3: User is able to set checkbox  "Whitelist enabled"',
		async function () {

			b=await wizardStep3.clickCheckboxWhitelistYes();
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist enabled"');

		});



	test.it.skip('Wizard step#3: User is able to download CSV file with whitelisted addresses',
		async function () {
			let rightAddresses=11;

			b=await wizardStep3.uploadCSV();
			newBalance=await tierPage.amountAddedWhitelist();
			await wizardStep3.clickButtonOk();
			if (b&&(newBalance==rightAddresses)) b=true;
			else b=false;
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');

		});

	test.it.skip('Wizard step#3: Downloaded whitelist addresses dont contain invalid data',
		async function () {
			assert.equal(true, true, "Test FAILED. Wizard step#3: Downloaded whitelist addresses contain invalid data");

		});



	test.it.skip('Wizard step#3: User is able to add several whitelisted addresses',
		async function () {

			b=await tierPage.fillWhitelist();
			assert.equal(b, true, "Test FAILED. Wizard step#3: User is able to add several whitelisted addresses");


		});

	test.it.skip('Wizard step#3: User is able to remove one whitelisted address',
		async function () {
			balance=await tierPage.amountAddedWhitelist();
			await tierPage.removeWhiteList(0);
			newBalance=await tierPage.amountAddedWhitelist();

			logger.info("Bal"+balance);
			logger.info("NewBal"+newBalance);
			assert.equal(balance, newBalance+1, "Test FAILED. Wizard step#3: User is NOT able to remove one whitelisted address");
		});

	test.it.skip('Wizard step#3: User is able to bulk delete all whitelisted addresses ',
		async function () {
			await tierPage.clickButtonClearAll();
			await tierPage.clickButtonYesAlert();
			newBalance=await tierPage.amountAddedWhitelist();
			logger.info("NewBal"+newBalance);
			assert.equal(newBalance,0, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");

		});*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
