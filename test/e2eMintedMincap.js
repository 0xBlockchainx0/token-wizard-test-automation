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
const adjEndTimeTier2 = 540000;
const adjEndTimeTier3 = 300000;
const TIME_FORMAT = require('../utils/constants.js').TIME_FORMAT;

test.describe(`e2e test for TokenWizard2.0/MintedCappedCrowdsale. v ${testVersion} `, async function () {
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
    let e2eMinCap;
    let mngPage;
    let endTime;
    let endDate;

    let balanceEthOwnerBefore;
    let balanceEthOwnerAfter;
/////////////////////////////////////////////////////////////////////////

    test.before(async function () {

        await Utils.copyEnvFromWizard();
        const scenarioE2eMintedMinCap = './scenarios/scenarioE2eMintedMinCap.json';
        e2eMinCap = await Utils.getMintedCrowdsaleInstance(scenarioE2eMintedMinCap);
        startURL = await Utils.getStartURL();
        driver = await Utils.startBrowserWithWallet();

        Owner = new User(driver, user8545_56B2File);
        Investor1 = new User(driver, user8545_F16AFile);
        Investor2 = new User(driver, user8545_f5aAFile);
        ReservedAddress = new User(driver, user8545_ecDFFile);
        Investor3 = new User(driver, user8545_dDdCFile);
        Investor3.minCap = e2eMinCap.tiers[2].whitelist[0].min
        Investor3.maxCap = e2eMinCap.tiers[2].whitelist[0].max
        Investor4 = new User(driver, user8545_9E96File);

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
        tierPage = new TierPage(driver, e2eMinCap.tiers[0]);

    });

    test.after(async function () {
        //await Utils.sendEmail(tempOutputFile);
        let outputPath = Utils.getOutputPath();
        outputPath = outputPath + "/result" + Utils.getDate();
        await fs.ensureDirSync(outputPath);
        await fs.copySync(tempOutputPath, outputPath);
        //await fs.remove(tempOutputPath);
        //await driver.quit();
    });

//////////////////////// Test SUITE #2 /////////////////////////////
    test.it('Owner  can create crowdsale(scenarioE2eMintedMinCap.json),minCap,3 tiers ',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            let result = await owner.createMintedCappedCrowdsale({crowdsale:e2eMinCap});
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
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap * 1.1;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED. Investor can buy before the crowdsale started");
        });

    test.it('Field minCap disabled if tier is not modifiable',
        async function () {
            let owner = Owner;
            let tierNumber = 1;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            await owner.openManagePage(e2eMinCap);
            let result = await mngPage.isDisabledFieldMinCap(tierNumber);
            return await assert.equal(result, true, 'Test FAILED.Field minCap enabled if crowdsale is not modifiable');
        });

    test.it('Disabled to modify the end time if crowdsale is not modifiable',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let adjust = 80000000;
            let format = TIME_FORMAT.UTC;
            let newTime = Utils.getTimeWithAdjust(adjust, format);
            let newDate = Utils.getDateWithAdjust(adjust, format);
            let tierNumber = 1;
            let result = await owner.changeEndTimeFromManagePage(tierNumber, newDate, newTime);
            return await assert.equal(result, false, 'Test FAILED.Owner can modify the end time of tier#1 if crowdsale not modifiable ');
        });

    test.it("Contribution page: Countdown timer has correct status: 'TO START OF TIER1 '",
        async function () {
            let investor = Owner;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCrowdsaleNotStarted();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });

    test.it('Tier #1 starts as scheduled',
        async function () {
            let investor = Owner;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let counter = 180;
            let startTime;
            do {
                startTime = await Utils.getMintedCrowdsaleStartTime(e2eMinCap);
                logger.info("wait " + Date.now());
                logger.info("wait " + startTime);
                //console.log("Date.now() = " + Date.now());
                //console.log("startTime =  " + startTime);
                await driver.sleep(1000);

            }
            while ( counter-- > 0 && (Date.now() / 1000 <= startTime) );
            return await assert.equal(counter > 0, true, 'Test FAILED. Tier #1 has not start in time ');
        });

    test.it("Contribution  page: Countdown timer has correct status: 'TO END OF TIER1 '",
        async function () {
            let investor = Owner;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCurrentTier1();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });

    test.it("Contribution page: minContribution field contains correct minCap value ",
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, e2eMinCap.tiers[0].minCap, 'Test FAILED. MinContribution value is incorrect ');
        });

    test.it('Investor is not able to buy less than mincap in first transaction',
        async function () {
            let investor = Investor1;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap * 0.5;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED. Investor can buy less than minCap in first transaction");
        });

    test.it('Investor is able to buy amount equal mincap',
        async function () {
            balanceEthOwnerBefore = await Utils.getBalance(Owner);
            let investor = Investor1;
            let contribution = e2eMinCap.tiers[0].minCap;
            investor.tokenBalance += contribution;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investor.contribute(contribution);
            return await assert.equal(result, true, 'Test FAILED. Investor can not buy amount = min');
        });

    test.it("Owner's Eth balance properly changed ",
        async function () {
            balanceEthOwnerAfter = await Utils.getBalance(Owner);
            let contribution = e2eMinCap.tiers[0].minCap;
            let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].rate);
            return await assert.equal(result, true, "Owner's balance incorrect");
        });

    test.it('Invest page: Investors balance is properly changed  after purchase ',
        async function () {
            let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let newBalance = await investor.getBalanceFromInvestPage(e2eMinCap);
            let result = (newBalance.toString() === investor.tokenBalance.toString());
            return await assert.equal(result, true, "Test FAILED. Investor can  buy but balance did not changed");
        });

    test.it('Investor is able to buy less than mincap after first transaction',
        async function () {
            balanceEthOwnerBefore = await Utils.getBalance(Owner);
            let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].minCap / 10;
            investor.tokenBalance += contribution;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, true, "Test FAILED. Investor can not buy less than mincap after first transaction");
        });

    test.it("Owner's Eth balance properly changed ",
        async function () {
            balanceEthOwnerAfter = await Utils.getBalance(Owner);
            let contribution = e2eMinCap.tiers[0].minCap / 10;
            let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].rate);
            return await assert.equal(result, true, "Owner's balance incorrect");
        });

    test.it('Investor is able to buy not more than total supply for current tier',
        async function () {
            balanceEthOwnerBefore = await Utils.getBalance(Owner);
            let investor = Investor1;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[0].supply * 2;
            investor.tokenBalance = e2eMinCap.tiers[0].supply;
            await investor.contribute(contribution);
            let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
            let result = (Math.abs(parseFloat(balance) - parseFloat(investor.tokenBalance)) < 0.1);
            return await assert.equal(result, true, "Test FAILED.Investor can not  buy  maxCap");
        });
    test.it("Owner's Eth balance properly changed ",
        async function () {
            balanceEthOwnerAfter = await Utils.getBalance(Owner);
            let contribution = e2eMinCap.tiers[0].supply;
            let delta = 0.1;
            let result = await Utils.compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, e2eMinCap.tiers[0].rate, delta);
            return await assert.equal(result, true, "Owner's balance incorrect");
        });

    test.it('Owner is not able to finalize if all tokens were sold in tier#1 ',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            let result = await owner.finalize(e2eMinCap);
            return await assert.equal(result, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
        });

    test.it('Manage page: owner is able to modify the end time of tier#2 before start',
        async function () {
            let owner = Owner;
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let tierNumber = 2;
            let format = TIME_FORMAT.UTC;
            endTime = Utils.getTimeWithAdjust(adjEndTimeTier2, format);
            endDate = Utils.getDateWithAdjust(adjEndTimeTier2, format);
            let result = await owner.changeEndTimeFromManagePage(tierNumber, endDate, endTime);
            return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#2 before start ');

        });

    test.it('Manage page:  end time of tier#2 properly changed after modifying ',
        async function () {
            let owner = Owner;
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let tierNumber = 2;
            let newTime = await owner.getEndTime(tierNumber);
            let result = await Utils.compareDates(newTime, endDate, endTime);
            return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
        });

    test.it('Manage page:  start time of tier#3 changed  after end time of tier#2 was changed',
        async function () {
            let owner = Owner;
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let tierNumber = 3;
            let newTime = await owner.getStartTime(tierNumber);
            let result = await Utils.compareDates(newTime, endDate, endTime);
            return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
        });

    test.it('Manage page: owner is able to change minCap tier#2 before start of tier#2',
        async function () {
            let owner = Owner;
            let tierNumber = 2;
            //assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            e2eMinCap.tiers[1].minCap = e2eMinCap.tiers[1].minCap / 2;
            let result = await owner.changeMinCapFromManagePage(tierNumber, e2eMinCap.tiers[1].minCap);
            return await assert.equal(result, true, 'Test FAILED.Owner is NOT able to add whitelisted address before start of crowdsale ');
        });

    test.it('Tier #1 finished as scheduled',
        async function () {
            let tierNumber = 1;
            let counter = 180;
            let endT;
            do {
                endT = await Utils.getTiersEndTimeMintedCrowdsale(e2eMinCap, tierNumber);
                //logger.info("wait " + Date.now());
                //logger.info("wait " + endT);
                //console.log("Date.now() = " + Date.now());
                //console.log("startTime =  " + startTime);
                await driver.sleep(1000);

            }
            while ( counter-- > 0 && (Date.now() / 1000 <= endT) );
            return await assert.equal(counter > 0, true, 'Test FAILED. Tier #1 has not finished as scheduled');
        });

