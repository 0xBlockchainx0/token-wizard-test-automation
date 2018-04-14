
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
const rateTier1=50000;
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

    let scenario;
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
		startURL = await Utils.getStartURL();

		logger.info("Version 2.2.0 - ropsten ");
		driver = await Utils.startBrowserWithMetamask();

		let random=Math.round(Math.random()*2);
		logger.info("Test set #"+random);
		switch (random){
			case 0:{
				scenario="./users/ropsten/0/test0_ropsten.json";
				Owner = new User (driver,"./users/ropsten/0/user3_0e03.json");
				Investor1 = new User (driver,"./users/ropsten/0/user3_2a77.json");
				Investor2 = new User (driver,'./users/ropsten/0/user3_4B33.json');
				ReservedAddress = new User (driver,"./users/ropsten/0/user3_5ACC.json");
				break;
			}
			case 1:{
				scenario="./users/ropsten/1/test1_ropsten.json";
				Owner = new User (driver,"users/ropsten/1/user3_8ce1.json");
				Investor1 = new User (driver,"users/ropsten/1/user3_9E96.json");
				Investor2 = new User (driver,"users/ropsten/1/user3_020F.json");
				ReservedAddress = new User (driver,"users/ropsten/1/user3_27F2.json");
				break;
			}
			case 2:{
				scenario="./users/ropsten/2/test2_ropsten.json";
				Owner = new User (driver,"users/ropsten/2/user3_41B.json");
				Investor1 = new User (driver,"users/ropsten/2/user3_45D9.json");
				Investor2 = new User (driver,"users/ropsten/2/user3_56B2.json");
				ReservedAddress = new User (driver,"users/ropsten/2/user3_76b3.json");
				break;

			}
		}
		crowdsaleForE2Etests2=await  Utils.getCrowdsaleInstance(scenario);
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


	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		await Utils.sendEmail(tempOutputPath+'manage1.png');
		await Utils.sendEmail(tempOutputPath+'manage2.png');
		await Utils.sendEmail(tempOutputFile);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});


//////////////////////////////////////////////////////////////////////////////


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
