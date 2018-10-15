
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
	let wizardStep4;
	let tierPage;
	let reservedTokensPage;
    let investPage;
	let startURL;
	let crowdsaleForUItests;
	let crowdsaleForE2Etests1;
	let crowdsaleForE2Etests2;
/////////////////////////////////////////////////////////////////////////

	test.before(async function() {

		startURL=await Utils.getStartURL();


		crowdsaleForUItests= await Utils.getCrowdsaleInstance(scenarioForUItests);
		 crowdsaleForE2Etests1=await  Utils.getCrowdsaleInstance(scenarioWhNoMdNoRt1Tr1);
		crowdsaleForE2Etests2=await  Utils.getCrowdsaleInstance(scenarioWhYMdYRt1Tr1);


		logger.info("Version 2.1.7");
		driver = await Utils.startBrowserWithMetamask();


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
		await Owner.setMetaMaskAccount();

		welcomePage = new WizardWelcome(driver,startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		wizardStep4 = new WizardStep4(driver);
		investPage = new InvestPage(driver);
		reservedTokensPage = new ReservedTokensPage(driver);
		tierPage = new TierPage(driver,crowdsaleForUItests.tiers[0]);

	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		//await Utils.sendEmail(tempOutputPath+'manage1.png');
		//await Utils.sendEmail(tempOutputPath+'manage2.png');
		await Utils.sendEmail(tempOutputFile);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});


//////////////////////////////////////////////////////////////////////////////
	test.it('User is able to open wizard welcome page' ,
		async function () {
			let result = await  welcomePage.open();
			return await assert.equal(result, startURL, "Test FAILED. User can not activate Wizard ");

		});

	test.it('Welcome page: button NewCrowdsale present ',
		async function () {
			let result = await welcomePage.isPresentButtonNewCrowdsale();
			return await assert.equal(result, true, "Test FAILED. Button NewCrowdsale not present ");

		});

	test.it('Welcome page: button ChooseContract present ',
		async function () {
			let result = await welcomePage.isPresentButtonChooseContract();
			return await assert.equal(result, true, "Test FAILED. button ChooseContract not present ");

	});

	test.it('Welcome page: user is able to open Step1 by clicking button NewCrowdsale ',
		async function () {
			await welcomePage.clickButtonNewCrowdsale();
			let result = await wizardStep1.isPresentButtonContinue();
			return await assert.equal(result, true, "Test FAILED. User is not able to activate Step1 by clicking button NewCrowdsale");

	});

	test.it('Wizard step#1: user is able to open Step2 by clicking button Continue ',
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
			while (count-->0);
			let result=await wizardStep2.isPresentFieldName();
			return await assert.equal(result, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");

	});

	test.it('Wizard step#2: user able to fill out Name field with valid data',
		async function () {
			await wizardStep2.fillName("name");
			let result = await wizardStep2.isPresentWarningName();
			return await assert.equal(result, false, "Test FAILED. Wizard step#2: user able to fill Name field with valid data ");

	});

	test.it('Wizard step#2: user able to fill out field Ticker with valid data',
		async function () {
			await wizardStep2.fillTicker("test");
			let result = await wizardStep2.isPresentWarningTicker();
			return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not  able to fill out field Ticker with valid data ");

	});

	test.it("Wizard step#2: user is not able to open Step2 if Decimals field empty ",
		async function () {
			await wizardStep2.fillDecimals("");
			await wizardStep2.clickButtonContinue();
			let result = await wizardStep2.getPageTitle();
			result=(result===wizardStep2.title);
			if (!result)  await wizardStep3.goBack();
			return await assert.equal(result, true, "Test FAILED. Wizard step#2: user is  able to proceed if Decimals field empty ");
	});

	test.it('Wizard step#2: user able to fill out  Decimals field with valid data',
		async function () {
			await wizardStep2.fillDecimals("18");
			let result=await wizardStep2.isPresentWarningDecimals();
			return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not able to fill Decimals  field with valid data ");

		});

	test.it('Wizard step#2: User is able to download CSV file with reserved addresses',
		async function () {

			let result = await reservedTokensPage.uploadReservedCSVFile();
			await reservedTokensPage.clickButtonOk();
			return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
	});

	test.it('Wizard step#2: number of added reserved tokens is correct ',
		async function () {
		    let correctNumberReservedTokens=20;
			let result = await reservedTokensPage.amountAddedReservedTokens();
			return await assert.equal(result,correctNumberReservedTokens, "Test FAILED. Wizard step#2: number of added reserved tokens is correct");
	});

	test.it('Wizard step#2: button ClearAll is displayed ',
		async function () {

			let result  = await reservedTokensPage.isPresentButtonClearAll();
			return await  assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
	});

	test.it('Wizard step#2: alert present after clicking ClearAll',
		async function () {
			await reservedTokensPage.clickButtonClearAll();
			let result = await reservedTokensPage.isPresentButtonNoAlert();
			return await assert.equal(result, true, "Test FAILED.Alert does NOT present after select ClearAll or button No does NOT present");
	});

	test.it('Wizard step#2: user is able to bulk delete of reserved tokens ',
		async function () {
			await reservedTokensPage.clickButtonYesAlert();
			await driver.sleep(2000);
			let result = await reservedTokensPage.amountAddedReservedTokens();
			return await assert.equal(result, 0, "Wizard step#2: user is NOT able bulk delete of reserved tokens");
	});

	test.it('Wizard step#2: user is able to add reserved tokens one by one ',
		async function () {

			for (let i=0;i<crowdsaleForUItests.reservedTokens.length;i++)
			{
				await reservedTokensPage.fillReservedTokens(crowdsaleForUItests.reservedTokens[i]);
				await reservedTokensPage.clickButtonAddReservedTokens();
			}
			let result = await reservedTokensPage.amountAddedReservedTokens();
			return await assert.equal(result, crowdsaleForUItests.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
	});

	test.it('Wizard step#2: field Decimals is disabled if reserved tokens are added ',
		async function () {

			let result  = await wizardStep2.isDisabledDecimals();
			return await assert.equal(result, true, "Wizard step#2: field Decimals enabled if reserved tokens added ");
	});

	test.it('Wizard step#2: user is able to remove one of reserved tokens ',
		async function () {

			let amountBefore = await reservedTokensPage.amountAddedReservedTokens();
			await reservedTokensPage.removeReservedTokens(1);
			let amountAfter = await reservedTokensPage.amountAddedReservedTokens();
			return await  assert.equal(amountBefore, amountAfter+1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
	});



	test.it('Wizard step#2: button Continue is displayed ',
		async function () {
			let result = await wizardStep2.isPresentButtonContinue();
			return await assert.equal(result, true, "Test FAILED. Wizard step#2: button Continue  not present ");

	});

	test.it('Wizard step#2: user is able to open Step3 with clicking button Continue ',
		async function () {
			await wizardStep2.clickButtonContinue();
			await driver.sleep(2000);
			let result = await wizardStep3.getPageTitle();
			result=(result==wizardStep3.title);
			return await assert.equal(result, true, "Test FAILED. User is not able to activate Step2 by clicking button Continue");
	});
	//////////////// STEP 3 /////////////////////

	test.it('Wizard step#3: field Wallet address contains current metamask account address  ',
		async function () {

			let result = await wizardStep3.getFieldWalletAddress();
			console.log(result);
			console.log(Owner.account);
			result=(result===Owner.account);
			return await assert.equal(result, true, "Test FAILED. Wallet address does not match the metamask account address ");
	});

	test.it('Wizard step#3: Whitelist container present if checkbox "Whitelist enabled" is selected',
		async function () {

			await wizardStep3.clickCheckboxWhitelistYes();

			let result= await tierPage.isPresentWhitelistContainer();
			return await  assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist enabled"');
	});

	test.it('Wizard step#3: User is able to download CSV file with whitelisted addresses',
		async function () {

			let result = await tierPage.uploadWhitelistCSVFile();
			await wizardStep3.clickButtonOk();
			return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
	});

	test.it('Wizard step#3: Number of added whitelisted addresses is correct',
		async function () {
			let shouldBe=6;
			let inReality=await tierPage.amountAddedWhitelist();
			return await assert.equal(shouldBe, inReality, "Test FAILED. Wizard step#3: Number of added whitelisted addresses is NOT correct");

		});

	test.it('Wizard step#3: User is able to bulk delete all whitelisted addresses ',
		async function () {
			let result = await tierPage.clickButtonClearAll();
			await driver.sleep(2000);
			await tierPage.clickButtonYesAlert();
			return await assert.equal(result,true, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
		});

	test.it('Wizard step#3: All whitelisted addresses removed after deletion ',
		async function () {
			let result = await tierPage.amountAddedWhitelist();
			return await assert.equal(result,0, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
		});

	test.it('Wizard step#3: User is able to add several whitelisted addresses one by one ',
		async function () {
			let result = await tierPage.fillWhitelist();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to add several whitelisted addresses");
	});

	test.it('Wizard step#3: User is able to remove one whitelisted address',
		async function () {
			let beforeRemoving = await tierPage.amountAddedWhitelist();
			let numberAddressForRemove=1;
			await tierPage.removeWhiteList(numberAddressForRemove-1);
			let afterRemoving=await tierPage.amountAddedWhitelist();
			return await assert.equal(beforeRemoving, afterRemoving+1, "Test FAILED. Wizard step#3: User is NOT able to remove one whitelisted address");
	});

	test.it('Wizard step#3: User is able to set "Custom Gasprice" checkbox',
		async function () {

			let result = await wizardStep3.clickCheckboxGasPriceCustom();
			return await assert.equal(result, true, 'Test FAILED. User is not able to set "Custom Gasprice" checkbox');

	});

	test.it (' Wizard step#3: User is able to fill out the  CustomGasprice field with valid value' ,
		async function () {
		    let customValue=100;
			let result = await wizardStep3.fillGasPriceCustom(customValue);
			return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to fill "Custom Gasprice" with valid value');

	});

	test.it('Wizard step#3: User is able to set SafeAndCheapGasprice checkbox ',
		async function () {
			let result = await wizardStep3.clickCheckboxGasPriceSafe();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: 'Safe and cheap' Gas price checkbox does not set by default");

	});

	test.it ('Wizard step#3:Tier#1: User is able to fill out field "Rate" with valid data',
		async function () {
			tierPage.number=0;
			tierPage.tier.rate = 5678;
			let result = await tierPage.fillRate();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to fill out field 'Rate' with valid data");
	});

	test.it ('Wizard step#3:Tier#1: User is able to fill out field "Supply" with valid data',
		async function () {
			tierPage.tier.supply = 1e18;
			let result = await tierPage.fillSupply();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
	});


	test.it('Wizard step#3: User is able to add tier',
		async function () {
			let result = await wizardStep3.clickButtonAddTier();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: Wizard step#3: User is able to add tier");
	});
	test.it ('Wizard step#3:Tier#2: User is able to fill out field "Rate" with valid data',
		async function () {
			tierPage.number=1;
			tierPage.tier.rate = 5678;
			let result = await tierPage.fillRate();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to fill out field 'Rate' with valid data");
		});

	test.it ('Wizard step#3:Tier#2: User is able to fill out field "Supply" with valid data',
		async function () {
			tierPage.tier.supply = 1e18;
			let result = await tierPage.fillSupply();
			return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
		});


	test.it('Wizard step#3: user is able to proceed to Step4 by clicking button Continue ',
		async function () {
			await wizardStep3.clickButtonContinue();
			await driver.sleep(2000);
			let result = await wizardStep4.isPresentModal();
			return await assert.equal(result, true, "Test FAILED. User is not able to activate Step2 by clicking button Continue");
	});
/////////////// STEP4 //////////////
	test.it('Wizard step#4: alert present if user reload the page ',
		async function () {
			await wizardStep4.refresh();
			await driver.sleep(2000);
			let result = await wizardStep4.isPresentAlert();
			return await assert.equal(result, true, "Test FAILED.  Alert does not present if user refresh the page");
	});

	test.it('Wizard step#4: user is able to accept alert after reloading the page ',
		async function () {

			let result = await wizardStep4.acceptAlert() ;
			await driver.sleep(10000);
		    result = result && await wizardStep4.isPresentModal();
			return await assert.equal(result, true, "Test FAILED. Modal does not present after user has accepted alert");
	});

	test.it('Wizard step#4: button SkipTransaction is  presented if user reject a transaction ',
		async function () {
			await metaMask.rejectTransaction();
			await metaMask.rejectTransaction();
			let result = await wizardStep4.isPresentButtonSkipTransaction();
			return await assert.equal(result, true, "Test FAILED. button'Skip transaction' does not present if user reject the transaction");
	});

	test.it('Wizard step#4: user is able to skip transaction ',
		async function () {

			let result = await wizardStep4.clickButtonSkipTransaction();
			await driver.sleep(2000);
			result = result && await wizardStep4.clickButtonYes();
			return await assert.equal(result, true, "Test FAILED. user is not able to skip transaction");
	});

	test.it('Wizard step#4: alert is presented if user wants to leave the wizard ',
		async function () {

		    let result = await  welcomePage.openWithAlertConfirmation();
			return await assert.equal(result, false, "Test FAILED. Alert does not present if user wants to leave the site");
	});

	test.it('Wizard step#4: User is able to stop deployment ',
		async function () {
			await driver.sleep(5000);
			let result =  await wizardStep4.clickButtonCancelDeployment();
			result = result && await wizardStep4.clickButtonYes();
			await metaMask.doTransaction(5);
			return await assert.equal(result, true, "Test FAILED. Button 'Cancel' does not present");
	});

//////////////////////// Test SUITE #1 /////////////////////////////
	test.it('Owner  can create crowdsale(scenario testSuite1.json),1 tier, not modifiable, no whitelist,1 reserved',
		async function () {

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

	test.it('Invest page: Investors balance is changed accordingly after purchase ',
		async function () {
			let investor = Investor1;
			let contribution = crowdsaleForE2Etests1.minCap;
			await investor.openInvestPage(crowdsaleForE2Etests1);
			let balance = await investor.getBalanceFromInvestPage(crowdsaleForE2Etests1);
			let result = (balance == contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
	});

	test.it('Investor is not able to buy amount which significally more than total supply',
		async function() {

		    let investor = Investor1;
		    await investor.openInvestPage(crowdsaleForE2Etests1);
		    let contribution = significantAmount;
		    let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor is able to buy amount significally  more than total supply");
	});

	test.it('Investor is able to buy less than mincap after first transaction',
		async function() {
		    let investor = Investor1;
		    await investor.openInvestPage(crowdsaleForE2Etests1);
		    let contribution = smallAmount+10;
		    let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
	});

	test.it('Crowdsale is finished in time',
		async function() {
			let investor = Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests1);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			driver.sleep(10000);
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

	test.it.skip('Owner able to distribute if crowdsale time expired but not all tokens were sold',
		async function() {

			let owner = Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsaleForE2Etests1);

			return await assert.equal(result, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
	});

	test.it.skip('Reserved address has received correct quantity of tokens after distribution',
		async function() {

			let newBalance=await ReservedAddress.getTokenBalance(crowdsaleForE2Etests1)/1e18;
			let balance=crowdsaleForE2Etests1.reservedTokens[0].value;
			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
	});

	test.it.skip('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function() {

			let owner = Owner;
			let result  = await owner.finalize(crowdsaleForE2Etests1);
			return await assert.equal(result , true, "Test FAILED.'Owner can NOT finalize ");
	});

	test.it.skip('Investor has received correct quantity of tokens after finalization', async function() {

		let investor=Investor1;
		let newBalance=await investor.getTokenBalance(crowdsaleForE2Etests1)/1e18;
		let balance=crowdsaleForE2Etests1.minCap+smallAmount+10;
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


	test.it.skip('Manage page: Owner is able to modify the rate before start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result=await owner.changeRate(tierNumber,rateTier1);//500
			assert.equal(result,true,'Test FAILED.Owner is NOT able to modify the rate before start of crowdsale ');

	});

	test.it('Manage page:rate changed accordingly after modifying',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let rate=await owner.getRateTier(tierNumber);
			return await assert.equal(rate, crowdsaleForE2Etests2.tiers[0].rate, 'Test FAILED.New value of rate does not match given value');

	});

	test.it('Manage page: owner is able to modify the total supply before start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result = await owner.changeSupply(tierNumber,supplyTier1);
			return await assert.equal(result,true,'Test FAILED.Owner can NOT modify the total supply before start of crowdsale ');
	});

	test.it('Manage page:  total supply changed accordingly  after changing',
		async function () {
			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let balance=await owner.getSupplyTier(tierNumber);
			return await assert.equal(balance, supplyTier1, 'Test FAILED. New value of supply does not match given value ');
	});

	test.it('Manage page: owner is able to modify the start time  before start of crowdsale ',
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

	test.it('Manage page: warning is displayed if end time earlier than start time',
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

	test.it('Manage page: disabled to modify the start time if crowdsale has begun',
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

	test.it('Manage page: disabled to modify the total supply if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);

			let tierNumber=1;
			let result = await owner.changeSupply(tierNumber,supplyTier1);
			return await assert.equal(result,false,'Test FAILED.Owner able to modify the total supply after start of crowdsale ');
	});

	test.it('Manage page: disabled to modify the rate if crowdsale has begun',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
			let tierNumber=1;
			let result=await owner.changeRate(tierNumber,rateTier1);//200
			return await assert.equal(result,false,'Test FAILED.Owner able to modify the rate after start of crowdsale ');
	});

	test.it('Manage page: owner is able to modify the end time after start of crowdsale',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);

			let tierNumber=1;
			let result=await owner.changeEndTime(tierNumber,endDateForTestLater, endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

	});

	test.it('Manage page:  end time changed  accordingly after modifying ',
		async function () {

			let owner = Owner;
			await owner.openManagePage(crowdsaleForE2Etests2);
            let tierNumber=1;
			let result=await  owner.getEndTime(tierNumber);
			result=Utils.compare(result,endDateForTestLater,endTimeForTestLater);
			return await assert.equal(result, true, 'Test FAILED. End time is changed but doest match the given value');
	});


	test.it('Manage page: owner is able to add whitelisted address if crowdsale has begun',
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

	test.it('Whitelisted investor can buy amount equal mincap',
		async function() {

			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].min;
			let result  = await investor.contribute(contribution);
			return await assert.equal(result,true,'Test FAILED. Investor can not buy amount = min');
	});

	test.it('Whitelisted investor is able to buy less than mincap after first transaction',
		async function() {
			let investor=Investor1;
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=crowdsaleForE2Etests2.tiers[0].whitelist[0].min-2;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

	});

	test.it('Whitelisted investor is not able to buy more than assigned max',
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

	test.it('Whitelisted investor is not able to buy more than total supply in tier',
		async function() {

			let investor=Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let result = await investor.contribute(crowdsaleForE2Etests2.tiers[0].supply+1);
			return await assert.equal(result, false, "Test FAILED.Investor can  buy more than supply in tier");

	});

	test.it('Owner is not able to distribute before all tokens are sold and crowdsale is not finished ',
		async function() {

			let owner=Owner;
			await owner.setMetaMaskAccount();
			let result = await owner.distribute(crowdsaleForE2Etests2);
			return await assert.equal(result, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");

	});

	test.it('Owner is not able to finalize before  all tokens are sold and crowdsale is not finished ',
		async function() {

			let owner=Owner;
			let result  = await owner.finalize(crowdsaleForE2Etests2);
			return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");

	});

	test.it('Whitelisted investor is able to buy total supply ',
		async function() {

			let investor=Investor2;
			await investor.setMetaMaskAccount();
			await investor.openInvestPage(crowdsaleForE2Etests2);
			let contribution=supplyTier1-crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can not buy total supply");
	});

	test.it('Whitelisted investor is not able to buy if all tokens were sold',
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

	test.it('Owner able to finalize (after all tokens were sold)',
		async function() {

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

	test.it('Investor #2 has received correct amount of tokens after finalization',
		async function() {

			let investor=Investor2;
			let newBalance=await investor.getTokenBalance(crowdsaleForE2Etests2)/1e18;
			let balance=supplyTier1-crowdsaleForE2Etests2.tiers[0].whitelist[0].max;
			logger.info("Investor should receive  = "+balance);
			logger.info("Investor has received balance = "+newBalance);
			return await assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );


	});




});



/*
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
test.it("Wizard step#2: user is not able to add reserved tokens if address is invalid ",
		async function () {
			await reservedTokensPage.clickButtonAddReservedTokens();
			let newBalance=await reservedTokensPage.amountAddedReservedTokens();
			assert.equal(newBalance, 0, "Test FAILED. Wizard step#2: user is not able to add reserved tokens if address is invalid");

		});

	test.it.skip("Wizard step#2: warning is presented if address of reserved tokens is invalid ",
		async function () {
			await reservedTokensPage.fillAddress("qwertyuiopasdfghjklz");
			b=await reservedTokensPage.isPresentWarningAddress();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if address of reserved tokens is invalid ");

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

	test.it.skip('Wizard step#3: User is able to set checkbox  "Whitelist disabled" ',
		async function () {
			b=true;
			b=await wizardStep3.clickCheckboxWhitelistNo();
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist disabled"');

		});



*/