//////// TIER#2 ////////////

    test.it('Manage page,tier #2: field minCap enabled if tier has started',
        async function () {
            let owner = Owner;
            let tierNumber = 2;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let result = await mngPage.isDisabledFieldMinCap(tierNumber);
            return await assert.equal(result, false, 'Test FAILED.Manage page,tier #2: field minCap disabled if whitelist enabled');
        });
    test.it("Contribution  page: Countdown timer has correct status: 'TO END OF TIER2 '",
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCurrentTier2();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });
    test.it("Contribution page: minContribution field contains correct minCap value",
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            //console.log("minCap= "+result);
            return await assert.equal(result, e2eMinCap.tiers[1].minCap, 'Test FAILED. MinContribution value is incorrect');
        });

    test.it('Investor is not able to buy less than minCap in first transaction',
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].minCap * 0.5;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
        });
    test.it('Investor is able to buy amount equal minCap',
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].minCap;
            investor.tokenBalance += contribution;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, true, 'Test FAILED. Investor can not buy ');
        });

    test.it('Manage page: owner is able to update minCap after start of crowdsale',
        async function () {
            let owner = Owner;
            let tierNumber = 2;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            e2eMinCap.tiers[1].minCap = e2eMinCap.tiers[1].minCap * 2;
            let result = await owner.changeMinCapFromManagePage(tierNumber, e2eMinCap.tiers[1].minCap);
            return await assert.equal(result, true, 'Test FAILED.Manage page: owner is not able to update minCap after start of crowdsale ');
        });
    test.it("Contribution page: minContribution field contains correct minCap value (after modifying) ",
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, e2eMinCap.tiers[1].minCap, 'Test FAILED. MinContribution value is incorrect ');
        });
    test.it('minCap should be updated: new investor is not able to buy less than new minCap ',
        async function () {
            let investor = Investor3;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].minCap - 1;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED. minCap wasn't updated");

        });

    test.it('minCap should be updated:  New investor is  able to buy amount equals  new minCap ',
        async function () {
            let investor = Investor3;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].minCap;
            investor.tokenBalance = contribution;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, true, "Test FAILED. Updated minCap in action: New investor is not able to buy amount equals  new minCap");
        });

    test.it('Old investor still able to buy amount less than minCap',
        async function () {
            let investor = Investor2;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].minCap / 10;
            investor.tokenBalance += contribution;

            await investor.contribute(contribution);
            let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
            let result = (Math.abs(parseFloat(balance) - parseFloat(investor.tokenBalance)) < 1);
            return await assert.equal(result, true, "Test FAILED.Investor can not  buy  maxCap");
        });

    test.it('Investor is able to buy maxCap',
        async function () {
            let investor = Investor2;
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = e2eMinCap.tiers[1].supply;
            investor.tokenBalance = e2eMinCap.tiers[1].supply - e2eMinCap.tiers[1].minCap;
            await investor.contribute(contribution);
            let balance = await investor.getBalanceFromInvestPage(e2eMinCap);
            //console.log("Real balance "+balance);
            //console.log("ShouldBe investor.tokenBalance "+investor.tokenBalance);
            let result = (Math.abs(parseFloat(balance) - parseFloat(investor.tokenBalance)) < 0.1);
            return await assert.equal(result, true, "Test FAILED.Investor can not  buy  maxCap");
        });

    test.it('Manage page: owner is able to modify the end time of tier#3 before start',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let tierNumber = 3;
            let format = TIME_FORMAT.UTC;
            endTime = Utils.getTimeWithAdjust(adjEndTimeTier3, format);
            endDate = Utils.getDateWithAdjust(adjEndTimeTier3, format);
            let result = await owner.changeEndTimeFromManagePage(tierNumber, endDate, endTime);
            return await assert.equal(result, true, 'Test FAILED.Owner can NOT modify the end time of tier#3 before start ');

        });

    test.it('Manage page:  end time of tier#3 properly changed after modifying ',
        async function () {
            let owner = Owner;
            //assert.equal(await owner.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let tierNumber = 3;
            await driver.sleep(5000);
            await mngPage.refresh();
            let newTime = await owner.getEndTime(tierNumber);
            let result = await Utils.compareDates(newTime, endDate, endTime);
            return await assert.equal(result, true, 'Test FAILED. End time doest match the given value');
        });

    test.it('Tier #2 finished as scheduled',
        async function () {
            let tierNumber = 2;
            let counter = 180;
            let endT;
            do {
                endT = await Utils.getTiersEndTimeMintedCrowdsale(e2eMinCap, tierNumber);
                logger.info("wait " + Date.now());
                logger.info("wait " + endT);
                //console.log("Date.now() = " + Date.now());
                //console.log("startTime =  " + startTime);
                await driver.sleep(1000);

            }
            while ( counter-- > 0 && (Date.now() / 1000 <= endT) );
            return await assert.equal(counter > 0, true, 'Test FAILED. Tier #2 has not finished as scheduled');
        });
