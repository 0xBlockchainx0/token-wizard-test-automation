let test = require('selenium-webdriver/testing');
let assert = require('assert');
const fs = require('fs-extra');
///////////////////////////////////////////////////////
const WizardWelcome = require('../pages/WizardWelcome.js').WizardWelcome;
const WizardStep1 = require('../pages/WizardStep1.js').WizardStep1;
const WizardStep2 = require('../pages/WizardStep2.js').WizardStep2;
const WizardStep3 = require('../pages/WizardStep3.js').WizardStep3;
const WizardStep4 = require('../pages/WizardStep4.js').WizardStep4;
const TierPage = require('../pages/TierPage.js').TierPage;
const ReservedTokensPage = require('../pages/ReservedTokensPage.js').ReservedTokensPage;
const CrowdsalePage = require('../pages/CrowdsalePage.js').CrowdsalePage;
const InvestPage = require('../pages/ContributionPage.js').InvestPage;
const ManagePage = require('../pages/ManagePage.js').ManagePage;
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Utils = require('../utils/Utils.js').Utils;
const User = require("../entity/User.js").User;
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const smallAmount = 0.1;
const endTimeForTestEarlier = "01:23";
const endDateForTestEarlier = "01/07/2049";
const endTimeForTestLater = "420000";
const endDateForTestLater = "420000";

test.describe('e2e test for TokenWizard2.0/MintedCappedCrowdsale. v2.8.1 ', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File = './users/user8545_56B2.json';//Owner
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor1 - whitelisted for Tier#1 before deployment
	const user8545_f5aAFile = './users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile = './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time
	const user8545_dDdCFile = './users/user8545_dDdC.json';//Investor3 - whitelisted for Tier#2 before deployment
	const user8545_9E96File = './users/user8545_9E96.json';//Investor4 - for checking if whitelisted in tier#1 can't buy in tier #2
	let driver;
	let Owner;
	let Investor1;
	let Investor2;
	let Investor3;
	let Investor4;
	let ReservedAddress;

	let wallet;
	let welcomePage;
	let wizardStep1;
	let wizardStep2;
	let wizardStep3;
	let wizardStep4;
	let tierPage;
	let reservedTokensPage;
	let investPage;
	let startURL;
	let crowdsaleForUItests;
	let e2eMinCap;
	let e2eWhitelist;
	let e2eMinCapModifiable;
	let mngPage;
	let balance;
	let endTime;
	let endDate;

	let balanceEthOwnerBefore;
	let balanceEthOwnerAfter;
/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		await Utils.copyEnvFromWizard();
		const scenarioE2eMintedMinCap = './scenarios/scenarioE2eMintedMinCap.json';
		const scenarioE2eMintedWhitelist = './scenarios/scenarioE2eMintedWhitelist.json';
		const scenarioForUItests = './scenarios/scenarioUItests.json';
		const scenarioE2eMintedMinCapModifiable = './scenarios/scenarioE2eMintedMinCapModifiable.json';
		crowdsaleForUItests = await Utils.getMintedCrowdsaleInstance(scenarioForUItests);
		e2eMinCap = await  Utils.getMintedCrowdsaleInstance(scenarioE2eMintedMinCap);
		e2eWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioE2eMintedWhitelist);
		e2eMinCapModifiable = await Utils.getMintedCrowdsaleInstance(scenarioE2eMintedMinCapModifiable);
		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithWallet();

		Owner = new User(driver, user8545_56B2File);
		Owner.minCap = 0;
		Owner.maxCap = 100;
		Investor1 = new User(driver, user8545_F16AFile);
		Investor1.minCap = e2eWhitelist.tiers[0].whitelist[0].min;
		Investor1.maxCap = e2eWhitelist.tiers[0].whitelist[0].max;
		Investor2 = new User(driver, user8545_f5aAFile);
		Investor2.minCap = 0;
		Investor2.maxCap = e2eWhitelist.tiers[0].supply * 2;
		ReservedAddress = new User(driver, user8545_ecDFFile);
		ReservedAddress.minCap = e2eWhitelist.tiers[0].supply / 4;
		ReservedAddress.maxCap = e2eWhitelist.tiers[0].supply / 2;
		Investor3 = new User(driver, user8545_dDdCFile);
		Investor3.minCap = e2eWhitelist.tiers[1].whitelist[0].min;
		Investor3.maxCap = e2eWhitelist.tiers[1].whitelist[0].max;

		Investor4 = new User(driver, user8545_9E96File);
		Investor4.minCap = e2eWhitelist.tiers[0].whitelist[1].min;
		Investor4.maxCap = e2eWhitelist.tiers[0].whitelist[1].max;

		await Utils.receiveEth(Owner, 10);
		await Utils.receiveEth(Investor1, 10);
		await Utils.receiveEth(Investor2, 10);
		await Utils.receiveEth(ReservedAddress, 10);
		await Utils.receiveEth(Investor3, 10);
		await Utils.receiveEth(Investor4, 10);

		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		balanceEthOwnerBefore = await Utils.getBalance(Owner);
		logger.info("Owner's balance = :" + balanceEthOwnerBefore / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = " + await Utils.getBalance(Investor1) / 1e18);
		logger.info("Investor2  = :" + Investor2.account);
		logger.info("Investor2 balance = " + await Utils.getBalance(Investor2) / 1e18);
		logger.info("Reserved address  = " + ReservedAddress.account);
		logger.info("ReservedAddress balance = " + await Utils.getBalance(ReservedAddress) / 1e18);
		logger.info("Investor3  = " + Investor3.account);
		logger.info("Investor3 balance = " + await Utils.getBalance(Investor3) / 1e18);

		wallet = await Utils.getWalletInstance(driver);
		await wallet.activate();//return activated Wallet and empty page
		await Owner.setWalletAccount();

		welcomePage = new WizardWelcome(driver, startURL);
		wizardStep1 = new WizardStep1(driver);
		wizardStep2 = new WizardStep2(driver);
		wizardStep3 = new WizardStep3(driver);
		wizardStep4 = new WizardStep4(driver);
		investPage = new InvestPage(driver);
		reservedTokensPage = new ReservedTokensPage(driver);
		mngPage = new ManagePage(driver);
		tierPage = new TierPage(driver, crowdsaleForUItests.tiers[0]);

	});

	test.after(async function () {
		// Utils.killProcess(ganache);
		//await Utils.sendEmail(tempOutputFile);
		let outputPath = Utils.getOutputPath();
		outputPath = outputPath + "/result" + Utils.getDate();
		await fs.ensureDirSync(outputPath);
		await fs.copySync(tempOutputPath, outputPath);
		//await fs.remove(tempOutputPath);
		//await driver.quit();
	});
