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
const ContributionPage = require('../pages/ContributionPage.js').InvestPage;
const InvestPage = require('../pages/ContributionPage.js').InvestPage;
const ManagePage = require('../pages/ManagePage.js').ManagePage;
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Utils = require('../utils/Utils.js').Utils;
const User = require("../entity/User.js").User;

test.describe(`e2e test for TokenWizard2.0/MintedCappedCrowdsale. v ${testVersion}`, async function () {
    this.timeout(2400000);//40 min
    this.slow(1800000);

    const user8545_56B2File = './users/user8545_56B2.json';//Owner
    const user77_F16AFile = './users/user77_F16A.json';//Investor1
    let driver;
    let Owner;
    let Investor1;

    let wallet;
    let welcomePage;
    let wizardStep1;
    let wizardStep2;
    let wizardStep3;
    let wizardStep4;
    let tierPage;
    let reservedTokensPage;
    let investPage;
    let contributionPage;
    let crowdsalePage;

    let startURL;
    let crowdsaleForUItests;
    let mngPage;
    let balanceEthOwnerBefore;
    let crowdsaleMintedSimple;

    const nameText = 'Name'
    const tickerText = 'Tick'
    const decimalsText = '13'

/////////////////////////////////////////////////////////////////////////

    test.before(async function () {

        await Utils.copyEnvFromWizard();

        const scenarioForUItests = './scenarios/scenarioUItests.json';
        crowdsaleForUItests = await Utils.getMintedCrowdsaleInstance(scenarioForUItests);
        crowdsaleMintedSimple = await Utils.getMintedCrowdsaleInstance('./scenarios/scenarioMintedSimple.json');

        startURL = await Utils.getStartURL();
        driver = await Utils.startBrowserWithWallet();

        Owner = new User(driver, user8545_56B2File);
        await Utils.receiveEth(Owner, 20);
        Investor1 = new User(driver, user77_F16AFile);

        logger.info("Roles:");
        logger.info("Owner = " + Owner.account);
        balanceEthOwnerBefore = await Utils.getBalance(Owner);
        logger.info("Owner's balance = :" + balanceEthOwnerBefore / 1e18);

        wallet = await Utils.getWalletInstance(driver);
        //await wallet.activate();//return activated Wallet and empty page
        // await Owner.setWalletAccount();

        welcomePage = new WizardWelcome(driver, startURL);
        wizardStep1 = new WizardStep1(driver);
        wizardStep2 = new WizardStep2(driver);
        wizardStep3 = new WizardStep3(driver);
        wizardStep4 = new WizardStep4(driver);
        investPage = new InvestPage(driver);
        reservedTokensPage = new ReservedTokensPage(driver);
        mngPage = new ManagePage(driver);
        tierPage = new TierPage(driver, crowdsaleForUItests.tiers[0]);
        contributionPage = new ContributionPage(driver);
        crowdsalePage = new CrowdsalePage(driver);
    });

    test.after(async function () {
        // Utils.killProcess(ganache);
        //await Utils.sendEmail(tempOutputFile);
        let outputPath = Utils.getOutputPath();
        outputPath = outputPath + "/result" + Utils.getDate();
        await fs.ensureDirSync(outputPath);
        await fs.copySync(tempOutputPath, outputPath);
        //await fs.remove(tempOutputPath);
        // await driver.quit();
    });
///////////////////////// UI TESTS /////////////////////////////////////

    test.it('Welcome page: User is able to open wizard welcome page',
        async function () {
            await welcomePage.open();
            let result = await welcomePage.waitUntilDisplayedButtonNewCrowdsale(180);
            return await assert.equal(result, true, "Test FAILED. Wizard's page is not available ");
        });

    test.it('Welcome page: Warning present if user logged out from wallet',
        async function () {
            let result = await welcomePage.waitUntilShowUpWarning(180)
            return await assert.equal(result, true, "Test FAILED. No warning present if user logged out from wallet ");
        });

    test.it('Welcome page: user can confirm warning',
        async function () {
            let result = await welcomePage.clickButtonOK()
            return await assert.equal(result, true, "Test FAILED. Button Ok doesn\'t present");
        });

    test.it('Welcome page: No warning present if user logged into wallet',
        async function () {
            await wallet.activate();//return activated Wallet and empty page
            await Owner.setWalletAccount();
            let result = await welcomePage.waitUntilShowUpWarning(10)
            return await assert.equal(result, false, "Test FAILED. No warning present if user logged out from wallet ");
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
            let result = await welcomePage.clickButtonNewCrowdsale()
                && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap();
            return await assert.equal(result, true, "Test FAILED. User is not able to activate Step1 by clicking button NewCrowdsale");
        });

    test.it('Step#1: Go back - page keep state of checkbox \'Whitelist with mincap\' ',
        async function () {
            const result = await wizardStep1.clickCheckboxWhitelistWithCap()
                && await wizardStep1.goBack()
                && await welcomePage.isDisplayedButtonChooseContract()
                && await wizardStep1.goForward()
                && await wizardStep1.waitUntilLoaderGone()
                && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                && await wizardStep1.isSelectedCheckboxWhitelistWithCap()
            return await assert.equal(result, true, "Test FAILED. Checkbox changed");
        });

    test.it('Step#1: Refresh - page keep state of checkbox \'Whitelist with mincap\' ',
        async function () {
            const result = await wizardStep1.clickCheckboxWhitelistWithCap()
                && await wizardStep1.refresh()
                && await wizardStep1.isSelectedCheckboxWhitelistWithCap()
            return await assert.equal(result, true, "Test FAILED. Checkbox changed");
        });

    test.it('Step#1: Change network - page keep state of checkbox \'Whitelist with mincap\' ',
        async function () {
            const result = await wizardStep1.clickCheckboxWhitelistWithCap()
                && await Investor1.setWalletAccount()
                && await wizardStep1.waitUntilLoaderGone()
                && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                && await wizardStep1.isSelectedCheckboxWhitelistWithCap()
                && await Owner.setWalletAccount()
                && await wizardStep1.waitUntilLoaderGone()
            return await assert.equal(result, true, "Test FAILED. Checkbox changed");
        });

    test.it('Wizard step#1: user is able to open Step2 by clicking button Continue ',
        async function () {
            let count = 10;
            do {
                await driver.sleep(1000);
                if ( (await wizardStep1.isDisplayedButtonContinue()) &&
                    !(await wizardStep2.isDisplayedFieldName()) ) {
                    await wizardStep1.clickButtonContinue();
                }
                else break;
            }
            while ( count-- > 0 );
            let result = await wizardStep2.isDisplayedFieldName();
            return await assert.equal(result, true, "Test FAILED. User is not able to open Step2 by clicking button Continue");
        });

    test.it('Step#2: field \'Decimals\' has placeholder 18',
        async function () {
            return await assert.equal(await wizardStep2.getValueFieldDecimals(), '18', "Test FAILED. Step#2:incorrect placeholder for field 'Decimals'");
        });

    test.it('Wizard step#2: user able to fill out field \'Name\' with valid data',
        async function () {
            let result = await wizardStep2.fillName(nameText)
                && await wizardStep2.isDisplayedWarningName();
            return await assert.equal(result, false, "Test FAILED. Wizard step#2: field name changed");
        });

    test.it('Step#2: Go back - page keep state of field \'Name\' ',
        async function () {
            const result = await wizardStep2.goBack()
                && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                && await wizardStep1.goForward()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilDisplayedFieldName()
                && await wizardStep2.waitUntilHasValueFieldName();
            await assert.equal(result, true, "Test FAILED. Wizard step#2: field name changed");
            return await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Field name changed");
        });

    test.it('Step#2: Refresh - page keep state of  field \'Name\'',
        async function () {
            const result = await wizardStep2.refresh()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilDisplayedFieldName()
                && await wizardStep2.waitUntilHasValueFieldName();
            await assert.equal(result, true, "Test FAILED. Wizard step#2: field name changed");
            return await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Wizard step#2: field name changed");
        });

    test.it('Step#2: Change network - page keep state of  field \'Name\'',
        async function () {
            const result = await Investor1.setWalletAccount()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilHasValueFieldName()
                && (await wizardStep2.getValueFieldName() === nameText)
                && await Owner.setWalletAccount()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilHasValueFieldName()
                && (await wizardStep2.getValueFieldName() === nameText)
            return await assert.equal(result, true, "Test FAILED. Wizard step#2: field name changed");
        });

    test.it('Wizard step#2: user able to fill out field Ticker with valid data',
        async function () {
            await wizardStep2.fillTicker(tickerText);
            let result = await wizardStep2.isDisplayedWarningTicker();
            return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not  able to fill out field Ticker with valid data ");
        });

    test.it('Wizard step#2: user able to fill out  Decimals field with valid data',
        async function () {
            await wizardStep2.fillDecimals(decimalsText);
            let result = await wizardStep2.isDisplayedWarningDecimals();
            return await assert.equal(result, false, "Test FAILED. Wizard step#2: user is not able to fill Decimals  field with valid data ");
        });


    test.it('Wizard step#2: User is able to download CSV file with reserved tokens',
        async function () {
            let fileName = './public/reservedAddresses21.csv';
            let result = await reservedTokensPage.uploadReservedCSVFile(fileName);
            return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
        });

    test.it('Wizard step#2: Alert present if number of reserved addresses greater 20 ',
        async function () {
            let result = await reservedTokensPage.waitUntilShowUpPopupConfirm(100)
                && await reservedTokensPage.clickButtonOk();
            return await assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
        });
    test.it('Wizard step#2: added only 20 reserved addresses from CSV file',
        async function () {
            let correctNumberReservedTokens = 20;
            let result = await reservedTokensPage.amountAddedReservedTokens();
            return await assert.equal(result, correctNumberReservedTokens, "Test FAILED. Wizard step#2: number of added reserved tokens is correct");
        });

    test.it('Wizard step#2: Check validator for reserved addresses',
        async function () {
            let fileName = './public/reservedAddressesTestValidation.csv';
            let result = await reservedTokensPage.uploadReservedCSVFile(fileName);
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
            return await assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
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
            return await assert.equal(amountBefore, amountAfter + 1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
        });

    test.it('Step#2: Go back - page keep state of each field',
        async function () {
            const result = await wizardStep2.goBack()
                && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                && await wizardStep1.goForward()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilHasValueFieldName();
            await assert.equal(result, true, "Test FAILED. Wizard step#2: page isn\'t loaded");
            await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Field name changed");
            await assert.equal(await wizardStep2.getValueFieldDecimals(), decimalsText, "Test FAILED.Field decimals changed");
            await assert.equal(await wizardStep2.getValueFieldTicker(), tickerText, "Test FAILED.Field ticker changed");
            await assert.equal(await reservedTokensPage.amountAddedReservedTokens(), crowdsaleForUItests.reservedTokens.length-1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
        });

    test.it('Step#2: Refresh - page keep state of each field',
        async function () {
            const result = await wizardStep2.refresh()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilDisplayedFieldName()
                && await wizardStep2.waitUntilHasValueFieldName();
            await assert.equal(result, true, "Test FAILED. Wizard step#2: page isn\'t loaded");
            await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Field name changed");
            await assert.equal(await wizardStep2.getValueFieldDecimals(), decimalsText, "Test FAILED.Field decimals changed");
            await assert.equal(await wizardStep2.getValueFieldTicker(), tickerText, "Test FAILED.Field ticker changed");
            await assert.equal(await reservedTokensPage.amountAddedReservedTokens(), crowdsaleForUItests.reservedTokens.length-1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");
        });

    test.it('Step#2: Change network - page keep state of each field',
        async function () {
            let result = await Investor1.setWalletAccount()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilHasValueFieldName()
            await assert.equal(result, true, "Test FAILED. Wizard step#2: page isn\'t loaded");
            await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Field name changed");
            await assert.equal(await wizardStep2.getValueFieldDecimals(), decimalsText, "Test FAILED.Field decimals changed");
            await assert.equal(await wizardStep2.getValueFieldTicker(), tickerText, "Test FAILED.Field ticker changed");
            await assert.equal(await reservedTokensPage.amountAddedReservedTokens(), crowdsaleForUItests.reservedTokens.length-1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");

            result = await Owner.setWalletAccount()
                && await wizardStep2.waitUntilLoaderGone()
                && await wizardStep2.waitUntilHasValueFieldName()
            await assert.equal(result, true, "Test FAILED. Wizard step#2: page isn\'t loaded");
            await assert.equal(await wizardStep2.getValueFieldName(), nameText, "Test FAILED.Field name changed");
            await assert.equal(await wizardStep2.getValueFieldDecimals(), decimalsText, "Test FAILED.Field decimals changed");
            await assert.equal(await wizardStep2.getValueFieldTicker(), tickerText, "Test FAILED.Field ticker changed");
            await assert.equal(await reservedTokensPage.amountAddedReservedTokens(), crowdsaleForUItests.reservedTokens.length-1, "Test FAILED. Wizard step#2: user is NOT able to add reserved tokens");

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
            let result = await wizardStep3.getTitleText();
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
            return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to set checkbox  "Whitelist enabled"');
        });

    test.it('Wizard step#3: field minCap disabled if whitelist enabled ',
        async function () {
            let tierNumber = 1;
            let result = await tierPage.isDisabledFieldMinCap(tierNumber);
            return await assert.equal(result, true, "Test FAILED. Field minCap disabled if whitelist enabled");
        });

    test.it('Wizard step#3:Tier#1: User is able to fill out field "Supply" with valid data',
        async function () {
            tierPage.tier.supply = 69;
            let result = await tierPage.fillSupply();
            return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
        });

    test.it('Wizard step#3: User is able to download CSV file with whitelisted addresses',
        async function () {
            let fileName = "./public/whitelistAddressesTestValidation.csv";
            let result = await tierPage.uploadWhitelistCSVFile(fileName)
                && await tierPage.waitUntilShowUpPopupConfirm(180)
                && await wizardStep3.clickButtonOk();
            return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
        });

    test.it('Wizard step#3: field Supply disabled if whitelist added ',
        async function () {
            let result = await tierPage.isDisabledFieldSupply();
            return await assert.equal(result, true, "Test FAILED. Field minCap disabled if whitelist enabled");
        });

    test.it('Wizard step#3: Number of added whitelisted addresses is correct, data is valid',
        async function () {
            let shouldBe = 5;
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

    test.it('Wizard step#3: field Supply enabled if whitelist was deleted ',
        async function () {
            let result = await tierPage.isDisabledFieldSupply();
            return await assert.equal(result, false, "Test FAILED. Field minCap disabled if whitelist enabled");
        });

    test.it('Wizard step#3:Tier#1: User is able to fill out field "Supply" with valid data',
        async function () {
            tierPage.tier.supply = 1e18;
            let result = await tierPage.fillSupply();
            return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
        });

    test.it('Wizard step#3: User is able to download CSV file with more than 50 whitelisted addresses',
        async function () {
            let fileName = "./public/whitelistedAddresses61.csv";
            let result = await tierPage.uploadWhitelistCSVFile(fileName);
            return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
        });

    test.it('Wizard step#3: Alert present if number of whitelisted addresses greater 50 ',
        async function () {
            let result = await tierPage.waitUntilShowUpPopupConfirm(100)
                && await wizardStep3.clickButtonOk();
            return await assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
        });

    test.it('Wizard step#3: Number of added whitelisted addresses is correct, data is valid',
        async function () {
            let shouldBe = 50;
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
    test.it('Wizard step#4: modal is displayed ',
        async function () {

            let result = await wizardStep4.waitUntilDisplayedModal()
                && await wizardStep4.isDisplayedModal();
            return await assert.equal(result, true, "Test FAILED. Modal is not displayed");
        });

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

            let result = await welcomePage.openWithAlertConfirmation();
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

    test.it('User is able to create crowdsale(scenarioMintedSimple.json),minCap,1 tier',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            let result = await owner.createMintedCappedCrowdsale(crowdsaleMintedSimple);
            return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
        });
    test.it('Contribution page: should be alert if invalid proxyID in address bar',
        async function () {
            let wrongUrl = crowdsaleMintedSimple.url.substring(0, 50) + crowdsaleMintedSimple.url.substring(52, crowdsaleMintedSimple.length)
            let result = await contributionPage.open(wrongUrl)
                && await contributionPage.waitUntilShowUpButtonOk()
                && await contributionPage.clickButtonOK()
            return await assert.equal(result, true, 'Test FAILED. Contribution page: no alert if invalid proxyID in address bar');
        });
    test.it('Crowdsale page: should be alert if invalid proxyID in address bar',
        async function () {
            let owner = Owner;
            let wrongCrowdsale = crowdsaleMintedSimple;
            wrongCrowdsale.proxyAddress = crowdsaleMintedSimple.proxyAddress.substring(0, crowdsaleMintedSimple.proxyAddress.length - 5)
            let result = await owner.openCrowdsalePage(wrongCrowdsale)
                && await contributionPage.waitUntilShowUpButtonOk()
                && await contributionPage.clickButtonOK()
            return await assert.equal(result, true, 'Test FAILED. Crowdsale page: no alert if invalid proxyID in address bar');
        });
});