//////// TIER#3 ///////////
    test.it('Manage page,tier #3: field minCap disabled if whitelist enabled',
        async function () {
            let owner = Owner;
            let tierNumber = 3;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await owner.openManagePage(e2eMinCap), true, 'Owner can not open manage page');
            let result = await mngPage.isDisabledFieldMinCap(tierNumber);
            return await assert.equal(result, true, 'Test FAILED.Manage page,tier #2: field minCap disabled if whitelist enabled');
        });
    test.it("Contribution page: minContribution field is 'You are not allowed' for non-whitelisted investors",
        async function () {
            let investor = Owner;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, -1, 'Test FAILED. MinContribution value is incorrect');
        });
    test.it("Contribution page: minContribution field contains correct minCap value for whitelisted investor",
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, e2eMinCap.tiers[2].whitelist[0].min, 'Test FAILED. MinContribution value is incorrect');
        });
    test.it('Whitelisted investor is not able to buy less than min in first transaction',
        async function () {
            let investor = Investor3;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = investor.minCap / 2;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED.Investor can buy less than minCap in first transaction");
        });

    test.it('Whitelisted investor can buy amount equal mincap',
        async function () {
            let investor = Investor3;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = investor.minCap;
            investor.tokenBalance += contribution;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, true, 'Test FAILED. Whitelisted investor that was added before start can not buy');
        });

    test.it("Contribution  page: Countdown timer has correct status: 'TO END OF TIER 3'",
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCurrentTier3();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });


    test.it('Tier #3 finished as scheduled',
        async function () {
            let tierNumber = 3;
            let counter = 180;
            let endT;
            do {
                endT = await Utils.getTiersEndTimeMintedCrowdsale(e2eMinCap, tierNumber);
                logger.info("wait " + Date.now());
                logger.info("wait " + endT);
                //console.log("Date.now() = " + Date.now());
                //console.log("startTime =  " + startTime);
                await driver.sleep(1000);

            }
            while ( counter-- > 0 && (Date.now() / 1000 <= endT) );
            return await assert.equal(counter > 0, true, 'Test FAILED. Tier #3 has not finished as scheduled');
        });
    ///// AFTER END //////

    test.it("Contribution page: minContribution field is 'You are not allowed' after end of crowdsale",
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, -1, 'Test FAILED. MinContribution value is incorrect');
        });


    test.it("Contribution page: Countdown timer has correct status: 'CROWDSALE HAS ENDED'",
        async function () {
            let investor = Investor3;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.isCrowdsaleEnded();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });

    test.it('Disabled to buy after crowdsale time expired',
        async function () {
            let investor = Investor3;
            let contribution = investor.minCap;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED. Investor can  buy if crowdsale is finalized");
        });

    test.it('Owner is able to finalize (if crowdsale time expired but not all tokens were sold)',
        async function () {
            let owner = Owner;
            assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
            let result = await owner.finalize(e2eMinCap);
            return await assert.equal(result, true, "Test FAILED.'Owner can NOT finalize ");
        });
    test.it("Contribution page: Countdown timer has correct status: 'HAS BEEN FINALIZED'",
        async function () {
            let investor = Owner;
            //assert.equal(await investor.setMetaMaskAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.refresh()
                && await investPage.waitUntilLoaderGone()
                && await investPage.waitUntilShowUpCountdownTimer()
                && await investPage.isCrowdsaleFinalized();
            return await assert.equal(result, true, 'Test FAILED. Countdown timer has incorrect status ');
        });
    test.it('Investor is not able to buy if crowdsale is finalized',
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let contribution = investor.minCap;
            let result = await investor.contribute(contribution);
            return await assert.equal(result, false, "Test FAILED. Investor can buy if crowdsale is finalized");
        });
    test.it("Contribution page: minContribution field is 'You are not allowed' after finalization of crowdsale",
        async function () {
            let investor = Investor3;
            assert.equal(await investor.setWalletAccount(), true, "Can not set Metamask account");
            assert.equal(await investor.openContributionPage(e2eMinCap), true, 'Investor can not open Contribution page');
            let result = await investPage.getMinContribution();
            return await assert.equal(result, -1, 'Test FAILED. MinContribution value is incorrect');
        });


    test.it('Reserved address#1 has received correct percent of tokens after finalization',
        async function () {
            let user = new User();
            user.account = e2eMinCap.reservedTokens[0].address;
            let balance = await user.getTokenBalance(e2eMinCap) / 1e18;
            let soldTokens = await Utils.getTokensSold(e2eMinCap) / 1e18;
            //let shouldBe = e2eMinCap.reservedTokens[0].value * (Investor1.tokenBalance+Investor2.tokenBalance+Investor3.tokenBalance)/ 100;
            let shouldBe = e2eMinCap.reservedTokens[0].value * soldTokens / 100;
            logger.info("Tokens are sold  = " + soldTokens);
            logger.info("Investor should receive  = " + shouldBe);
            logger.info("Investor has received balance = " + balance);
            return await assert.equal(shouldBe, balance, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe);
        });

    test.it('Reserved address#2 has received correct quantity of tokens after finalization',
        async function () {
            let user = new User();
            user.account = e2eMinCap.reservedTokens[1].address;
            let balance = await user.getTokenBalance(e2eMinCap) / 1e18;
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
    test.it('Investor#2 has received correct quantity of tokens after finalization', async function () {

        let investor = Investor2;
        let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
        let shouldBe = investor.tokenBalance;
        logger.info("Investor should receive  = " + shouldBe);
        logger.info("Investor has received balance = " + balance);
        logger.info("Difference = " + (balance - shouldBe));
        return await assert.equal(balance, shouldBe, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
    });
    test.it('Investor#3 has received correct quantity of tokens after finalization', async function () {

        let investor = Investor3;
        let balance = await investor.getTokenBalance(e2eMinCap) / 1e18;
        let shouldBe = investor.tokenBalance;
        logger.info("Investor should receive  = " + shouldBe);
        logger.info("Investor has received balance = " + balance);
        logger.info("Difference = " + (balance - shouldBe));
        return await assert.equal(balance, shouldBe, "Test FAILED.'Investor has received " + balance + " tokens instead " + shouldBe)
    });

});
