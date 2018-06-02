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
const MetaMask = require('../pages/MetaMask.js').MetaMask;
const User = require("../entity/User.js").User;
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const smallAmount = 0.1;
const endTimeForTestEarlier = "01:23";
const endDateForTestEarlier = "01/07/2049";
const endTimeForTestLater = "420000";
const endDateForTestLater = "420000";

test.describe('POA token-wizard. Test MintedCappedCrowdsale', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	const user8545_56B2File = './users/user8545_56B2.json';//Owner
	const user8545_F16AFile = './users/user8545_F16A.json';//Investor1 - whitelisted for Tier#1 before deployment
	const user8545_f5aAFile = './users/user8545_f5aA.json';//Investor2 - added from manage page before start
	const user8545_ecDFFile = './users/user8545_ecDF.json';//Reserved address, also wh investor that added after start time
	const user8545_dDdCFile = './users/user8545_dDdC.json';//Investor3 - whitelisted for Tier#2 before deployment

	let driver;
	let Owner;
	let Investor1;
	let Investor2;
	let Investor3;
	let ReservedAddress;

	let metaMask;
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
	let e2eMultitier;
	let mngPage;
	let balance;
	let endTime;
	let endDate;

	let balanceEthOwnerBefore;
	let balanceEthOwnerAfter;
/////////////////////////////////////////////////////////////////////////

	test.before(async function () {
		logger.info("Version 2.6.1 - Wizard2.0 ");
		await Utils.copyEnvFromWizard();
		const scenarioE2eMintedMinCap = './scenarios/scenarioE2eMintedMinCap.json';
		const scenarioE2eMintedWhitelist = './scenarios/scenarioE2eMintedWhitelist.json';
		const scenarioForUItests = './scenarios/scenarioUItests.json';

		crowdsaleForUItests = await Utils.getMintedCrowdsaleInstance(scenarioForUItests);
		e2eMinCap = await  Utils.getMintedCrowdsaleInstance(scenarioE2eMintedMinCap);
		e2eWhitelist = await  Utils.getMintedCrowdsaleInstance(scenarioE2eMintedWhitelist);

		startURL = await Utils.getStartURL();
		driver = await Utils.startBrowserWithMetamask();

		Owner = new User(driver, user8545_56B2File);
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

		await Utils.receiveEth(Owner, 10);
		await Utils.receiveEth(Investor1, 10);
		await Utils.receiveEth(Investor2, 10);
		await Utils.receiveEth(ReservedAddress, 10);
		await Utils.receiveEth(Investor3, 10);

		logger.info("Roles:");
		logger.info("Owner = " + Owner.account);
		balanceEthOwnerBefore = await Utils.getBalance(Owner);
		logger.info("Owner's balance = :" + balanceEthOwnerBefore / 1e18);
		logger.info("Investor1  = " + Investor1.account);
		logger.info("Investor1 balance = :" + await Utils.getBalance(Investor1) / 1e18);
		logger.info("Investor2  = :" + Investor2.account);
		logger.info("Investor2 balance = :" + await Utils.getBalance(Investor2) / 1e18);
		logger.info("Reserved address  = :" + ReservedAddress.account);
		logger.info("ReservedAddress balance = :" + await Utils.getBalance(ReservedAddress) / 1e18);
		logger.info("Investor3  = " + Investor3.account);
		logger.info("Investor3 balance = :" + await Utils.getBalance(Investor3) / 1e18);

		metaMask = new MetaMask(driver);
		await metaMask.activate();//return activated Metamask and empty page
		await Owner.setMetaMaskAccount();

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
			console.log("result" + result);
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
			let result = await wizardStep3.isDisabledMinCap();
			return await assert.equal(result, true, "Test FAILED. Field minCap disabled if whitelist enabled");
		});

	test.it('Wizard step#3: User is able to download CSV file with whitelisted addresses',
		async function () {

			let result = await tierPage.uploadWhitelistCSVFile();
			await wizardStep3.clickButtonOk();
			return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
		});

	test.it('Wizard step#3: Number of added whitelisted addresses is correct,data is valid',
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
			let result = await metaMask.rejectTransaction()
				&& await metaMask.rejectTransaction()
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

//////////////////////// Test SUITE #1 /////////////////////////////
	test.it('Owner  can create crowdsale(e2eWhitelist.json),2 tiers, modifiable, whitelist,2 reserved addresses',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createMintedCappedCrowdsale(e2eWhitelist);
			logger.info("e2eWhitelist.executionID  " + e2eWhitelist.executionID);
			logger.info("e2eWhitelist.networkID  " + e2eWhitelist.networkID);
			logger.info("e2eWhitelist.sort  " + e2eWhitelist.sort);
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			Owner.tokenBalance = 0;
			Investor1.tokenBalance = 0;
			Investor2.tokenBalance = 0;
			Investor3.tokenBalance = 0;
			ReservedAddress.tokenBalance = 0;
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it('Owner is able to open the manage page',
		async function () {
			let owner = Owner;
			return await assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
		});

	test.it('Manage page: correct number of reserved addresses is displayed ',
		async function () {
			let addresses = await mngPage.getReservedTokensAddresses();
			let result = true;
			for (let i = 0; i < addresses.length; i++) {
				result = result && (addresses[i] === e2eWhitelist.reservedTokens[i].address);
			}
			return await assert.equal(result, true, 'Test FAILED.Manage page: Manage page: correct number of reserved addresses is displayed');
		});

	test.it.skip('Manage page: correct number of whitelisted addresses is displayed for tier#1',
		async function () {
			let tierNumber = 1;
			let addresses = await mngPage.getWhitelistAddresses(tierNumber);
			let result = true;
			for (let i = 0; i < addresses.length; i++) {
				result = result && (addresses[i] === e2eWhitelist.tiers[tierNumber - 1].whitelist[i].address);
				console.log("WHHHhH#" + i + "   " + e2eWhitelist.tiers[tierNumber - 1].whitelist[i].address)
			}
			return await assert.equal(result, true, 'Test FAILED.Manage page: incorrect number of whitelisted addresses is displayed for tier #1');
		});

	test.it.skip('Manage page: correct number of whitelisted addresses is displayed for tier#2',
		async function () {
			let owner = Owner;

			return await assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Test FAILED.Manage page: incorrect number of whitelisted addresses is displayed for tier #2');
		});

	test.it("Manage page: button 'Save' is  disabled by default",
		async function () {
			return await assert.equal(await mngPage.isDisabledButtonSave(), true, "Test FAILED. Button 'Save' is enabled by default");
		});

	test.it("Manage page: button 'Save' is not clickable when disabled",
		async function () {
			await mngPage.clickButtonSave();
			return await assert.equal(await mngPage.waitUntilShowUpPopupConfirm(20), false, "Test FAILED. Button 'Save' is clickable by default");
		});

	test.it('Manage page: owner is able to add whitelisted address before start of crowdsale',
		async function () {
			let owner = Owner;
			let investor = Investor2;
			let tierNumber = 1;
			let result = await owner.addWhitelistTier(tierNumber, investor.account, investor.minCap, investor.maxCap);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
		});

	test.it.skip('Manage page: correct number of whitelisted addresses is displayed for tier#1',
		async function () {
			let owner = Owner;

			return await assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Test FAILED.Manage page: incorrect number of whitelisted addresses is displayed for tier #1');
		});

	test.it.skip('Manage page: owner is able to modify the end time before start of crowdsale',
		async function () {
			let owner = Owner;
			assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
			let tierNumber = 1;
			let format = await Utils.getDateFormat(driver);
			endTime = Utils.getTimeWithAdjust(parseInt(endTimeForTestLater), format);
			endDate = Utils.getDateWithAdjust(parseInt(endDateForTestLater), format);
			let result = await owner.changeEndTime(tierNumber, endDate, endTime);
			return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#1 after start ');

		});
	test.it.skip('Manage page:  end time of tier#1  properly changed after modifying ',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 1;
			let newTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compareDates(newTime, endDate, endTime);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});
	test.it.skip('Manage page:  start time of tier#2 changed  after end time of tier#1 was changed',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 2;
			let newTime = await  owner.getStartTime(tierNumber);
			let result = await Utils.compareDates(newTime, endDate, endTime);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});

	test.it.skip('Manage page:  end time of tier#2 properly changed  after modifying ',
		async function () {
			let owner = Owner;
			await owner.openManagePage(e2eWhitelist);
			let tierNumber = 2;
			let newTime = await  owner.getEndTime(tierNumber);
			let result = await Utils.compareDates(newTime, endDate, endTime);
			return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
		});

	test.it('Whitelisted investor not able to buy before start of crowdsale ',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Whitelisted investor can buy before the crowdsale started");
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier starts as scheduled',
		async function () {
			let investor = Owner;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it('Manage page: owner is able to add whitelisted address if crowdsale has begun',
		async function () {
			let owner = Owner;
			let investor = ReservedAddress;
			assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
			let tierNumber = 1;
			let result = await owner.addWhitelistTier(tierNumber, investor.account, investor.minCap, investor.maxCap);
			return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address after start of crowdsale ');
		});

	test.it('Manage page: owner is not able to modify the end time after start of crowdsale',
		async function () {
			let owner = Owner;
			assert.equal(await owner.openManagePage(e2eWhitelist), true, 'Owner can not open manage page');
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, endDateForTestEarlier, endTimeForTestEarlier);
			return await assert.equal(result, false, 'Test FAILED.Owner can  modify the end time of tier#1 after start ');

		});

	test.it('Whitelisted investor is not able to buy less than min in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
		});

	test.it('Whitelisted investor can buy amount equal mincap',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eWhitelist.tiers[0].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it('Invest page: Investors balance is properly changed  after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let shouldBe = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (shouldBe.toString() === e2eWhitelist.tiers[0].whitelist[0].min.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Whitelisted investor is able to buy less than mincap after first transaction',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.1;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can NOT buy less than min after first transaction");

		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].min * 0.1;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eWhitelist.tiers[0].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it('Whitelisted investor is able to buy not more than maxCap',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			investor.tokenBalance += contribution;
			await investor.contribute(contribution);
			let shouldBe = e2eWhitelist.tiers[0].whitelist[0].max;
			let balance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = e2eWhitelist.tiers[0].whitelist[0].max -
				e2eWhitelist.tiers[0].whitelist[0].min * 0.1 -
				e2eWhitelist.tiers[0].whitelist[0].min;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eWhitelist.tiers[0].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it.skip('Whitelisted investor (which was added from Manage page) is able to buy maxCap',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it.skip('Whitelisted investor is not able to buy more than remains even if individual maxCap is not reached',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let shouldBe = e2eWhitelist.tiers[0].supply - Investor1.maxCap;
			let balance = await investor.getBalanceFromInvestPage(e2eWhitelist);
			console.log("shouldBe " + shouldBe);
			console.log("balance " + balance);
			let result = (balance.toString() === shouldBe.toString());
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than total supply");
		});

	test.it.skip('Whitelisted investor is not able to buy if all tokens were sold',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			return await assert.equal(await investor.contribute(contribution), false, 'Whitelisted investor is able to buy if all tokens were sold');
		});

	test.it('Owner is not able to finalize if tier#1 is done',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, false, "Test FAILED.'Owner can finalize ");
		});

	test.it.skip('Tier#1 has finished as scheduled',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it.skip('Tier #2 started immideatelly after tier#1 is finished ',
		async function () {
			//Status should not contain CROWDSALE HAS ENDED
			//Should contain TIER 2??

			let investor = Investor1;
			await investor.openInvestPage(e2eWhitelist);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Tier #2 started immideatelly after tier#1 is finished");
		});

	test.it.skip('Investor which whitelisted in tier#1 is not able to buy in tier#2',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[1].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Whitelisting is inherited");
		});
	test.it.skip('Investor which was added in whitelist from manage page in tier#1 is not able to buy in tier#2',
		async function () {
			let investor = Investor2;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[1].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Whitelisting is inherited");
		});

	test.it.skip('Whitelisted investor  is able to buy maxCap in first transaction',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor3;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = investor.maxCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED.Investor can  buy more than assigned max");
		});

	test.it.skip("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = investor.maxCap;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eWhitelist.tiers[1].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it.skip('Not owner is not able to finalize',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await investor.finalize(e2eWhitelist);
			return await assert.equal(result, false, "Test FAILED.'Not Owner can finalize ");
		});

	test.it.skip('Owner is able to finalize (if all tokens are sold but crowdsale time is not expired)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eWhitelist);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it.skip('Whitelisted investor is not able to buy if crowdsale finalized',
		async function () {
			let investor = Investor3;
			assert.equal(await investor.openInvestPage(e2eWhitelist), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eWhitelist.tiers[0].supply;
			return await assert.equal(await investor.contribute(contribution), false, 'Whitelisted investor is able to buy if crowdsale finalized');
		});

	test.it.skip('Reserved address#1 has received correct percent of tokens after finalization',
		async function () {
			let balance = await ReservedAddress.getTokenBalance(e2eWhitelist) / 1e18;
			const totalSupply = e2eWhitelist.tiers[0].supply + e2eWhitelist.tiers[1].supply;
			let shouldBe = e2eWhitelist.reservedTokens[0].value * totalSupply / 100
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe);
		});

	test.it.skip('Reserved address#2 has received correct quantity of tokens after finalization',
		async function () {
			let balance = await Owner.getTokenBalance(e2eWhitelist) / 1e18;
			let shouldBe = e2eWhitelist.reservedTokens[1].value;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe);
		});

	test.it.skip('Investor#1 has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor1;
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let shouldBe = investor.maxCap;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

	test.it.skip('Investor#2 has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor2;
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let shouldBe = e2eWhitelist.tiers[0].supply - Investor1.maxCap;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

	test.it.skip('Investor#3 has received correct quantity of tokens after finalization',
		async function () {
			let investor = Investor3;
			let balance = await investor.getTokenBalance(e2eWhitelist) / 1e18;
			let shouldBe = e2eWhitelist.tiers[1].supply;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			logger.info("Difference = " + (balance - shouldBe));
			throw("stop!!!");
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
		});

//////////////////////// Test SUITE #2 /////////////////////////////
	test.it('Owner  can create crowdsale(scenarioE2eMintedMinCap.json),minCap,1 tier, not modifiable, no whitelist,2 reserved addresses',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.createMintedCappedCrowdsale(e2eMinCap);
			Owner.tokenBalance = 0;
			Investor1.tokenBalance = 0;
			Investor2.tokenBalance = 0;
			Investor3.tokenBalance = 0;
			ReservedAddress.tokenBalance = 0;
			return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Investor not able to buy before start of crowdsale ',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			assert.equal(await investor.openInvestPage(e2eMinCap), true, 'Investor can not open Invest page');
			assert.equal(await investPage.waitUntilLoaderGone(), true, 'Loader displayed too long time');
			let contribution = e2eMinCap.minCap * 1.1;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy before the crowdsale started");
		});
	test.it('Disabled to modify the end time if crowdsale is not modifiable',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			await owner.openManagePage(e2eMinCap);
			let adjust = 80000000;
			let newTime = Utils.getTimeWithAdjust(adjust, "utc");
			let newDate = Utils.getDateWithAdjust(adjust, "utc");
			let tierNumber = 1;
			let result = await owner.changeEndTime(tierNumber, newDate, newTime);
			return await assert.equal(result, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');
		});

	test.it('Invest page: Countdown timer is displayed',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eMinCap);
			await investPage.waitUntilLoaderGone();
			let result = await investPage.getTimerStatus();
			return await assert.notEqual(result, false, 'Test FAILED. Countdown timer are not displayed ');
		});

	test.it('Tier starts as scheduled',
		async function () {
			let investor = Owner;
			await investor.openInvestPage(e2eMinCap);
			await investPage.waitUntilLoaderGone();
			let counter = 120;
			do {
				logger.info("wait " + Date.now());
				await driver.sleep(1000);
			}
			while (counter-- > 0 && !await investPage.isCrowdsaleStarted());
			return await assert.equal(counter > 0, true, 'Test FAILED. Tier has not start in time ');
		});

	test.it('Investor is not able to buy less than mincap in first transaction',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			await investor.openInvestPage(e2eMinCap);

			let contribution = e2eMinCap.minCap * 0.5;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy less than minCap in first transaction");
		});

	test.it('Investor is able to buy amount equal mincap',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			let contribution = e2eMinCap.minCap;
			investor.tokenBalance += contribution
			let result = await investor.openInvestPage(e2eMinCap)
				&& await investor.contribute(contribution);
			return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = e2eMinCap.minCap;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it('Invest page: Investors balance is properly changed  after purchase ',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
			let result = (newBalance.toString() === investor.tokenBalance.toString());
			return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
		});

	test.it('Investor is able to buy less than mincap after first transaction',
		async function () {
			balanceEthOwnerBefore = await Utils.getBalance(Owner);
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let contribution = smallAmount + 10;
			investor.tokenBalance += contribution;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
		});

	test.it("Owner's Eth balance properly changed ",
		async function () {
			balanceEthOwnerAfter = await Utils.getBalance(Owner);
			let contribution = smallAmount + 10;
			let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].rate);
			return await assert.equal(result, true, "Owner's balance incorrect");
		});

	test.it('Owner is not able to finalize if all tokens were not sold and crowdsale is not finished ',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
		});

	test.it('Crowdsale is finished as scheduled',
		async function () {
			let investor = Investor1;
			await investor.openInvestPage(e2eMinCap);
			let counter = 40;
			do {
				driver.sleep(5000);
			}
			while ((!await investPage.isCrowdsaleTimeOver()) && (counter-- > 0));
			let result = (counter > 0);
			return await assert.equal(result, true, "Test FAILED. Crowdsale has not finished in time");
		});

	test.it('Disabled to buy after crowdsale time expired',
		async function () {
			let investor = Investor1;
			let contribution = e2eMinCap.tiers[0].supply;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
		});

	test.it('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
		async function () {
			let owner = Owner;
			assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
			let result = await owner.finalize(e2eMinCap);
			return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
		});

	test.it('Investor is not able to buy if crowdsale is finalized',
		async function () {
			let investor = Investor1;
			assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
			await investor.openInvestPage(e2eMinCap);
			let contribution = e2eMinCap.minCap;
			let result = await investor.contribute(contribution);
			return await assert.equal(result, false, "Test FAILED. Investor can buy if crowdsale is finalized");
		});

	test.it('Reserved address#1 has received correct percent of tokens after finalization',
		async function () {
			let balance = await ReservedAddress.getTokenBalance(e2eMinCap) / 1e18;
			let shouldBe = e2eMinCap.reservedTokens[0].value * Investor1.tokenBalance / 100;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe);
		});

	test.it('Reserved address#2 has received correct quantity of tokens after finalization',
		async function () {
			let balance = await Owner.getTokenBalance(e2eMinCap) / 1e18;
			let shouldBe = e2eMinCap.reservedTokens[1].value;
			logger.info("Investor should receive  = " + shouldBe);
			logger.info("Investor has received balance = " + balance);
			return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe);
		});
	test.it('Investor#1 has received correct quantity of tokens after finalization', async function () {

		let investor = Investor1;
		let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
		let shouldBe = investor.tokenBalance;
		logger.info("Investor should receive  = " + shouldBe);
		logger.info("Investor has received balance = " + balance);
		logger.info("Difference = " + (balance - shouldBe));
		return await assert.equal(balance, shouldBe, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
	});

});
