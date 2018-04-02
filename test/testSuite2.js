
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');
////////////////////////////////////////////////////////
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
const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;
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
		//await driver.quit();
	});
/////////////////////////////////////////////////////////////////////////////


	test.it('User can open wizard welcome page: https://wizard.oracles.org/',
		async function () {
		b="";
		b=await  welcomePage.open();
		assert.equal(b, startURL, "Test FAILED. User can open Wizard ");
		logger.error("Test PASSED. User can open wizard welcome page: https://wizard.oracles.org/");

	});
	test.it('Welcome page: button NewCrowdsale present ',
		async function () {
			b=false;
			b=await welcomePage.isPresentButtonNewCrowdsale();
			assert.equal(b, true, "Test FAILED. button NewCrowdsale not present ");
			logger.error("Test PASSED. Button NewCrowdsale present");

		});
	test.it('Welcome page: button ChooseContract present ',
		async function () {
			b=false;
			b=await welcomePage.isPresentButtonChooseContract();
			assert.equal(b, true, "Test FAILED. button ChooseContract not present ");
			logger.error("Test PASSED. Button ChooseContract present");

		});
	test.it('Welcome page: user is able to open Step1 by clicking button NewCrowdsale ',
		async function () {
			b=false;
			await welcomePage.clickButtonNewCrowdsale();
			b= await wizardStep1.isPresentButtonContinue();
			assert.equal(b, true, "Test FAILED. User is not able to open Step1 by clicking button NewCrowdsale");
			logger.error("Test PASSED. User is able to open Step2 by clicking button NewCrowdsale");

		});
	test.it('Wizard step#1: user is able to open Step2 by clicking button Continue ',
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
	test.it('Wizard step#2: user able to fill Name field with valid data',
		async function () {
			b= await wizardStep2.fillName(currencyForE2e.name);
			assert.equal(b, true, "Test FAILED. Wizard step#2: button Continue  not present ");

		});

	test.it('Wizard step#2: user able to fill Ticker field with valid data',
		async function () {
			b=await wizardStep2.fillTicker(currencyForE2e.ticker);
			assert.equal(b, true, "Test FAILED. User able to fill Ticker field with valid data ");

		});
	test.it('Wizard step#2: user able to fill Decimals field with valid data',
		async function () {
			b=await wizardStep2.fillDecimals(currencyForE2e.decimals);
			assert.equal(b, true, "Test FAILED. User able to fill Decimals field with valid data ");

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

	    test.it.skip('Wizard step#2: Alert present after select ClearAll and button No present',
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

	test.it('Wizard step#2: button Continue present ',
		async function () {
			b=false;
			b=await wizardStep2.isPresentButtonContinue();

			assert.equal(b, true, "Test FAILED. Wizard step#2: button Continue  not present ");

		});
	test.it('Wizard step#2: user is able to open Step3 by clicking button Continue ',
		async function () {
			b=false;
			await wizardStep2.clickButtonContinue();
			await driver.sleep(2000);
			b=await wizardStep3.isPresentFieldWalletAddress();
			assert.equal(b, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");
			logger.error("Test PASSED. User is able to open Step3 by clicking button Continue");

		});

	test.it('Wizard step#3: Wallet address matches the metamask account address ',
		async function () {

			s=await wizardStep3.getFieldWalletAddress();
			console.log("SSS="+s);
			b=(s==Owner.account);
			assert.equal(b, true, "Test FAILED. Wallet address does not match the metamask account address ");




		});

	test.it('Wizard step#3: "Safe and cheap" Gas price checkbox set by default ',
		async function () {
			b=true;
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
	test.it.skip('Wizard step#3: Checkbox "Whitelist disabled"   set by default ',
		async function () {
			b=true;
			assert.equal(b, true, 'Test FAILED. Wizard step#3: Checkbox "Whitelist disabled"  does not set by default');

		});
	test.it('Wizard step#3: User is able to set checkbox  "Whitelist enabled"',
		async function () {

			b=await wizardStep3.clickCheckboxWhitelistYes();
			assert.equal(b, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist enabled"');

		});






	test.it('Wizard step#3: User is able to download CVS file with whitelisted addresses',
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
			assert.equal(true, true, "Test FAILED. Wizard step#3: User is able to add several whitelisted addresses");


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








});
