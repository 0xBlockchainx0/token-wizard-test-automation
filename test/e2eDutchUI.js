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
const PublishPage = require('../pages/PublishPage.js').PublishPage;
const CrowdsaleList = require('../pages/CrowdsaleList.js').CrowdsaleList
const ManagePage = require('../pages/ManagePage.js').ManagePage;

const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Utils = require('../utils/Utils.js').Utils;
const TEXT = require('../utils/constants.js').TEXT;
const TITLES = require('../utils/constants.js').TITLES;
const User = require("../entity/User.js").User;

test.describe(`e2e test for TokenWizard2.0/DutchAuctionCrowdsale. v ${testVersion} `, async function () {

    this.timeout(2400000);//40 min
    this.slow(1800000);

    const user8545_dDdCFile = './users/user8545_dDdC.json';//Owner
    const scenarioForUItests = './scenarios/scenarioUItests.json';
    const scenarioDutchSimple = './scenarios/scenarioDutchSimple.json'
    const user8545_F16AFile = './users/user8545_F16A.json';

    let driver
    let Owner
    let Investor1

    let wallet
    let welcomePage
    let wizardStep1
    let wizardStep2
    let wizardStep3
    let wizardStep4
    let tierPage
    let mngPage
    let reservedTokensPage
    let contributionPage
    let startURL
    let crowdsaleForUItests
    let crowdsaleDutchSimple
    let crowdsalePage
    let crowdsaleListPage
    let publishPage

    const placeholder = {
        gasCustom: '0.1',
        setupNameTier1: 'Tier 1',
        decimals: '18',
        mincap: '0',
        totalSupply: '0'
    }

    const newValue = {
        name: 'Name',
        decimals: '13',
        totalSupply: '1000',
        customGas: '100',
        ticker: 'Tick',
        rateTier1: '456',
        supplyTier1: '1e18',
        mincapTier2: '423'
    }

/////////////////////////////////////////////////////////////////////////

    test.before(async function () {

        await Utils.copyEnvFromWizard();

        crowdsaleForUItests = await Utils.getDutchCrowdsaleInstance(scenarioForUItests);
        crowdsaleForUItests.totalSupply = 1e10
        crowdsaleDutchSimple = await Utils.getDutchCrowdsaleInstance(scenarioDutchSimple);

        startURL = await Utils.getStartURL();
        driver = await Utils.startBrowserWithWallet();

        Owner = new User(driver, user8545_dDdCFile);
        Owner.tokenBalance = 0;
        Investor1 = new User(driver, user8545_F16AFile);
        await Utils.receiveEth(Owner, 20);
        await Utils.receiveEth(Investor1, 20);
        logger.info("Roles:");
        logger.info("Owner = " + Owner.account);
        logger.info("Owner's balance = :" + await Utils.getBalance(Owner) / 1e18);

        wallet = await Utils.getWalletInstance(driver);
        // await wallet.activate();//return activated Wallet and empty page
        // await Owner.setWalletAccount();

        welcomePage = new WizardWelcome(driver, startURL);
        wizardStep1 = new WizardStep1(driver);
        wizardStep2 = new WizardStep2(driver);
        wizardStep3 = new WizardStep3(driver);
        wizardStep4 = new WizardStep4(driver);

        reservedTokensPage = new ReservedTokensPage(driver);
        mngPage = new ManagePage(driver);
        tierPage = new TierPage(driver, crowdsaleForUItests.tiers[0]);
        contributionPage = new ContributionPage(driver);
        crowdsalePage = new CrowdsalePage(driver);
        publishPage = new PublishPage(driver)
        crowdsaleListPage = new CrowdsaleList(driver)
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

    //////// UI TESTS ////////////////////////////////////////////////

    describe("Welcome page, logged  out from wallet", async function () {

        test.it("User is able to open wizard welcome page",
            async function () {
                const result = await welcomePage.open()
                    && await welcomePage.waitUntilDisplayedButtonNewCrowdsale(180);
                return await assert.equal(result, true, "welcome page is not available ");
            });

        test.it("Warning present if user logged out from wallet",
            async function () {
                const result = await welcomePage.clickButtonNewCrowdsale()
                    && await welcomePage.waitUntilShowUpWarning(180)
                return await assert.equal(result, true, "no warning present if user logged out from wallet");
            });

        test.it("User can confirm warning",
            async function () {
                const result = await welcomePage.clickButtonOk()
                return await assert.equal(result, true, "button Ok doesn't present");
            });

        test.it("Return back to Home page opens if user confirm warning",
            async function () {
                const result = await welcomePage.waitUntilDisplayedButtonNewCrowdsale()
                return await assert.equal(result, true, "home page  isn't open");
            });

        test.it("No warning is displayed if user logged into wallet",
            async function () {
                const result = await wallet.activate() //return activated Wallet and empty page
                    && await Owner.setWalletAccount()
                    && await welcomePage.waitUntilShowUpWarning(10)
                return await assert.equal(result, false, "no warning present if user logged out from wallet ");
            });
    })
    describe ("Create crowdsale", async function () {

        test.it('User is able to create crowdsale(scenarioMintedSimple.json),2 tiers',
            async function () {
                const owner = Owner;
                assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
                const result = await owner.createDutchAuctionCrowdsale({
                    crowdsale: crowdsaleDutchSimple,
                    stop: { publish: true }
                });

                return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
            });
    })
    describe ("Publish page", async function () {
        let values
        describe('Common data', async function () {

            test.it("Correct numbers of fields",
                async function () {
                    await publishPage.waitUntilLoaderGone()
                    await Utils.delay(5000)
                    values = await publishPage.getFieldsContent()
                    return await assert.equal(values.length, 14, "Incorrect amount of fields");
                });
            test.it("Title is correct",
                async function () {
                    await publishPage.waitUntilDisplayedTitle(180)
                    const result = await publishPage.getTitleText();
                    return await assert.equal(result, TITLES.PUBLISH_PAGE, "Page's title is incorrect");
                });
            test.it('Name is correct',
                async function () {
                    await driver.sleep(5000)
                    return await assert.equal(crowdsaleDutchSimple.name, values[0], 'Publish page: name is incorrect ');
                });

            test.it('Ticker is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.ticker, values[1].toUpperCase(), 'Publish page: ticker is incorrect ');
                });

            test.it('Decimals is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.decimals, values[2], 'Publish page: decimals is incorrect ');
                });

            test.it('Supply is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.totalSupply, values[3], 'Publish page: supply is incorrect ');
                });

            test.it('Wallet address is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.walletAddress, values[4], 'Publish page: wallet address is incorrect ');
                });


            test.it('Burn excess is correct',
                async function () {
                    return await assert.equal(values[5], 'No', 'Publish page: burn excess flag is incorrect ');
                });

            test.it('Crowdsale start time/date is correct',
                async function () {
                    const time = await publishPage.getCrowdsaleStartTime()
                    console.log(time)
                    const startDate = crowdsaleDutchSimple.tiers[0].startDate
                    const startTime = crowdsaleDutchSimple.tiers[0].startTime
                    const date = await Utils.convertDateToUtc0(startDate, startTime)
                    const datePublish = await Utils.formatDate(date, 'publish')
                    console.log('inReal   ' + time)
                    console.log('shouldBe   ' + datePublish)
                    await assert.equal(time, datePublish, "crowdsale start time is incorrect")
                });

            test.it('Crowdsale end time/date is correct',
                async function () {
                    const time = await publishPage.getCrowdsaleEndTime()
                    console.log(time)
                    const endDate = crowdsaleDutchSimple.tiers[0].endDate
                    const endTime = crowdsaleDutchSimple.tiers[0].endTime
                    const date = await Utils.convertDateToUtc0(endDate, endTime)
                    const datePublish = await Utils.formatDate(date, 'publish')
                    console.log('inReal   ' + time)
                    console.log('shouldBe   ' + datePublish)
                    await assert.equal(time, datePublish, "crowdsale end time is incorrect")
                });

            test.it('Compiler version is correct',
                async function () {
                    return await assert.equal(values[11].includes('0.4.'), true, 'Publish page: compiler version is incorrect ');
                });

            test.it('Contract name is correct',
                async function () {
                    return await assert.equal(values[12], 'DutchProxy', 'Publish page: contract name is incorrect ');
                });

            test.it('Optimized flag is correct',
                async function () {
                    return await assert.equal(values[13], 'Yes', 'Publish page: optimized flag name is incorrect ');
                });

            test.it.skip('Contract source code is displayed and correct ',
                async function () {
                    const contract = await publishPage.getTextContract()
                    crowdsaleDutchSimple.sort = 'dutch'
                    const shouldBe = await Utils.getContractSourceCode(crowdsaleDutchSimple)
                    console.log(shouldBe)
                    return await assert.equal(contract, shouldBe, "contract source code isn't correct")
                })

            test.it('Encoded ABI is displayed and correct ',
                async function () {
                    const abi = await publishPage.getEncodedABI()
                    return await assert.equal(abi.length, 256, 'Publish page:encoded ABI isn\'t correct ');
                });

            test.it("Tier's start time/date is correct",
                async function () {
                    const time = await publishPage.getTierStartTime(1)
                    const startDate = crowdsaleDutchSimple.tiers[0].startDate
                    const startTime = crowdsaleDutchSimple.tiers[0].startTime
                    const date = await Utils.convertDateToUtc0(startDate, startTime)
                    const datePublish = await Utils.formatDate(date, 'publish')
                    console.log('inReal   ' + time)
                    console.log('shouldBe   ' + datePublish)
                    await assert.equal(time, datePublish, "tier's start time is incorrect")
                });
            test.it("Tier's end time/date is correct",
                async function () {
                    const time = await publishPage.getTierEndTime(1)
                    const endDate = crowdsaleDutchSimple.tiers[0].endDate
                    const endTime = crowdsaleDutchSimple.tiers[0].endTime
                    const date = await Utils.convertDateToUtc0(endDate, endTime)
                    const datePublish = await Utils.formatDate(date, 'publish')
                    console.log('inReal   ' + time)
                    console.log('shouldBe   ' + datePublish)
                    await assert.equal(time, datePublish, "tier's end time is incorrect")
                });

            test.it('Min rate is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.tiers[0].minRate, values[8], 'Publish page: min rate is incorrect ');
                });
            test.it('Max rate is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.tiers[0].maxRate, values[9], 'Publish page: max rate is incorrect ');
                });

            test.it('Mincap is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.tiers[0].minCap, values[6], 'Publish page: mincap is incorrect ');
                });
            test.it('Maxcap is correct',
                async function () {
                    return await assert.equal(crowdsaleDutchSimple.tiers[0].supply, values[7], 'Publish page: maxcap is incorrect ');
                });
            test.it('Whitelisting is correct',
                async function () {
                    const result = (values[10] === 'Yes')
                    return await assert.equal(crowdsaleDutchSimple.tiers[0].isWhitelisted, result, 'Publish page: whitelisting is incorrect ');
                });
        })
        describe("Check alerts, buttons", async function () {

            test.it("Warning displayed after refreshing",
                async function () {
                    const result = await publishPage.refresh()
                        && await Utils.delay(2000)
                        && await wizardStep4.isPresentAlert()
                        && await wizardStep4.acceptAlert()
                        && await publishPage.waitUntilShowUpWarning()
                        && await publishPage.clickButtonOk()
                    return await assert.equal(result, true, "warning does not present");
                });

            test.it("Button 'Download file' is presented and clickable, notice appears",
                async function () {
                    const result = !await publishPage.waitUntilShowUpWarning(15)
                    await publishPage.clickButtonDownload()
                    && await publishPage.waitUntilShowUpErrorNotice()
                    return await assert.equal(result, true, "button 'Download file' isn't present");
                });
            test.it("Clicking button 'Continue' opens Crowdsale page",
                async function () {
                    const result = await publishPage.clickButtonContinue()
                        && await publishPage.waitUntilLoaderGone()
                        && await crowdsalePage.waitUntilShowUpTitle()
                    return await assert.equal(result, true, "crowdsale page hasn't opened");
                });
        })
    })
    describe ("Crowdsale page:", async function () {
        let values
        test.it("Correct numbers of fields",
            async function () {
                await crowdsalePage.waitUntilLoaderGone()
                await Utils.delay(5000)
                values = await crowdsalePage.getFieldsContent()
                return await assert.equal(values.length, 6, "Incorrect amount of fields");
            })

        test.it("Title is correct",
            async function () {
                await Utils.delay(5000)
                await crowdsalePage.waitUntilDisplayedTitle(180)
                const result = await crowdsalePage.getTitleText();
                return await assert.equal(result, TITLES.CROWDSALE_PAGE, "Page's title is incorrect");
            })

        test.it("Proxy address is correct",
            async function () {
                const result = await crowdsalePage.getProxyAddress()
                return await assert.equal(result.length, 42, "proxy address is incorrect");
            })

        test.it("Raised funds is correct",
            async function () {
                const result = await crowdsalePage.getRaisedFunds()
                return await assert.equal(result, '0 ETH', "raised funds is incorrect");
            })

        test.it.skip("Goal funds is correct",
            async function () {
                const result = await crowdsalePage.getGoalFunds()
                const goal = crowdsaleDutchSimple.tiers[0].supply / crowdsaleDutchSimple.tiers[0].rate + crowdsaleDutchSimple.tiers[1].supply / crowdsaleDutchSimple.tiers[1].rate
                return await assert.equal(result.includes(goal.toString().slice(0, 15)), true, "goal funds is incorrect");
            })

        test.it("Tokens claimed is correct",
            async function () {
                const result = await crowdsalePage.getTokensClaimed()
                return await assert.equal(result, '0', "tokens claimed is incorrect")
            })

        test.it("Contributors number is correct",
            async function () {
                const result = await crowdsalePage.getContributors()
                return await assert.equal(result, '0', "contributors number is incorrect")
            })

        test.it("Current rate is correct",
            async function () {
                return await assert.equal(values[4], crowdsaleDutchSimple.tiers[0].minRate, "current rate is incorrect")
            })

        test.it("Start rate is correct",
            async function () {
                return await assert.equal(values[3], crowdsaleDutchSimple.tiers[0].minRate, "start rate is incorrect")
            })

        test.it("End rate is correct",
            async function () {
                return await assert.equal(values[5], crowdsaleDutchSimple.tiers[0].maxRate, "end rate is incorrect")
            })

        test.it("Total supply is correct",
            async function () {
                const goal = crowdsaleDutchSimple.tiers[0].supply
                return await assert.equal(values[2], goal, "total supply is incorrect")
            })

        test.it("Clicking button 'Contribute' opens Contribution page",
            async function () {
                const result = await crowdsalePage.clickButtonContribute()
                    && await crowdsalePage.waitUntilLoaderGone()
                    && await contributionPage.waitUntilShowUpCountdownTimer()
                return await assert.equal(result, true, "contribution page hasn't opened");
            })
    })

    describe("Welcome page", async function () {

        test.it("User is able to open wizard welcome page",
            async function () {
                const result = await welcomePage.open()
                    && await welcomePage.waitUntilDisplayedButtonNewCrowdsale(180);
                return await assert.equal(result, true, "welcome page is not available ");
            });
        test.it("Button 'Choose Contract' present",
            async function () {
                const result = await welcomePage.isDisplayedButtonChooseContract();
                return await assert.equal(result, true, "button 'Choose Contract' not present ");
            });

        test.it("Button 'New crowdsale' present",
            async function () {
                const result = await welcomePage.isDisplayedButtonNewCrowdsale();
                return await assert.equal(result, true, "button ' New crowdsale' is not present ");
            });

        test.it("Button 'Choose contract' present",
            async function () {
                const result = await welcomePage.isDisplayedButtonChooseContract();
                return await assert.equal(result, true, "button 'Choose contract' isn't presented ");
            });

        test.it("User is able to open Step1 by clicking button 'New crowdsale'",
            async function () {
                const result = await welcomePage.clickButtonNewCrowdsale()
                    && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap();
                return await assert.equal(result, true, "user is not able to activate Step1 by clicking button 'New crowdsale'");
            });
    })

    describe("Step#1:", async function () {

        test.it("Title is correct",
            async function () {
                await wizardStep1.waitUntilDisplayedTitle(180)
                const result = await wizardStep1.getTitleText();
                return await assert.equal(result, TITLES.STEP1, "Page's title is incorrect");
            });

        test.it("Move back/forward - page keep state of checkbox 'Dutch Auction'",
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await wizardStep1.goBack()
                    && await wizardStep1.waitUntilLoaderGone()
                    && await Utils.delay(2000)
                    && await welcomePage.isDisplayedButtonChooseContract()
                    && await wizardStep1.goForward()
                    && await wizardStep1.waitUntilLoaderGone()
                    && await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                return await assert.equal(result, true, "Checkbox 'Dutch Auction' was changed after move back/forward");
            });

        test.it("Alert if user is going to leave TW",
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                    && (!await wizardStep1.open('localhost:3000/?uiversion=2'))
                    && await wizardStep1.isPresentAlert()
                    && await wizardStep1.cancelAlert()
                    && await wizardStep1.waitUntilDisappearAlert()
                return await assert.equal(result, true, "alert does not present if user wants to leave TW");
            });

        test.it("Alert is displayed if reload the page",
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await wizardStep1.refresh()
                    && await Utils.delay(2000)
                    && await wizardStep1.isPresentAlert()
                    && await wizardStep1.acceptAlert()
                return await assert.equal(result, true, "alert does not present");
            });
        test.it("Refresh - page keep state of checkbox 'Dutch Auction'",
            async function () {
                const result = await wizardStep1.waitUntilLoaderGone()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                return await assert.equal(result, true, "Checkbox 'Dutch Auction' was changed after refresh");
            });

        test.it("Change network - page keep state of checkbox 'Dutch Auction'",
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await Investor1.setWalletAccount()
                    && (await wizardStep1.isPresentAlert() ? await wizardStep1.cancelAlert() : true)
                    && await wizardStep1.waitUntilLoaderGone()
                    && await Utils.delay(2000)
                    && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                    && await Owner.setWalletAccount()
                    && await wizardStep1.waitUntilLoaderGone()
                return await assert.equal(result, true, "Checkbox 'Whitelist with mincap' was changed after change network");
            });

        test.it("User is able to open Step2 by clicking button Continue",
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
                return await assert.equal(result, true, "user is not able to open Step2 by clicking button 'Continue'");
            });
    })

    describe("Step#2:", async function () {
        const invalidValues = {
            name: '012345678901234567790123456789f',
            ticker: 'qwe$#',
            decimals: '19',
            address: 'lsdnfoiwd',
            value: '0.00000123134824956234651234234',
            supplyNegative: '-',
            supplySymbols: '123..12312'
        }

        test.it("Title is correct",
            async function () {
                await wizardStep2.waitUntilDisplayedTitle(180)
                const result = await wizardStep2.getTitleText();
                return await assert.equal(result, TITLES.STEP2, "Page's title is incorrect");
            });

        test.it("Button 'Back' opens Step#1",
            async function () {
                const result = await wizardStep2.clickButtonBack()
                    && await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                await assert.equal(result, true, "Incorrect behavior of button 'Back'")
            })

        test.it("User is able to open Step2 by clicking button 'Continue'",
            async function () {
                await wizardStep1.clickCheckboxDutchAuction()
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
                let result = await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.isDisplayedFieldName();
                return await assert.equal(result, true, "user is not able to open Step2 by clicking button 'Continue'");
            });

        test.it("Alert if user is going to leave TW",
            async function () {
                const result = (!await wizardStep2.open('localhost:3000/?uiversion=2'))
                    && await wizardStep2.isPresentAlert()
                    && await wizardStep2.cancelAlert()
                    && await wizardStep2.waitUntilDisappearAlert()
                return await assert.equal(result, true, "alert does not present if user wants to leave TW");
            });

        test.it("Error message if name longer than 30 symbols",
            async function () {
                const result = await wizardStep2.fillName(invalidValues.name)
                    && await wizardStep2.getWarningText('name')
                return await assert.equal(result, "Please enter a valid name between 1-30 characters", "Incorrect error message");
            });

        test.it("Button 'Continue' disabled if name is wrong",
            async function () {
                const result = await wizardStep2.isDisabledButtonContinue()
                return await assert.equal(result, true, "button 'Continue' is enabled if error message");
            });

        test.it("Error message if field 'Name' is empty",
            async function () {

                const result = await wizardStep2.fillName('')
                    && await wizardStep2.getWarningText('name')
                return await assert.equal(result, 'This field is required', "Incorrect error message");
            });

        test.it("User able to fill out field 'Name' with valid data",
            async function () {
                const result = await wizardStep2.fillName(newValue.name)
                return await assert.equal(result, true, "field 'Name' was changed");
            });

        test.it ("Move back/forward - page keep state of field 'Name'",
            async function () {
                const result = await wizardStep2.goBack()
                    && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                    && await wizardStep1.goForward()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilDisplayedFieldName()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "field 'Name' was changed");
                return await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' was changed");
            });

        test.it("Alert is displayed if reload the page",
            async function () {
                const result = await wizardStep2.refresh()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await Utils.delay(2000)
                    && await wizardStep2.isPresentAlert()
                    && await wizardStep2.acceptAlert()
                return await assert.equal(result, true, "alert does not present");
            });

        test.it("Reload - page keep state of  field 'Name'",
            async function () {
                const result = await wizardStep2.waitUntilDisplayedFieldName()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "field 'Name' was changed");
                return await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' was changed");
            });

        test.it("Change network - page keep state of  field 'Name'",
            async function () {
                const result = await Investor1.setWalletAccount()
                    && (await wizardStep1.isPresentAlert() ? await wizardStep1.cancelAlert() : true)
                    && await wizardStep2.waitUntilLoaderGone()
                    && await Utils.delay(2000)
                    && await wizardStep2.waitUntilHasValueFieldName()
                    && (await wizardStep2.getValueFieldName() === newValue.name)
                    && await Owner.setWalletAccount()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName()
                    && (await wizardStep2.getValueFieldName() === newValue.name)
                return await assert.equal(result, true, "field 'Name' was changed");
            });


        test.it("Field 'Supply' has placeholder 0",
            async function () {
                return await assert.equal(await wizardStep2.getValueFieldSupply(), placeholder.totalSupply, "field 'Supply' has incorrect placeholder");
            });

        test.it("Error message if supply negative",
            async function () {
                await wizardStep2.fillSupply(invalidValues.supplyNegative)
                await Utils.delay(2000)
                const result = await wizardStep2.getWarningText('supply')
                return await assert.equal(result, "Please enter a valid number greater than 0", "Incorrect error message");
            });

        test.it("Error message if supply isn't digital",
            async function () {
                await wizardStep2.fillSupply(invalidValues.supplySymbols)
                await Utils.delay(2000)
                const result = await wizardStep2.getWarningText('supply')
                return await assert.equal(result, "Please enter a valid number greater than 0", "Incorrect error message");
            });

        test.it("Error message if field 'Supply' is empty",
            async function () {
                const result = await wizardStep2.fillSupply('')
                    && await wizardStep2.refresh()
                    && await Utils.delay(2000)
                    && (await wizardStep2.isPresentAlert() ? await wizardStep2.acceptAlert() : true)
                    && await wizardStep2.waitUntilDisappearAlert()
                    && await wizardStep2.getWarningText('supply')
                return await assert.equal(result, "Please enter a valid number greater than 0", "Incorrect error message");
            });

        test.it("User able to fill out field 'Supply' with valid data",
            async function () {
                await wizardStep2.fillSupply(newValue.totalSupply)
                await Utils.delay(2000)
                const result = await wizardStep2.isDisplayedWarningSupply()
                return await assert.equal(result, false, "user is not  able to fill out field 'Supply' with valid data");
            });

        test.it('Error message if ticker longer than 5 symbols',
            async function () {
                await wizardStep2.fillTicker(invalidValues.name)
                await Utils.delay(2000)
                const result = await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, "Please enter a valid ticker between 1-5 characters", "Incorrect error message");
            });

        test.it("Error message if ticker contains special symbols",
            async function () {
                await wizardStep2.fillTicker(invalidValues.ticker)
                await Utils.delay(2000)
                const result = await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, 'Only alphanumeric characters', 'Incorrect error message');
            });

        test.it("Error message if field 'Ticker' is empty",
            async function () {
                const result = await wizardStep2.fillTicker('')
                    && await wizardStep2.refresh()
                    && await Utils.delay(2000)
                    && (await wizardStep2.isPresentAlert() ? await wizardStep2.acceptAlert() : true)
                    && await wizardStep2.waitUntilDisappearAlert()
                    && await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, "This field is required", "Incorrect error message");
            });

        test.it("User able to fill out field 'Ticker' with valid data",
            async function () {
                await wizardStep2.fillTicker(newValue.ticker)
                await Utils.delay(1000)
                const result = await wizardStep2.isDisplayedWarningTicker()
                return await assert.equal(result, false, "user is not  able to fill out field 'Ticker' with valid data");
            });

        test.it("Field 'Decimals' has placeholder 18",
            async function () {
                return await assert.equal(await wizardStep2.getValueFieldDecimals(), placeholder.decimals, "field 'Decimals' has incorrect placeholder");
            });

        test.it("Error message if decimals more than 18",
            async function () {
                await wizardStep2.fillDecimals(invalidValues.decimals)
                const result = await wizardStep2.getWarningText('decimals')
                return await assert.equal(result, 'Should not be greater than 18', "Incorrect error message");
            });

        test.it("Error message if field 'Decimals' is empty",
            async function () {
                await wizardStep2.fillDecimals('')
                const result = await wizardStep2.getWarningText('decimals')
                return await assert.equal(result, 'This field is required', "Incorrect error message");
            });

        test.it("User able to fill out field 'Decimals' with valid data",
            async function () {
                let result = await wizardStep2.fillDecimals(newValue.decimals);
                return await assert.equal(result, true, "user is not able to fill field 'Decimals' with valid data ");
            });

        test.it("Move back/forward - page keep state of each field",
            async function () {
                const result = await wizardStep2.goBack()
                    && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                    && await wizardStep1.goForward()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "page isn't loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "field 'Decimals' changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "field 'Ticker' changed");
                await assert.equal(await wizardStep2.getValueFieldSupply(), newValue.totalSupply, "field 'Supply' changed");
            });

        test.it("Alert is displayed if reload the page",
            async function () {
                const result = await wizardStep2.refresh()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await Utils.delay(2000)
                    && await wizardStep2.isPresentAlert()
                    && await wizardStep2.acceptAlert()
                return await assert.equal(result, true, "alert does not present");
            });


        test.it("Reload - page keep state of each field",
            async function () {
                const result = await wizardStep2.waitUntilDisplayedFieldName()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "page isn't loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "field 'Decimals' changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "field 'Ticker' changed");
                await assert.equal(await wizardStep2.getValueFieldSupply(), newValue.totalSupply, "field 'Supply' changed");
            });

        test.it("Change network - page keep state of each field",
            async function () {
                let result = await Investor1.setWalletAccount()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName()
                    && await Utils.delay(2000)
                await assert.equal(result, true, "page isn't loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "field 'Decimals' changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "field 'Ticker' changed");
                await assert.equal(await wizardStep2.getValueFieldSupply(), newValue.totalSupply, "field 'Supply' changed");

                result = await Owner.setWalletAccount()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName()
                    && await Utils.delay(2000)
                await assert.equal(result, true, "page isn't loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "field 'Name' changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "field 'Decimals' changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "field 'Ticker' changed");
                await assert.equal(await wizardStep2.getValueFieldSupply(), newValue.totalSupply, "field 'Supply' changed");

            });

        test.it("Button 'Continue' is displayed",
            async function () {
                const result = await wizardStep2.isDisplayedButtonContinue();
                return await assert.equal(result, true, "button 'Continue' isn't present");
            });

        test.it("User is able to open Step3 by clicking button 'Continue'",
            async function () {
                await wizardStep2.clickButtonContinue();
                await wizardStep3.waitUntilDisplayedTitle(180);
                const result = await wizardStep3.getTitleText();
                return await assert.equal(result, TITLES.STEP3, "Page's title is incorrect");
            });
    })

    describe("Step#3: ", async function () {
        const invalidValues = {
            walletAddress: '0x56B2e3C3cFf7f3921D2e0F8B8e20d1eEc2926b',
            supply:'2000'
        }

        const validValues={
            mincap:'13',
            minRate:'1000',
            maxRate:'10000',
            supply:'500'
        }
        describe("Crowdsale data", async function () {

            test.it("Title is correct",
                async function () {
                    await wizardStep3.waitUntilDisplayedTitle(180)
                    const result = await wizardStep3.getTitleText();
                    return await assert.equal(result, TITLES.STEP3, "Page's title is incorrect");
                });

            test.it("Alert if user is going to leave TW",
                async function () {
                    const result = (!await wizardStep3.open('localhost:3000/?uiversion=2'))
                        && await wizardStep3.isPresentAlert()
                        && await wizardStep3.cancelAlert()
                        && await wizardStep3.waitUntilDisappearAlert()
                    return await assert.equal(result, true, "alert does not present if user wants to leave TW");
                });

            test.it("Button 'Continue' is disabled if data are wrong",
                async function () {
                    let result = await wizardStep3.isDisabledButtonContinue();
                    return await assert.equal(result, true, "Button 'Continue' is enabled");
                });

            test.it('Field Wallet address contains current metamask account address  ',
                async function () {
                    let result = await wizardStep3.getValueFieldWalletAddress();
                    result = (result === Owner.account.toString());
                    return await assert.equal(result, true, "Test FAILED. Wallet address does not match the metamask account address ");
                });

            test.it('Error message if wallet address is incorrect',
                async function () {
                    let result = await wizardStep3.fillWalletAddress(invalidValues.walletAddress)
                        && await wizardStep3.waitUntilHasValue('walletAddress')
                    await assert.equal(result, true, 'Cannot fill out the field');
                    result = await wizardStep3.getWarningText('walletAddress')
                    await assert.equal(result, 'Please enter a valid address', 'Incorrect error message');
                    await wizardStep3.fillWalletAddress(Owner.account.toString());
                });

            test.it('Checkbox gasprice \'Safe\' by default ',
                async function () {
                    const result = await wizardStep3.isSelectedCheckboxGasSafe()
                        && !await wizardStep3.isSelectedCheckboxGasNormal()
                        && !await wizardStep3.isSelectedCheckboxGasFast()
                        && !await wizardStep3.isSelectedCheckboxGasCustom()
                        && !await wizardStep3.isDisplayedFieldGasCustom()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Safe'  by default ");
                });

            test.it('User is able to set checkbox gasprice \'Normal\'',
                async function () {
                    const result = await wizardStep3.clickCheckboxGasNormal()
                        && await wizardStep3.isSelectedCheckboxGasNormal()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Normal' isn\'t selected ");
                });

            test.it('User is able to set checkbox gasprice \'Safe\'',
                async function () {
                    const result = await wizardStep3.clickCheckboxGasSafe()
                        && await wizardStep3.isSelectedCheckboxGasSafe()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Safe' isn\'t selected ");
                });

            test.it('Field \'Gas price custom\' isn\'t displayed if checkbox gasprice \'Custom\' isn\'t selected ',
                async function () {
                    const result = await wizardStep3.isDisplayedFieldGasCustom()
                    return await assert.equal(result, false, "Wizard step#3: checkbox gasprice 'Custom' isn\'t selected ");
                });

            test.it('User is able to set checkbox gasprice \'Fast\'',
                async function () {
                    const result = await wizardStep3.clickCheckboxGasFast()
                        && await wizardStep3.isSelectedCheckboxGasFast()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Fast' isn\'t selected ");
                });

            test.it('User is able to set "Custom Gasprice" checkbox',
                async function () {
                    const result = await wizardStep3.clickCheckboxGasCustom()
                        && await wizardStep3.isSelectedCheckboxGasCustom()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Custom' isn\'t selected ");
                });

            test.it('Field \'Gas price custom\' displayed if checkbox gasprice \'Custom\'is selected ',
                async function () {
                    const result = await wizardStep3.isDisplayedFieldGasCustom()
                    return await assert.equal(result, true, "Wizard step#3: checkbox gasprice 'Custom' isn\'t selected ");
                });

            test.it('Field \'Gas price custom\' has correct placeholder ',
                async function () {
                    const result = await wizardStep3.getValueFieldGasCustom()
                    return await assert.equal(result, placeholder.gasCustom, "Wizard step#3: checkbox gasprice 'Custom' isn\'t selected ");
                });

            test.it("Error message if Field 'Gas price custom' is empty",
                async function () {
                    let result = await wizardStep3.fillGasPriceCustom(' ')
                        && await wizardStep3.waitUntilHasValue('gasPrice')
                        && await Utils.delay(2000)
                    await assert.equal(result, true, 'Cannot fill out the field');
                    result = await wizardStep3.getWarningText('gasPrice')
                    await assert.equal(result, 'Should be greater or equal than 0.1', 'Incorrect error message');
                });

            test.it('User is able to fill out the CustomGasprice field with valid value',
                async function () {
                    const result = await wizardStep3.fillGasPriceCustom(newValue.customGas);
                    return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to fill "Custom Gasprice" with valid value');
                });

            test.it('no error message if CustomGasprice field has valid value',
                async function () {
                    const result = await wizardStep3.getWarningText('gasPrice')
                    await assert.equal(result, '', 'Unexpected error message');
                });

            test.it.skip ("Checkbox 'Burn express' is 'No' by default",
                async function () {

                 const result = await wizardStep3.isSelectedCheckboxBurnNo()
                        && ! await wizardStep3.isSelectedCheckboxBurnYes();
                    return await assert.equal(result, true, "Checkbox 'Burn express' isn't 'No' by default ");
                });

            test.it.skip ("User is able to set checkbox 'Burn express' to  'Yes'",
                async function () {
                    const result = await wizardStep3.clickCheckboxBurnExcessYes()
                        && await wizardStep3.isSelectedCheckboxBurnYes()
                        && !await wizardStep3.isSelectedCheckboxBurnNo()
                    return await assert.equal(result, true, "can't switch checkbox 'Burn express' to 'Yes'");
                });
        })

        describe("Tier#1: ", async function () {
            const invalidValues = {
                nameLong: 'qertyuiopasdfghjklzxcvbnmqwertyui'
            }
            test.it("Field 'Mincap' has placeholder 0 ",
                async function () {
                    const result = await tierPage.getValueFieldMinCap();
                    return await assert.equal(result, placeholder.mincap, "field 'Mincap' has incorrect placeholder");
                });

            test.it.skip("Error message if field 'Mincap' is empty",
                async function () {
                    const tier = tierPage
                    tier.tier.minCap = ' '
                    let result = await tier.fillMinCap(1)
                        && await Utils.delay(2000)
                    await assert.equal(result, true, 'Cannot fill out the field');
                    result = await tier.getWarningText()
                    await assert.equal(result, 'Please enter a valid number greater or equal than 0', 'incorrect error message');
                });

            test.it("User is able to fill out field 'Mincap' with valid data",
                async function () {
                    const tier = tierPage
                    tier.tier.minCap = validValues.mincap
                    const result = await tierPage.fillMinCap();
                    return await assert.equal(result, true, "user isn't able to fill out field 'Mincap' with valid data");
                });

            test.it("User is able to fill out field 'Min rate' with valid data",
                async function () {
                    tierPage.tier.minRate = validValues.minRate
                    const result = await tierPage.fillMinRate();
                    return await assert.equal(result, true, "user isn't able to fill out field 'Min rate' with valid data");
                });

            test.it("User is able to fill out field 'Max rate' with valid data",
                async function () {
                    tierPage.tier.maxRate = validValues.maxRate
                    const result = await tierPage.fillMaxRate();
                    return await assert.equal(result, true, "user isn't able to fill out field 'Maxrate' with valid data");
                });

            test.it("User is able to fill out field 'Supply' with valid data",
                async function () {
                    tierPage.tier.supply = validValues.supply;
                    let result = await tierPage.fillSupply();
                    return await assert.equal(result, true, "user is able to fill out field 'Supply' with valid data");
                });

            test.it.skip("Whitelist container isn't displayed if checkbox 'Whitelist enabled' is 'No'",
                async function () {
                    const result = await tierPage.isDisplayedWhitelistContainer();
                    return await assert.equal(result, false, "Unexpected whitelist container is displayed");
                });

            test.it.skip("User is able to set checkbox 'Enable whitelisting Yes'",
                async function () {
                    const result = await tierPage.clickCheckboxWhitelistYes()
                        && await tierPage.isSelectedCheckboxWhitelistYes()
                        && !await tierPage.isSelectedCheckboxWhitelistNo()
                    return await assert.equal(result, true, "Checkbox 'Enable whitelisting Yes' isn't selected ");
                });

            test.it.skip("Whitelist container is presented if checkbox 'Enable whitelisting Yes' is selected",
                async function () {
                    const result = await tierPage.isDisplayedWhitelistContainer();
                    return await assert.equal(result, true, "Whitelist container isn't displayed");
                });

            test.it.skip("Field 'Min cap' is disabled if whitelist enabled",
                async function () {
                    const tierNumber = 1;
                    const result = await tierPage.isDisabledFieldMinCap(tierNumber);
                    return await assert.equal(result, true, "field 'Min cap' is  disabled if whitelist enabled");
                });

            test.it.skip("User is able to download CSV file with whitelisted addresses",
                async function () {
                    const fileName = "./public/whitelistAddressesTestValidation.csv";
                    const result = await tierPage.uploadWhitelistCSVFile(fileName)
                        && await tierPage.waitUntilShowUpPopupConfirm(180)
                    return await assert.equal(result, true, "user isn't able to download CVS file with whitelisted addresses");
                });

            test.it.skip("Check validator for *.csv files with whitelisted addresses",
                async function () {
                    const text = await tierPage.getTextPopup()
                    return await assert.equal(text, TEXT.WHITELIST_VALIDATOR, "validator's message is incorrect")
                });

            test.it.skip("Number of added whitelisted addresses is zero",
                async function () {
                    await tierPage.clickButtonOk()
                    const shouldBe = 0;
                    const inReality = await tierPage.amountAddedWhitelist(15);
                    return await assert.equal(shouldBe, inReality, "number of added whitelisted addresses isn't correct");
                });

            test.it.skip("User isn't able to download CSV file with more than 50 whitelisted addresses",
                async function () {
                    const fileName = "./public/whitelistedAddresses61.csv";
                    const result = await tierPage.uploadWhitelistCSVFile(fileName);
                    return await assert.equal(result, true, "user is able to download CVS file with more than 50 whitelisted addresses");
                });

            test.it.skip("Popup window is displayed if number of whitelisted addresses greater than 50",
                async function () {
                    const result = await tierPage.waitUntilShowUpPopupConfirm(100)
                    return await assert.equal(result, true, "no popup if number of whitelisted addresses greater than 50");
                });

            test.it.skip("Popup has correct text",
                async function () {
                    const text = await tierPage.getTextPopup()
                    await assert.equal(text, TEXT.WHITELIST_MAX_REACHED, "popup's text is  incorrect")
                });

            test.it.skip("Confirm popup",
                async function () {
                    const result = await wizardStep3.clickButtonOk();
                    return await assert.equal(result, true, "button 'Ok' doesn't present")
                });

            test.it.skip('Number of added whitelisted addresses is correct, data is valid',
                async function () {
                    const shouldBe = 50;
                    const inReality = await tierPage.amountAddedWhitelist();
                    return await assert.equal(shouldBe, inReality, "number of added whitelisted addresses isn't correct");
                });

            test.it.skip("Field 'Supply' disabled if whitelist added",
                async function () {
                    const result = await tierPage.isDisabledFieldSupply();
                    return await assert.equal(result, true, "field 'Min cap' is  disabled if whitelist is enabled");
                });

            test.it.skip('User is able to bulk delete all whitelisted addresses ',
                async function () {
                    const result = await tierPage.clickButtonClearAll()
                        && await tierPage.waitUntilShowUpPopupConfirm(180)
                        && await tierPage.clickButtonYesAlert();
                    return await assert.equal(result, true, "user is not able to bulk delete all whitelisted addresses");
                });

            test.it.skip("Field 'Supply' enabled if whitelist was deleted",
                async function () {
                    await Utils.delay(2000)
                    const result = await tierPage.isDisabledFieldSupply();
                    return await assert.equal(result, false, "field 'Supply' is disabled ");
                });

            test.it.skip('User is able sequental to add several whitelisted addresses  ',
                async function () {
                    const result = await wizardStep3.refresh()//for prevent ElementNotVisibleError
                        && (await reservedTokensPage.isPresentAlert() ? await reservedTokensPage.acceptAlert() : true)
                        && await reservedTokensPage.waitUntilDisappearAlert()
                        && await reservedTokensPage.waitUntilLoaderGone()
                        && await tierPage.fillWhitelist();
                    return await assert.equal(result, true, "user isn't able to add several whitelisted addresses");
                });

            test.it.skip('User is able to remove one whitelisted address',
                async function () {
                    const beforeRemoving = await tierPage.amountAddedWhitelist();
                    const numberAddressForRemove = 1;
                    await tierPage.removeWhiteList(numberAddressForRemove - 1);
                    const afterRemoving = await tierPage.amountAddedWhitelist();
                    return await assert.equal(beforeRemoving, afterRemoving + 1, "User is NOT able to remove one whitelisted address");
                });
        })

        describe.skip("Check persistant", async function () {

            test.it.skip("Move back/forward - page keep state",
                async function () {
                    const result = await wizardStep3.goBack()
                        && await wizardStep2.waitUntilDisplayedFieldName()
                        && await Utils.delay(5000)
                        && await wizardStep3.goForward()
                        && await wizardStep1.waitUntilLoaderGone()
                        && await wizardStep3.waitUntilDisplayedFieldWalletAddress()
                    await assert.equal(result, true, "Page crashed after moving back/forward");
                    await assert.equal(await wizardStep3.isSelectedCheckboxGasCustom(), true, "Checkbox gasprice 'Custom' lost state after moving back/forward");
                    await assert.equal(await wizardStep3.getValueFieldGasCustom(), newValue.customGas, "field 'Gas Custom' lost value after moving back/forward");
                    await assert.equal(await wizardStep3.getValueFieldWalletAddress(), Owner.account, "field 'Wallet address' lost value after moving back/forward");
                    tierPage.number = 0
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyNo(), false, "Tier#" + tierPage.number + " Checkbox 'Allow modifying Yes' lost state after moving back/forward");
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyYes(), true, "Tier#" + tierPage.number + " Checkbox 'Allow modifying No' lost state after moving back/forward");

                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistYes(), true, "Tier#" + tierPage.number + " Checkbox 'Enable whitelist Yes' lost state after moving back/forward");
                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistNo(), false, "Tier#" + tierPage.number + "Checkbox 'Enable whitelist No' lost state after moving back/forward");

                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier1.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier1.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier1.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldMinCap(), 0, "Tier#" + tierPage.number + " field 'Mincap' lost value after moving back/forward");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), true, "Tier#" + tierPage.number + " field 'Mincap' became enabled after moving back/forward");
                    tierPage.number = 1;
                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier2.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier2.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier2.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after moving back/forward");
                    await assert.equal(await tierPage.getValueFieldMinCap(), newValue.tier2.mincap, "Tier#" + tierPage.number + " field 'Mincap' lost value after moving back/forward");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), false, "Tier#" + tierPage.number + " field 'Mincap' became disabled after moving back/forward");
                });

            test.it("Alert is displayed if reload the page",
                async function () {
                    const result = await wizardStep3.refresh()
                        && await wizardStep3.waitUntilLoaderGone()
                        && await Utils.delay(2000)
                        && await wizardStep2.isPresentAlert()
                        && await wizardStep2.acceptAlert()
                    return await assert.equal(result, true, "alert does not present");
                });

            test.it("Reload - page keep state of checkbox 'Whitelist with mincap'",
                async function () {
                    const result = await wizardStep3.waitUntilDisplayedFieldWalletAddress()
                    await assert.equal(result, true, "Page crashed after reloading");
                    await assert.equal(await wizardStep3.isSelectedCheckboxGasCustom(), true, "Checkbox gasprice 'Custom' lost state after reloading");
                    await assert.equal(await wizardStep3.getValueFieldGasCustom(), newValue.customGas, "field 'Gas Custom' lost value after reloading");
                    await assert.equal(await wizardStep3.getValueFieldWalletAddress(), Owner.account, "field 'Wallet address' lost value after reloading");
                    tierPage.number = 0
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyNo(), false, "Tier#" + tierPage.number + " Checkbox 'Allow modifying Yes' lost state after reloading");
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyYes(), true, "Tier#" + tierPage.number + " Checkbox 'Allow modifying No' lost state after reloading");

                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistYes(), true, "Tier#" + tierPage.number + " Checkbox 'Enable whitelist Yes' lost state after reloading");
                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistNo(), false, "Tier#" + tierPage.number + "Checkbox 'Enable whitelist No' lost state after reloading");

                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier1.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier1.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier1.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldMinCap(), 0, "Tier#" + tierPage.number + " field 'Mincap' lost value after reloading");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), true, "Tier#" + tierPage.number + " field 'Mincap' became enabled after reloading");
                    tierPage.number = 1;
                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier2.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier2.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier2.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after reloading");
                    await assert.equal(await tierPage.getValueFieldMinCap(), newValue.tier2.mincap, "Tier#" + tierPage.number + " field 'Mincap' lost value after reloading");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), false, "Tier#" + tierPage.number + " field 'Mincap' became disabled after reloading");

                });

            test.it("Change network - page keep state of checkbox 'Whitelist with mincap'",
                async function () {
                    const result = await Investor1.setWalletAccount()
                        && await wizardStep1.waitUntilLoaderGone()
                        && await Owner.setWalletAccount()
                        && await wizardStep3.waitUntilDisplayedFieldWalletAddress()
                    await Utils.delay(2000)
                    await assert.equal(result, true, "Page crashed after go back/forward");
                    await assert.equal(await wizardStep3.isSelectedCheckboxGasCustom(), true, "Checkbox gasprice 'Custom' lost state after changing network");
                    await assert.equal(await wizardStep3.getValueFieldGasCustom(), newValue.customGas, "field 'Gas Custom' lost value after changing network");
                    await assert.equal(await wizardStep3.getValueFieldWalletAddress(), Owner.account, "field 'Wallet address' lost value after changing network");
                    tierPage.number = 0
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyNo(), false, "Tier#" + tierPage.number + " Checkbox 'Allow modifying Yes' lost state after changing network");
                    await assert.equal(await tierPage.isSelectedCheckboxAllowModifyYes(), true, "Tier#" + tierPage.number + " Checkbox 'Allow modifying No' lost state after changing network");

                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistYes(), true, "Tier#" + tierPage.number + " Checkbox 'Enable whitelist Yes' lost state after changing network");
                    await assert.equal(await tierPage.isSelectedCheckboxWhitelistNo(), false, "Tier#" + tierPage.number + "Checkbox 'Enable whitelist No' lost state after changing network");

                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier1.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier1.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier1.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldMinCap(), 0, "Tier#" + tierPage.number + " field 'Mincap' lost value after changing network");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), true, "Tier#" + tierPage.number + " field 'Mincap' became enabled after changing network");
                    tierPage.number = 1;
                    await assert.equal(await tierPage.getValueFieldSetupName(), newValue.tier2.name, "Tier#" + tierPage.number + " field 'Setup name' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldRate(), newValue.tier2.rate, "Tier#" + tierPage.number + " field 'Rate' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldSupply(), newValue.tier2.supply, "Tier#" + tierPage.number + " field 'Supply' lost value after changing network");
                    await assert.equal(await tierPage.getValueFieldMinCap(), newValue.tier2.mincap, "Tier#" + tierPage.number + " field 'Mincap' lost value after changing network");
                    await assert.equal(await tierPage.isDisabledFieldMinCap(), false, "Tier#" + tierPage.number + " field 'Mincap' became disabled after changing network");
                });

            test.it('User is able to proceed to Step4 by clicking button Continue ',
                async function () {
                    let result
                    try {
                        result = await wizardStep3.clickButtonContinue()

                            && await wizardStep4.waitUntilDisplayedModal(60)
                    }
                    catch ( err ) {
                        console.log(err)
                        await wizardStep4.acceptAlert()
                    }
                    return await assert.equal(result, true, "Modal isn't displayed");
                });
        })
    })

});