///////////////////////// UI TESTS /////////////////////////////////////

		test.it('User is able to open wizard welcome page',
			async function () {
				await  welcomePage.open();
				let result = await welcomePage.waitUntilDisplayedButtonNewCrowdsale(180);
				return await assert.equal(result, true, "Test FAILED. Wizard's page is not available ");
			});

		test.it('Welcome page: button NewCrowdsale present ',
			async function () {
				let result = await welcomePage.isDisplayedButtonNewCrowdsale();
				return await assert.equal(result, true, "Test FAILED. Button NewCrowdsale not present ");

			});

		test.it('Welcome page: button ChooseContract present ',
			async function () {
				let result = await welcomePage.isDisplayedButtonChooseContract();
				return await assert.equal(result, true, "Test FAILED. button ChooseContract not present ");

			});

		test.it('Welcome page: user is able to open Step1 by clicking button NewCrowdsale ',
			async function () {
				await welcomePage.clickButtonNewCrowdsale();
				let result = await wizardStep1.isDisplayedButtonContinue();
				return await assert.equal(result, true, "Test FAILED. User is not able to activate Step1 by clicking button NewCrowdsale");

			});

		test.it('Wizard step#1: user is able to open Step2 by clicking button Continue ',
			async function () {
				let count = 10;
				do {
					await driver.sleep(1000);
					if ((await wizardStep1.isDisplayedButtonContinue()) &&
						!(await wizardStep2.isDisplayedFieldName())) {
						await wizardStep1.clickButtonContinue();
					}
					else break;
				}
				while (count-- > 0);
				let result = await wizardStep2.isDisplayedFieldName();
				return await assert.equal(result, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");

			});

		test.it('Wizard step#2: user able to fill out Name field with valid data',
			async function () {
				await wizardStep2.fillName("name");
				let result = await wizardStep2.isDisplayedWarningName();
				return await assert.equal(result, false, "Test FAILED. Wizard step#2: user able to fill Name field with valid data ");

			});

		test.it('Wizard step#2: user able to fill out field Ticker with valid data',
			async function () {
				await wizardStep2.fillTicker("test");
				let result = await wizardStep2.isDisplayedWarningTicker();
				return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not  able to fill out field Ticker with valid data ");

			});

		test.it('Wizard step#2: user able to fill out  Decimals field with valid data',
			async function () {
				await wizardStep2.fillDecimals("18");
				let result = await wizardStep2.isDisplayedWarningDecimals();
				return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not able to fill Decimals  field with valid data ");

			});

		test.it('Wizard step#2: User is able to download CSV file with reserved addresses',
			async function () {

				let result = await reservedTokensPage.uploadReservedCSVFile();
				await reservedTokensPage.clickButtonOk();
				return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
			});

		test.it('Wizard step#2: added only valid data from CSV file',
			async function () {
				let correctNumberReservedTokens = 20;
				let result = await reservedTokensPage.amountAddedReservedTokens();
				return await assert.equal(result, correctNumberReservedTokens, "Test FAILED. Wizard step#2: number of added reserved tokens is correct");
			});

		test.it('Wizard step#2: button ClearAll is displayed ',
			async function () {

				let result = await reservedTokensPage.isLocatedButtonClearAll();
				return await  assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
			});

		test.it('Wizard step#2: alert present after clicking ClearAll',
			async function () {
				await reservedTokensPage.clickButtonClearAll();
				let result = await reservedTokensPage.isDisplayedButtonNoAlert();
				return await assert.equal(result, true, "Test FAILED.Alert does NOT present after select ClearAll or button No does NOT present");
			});

		test.it('Wizard step#2: user is able to bulk delete of reserved tokens ',
			async function () {
				let result = await reservedTokensPage.waitUntilShowUpPopupConfirm(20)
					&& await reservedTokensPage.clickButtonYesAlert()
					&& await reservedTokensPage.amountAddedReservedTokens();
				return await assert.equal(result, 0, "Wizard step#2: user is NOT able bulk delete of reserved tokens");
			});

		test.it('Wizard step#2: user is able to add reserved tokens one by one ',
			async function () {
				await reservedTokensPage.fillReservedTokens(crowdsaleForUItests);
				let result = await reservedTokensPage.amountAddedReservedTokens();
				return await assert.equal(result, crowdsaleForUItests.reservedTokens.length, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
			});

		test.it('Wizard step#2: field Decimals is disabled if reserved tokens are added ',
			async function () {
				let result = await wizardStep2.isDisabledDecimals();
				return await assert.equal(result, true, "Wizard step#2: field Decimals enabled if reserved tokens added ");
			});

		test.it('Wizard step#2: user is able to remove one of reserved tokens ',
			async function () {

				let amountBefore = await reservedTokensPage.amountAddedReservedTokens();
				await reservedTokensPage.removeReservedTokens(1);
				let amountAfter = await reservedTokensPage.amountAddedReservedTokens();
				return await  assert.equal(amountBefore, amountAfter + 1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
			});

		test.it('Wizard step#2: button Continue is displayed ',
			async function () {
				let result = await wizardStep2.isDisplayedButtonContinue();
				return await assert.equal(result, true, "Test FAILED. Wizard step#2: button Continue  not present ");

			});

		test.it('Wizard step#2: user is able to open Step3 by clicking button Continue ',
			async function () {
				await wizardStep2.clickButtonContinue();
				await wizardStep3.waitUntilDisplayedTitle(180);
				let result = await wizardStep3.getPageTitleText();
				result = (result === wizardStep3.title);
				return await assert.equal(result, true, "Test FAILED. User is not able to activate Step2 by clicking button Continue");
			});
		//////////////// STEP 3 /////////////////////

		test.it('Wizard step#3: field Wallet address contains current metamask account address  ',
			async function () {

				let result = await wizardStep3.getValueFromFieldWalletAddress();
				result = (result === Owner.account.toString());
				return await assert.equal(result, true, "Test FAILED. Wallet address does not match the metamask account address ");
			});

		test.it('Tier#1: Whitelist container present if checkbox "Whitelist enabled" is selected',
			async function () {
				let result = await tierPage.setWhitelisting()
					&& await tierPage.isDisplayedWhitelistContainer();
				return await  assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist enabled"');
			});

		test.it('Wizard step#3: field minCap disabled if whitelist enabled ',
			async function () {
				let tierNumber = 1;
				let result = await tierPage.isDisabledMinCap(tierNumber);
				return await assert.equal(result, true, "Test FAILED. Field minCap disabled if whitelist enabled");
			});

		test.it('Wizard step#3: User is able to download CSV file with whitelisted addresses',
			async function () {

				let result = await tierPage.uploadWhitelistCSVFile();
				await wizardStep3.clickButtonOk();
				return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
			});

		test.it('Wizard step#3: Number of added whitelisted addresses is correct, data is valid',
			async function () {
				let shouldBe = 6;
				let inReality = await tierPage.amountAddedWhitelist();
				return await assert.equal(shouldBe, inReality, "Test FAILED. Wizard step#3: Number of added whitelisted addresses is NOT correct");

			});

		test.it('Wizard step#3: User is able to bulk delete all whitelisted addresses ',
			async function () {
				let result = await tierPage.clickButtonClearAll()
					&& await tierPage.waitUntilShowUpPopupConfirm(180)
					&& await tierPage.clickButtonYesAlert();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
			});

		test.it('Wizard step#3: All whitelisted addresses are removed after deletion ',
			async function () {
				let result = await tierPage.amountAddedWhitelist(10);
				return await assert.equal(result, 0, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
			});

		test.it('Wizard step#3: User is able to add several whitelisted addresses one by one ',
			async function () {
				let result = await tierPage.fillWhitelist();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to add several whitelisted addresses");
			});

		test.it('Wizard step#3: User is able to remove one whitelisted address',
			async function () {
				let beforeRemoving = await tierPage.amountAddedWhitelist();
				let numberAddressForRemove = 1;
				await tierPage.removeWhiteList(numberAddressForRemove - 1);
				let afterRemoving = await tierPage.amountAddedWhitelist();
				return await assert.equal(beforeRemoving, afterRemoving + 1, "Test FAILED. Wizard step#3: User is NOT able to remove one whitelisted address");
			});

		test.it('Wizard step#3: User is able to set "Custom Gasprice" checkbox',
			async function () {

				let result = await wizardStep3.clickCheckboxGasPriceCustom();
				return await assert.equal(result, true, 'Test FAILED. User is not able to set "Custom Gasprice" checkbox');

			});

		test.it(' Wizard step#3: User is able to fill out the  CustomGasprice field with valid value',
			async function () {
				let customValue = 100;
				let result = await wizardStep3.fillGasPriceCustom(customValue);
				return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to fill "Custom Gasprice" with valid value');

			});

		test.it('Wizard step#3: User is able to set SafeAndCheapGasprice checkbox ',
			async function () {
				let result = await wizardStep3.clickCheckboxGasPriceSafe();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: 'Safe and cheap' Gas price checkbox does not set by default");

			});

		test.it('Wizard step#3:Tier#1: User is able to fill out field "Rate" with valid data',
			async function () {
				tierPage.number = 0;
				tierPage.tier.rate = 5678;
				let result = await tierPage.fillRate();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to fill out field 'Rate' with valid data");
			});

		test.it('Wizard step#3:Tier#1: User is able to fill out field "Supply" with valid data',
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

		test.it('Wizard step#3:Tier#2: User is able to fill out field "Rate" with valid data',
			async function () {
				tierPage.number = 1;
				tierPage.tier.rate = 5678;
				let result = await tierPage.fillRate();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to fill out field 'Rate' with valid data");
			});

		test.it('Wizard step#3:Tier#2: User is able to fill out field "Supply" with valid data',
			async function () {
				tierPage.tier.supply = 1e18;
				let result = await tierPage.fillSupply();
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
			});
		test.it('Wizard step#3:Tier#2: User is able to fill out field "minCap" with valid data',
			async function () {
				tierPage.tier.minCap = 2;
				let tierNumber = 2;
				let result = await tierPage.fillMinCap(tierNumber,);
				return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
			});


		test.it('Wizard step#3: user is able to proceed to Step4 by clicking button Continue ',
			async function () {
				await wizardStep3.clickButtonContinue();
				let result = await wizardStep4.waitUntilDisplayedModal(60);
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

				let result = await wizardStep4.acceptAlert()
					&& await wizardStep4.waitUntilDisplayedModal(80);
				return await assert.equal(result, true, "Test FAILED. Modal does not present after user has accepted alert");
			});

		test.it('Wizard step#4: button SkipTransaction is  presented if user reject a transaction ',
			async function () {
				let result = await wallet.rejectTransaction(20)
					&& await wallet.rejectTransaction(20)
					&& await wizardStep4.isDisplayedButtonSkipTransaction();
				return await assert.equal(result, true, "Test FAILED. button'Skip transaction' does not present if user reject the transaction");
			});

		test.it('Wizard step#4: user is able to skip transaction ',
			async function () {

				let result = await wizardStep4.clickButtonSkipTransaction()
					&& await wizardStep4.waitUntilShowUpPopupConfirm(80)
					&& await wizardStep4.clickButtonYes();
				return await assert.equal(result, true, "Test FAILED. user is not able to skip transaction");
			});

		test.it('Wizard step#4: alert is presented if user wants to leave the wizard ',
			async function () {

				let result = await  welcomePage.openWithAlertConfirmation();
				return await assert.equal(result, false, "Test FAILED. Alert does not present if user wants to leave the site");
			});

		test.it('Wizard step#4: User is able to stop deployment ',
			async function () {

				let result = await wizardStep4.waitUntilShowUpButtonCancelDeployment(80)
					&& await wizardStep4.clickButtonCancelDeployment()
					&& await wizardStep4.waitUntilShowUpPopupConfirm(80)
					&& await wizardStep4.clickButtonYes();

				return await assert.equal(result, true, "Test FAILED. Button 'Cancel' does not present");
			});

});