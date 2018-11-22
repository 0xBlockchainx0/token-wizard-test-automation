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
    describe("Create crowdsale", async function () {

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
    describe("Publish page", async function () {
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
                    return await assert.equal(crowdsaleDutchSimple.ticker, values[1], 'Publish page: ticker is incorrect ');
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
    describe("Crowdsale page:", async function () {
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


    describe ('Step#1 ', async function () {

        test.it('User is able to click DutchAuction checkbox ',
            async function () {
                let result = await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                    && await wizardStep1.clickCheckboxDutchAuction();
                return await assert.equal(result, true, "User is not able to to click DutchAuction checkbox");
            });
        test.it.skip('Go back - page keep state of checkbox \'Dutch auction\'',
            async function () {
                const result = await wizardStep1.goBack()
                    && await wizardStep1.waitUntilLoaderGone()
                    && await welcomePage.isDisplayedButtonChooseContract()
                    && await wizardStep1.goForward()
                    && await wizardStep1.waitUntilLoaderGone()
                    && await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                return await assert.equal(result, true, "Checkbox changed after go back");
            });

        test.it.skip('Refresh - page keep state of checkbox \'Dutch auction\' ',
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await wizardStep1.refresh()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                return await assert.equal(result, true, "Checkbox changed after refresh");
            });

        test.it('Change network - page keep state of checkbox \'Dutch auction\' ',
            async function () {
                const result = await wizardStep1.clickCheckboxDutchAuction()
                    && await Investor1.setWalletAccount()
                    && await wizardStep1.waitUntilLoaderGone()
                    && await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                    && await wizardStep1.isSelectedCheckboxDutchAuction()
                    && await Owner.setWalletAccount()
                    && await wizardStep1.waitUntilLoaderGone()
                return await assert.equal(result, true, "Checkbox changed after changing network");
            });

        test.it('User is able to open Step2 by clicking button Continue',
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
                let result = await wizardStep2.isDisplayedFieldName();
                return await assert.equal(result, true, "User is not able to open Step2 by clicking button Continue");
            });
    })

    describe.skip('Step#2 ', async function () {
        const invalidValues = {
            name: '012345678901234567790123456789f',
            ticker: 'qwe$#',
            decimals: '19',
            supply: '0'
        }
        test.it('Button \'Back\' opens Step#1',
            async function () {
                const result = await wizardStep2.clickButtonBack()
                    && await wizardStep1.waitUntilDisplayedCheckboxDutchAuction()
                await assert.equal(result, true, 'Incorrect behavior of button \'Back\'')
            });
        test.it('user is able to open Step2 by clicking button Continue',
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
                return await assert.equal(result, true, "User is not able to open Step2 by clicking button Continue");
            });
        test.it('Error message if name longer than 30 symbols',
            async function () {
                await wizardStep2.fillName(invalidValues.name);
                const result = await wizardStep2.getWarningText('name')
                return await assert.equal(result, 'Please enter a valid name between 1-30 characters', 'Incorrect error message');
            });
        test.it('Error message if name is empty',
            async function () {
                await wizardStep2.fillName('');
                const result = await wizardStep2.getWarningText('name')
                return await assert.equal(result, 'This field is required', 'Incorrect error message');
            });
        test.it('User able to fill out name field with valid data',
            async function () {
                const result = await wizardStep2.fillName(newValue.name);
                return await assert.equal(result, true, "User able to fill Name field with valid data ");
            });
        test.it('No error message if name is valid',
            async function () {
                const result = await wizardStep2.getWarningText('name')
                return await assert.equal(result, '', 'unexpected error message');
            });

        test.it('Error message if ticker longer than 5 symbols',
            async function () {
                await wizardStep2.fillTicker(invalidValues.name);
                const result = await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, 'Please enter a valid ticker between 1-5 characters', 'Incorrect error message');
            });

        test.it('Error message if ticker contains special symbols',
            async function () {
                await wizardStep2.fillTicker(invalidValues.ticker);
                const result = await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, 'Only alphanumeric characters', 'Incorrect error message');
            });

        test.it('Error message if ticker is empty',
            async function () {
                await wizardStep2.fillTicker('');
                await wizardStep2.refresh()
                const result = await wizardStep2.getWarningText('ticker')
                return await assert.equal(result, 'This field is required', 'Incorrect error message');
            });

        test.it('User able to fill out field Ticker with valid data',
            async function () {
                let result = await wizardStep2.fillTicker(newValue.ticker);
                return await assert.equal(result, true, "User is not  able to fill out field Ticker with valid data ");
            });

        test.it('Decimals field has placeholder 18',
            async function () {
                const result = await wizardStep2.getValueFieldDecimals()
                return await assert.equal(result, placeholder.decimals, 'Incorrect placeholder');
            });
        test.it('Error message if decimals more than 18',
            async function () {
                await wizardStep2.fillDecimals(invalidValues.decimals);
                const result = await wizardStep2.getWarningText('decimals')
                return await assert.equal(result, 'Should not be greater than 18', 'Incorrect error message');
            });
        test.it('Error message if decimals is empty',
            async function () {
                await wizardStep2.fillDecimals('');
                const result = await wizardStep2.getWarningText('decimals')
                return await assert.equal(result, 'This field is required', 'Incorrect error message');
            });
        test.it('User able to fill out decimals field with valid data',
            async function () {
                let result = await wizardStep2.fillDecimals(newValue.decimals);
                return await assert.equal(result, true, "User is not able to fill Decimals  field with valid data ");
            });

        test.it.skip('Go back - page keep state of each field',
            async function () {
                const result = await wizardStep2.goBack()
                    && await wizardStep1.waitUntilDisplayedCheckboxWhitelistWithCap()
                    && await wizardStep1.goForward()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "page isn\'t loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "Field name changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "Field decimals changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "Field ticker changed");
            });

        test.it('Change network - page keep state of each field',
            async function () {
                let result = await Investor1.setWalletAccount()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName()
                await assert.equal(result, true, " Wizard step#2: page isn\'t loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "Field name changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "Field decimals changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "Field ticker changed");

                result = await Owner.setWalletAccount()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilHasValueFieldName()
                await assert.equal(result, true, " Wizard step#2: page isn\'t loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "Field name changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "Field decimals changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "Field ticker changed");

            });
        test.it('Supply field has placeholder 0',
            async function () {
                const result = await wizardStep2.getValueFieldSupply()
                return await assert.equal(result, placeholder.totalSupply, 'Incorrect placeholder');
            });
        test.it('Error message if total supply is 0',
            async function () {
                await wizardStep2.fillSupply(invalidValues.supply);
                const result = await wizardStep2.getWarningText('supply')
                return await assert.equal(result, 'Please enter a valid number greater than 0', 'Incorrect error message');
            });

        test.it('User able to fill out Total supply field with valid data',
            async function () {
                let result = await wizardStep2.fillSupply(newValue.totalSupply);
                return await assert.equal(result, true, "User is not able to fill Total supply  field with valid data ");
            });

        test.it('Refresh - page keep state of each field',
            async function () {
                const result = await wizardStep2.refresh()
                    && await wizardStep2.waitUntilLoaderGone()
                    && await wizardStep2.waitUntilDisplayedFieldName()
                    && await wizardStep2.waitUntilHasValueFieldName();
                await assert.equal(result, true, "Test FAILED. Wizard step#2: page isn\'t loaded");
                await assert.equal(await wizardStep2.getValueFieldName(), newValue.name, "Field name changed");
                await assert.equal(await wizardStep2.getValueFieldDecimals(), newValue.decimals, "Field decimals changed");
                await assert.equal(await wizardStep2.getValueFieldTicker(), newValue.ticker, "Field ticker changed");
                await assert.equal(await wizardStep2.getValueFieldSupply(), newValue.totalSupply, "Field supply changed");
            });

        test.it('Button Continue is displayed and enabled',
            async function () {
                let result = await wizardStep2.isDisplayedButtonContinue();
                return await assert.equal(result, true, "Button Continue disabled or not displayed  ");
            });
    })
    describe.skip('Step#3 ', async function () {
        test.it('User is able to open Step3 by clicking button Continue ',
            async function () {
                await wizardStep2.clickButtonContinue();
                await wizardStep3.waitUntilDisplayedTitle(180);
                let result = await wizardStep3.getTitleText();
                result = (result === wizardStep3.title);
                return await assert.equal(result, true, "Test FAILED. User is not able to open Step3 by clicking button Continue");
            });
        test.it('Field Wallet address contains current metamask account address  ',
            async function () {

                let result = await wizardStep3.getValueFieldWalletAddress();
                result = (result === Owner.account.toString());
                return await assert.equal(result, true, "Test FAILED. Wallet address does not match the metamask account address ");
            });

        test.it('Whitelist container present if checkbox "Whitelist enabled" is selected',
            async function () {
                let result = await tierPage.setWhitelisting()
                    && await tierPage.isDisplayedWhitelistContainer();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to set checkbox  'Whitelist enabled'");
            });
        test.it('Field minCap disabled if whitelist enabled ',
            async function () {
                let tierNumber = 1;
                let result = await tierPage.isDisabledFieldMinCap(tierNumber);
                return await assert.equal(result, true, "Test FAILED. Field minCap enabled if whitelist enabled");
            });
        test.it('User is able to fill out field "Supply" with valid data',
            async function () {
                tierPage.tier.supply = 69;
                let result = await tierPage.fillSupply();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
            });
        test.it('User is able to download CSV file with whitelisted addresses',
            async function () {
                let fileName = "./public/whitelistAddressesTestValidation.csv";
                let result = await tierPage.uploadWhitelistCSVFile(fileName)
                    && await wizardStep3.clickButtonOk();
                return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
            });

        test.it('Field Supply disabled if whitelist added ',
            async function () {
                let result = await tierPage.isDisabledFieldSupply();
                return await assert.equal(result, true, "Test FAILED. Field minCap disabled if whitelist enabled");
            });

        test.it('Number of added whitelisted addresses is correct, data is valid',
            async function () {
                let shouldBe = 5;
                let inReality = await tierPage.amountAddedWhitelist();
                return await assert.equal(shouldBe, inReality, "Test FAILED. Wizard step#3: Number of added whitelisted addresses is NOT correct");

            });

        test.it('User is able to bulk delete all whitelisted addresses ',
            async function () {
                let result = await tierPage.clickButtonClearAll()
                    && await tierPage.waitUntilShowUpPopupConfirm(180)
                    && await tierPage.clickButtonYesAlert();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
            });

        test.it('All whitelisted addresses are removed after deletion ',
            async function () {
                let result = await tierPage.amountAddedWhitelist(10);
                return await assert.equal(result, 0, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
            });

        test.it('Field Supply enabled if whitelist was deleted ',
            async function () {
                let result = await tierPage.isDisabledFieldSupply();
                return await assert.equal(result, false, "Test FAILED. Field minCap disabled if whitelist enabled");
            });

        test.it('User is able to fill out field "Supply" with valid data',
            async function () {
                tierPage.tier.supply = crowdsaleForUItests.totalSupply;
                let result = await tierPage.fillSupply();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to fill out field 'Supply' with valid data");
            });

        test.it('User is able to download CSV file with more than 50 whitelisted addresses',
            async function () {
                let fileName = "./public/whitelistedAddresses61.csv";
                let result = await tierPage.uploadWhitelistCSVFile(fileName);

                return await assert.equal(result, true, 'Test FAILED. Wizard step#3: User is NOT able to download CVS file with whitelisted addresses');
            });

        test.it('Alert present if number of whitelisted addresses greater 50 ',
            async function () {
                let result = await reservedTokensPage.waitUntilShowUpPopupConfirm(100)
                    && await reservedTokensPage.clickButtonOk();
                return await assert.equal(result, true, "Test FAILED.ClearAll button is NOT present");
            });

        test.it('Number of added whitelisted addresses is correct, data is valid',
            async function () {
                let shouldBe = 50;
                let inReality = await tierPage.amountAddedWhitelist();
                return await assert.equal(shouldBe, inReality, "Test FAILED. Wizard step#3: Number of added whitelisted addresses is NOT correct");

            });

        test.it('User is able to bulk delete all whitelisted addresses ',
            async function () {
                let result = await tierPage.clickButtonClearAll()
                    && await tierPage.waitUntilShowUpPopupConfirm(180)
                    && await tierPage.clickButtonYesAlert();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
            });
        test.it('User is able to add several whitelisted addresses one by one ',
            async function () {
                let result = await tierPage.fillWhitelist();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is able to add several whitelisted addresses");
            });

        test.it('User is able to remove one whitelisted address',
            async function () {
                let beforeRemoving = await tierPage.amountAddedWhitelist();
                let numberAddressForRemove = 1;
                await tierPage.removeWhiteList(numberAddressForRemove - 1);
                let afterRemoving = await tierPage.amountAddedWhitelist();
                return await assert.equal(beforeRemoving, afterRemoving + 1, "Test FAILED. Wizard step#3: User is NOT able to remove one whitelisted address");
            });

        test.it('User is able to bulk delete all whitelisted addresses ',
            async function () {
                let result = await tierPage.clickButtonClearAll()
                    && await tierPage.waitUntilShowUpPopupConfirm(180)
                    && await tierPage.clickButtonYesAlert()
                    && await tierPage.waitUntilLoaderGone();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to bulk delete all whitelisted addresses");
            });

        test.it("User is able to set 'Custom Gasprice' checkbox",
            async function () {

                let result = await wizardStep3.clickCheckboxGasCustom();
                return await assert.equal(result, true, "Test FAILED. User is not able to set 'Custom Gasprice' checkbox");

            });

        test.it("User is able to fill out the  'CustomGasprice' field with valid value",
            async function () {
                let customValue = 100;
                let result = await wizardStep3.fillGasPriceCustom(customValue);
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is NOT able to fill 'Custom Gasprice' with valid value");
            });

        test.it('User is able to set SafeAndCheapGasprice checkbox ',
            async function () {
                let result = await wizardStep3.clickCheckboxGasSafe();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: 'Safe and cheap' Gas price checkbox does not set by default");
            });

        test.it("User is able to fill out field 'minRate' with valid data",
            async function () {
                tierPage.tier.minRate = 100;
                let result = await tierPage.fillMinRate();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3:Tier#1: User is not able to fill out field 'minRate' with valid data");
            });
        test.it("User is able to fill out field 'maxRate' with valid data",
            async function () {
                tierPage.tier.maxRate = 10;
                let result = await tierPage.fillMaxRate();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3:Tier#1: User is not able to fill out field 'maxRate' with valid data");
            });

        test.it("Button 'Continue' disabled if minRate > maxRate ",
            async function () {
                let result = !await wizardStep3.isEnabledButtonContinue();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: Button 'Continue' enabled if minRate > maxRate");

            });
        test.it('User is able to fill out field maxRate with valid data ',
            async function () {
                tierPage.tier.maxRate = 1000;
                let result = await tierPage.fillMaxRate();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: User is not able to fill out field maxRate with valid data");
            });

        test.it("Button 'Continue' disabled if crowdsaleSupply>totalSupply",
            async function () {
                tierPage.tier.supply = crowdsaleForUItests.totalSupply + 1;
                let result = await tierPage.fillSupply()
                    && !await wizardStep3.isEnabledButtonContinue();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3: Button 'Continue' ensabled if crowdsaleSupply>totalSupply");

            });
        test.it('User is able to fill out field Supply with valid data ',
            async function () {
                tierPage.tier.supply = crowdsaleForUItests.totalSupply - 1;
                let result = await tierPage.fillSupply();
                return await assert.equal(result, true, "Test FAILED. Wizard step#3:Tier#1: User is not able to fill out field Supply with valid data");

            });
        test.it('User is able to proceed to Step4 by clicking button Continue ',
            async function () {
                let result = await wizardStep3.clickButtonContinue()
                    && await wizardStep4.waitUntilDisplayedModal(60);
                return await assert.equal(result, true, "Test FAILED. User is not able to open Step4 by clicking button Continue");
            });
    })

    describe.skip('Step#4 ', async function () {
        test.it('Alert present if user reload the page ',
            async function () {
                await wizardStep4.refresh();
                await driver.sleep(2000);
                let result = await wizardStep4.isPresentAlert();
                return await assert.equal(result, true, "Test FAILED.  Alert does not present if user refresh the page");
            });

        test.it('User is able to accept alert after reloading the page ',
            async function () {

                let result = await wizardStep4.acceptAlert()
                    && await wizardStep4.waitUntilDisplayedModal(80);
                return await assert.equal(result, true, "Test FAILED. Wizard step#4: Modal does not present after user has accepted alert");
            });

        test.it('Button SkipTransaction is  presented if user reject a transaction ',
            async function () {
                let result = await wallet.rejectTransaction()
                    && await wallet.rejectTransaction()
                    && await wizardStep4.isDisplayedButtonSkipTransaction();
                return await assert.equal(result, true, "Test FAILED. Wizard step#4: button'Skip transaction' does not present if user reject the transaction");
            });

        test.it('User is able to skip transaction ',
            async function () {

                let result = await wizardStep4.clickButtonSkipTransaction()
                    && await wizardStep4.waitUntilShowUpPopupConfirm(80)
                    && await wizardStep4.clickButtonYes();
                return await assert.equal(result, true, "Test FAILED.Wizard step#4:  user is not able to skip transaction");
            });

        test.it('Alert is presented if user wants to leave the wizard ',
            async function () {

                let result = await welcomePage.openWithAlertConfirmation();
                return await assert.equal(result, false, "Test FAILED. Wizard step#4: Alert does not present if user wants to leave the site");
            });

        test.it('User is able to stop deployment ',
            async function () {

                let result = await wizardStep4.waitUntilShowUpButtonCancelDeployment(80)
                    && await wizardStep4.clickButtonCancelDeployment()
                    && await wizardStep4.waitUntilShowUpPopupConfirm(80)
                    && await wizardStep4.clickButtonYes();

                return await assert.equal(result, true, "Test FAILED. Button 'Cancel' does not present");
            });
    })
    describe.skip('Others ', async function () {
        test.it('User is able to create crowdsale(scenarioDutchSimple.json),minCap,1 tier',
            async function () {
                let owner = Owner;
                assert.equal(await owner.setWalletAccount(), true, "Can not set Metamask account");
                let result = await owner.createDutchAuctionCrowdsale(crowdsaleDutchSimple);
                return await assert.equal(result, true, 'Test FAILED. Crowdsale has not created ');
            });
        test.it('Contribution page: should be alert if invalid proxyID in address bar',
            async function () {
                let wrongUrl = crowdsaleDutchSimple.url.substring(0, 50) + crowdsaleDutchSimple.url.substring(52, crowdsaleDutchSimple.length)
                let result = await contributionPage.open(wrongUrl)
                    && await contributionPage.waitUntilShowUpButtonOk()
                    && await contributionPage.clickButtonOk()
                return await assert.equal(result, true, 'Test FAILED. Contribution page: no alert if invalid proxyID in address bar');
            });

        test.it('Crowdsale page: should be alert if invalid proxyID in address bar',
            async function () {
                let owner = Owner;
                let wrongCrowdsale = crowdsaleDutchSimple;
                wrongCrowdsale.proxyAddress = crowdsaleDutchSimple.proxyAddress.substring(0, crowdsaleDutchSimple.proxyAddress.length - 5)
                let result = await owner.openCrowdsalePage(wrongCrowdsale)
                    && await contributionPage.waitUntilShowUpButtonOk()
                    && await contributionPage.clickButtonOk()
                return await assert.equal(result, true, 'Test FAILED. Crowdsale page: no alert if invalid proxyID in address bar');
            });
    })

});
