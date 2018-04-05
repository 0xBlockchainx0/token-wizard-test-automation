
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
const investPage=require('../pages/InvestPage.js');
const InvestPage=investPage.InvestPage;
const managePage=require('../pages/ManagePage.js');
const ManagePage=managePage.ManagePage;
const currency= require('../entity/Currency.js');
const Currency=currency.Currency;

////////////////////////////////////////////////////////
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;
const tempOutputFile=Logger.tempOutputFile;
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const metaMask=require('../pages/MetaMask.js');
const MetaMask=metaMask.MetaMask;
const user=require("../entity/User.js");
const User=user.User;
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;


test.describe('POA token-wizard. Test suite #2', function() {
	this.timeout(2400000);//40 min

	var driver;
	var s="";
	var min;
	var max;
	var owner;
	var investor;
	var mngPage;

	var Owner;
	var Investor1;
	var Investor2;
	var Investor3;
	var ReservedAddress;

	var scenario1 = './scenarios/testSuite1.json';
	var scenario2 = './scenarios/testSuite2.json';
	var scenarioReservedTokens = './scenarios/ReservedTokens.json';
	var mtMask;
	var crowdsale1 = new Crowdsale();//test suite #1
	var crowdsale = new Crowdsale();//test suite #2
	var b = false;
	var balance;
	var newBalance;
	var contribution;
	var flagCrowdsale=false;
	var flagStartTimeChanged=false;
	var flagWhitelistAdded=false;
	var flagDistribute=false
	var supplyTier1=200;
	var rateTier1=500;
	var newTime;
	var newDate;
	var minInvestor2=20;
	var maxInvestor2=200;
	var minReservedAddress=15;
	var maxReservedAddress=50;
	var startTime=0;
	var smallAmount=0.1;
	var user8545_56B2File='./users/user8545_56B2.json';//Owner
	var user8545_F16AFile='./users/user8545_F16A.json';//Investor1 - whitelisted before deployment
	var user8545_f5aAFile='./users/user8545_f5aA.json';//Investor2 - added from manage page before start
	var user8545_ecDFFile= './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time

	var welcomePage;
	const  startURL=Utils.getStartURL();
	var wizardStep1 ;
	var wizardStep2;
	var wizardStep3;
	var reservedTokens;
	var currency;
	var currencyForE2e;
	var tierPage;
	///////////////////////////////////////////////////////////////////////

	test.before(async function() {
        logger.info("Version 2.0.5");
		driver = await Utils.startBrowserWithMetamask();
		flagCrowdsale=false;
		Owner = new User (driver,user8545_56B2File);
		Investor1 = new User (driver,user8545_F16AFile);
		Investor2 = new User (driver,user8545_f5aAFile);
		ReservedAddress = new User (driver,user8545_ecDFFile);

		await Utils.sendEth(Owner,20);
		await Utils.sendEth(Investor1,20);
		await Utils.sendEth(Investor2,20);
		await Utils.sendEth(ReservedAddress,20);
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

		mtMask = new MetaMask(driver);
		await mtMask.open();//return activated Metamask and empty page

		await Owner.setMetaMaskAccount();

		welcomePage = new WizardWelcome(driver,startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		reservedTokens=new ReservedTokensPage(driver);
		currency=Currency.createCurrency(scenarioReservedTokens);
		currencyForE2e=Currency.createCurrency(scenario1);
		tierPage=new TierPage(driver,currency.tiers[0]);


	});

	test.after(async function() {
		// Utils.killProcess(ganache);
		await Utils.sendEmail(tempOutputFile);
		let outputPath=Utils.getOutputPath();
		outputPath=outputPath+"/result"+Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath,outputPath);
		//await fs.remove(tempOutputPath);
		await driver.quit();
	});


//////////////////////////////////////////////////////////////////////////////
	test.it.skip('User is able to open wizard welcome page:'+startURL ,
		async function () {
			b="";
			b=await  welcomePage.open();
			assert.equal(b, startURL, "Test FAILED. User can open Wizard ");
			logger.error("Test PASSED. User can open wizard welcome page: https://wizard.oracles.org/");

		});
	test.it.skip('Welcome page: button NewCrowdsale present ',
		async function () {
			b=false;
			b=await welcomePage.isPresentButtonNewCrowdsale();
			assert.equal(b, true, "Test FAILED. button NewCrowdsale not present ");
			logger.error("Test PASSED. Button NewCrowdsale present");

		});
	test.it.skip('Welcome page: button ChooseContract present ',
		async function () {
			b=false;
			b=await welcomePage.isPresentButtonChooseContract();
			assert.equal(b, true, "Test FAILED. button ChooseContract not present ");
			logger.error("Test PASSED. Button ChooseContract present");

		});
	test.it.skip('Welcome page: user is able to open Step1 by clicking button NewCrowdsale ',
		async function () {
			b=false;
			await welcomePage.clickButtonNewCrowdsale();
			b= await wizardStep1.isPresentButtonContinue();
			assert.equal(b, true, "Test FAILED. User is not able to open Step1 by clicking button NewCrowdsale");
			logger.error("Test PASSED. User is able to open Step2 by clicking button NewCrowdsale");

		});
	test.it.skip('Wizard step#1: user is able to open Step2 by clicking button Continue ',
		async function () {
			b=false;
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
			b=await wizardStep2.isPresentFieldName();
			assert.equal(b, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");
			logger.error("Test PASSED. User is able to open Step2 by clicking button Continue");

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
			await wizardStep2.fillName(currencyForE2e.name);
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
			await wizardStep2.fillTicker(currencyForE2e.ticker);
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
			await wizardStep2.fillDecimals(currencyForE2e.decimals);
			b=await wizardStep2.isPresentWarningDecimals();
			assert.equal(b, false, "Test FAILED. Wizard step#2: user is not able to fill Decimals  field with valid data ");

		});

/////////// Reserved
	test.it.skip("Wizard step#2: warnings are presented if user try to add empty reserved token ",
		async function () {
			await reservedTokens.clickButtonAddReservedTokens();
			b=(await reservedTokens.isPresentWarningAddress())&&(await reservedTokens.isPresentWarningValue());
			assert.equal(b, true, "Test FAILED. Wizard step#2: warnings are not  presented if user try to add empty reserved token ");

		});
	test.it.skip("Wizard step#2: warnings are disappeared if user fill out address and value fields with valid data ",
		async function () {
			await reservedTokens.fillAddress(currency.reservedTokens[0].address);
			await reservedTokens.fillValue(currency.reservedTokens[0].value);
			b=(await reservedTokens.isPresentWarningAddress())||(await reservedTokens.isPresentWarningValue());
			assert.equal(b, false, "Test FAILED. Wizard step#2: warnings are presented if user fill out address and value fields with valid data ");

		});

	test.it.skip("Wizard step#2: warning is presented if address of reserved tokens is invalid ",
		async function () {
			await reservedTokens.fillAddress("qwertyuiopasdfghjklz");
			b=await reservedTokens.isPresentWarningAddress();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if address of reserved tokens is invalid ");

		});

	test.it.skip("Wizard step#2: user is not able to add reserved tokens if address is invalid ",
		async function () {
			await reservedTokens.clickButtonAddReservedTokens();
			newBalance=await reservedTokens.amountAddedReservedTokens();
			assert.equal(newBalance, 0, "Test FAILED. Wizard step#2: user is not able to add reserved tokens if address is invalid");

		});

	test.it.skip("Wizard step#2: warning present if value of reserved tokens  is negative ",
		async function () {
			await reservedTokens.fillValue("-123");
			b=await reservedTokens.isPresentWarningValue();
			assert.equal(b, true, "Test FAILED. Wizard step#2: warning does not present if address of reserved tokens is negative ");

		});
	test.it.skip("Wizard step#2: user is not able to add reserved tokens if value is invalid ",
		async function () {
		await reservedTokens.fillAddress(currency.reservedTokens[0].address);
		await reservedTokens.clickButtonAddReservedTokens();
		newBalance=await reservedTokens.amountAddedReservedTokens();
		assert.equal(newBalance, 0, "Test FAILED. Wizard step#2: user is not able to add reserved tokens if address is invalid");

		});

	test.it.skip('Wizard step#2: user is able to add reserved tokens ',
		async function () {
			b=false;
			for (var i=0;i<currency.reservedTokens.length;i++)
			{
				await reservedTokens.fillReservedTokens(currency.reservedTokens[i]);
				await reservedTokens.clickButtonAddReservedTokens();
			}
			b=await reservedTokens.amountAddedReservedTokens();
			assert.equal(b, currency.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
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
			balance=await reservedTokens.amountAddedReservedTokens();
			contribution=currency.reservedTokens.length-1;
			await reservedTokens.removeReservedTokens(contribution);
			newBalance=await reservedTokens.amountAddedReservedTokens();
			assert.equal(balance, newBalance+1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
			logger.error("Test PASSED. Wizard step#2: user is able to add reserved tokens");

		});

	test.it.skip('Wizard step#2: ClearAll button present ',
		async function () {

			b = await reservedTokens.isPresentButtonClearAll();
			assert.equal(b, true, "Test FAILED.ClearAll button is NOT present");
		});

	test.it.skip('Wizard step#2: Alert present after clicking ClearAll and button No present',
		async function () {
			await reservedTokens.clickButtonClearAll();
			b = await reservedTokens.isPresentButtonNoAlert();
			assert.equal(b, true, "Test FAILED.Alert does NOT present after select ClearAll or button No does NOT present");
		});
	test.it.skip('Wizard step#2: User able to click button No and warning disappear ',
		async function () {

			await  reservedTokens.clickButtonNoAlert();
			await driver.sleep(2000);
			b = await reservedTokens.isPresentButtonYesAlert();
			assert.equal(b, false, "Test FAILED.User is not able to click button No or warning does not disappear");
		});

	test.it.skip('Wizard step#2: Alert present after select ClearAll and button Yes present',
		async function () {
			await reservedTokens.clickButtonClearAll();
			b = await reservedTokens.isPresentButtonYesAlert();
			assert.equal(b, true, "Test FAILED.Alert does NOT present after select ClearAll or button Yes does NOT present");
		});

	test.it.skip('Wizard step#2: user is able bulk delete of reserved tokens ',
		async function () {
			await reservedTokens.clickButtonYesAlert();
			await driver.sleep(2000);
			newBalance = await reservedTokens.amountAddedReservedTokens();
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
			for (var i=0;i<currencyForE2e.reservedTokens.length;i++)
			{
				await reservedTokens.fillReservedTokens(currencyForE2e.reservedTokens[i]);
				await reservedTokens.clickButtonAddReservedTokens();
			}
			b=await reservedTokens.amountAddedReservedTokens();
			assert.equal(b, currencyForE2e.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens after deletion");
			logger.error("Test PASSED. Wizard step#2: user is able to add reserved tokens after deletion");

		});

	test.it.skip('Wizard step#2: button Continue present ',
		async function () {
			b=false;
			b=await wizardStep2.isPresentButtonContinue();

			assert.equal(b, true, "Test FAILED. Wizard step#2: button Continue  not present ");

		});
	test.it.skip('Wizard step#2: user is able to open Step3 by clicking button Continue ',
		async function () {
			b=false;
			await wizardStep2.clickButtonContinue();
			await driver.sleep(2000);
			b=await wizardStep3.isPresentFieldWalletAddress();
			assert.equal(b, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");
			logger.error("Test PASSED. User is able to open Step3 by clicking button Continue");

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

			b=await wizardStep3.fillGasPriceCustom(currencyForE2e.gasPrice);
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
		});

/////////////////////////////////////////////////////////////////////////////

	test.it.skip('Owner  can create crowdsale(scenario testSuite1.json),1 tier, not modifiable, no whitelist,1 reserved',
		async function () {
			b=false;
			owner = Owner;//Owner

			await owner.setMetaMaskAccount();
			startTime=new Date(Date.now()).getTime()+80000+180000;
			crowdsale1 = await owner.createCrowdsale(scenario1,4);
			logger.info("TokenAddress:  " + crowdsale1.tokenAddress);
			logger.info("ContractAddress:  " + crowdsale1.contractAddress);
			logger.info("url:  " + crowdsale1.url);
			b = (crowdsale1.tokenAddress != "") & (crowdsale1.contractAddress != "") & (crowdsale1.url != "");
			flagCrowdsale=b;
			assert.equal(b, true, "Test FAILED. Crowdsale has NOT created ");
			logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

		});

	test.it.skip('Disabled to modify the end time if crowdsale is not modifiable',
		async function () {
			assert.equal(flagCrowdsale, true);
			b=true;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale1);
			newTime=Utils.getTimeNear(80000000,"utc");
			newDate=Utils.getDateNear(80000000,"utc");
			b=await owner.changeEndTime(1,newDate, newTime);
			assert.equal(b, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');
			logger.info('Test PASSED. Disabled to modify the end time if crowdsale not modifiable ');
		});

	test.it.skip('Investor can NOT buy less than mincap in first transaction',
		async function() {
			assert.equal(flagCrowdsale,true);
			b=true;
			investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale1.url);
			b = await investor.contribute(crowdsale1.currency.minCap * 0.5);
			assert.equal(b, false, "Test FAILED.Investor can buy less than minCap in first transaction");
			logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

		});

	//SKIP
	test.it.skip('Investor can buy amount equal mincap',
		async function() {
			assert.equal(flagCrowdsale,true);

			b=false;
			investor=Investor1;
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale1.url);
			balance=await investor.getBalanceFromPage(crowdsale1.url);
			contribution=crowdsale1.currency.minCap;
			b = await investor.contribute(contribution);
			assert.equal(b,true,'Test FAILED. Investor can not buy amount = min');
			await investor.open(crowdsale1.url) ;
			newBalance=await investor.getBalanceFromPage(crowdsale1.url);
			b=((newBalance-balance)==contribution);
			logger.info("minCap: Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
			logger.warn("Test PASSED. Investor can buy minCap");

		});

	test.it.skip('Investor not able to buy amount significally  more than total supply', async function() {
		assert.equal(flagCrowdsale,true);
		investor=Investor1;
		await investor.open(crowdsale1.url);
		balance=await investor.getBalanceFromPage(crowdsale1.url);
		contribution=1234567890;
		b = await investor.contribute(contribution);
		assert.equal(b, false, "Test FAILED. Investor is able to buy amount significally  more than total supply");
	});

	test.it.skip('Investor can buy less than mincap after first transaction', async function() {
		assert.equal(flagCrowdsale,true);

		b=false;
		investor=Investor1;
		await investor.open(crowdsale1.url);
		balance=await investor.getBalanceFromPage(crowdsale1.url);
		contribution=smallAmount;
		b = await investor.contribute(contribution);
		assert.equal(b, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
		newBalance=await investor.getBalanceFromPage(crowdsale1.url);
		b=(newBalance!=balance)&&(Math.abs((parseFloat(newBalance)-parseFloat(balance))-contribution)<=smallAmount);
		logger.info("Difference="+(parseFloat(newBalance)-parseFloat(balance)));
		logger.info("Contribution="+contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		//await driver.sleep(10000);
		assert.equal(b, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		logger.warn("Test PASSED. Investor can buy less than min after first transaction" );

	});

	test.it.skip('Disabled to buy after crowdsale time expired', async function() {

		var endTime=startTime+parseInt(crowdsale1.currency.tiers[0].endDate);
		//console.log("Starttime="+startTime);
		do{
			await driver.sleep(1000);
			logger.info("Wait 1 sec until crowdsale ended");
			logger.info(new Date().getTime() +" : "+ endTime);
		}
		while (new Date().getTime()<=endTime);
		assert.equal(flagCrowdsale,true);
		b=true;
		investor=Investor1;
		await investor.open(crowdsale1.url);
		contribution=crowdsale1.currency.tiers[0].supply;
		b = await investor.contribute(contribution);
		assert.equal(b, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
		logger.warn("Test PASSED. IDisabled to buy after crowdsale is finalized");
	});

	test.it.skip('Owner able to distribute if crowdsale time expired but not all tokens were sold', async function() {
		assert.equal(flagCrowdsale,true);
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale1);
		assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
		logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");
		flagDistribute=true;
	});

	test.it.skip('Reserved address has received correct quantity of tokens after distribution', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		flagDistribute=false;
		newBalance=await ReservedAddress.getTokenBalance(crowdsale1)/1e18;
		balance=crowdsale1.currency.reservedTokens[0].value;//1e18
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");
		flagDistribute=true;
	});

	test.it.skip('Owner able to finalize ( if crowdsale time expired but not all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		b=false;
		owner=Owner;
		//await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale1);
		assert.equal(b, true, "Test FAILED.'Owner can NOT finalize ");
		logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

	});
	test.it.skip('Investor has received correct quantity of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		investor=Investor1;
		newBalance=await investor.getTokenBalance(crowdsale1)/1e18;
		balance=crowdsale1.currency.minCap+smallAmount;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		logger.info("Difference = "+(newBalance-balance));
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});
////////////////// TEST SUITE 2 /////////////////////////////////////////////////

	test.it('Owner  can create crowdsale(scenario testSuite2.json): 1 tier,' +
		' 1 whitelist address,2 reserved addresses, modifiable',
		async function () {

			flagCrowdsale=false;
			b=false;
			owner = Owner;//Owner
			await owner.setMetaMaskAccount();
			crowdsale = await owner.createCrowdsale(scenario2,1);
			logger.info("TokenAddress:  " + crowdsale.tokenAddress);
			logger.info("ContractAddress:  " + crowdsale.contractAddress);
			logger.info("url:  " + crowdsale.url);
			b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
			flagCrowdsale=b;
			assert.equal(b, true, 'Test FAILED. Crowdsale has NOT created ');
			logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");

		});

	test.it('Whitelisted investor NOT able to buy before start of crowdsale ',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=true;
			investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min);
			assert.equal(b, false, "Test FAILED. Whitelisted investor can not buy before the crowdsale started");
			logger.warn("Test PASSED. IWhitelisted investor can  buy before the crowdsale started");


		});


	test.it('Disabled to modify the name of tier ',
		async function () {
			assert.equal(flagCrowdsale, true);
			owner = Owner;
			await owner.setMetaMaskAccount();
			mngPage=await owner.openManagePage(crowdsale);
			b=await mngPage.isDisabledNameTier(1);
			assert.equal(b,true,"Test FAILED. Enabled to modify the name of tier");
			logger.warn("Test PASSED. Disabled to modify the name of tier");
		});

	test.it("Tier's name  matches given value",
		async function () {
			assert.equal(flagCrowdsale, true);
			owner = Owner;
			//await owner.setMetaMaskAccount();
			mngPage=await owner.openManagePage(crowdsale);
			s=await mngPage.getNameTier(1);
			b=(s==crowdsale.currency.tiers[0].name);
			assert.equal(b,true,"Test FAILED. Tier's name does NOT matches given value");
			logger.warn("Test PASSED. Tier's name  matches given value");

		});

	test.it('Disabled to modify the wallet address ',
		async function () {
			assert.equal(flagCrowdsale, true);
			owner = Owner;
			//await owner.setMetaMaskAccount();
			mngPage=await owner.openManagePage(crowdsale);
			b=await mngPage.isDisabledWalletAddressTier(1);
			assert.equal(b,true,"Test FAILED. Enabled to modify the wallet address of tier");
			logger.warn("Test PASSED. Disabled to modify the wallet address of tier");
		});


	test.it("Tier's wallet address matches given value",
		async function () {
			assert.equal(flagCrowdsale, true);
			owner = Owner;
			//await owner.setMetaMaskAccount();
			mngPage=await owner.openManagePage(crowdsale);
			s=await mngPage.getWalletAddressTier(1);
			b=(s==crowdsale.currency.walletAddress);
			assert.equal(b,true,"Test FAILED. Tier's wallet address does NOT matches given value")
			logger.warn("Test PASSED. Tier's wallet address  matches given value");

		});

	test.it('Owner is able to add whitelisted address before start of crowdsale',
		async function () {
			assert.equal(flagCrowdsale, true);
			b=false;
			owner = Owner;
			investor=Investor2;
			//await owner.setMetaMaskAccount();
			b=await owner.openManagePage(crowdsale);
			b=await owner.fillWhitelistTier(1,investor.account,minInvestor2,maxInvestor2);
			assert.equal(b, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
			logger.error("Test PASSED. Owner is able to add whitelisted address before start of crowdsale ");
			flagWhitelistAdded=true;
		});

	test.it.skip('Owner is able to modify the rate before start of crowdsale',
		async function () {
			assert.equal(flagCrowdsale, true);
			b=false;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			b=await owner.changeRate(1,rateTier1);//500
			assert.equal(b,true,'Test FAILED.Owner is NOT able to modify the rate before start of crowdsale ');
			await owner.openManagePage(crowdsale);
			balance=await owner.getRateTier(1);
			b=(rateTier1==balance);
			assert.equal(b, true, 'Test FAILED.New value of rate does not match given value');
			logger.error("Test PASSED. Owner is able to modify the rate before start of crowdsale");



		});
	test.it('Owner is able to modify the total supply before start of crowdsale',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			b=await owner.changeSupply(1,supplyTier1)//200
			assert.equal(b,true,'Test FAILED.Owner can NOT modify the total supply before start of crowdsale ');
			await owner.openManagePage(crowdsale);
			balance=await owner.getSupplyTier(1);
			b=(supplyTier1==balance);
			assert.equal(b, true, 'Test FAILED. New value of supply does not match given value ');
			logger.error("Test PASSED. Owner is able to modify the total supply before start of crowdsale");
		});


	test.it('Owner is able to modify the start time  before start of crowdsale ',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=false;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			newTime=Utils.getTimeNear(90000,"utc");
			newDate=Utils.getDateNear(90000,"utc");
			b=await owner.changeStartTime(1,newDate, newTime);
			assert.equal(b, true, 'Test FAILED.Owner can NOT modify the start time of tier#1 before start ');
			await owner.openManagePage(crowdsale);
			s=await  owner.getStartTime(1);
			b=Utils.compare(s,newDate,newTime);
			//console.log("It is BBBB="+b);
			assert.equal(b, true, 'Test FAILED. Start time is changed but doest match the given value');
			logger.info('Test PASSED. Owner is able to modify the start time of tier#1 before start ');
			flagStartTimeChanged=true;
		});


	test.it('Owner is able to modify the end time before start of crowdsale',
		async function () {
			assert.equal(flagCrowdsale, true);
			b=false;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			newTime=Utils.getTimeNear(7000000000,"utc");
			newDate=Utils.getDateNear(7000000000,"utc");
			await owner.changeEndTime(1,newDate, newTime);
			//assert.equal(b, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 before start ');
			await owner.openManagePage(crowdsale);
			s=await  owner.getEndTime(1);
			b=await Utils.compare(s,newDate,newTime);
			//console.log("It is BBBB="+b);
			assert.equal(b, true, 'Test FAILED. End time is changed but doest match the given value');
			logger.info('Test PASSED. Owner is able to modify the end time of tier#1 before start ');

		});


	test.it('Warning present if end time earlier than start time',
		async function () {
			assert.equal(flagCrowdsale, true);

			b=true;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			newTime=Utils.getTimeNear(100,"utc");
			newDate=Utils.getDateNear(100,"utc");
			b=await owner.changeEndTime(1,newDate,newTime);
			assert.equal(b, false, 'Test FAILED. Allowed to set  end time earlier than start time ');
			logger.info('Test PASSED. Warning present if end time earlier than start time');


		});

	test.it('Not owner is NOT able to modify the start time of tier ',
		async function () {
			assert.equal(flagCrowdsale,true);
			b=true;
			owner = Investor1;
			await owner.setMetaMaskAccount();
			b=await owner.openManagePage(crowdsale);
			if (b!=false) assert.equal(true, false, 'Test FAILED.Warning "NOT OWNER" doesnt present');
			newTime=Utils.getTimeNear(120000,"utc");
			newDate=Utils.getDateNear(120000,"utc");
			b=await owner.changeStartTime(1,newDate, newTime);
			assert.equal(b, false, 'Test FAILED.Not owner can  modify the start time of tier#1 ');
			logger.error("Test PASSED. Not owner can NOT modify the start time of tier#1 ");

		});


	test.it('Disabled to modify the start time if crowdsale has begun',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			owner = Owner;//Owner
			await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			newTime=Utils.getTimeNear(120000,"utc");
			newDate=Utils.getDateNear(120000,"utc");
			b=await owner.changeStartTime(1,newDate,newTime);
			assert.equal(b, false, 'Test FAILED. Owner can  modify start time of tier#1 if tier has started');
			logger.info('Test PASSED. Owner can NOT modify start time if tier has started');

		});

	test.it('Disabled to modify the total supply if crowdsale has begun',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			owner = Owner;//Owner
			//await owner.setMetaMaskAccount();
			//await owner.openManagePage(crowdsale);
			b=await owner.changeSupply(1,supplyTier1)//200
			assert.equal(b,false,'Test FAILED.Owner able to modify the total supply after start of crowdsale ');
			logger.error("Test PASSED. Owner is able to modify the total supply before start of crowdsale");

		});
	test.it('Disabled to modify the rate if crowdsale has begun',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			owner = Owner;//Owner
			//await owner.setMetaMaskAccount();
			//await owner.openManagePage(crowdsale);
			b=await owner.changeRate(1,rateTier1);//200
			assert.equal(b,false,'Test FAILED.Owner able to modify the rate after start of crowdsale ');
			logger.error("Test PASSED. Owner is able to modify the rate before start of crowdsale");

		});

	test.it('Owner is able to modify the end time after start of crowdsale',
		async function () {
			assert.equal(flagCrowdsale, true);
			assert.equal(flagStartTimeChanged,true);
			b=false;
			owner = Owner;
			//await owner.setMetaMaskAccount();
			await owner.openManagePage(crowdsale);
			newTime=Utils.getTimeNear(80000000,"utc");
			newDate=Utils.getDateNear(80000000,"utc");
			b=await owner.changeEndTime(1,newDate, newTime);
			assert.equal(b, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');
			await owner.openManagePage(crowdsale);
			s=await  owner.getEndTime(1);
			b=Utils.compare(s,newDate,newTime);
			assert.equal(b, true, 'Test FAILED. End time is changed but doest match the given value');
			logger.info('Test PASSED. Owner is able to modify the end time of tier#1 after start ');
		});

	test.it('Owner is able to add whitelisted address if crowdsale has begun',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			flagWhitelistAdded=false;
			b=false;
			owner = Owner;
			investor=ReservedAddress;
			//await owner.setMetaMaskAccount();
			b=await owner.openManagePage(crowdsale);
			b=await owner.fillWhitelistTier(1,investor.account,minReservedAddress,maxReservedAddress);
			assert.equal(b, true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');
			logger.error("Test PASSED. Owner is able to add whitelisted address after start of crowdsale ");
			flagWhitelistAdded=true;
		});

	test.it('Whitelisted investor is NOT able to buy less than min in first transaction',
		async function() {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			investor=Investor1;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min * 0.5);
			assert.equal(b, false, "Test FAILED.Investor can buy less than minCap in first transaction");
			logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

		});



	test.it('Whitelisted investor can buy amount equal min',
		async function() {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=false;
			investor=Investor1;
			//await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			balance=await investor.getBalanceFromPage(crowdsale.url);
			contribution=crowdsale.currency.tiers[0].whitelist[0].min;
			b = await investor.contribute(contribution);
			assert.equal(b,true,'Test FAILED. Investor can not buy amount = min');
			await investor.open(crowdsale.url) ;
			newBalance=await investor.getBalanceFromPage(crowdsale.url);
			b=((newBalance-balance)==contribution);
			logger.info("minCap: Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
			assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
			logger.warn("Test PASSED. Investor can buy minCap");

		});
	test.it('Whitelisted investor is able to buy less than min after first transaction', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor1;
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=crowdsale.currency.tiers[0].whitelist[0].min-2;
		b = await investor.contribute(contribution);
		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED. Investor can NOT buy less than min after first transaction");
		logger.warn("Test PASSED. Investor can buy less than min after first transaction" );

	});

	test.it('Whitelisted investor is  NOT able to buy more than assigned max', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=Investor1;
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].max);
		assert.equal(b, false, "Test FAILED.Investor can  buy more than assigned max");
		logger.warn("Test PASSED. Investor can NOT buy more than assigned max");

	});

	test.it('Whitelisted investor is able to buy assigned max', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor1;
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=crowdsale.currency.tiers[0].whitelist[0].max-
			2*crowdsale.currency.tiers[0].whitelist[0].min+2;
		b = await investor.contribute(contribution);
		assert.equal(b, true, "Test FAILED.Investor can not buy  assigned max");
		await investor.open(crowdsale.url);

		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy assigned max" );
	});

	test.it('Whitelisted investor is NOT able to buy more than total supply in tier', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		investor=Investor2;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
		assert.equal(b, false, "Test FAILED.Investor can  buy more than supply in tier");
		logger.warn("Test PASSED. Investor can NOT contribute more than supply in tier");

	});

	test.it('Owner is NOT able to distribute before all tokens are sold and crowdsale is not finished ', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");
		logger.warn("Owner can NOT distribute before  all tokens are sold " );
	});

	test.it('Owner is NOT able to finalize before  all tokens are sold and crowdsale is not finished ', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=Owner;
		b = await owner.finalize(crowdsale);
		assert.equal(b, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
		logger.warn("Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended" );
	});

	test.it('Whitelisted investor able to buy total supply ', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		investor=Investor2;
		await investor.setMetaMaskAccount();
		await investor.open(crowdsale.url);
		balance=await investor.getBalanceFromPage(crowdsale.url);
		contribution=supplyTier1-crowdsale.currency.tiers[0].whitelist[0].max;

		b = await investor.contribute(contribution);
		assert.equal(b, true, "Test FAILED.Investor can not buy total supply");
		await investor.open(crowdsale.url);
		newBalance=await investor.getBalanceFromPage(crowdsale.url);
		b=((newBalance-balance)==contribution);
		logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
		assert.equal(b, true, "Test FAILED.Investor can  buy but balance did not changed");
		logger.warn("Test PASSED. Investor can buy total supply.");

	});
	test.it('Whitelisted investor is NOT able to buy if all tokens were sold',
		async function () {
			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			investor=ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			contribution=minReservedAddress;
			b = await investor.contribute(contribution);
			assert.equal(b,false, "Test FAILED.Investor can not buy if all tokens were sold");
			logger.warn("Test PASSED. Investor can buy total supply.");

		});

	test.it('Owner able to distribute after all tokens were sold but crowdsale is not finished', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		flagDistribute=false;
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.distribute(crowdsale);
		assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
		logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");
		flagDistribute=true;
	});

	test.it('Reserved address has received correct QUANTITY of tokens after distribution', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		owner=Owner;

		newBalance=await owner.getTokenBalance(crowdsale)/1e18;
		balance=
			crowdsale.currency.reservedTokens[1].value;//1e18

		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");

	});

	test.it('Reserved address has received correct PERCENT of tokens after distribution', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		owner=ReservedAddress;

		newBalance=await owner.getTokenBalance(crowdsale)/1e18;
		balance=
			crowdsale.currency.reservedTokens[0].value*supplyTier1/100;

		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
		logger.error("Test PASSED.'Investor has received right amount of tokens after finalization ");

	});

	test.it('Not Owner is NOT able to finalize (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		b=true;
		owner=ReservedAddress;
		await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale);
		assert.equal(b, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");
		logger.warn("Test PASSED. NOT Owner can NOT finalize (after all tokens were sold) " );

	});

	test.it('Owner able to finalize (after all tokens were sold)', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagDistribute,true);
		assert.equal(flagStartTimeChanged,true);
		b=false;
		owner=Owner;
		await owner.setMetaMaskAccount();
		b = await owner.finalize(crowdsale);
		assert.equal(b, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");
		logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

	});


	test.it('Disabled to buy after finalization of crowdsale',
		async function () {

			assert.equal(flagCrowdsale,true);
			assert.equal(flagStartTimeChanged,true);
			b=true;
			investor=ReservedAddress;
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			contribution=minReservedAddress;
			b = await investor.contribute(contribution);
			assert.equal(b, false, "Test FAILED.Investor can  buy if crowdsale is finalized");
			logger.warn("Test PASSED. IDisabled to buy after crowdsale is finalized");

		});

	test.it('Investor #1 has received correct amount of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		investor=Investor1;
		newBalance=await investor.getTokenBalance(crowdsale)/1e18;
		balance=crowdsale.currency.tiers[0].whitelist[0].max;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});
	test.it('Investor #2 has received correct amount of tokens after finalization', async function() {
		assert.equal(flagCrowdsale,true);
		assert.equal(flagStartTimeChanged,true);
		investor=Investor2;
		newBalance=await investor.getTokenBalance(crowdsale)/1e18;
		balance=50;
		logger.info("Investor should receive  = "+balance);
		logger.info("Investor has received balance = "+newBalance);
		assert.equal(balance, newBalance,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
		logger.warn("Test PASSED.'Investor has received right amount of tokens after finalization ");


	});


});
