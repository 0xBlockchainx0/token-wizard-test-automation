
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');

////////////////////////////////////////////////////////
const deployRegistry= require("../contracts/DeployRegistry.js");
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
const Web3 = require('web3');

test.describe('POA token-wizard. Test suite #1', async function() {
    this.timeout(2400000);//400 min

    var driver;

///////////// SET #1 ///////////////////////////////////////////////////////
    var user4_F16AFile='./users/user4_F16A.json';//Foreign Owner
    var user8545_56B2File='./users/user8545_56B2.json';//Owner
	var user8545_F16AFile='./users/user8545_F16A.json';//Investor



	var owner;
    var investor;
    var Owner;
    var Investor;

    //var scenario="./scenarios/T1RyWn_0008.json";//'./scenarios/simple.json';
    var scenario;
    var mtMask;
    var crowdsale=new Crowdsale();
    var b=false;
    var balance;
    var newBalance;
    var contribution;
	var flagCrowdsale;
	var flagDistribute=false;
	var s;
	var ganache;

 ///////////////////////////////////////////////////////////////////////

    test.before(async function() {

	   //ganache=Utils.runGanache();
	    //await driver.sleep(5000);//for ganache
	    scenario = './scenarios/testSuite1.json';


	    logger.info("Scenario: "+scenario);


	    driver = await Utils.startBrowserWithMetamask();
	    flagCrowdsale=false;
	     Owner = new User (driver,user8545_56B2File);


	    Investor = new User (driver,user8545_F16AFile);
	    await  Utils.sendEth(Owner,30);
	    await Utils.sendEth(Investor,30);
	  // await deployRegistry(Owner.account);

		logger.info("Roles:");
	    logger.info("Owner = "+Owner.account);
	    logger.info("Owner's balance:"+await Utils.getBalance(Owner)/1e18);
	    logger.info("Investor = "+Investor.account);
	    logger.info("Investor's balance:"+await Utils.getBalance(Investor)/1e18);


        mtMask = new MetaMask(driver);
        await mtMask.open();//return activated Metamask and empty page

    });

    test.after(async function() {
        // Utils.killProcess(ganache);
	     await Utils.sendEmail(tempOutputFile);
	     //driver.sleep(10000);
        let outputPath=Utils.getOutputPath();
        outputPath=outputPath+"/result"+Utils.getDate();
        await fs.ensureDirSync(outputPath);
        await fs.copySync(tempOutputPath,outputPath);
        //await fs.remove(tempOutputPath);
	    await driver.quit();
    });
//////////////////////////////////////////////////////////////////////////////


    test.it('Owner  can create crowdsale,one whitelist address,two reserved addresses, not modifiable', async function() {
        b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        crowdsale = await owner.createCrowdsale(scenario);
        logger.info("TokenAddress:  " + crowdsale.tokenAddress);
        logger.info("ContractAddress:  " + crowdsale.contractAddress);
        logger.info("url:  " + crowdsale.url);
        b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
	    flagCrowdsale=b;
        assert.equal(b, true, 'Test FAILED. ');

        logger.info("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");
       // if (!b) {console.log("Crowdsale didn't created. Can't proceed"); throw("Crowdsale didn't created. Can't proceed");}

    });

	test.it('Not whitelisted investor can NOT buy',
		async function () {

			assert.equal(flagCrowdsale,true);
			b=true;
			investor=Owner;//whitelisted#2 for tier#2
			await investor.setMetaMaskAccount();
			await investor.open(crowdsale.url);
			b=await investor.contribute(crowdsale.currency.tiers[0].whitelist[0].min*2);
			assert.equal(b, false, 'Test FAILED.Not whitelisted investor can  buy ');
			logger.error('Test PASSED. Not whitelisted investor can NOT buy');

		});


	test.it('Whitelisted investor can NOT buy less than minCap in first transaction', async function() {
	    assert.equal(flagCrowdsale,true);
	     b=true;
        investor=Investor;
        await investor.setMetaMaskAccount();
        await investor.open(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.minCap * 0.5);
        assert.equal(b, false, "Test FAILED.Investor can buy less than minCap in first transaction");
        logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

    });



    test.it('Whitelisted investor can buy amount = minCap', async function() {
	    assert.equal(flagCrowdsale,true);
    	b=false;
        //await investor.setMetaMaskAccount();
        //crowdsale.url="https://wizard.poa.network/invest?addr=0x87be99f4F7e0CA13E878202232CA2eDA93c449b7&networkID=77";
        //crowdsale.currency.minCap=1;
	    investor=Investor;
        await investor.open(crowdsale.url);
        balance=await investor.getBalanceFromPage(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.minCap);
        //b = await investor.contribute(1);

        newBalance=await investor.getBalanceFromPage(crowdsale.url);
        b=b&&((newBalance-balance)==crowdsale.currency.minCap);
        //b=b&&((newBalance-balance)==1);
        logger.info("minCap: Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
        assert.equal(b, true, "Test FAILED.Investor can NOT buy minCap");
        logger.warn("Test PASSED. Investor can buy minCap");

    });

	test.it('Whitelisted investor can NOT buy more than total supply in tier', async function() {
		assert.equal(flagCrowdsale,true);
		b=true;
		investor=Investor;
		await investor.open(crowdsale.url);
		b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
		assert.equal(b, false, "Test FAILED.Investor can  buy more than supply in tier");
		logger.warn("Test PASSED. Investor can NOT contribute more than supply in tier");

	});

    test.it('Whitelisted investor can buy less than minCap after first transaction', async function() {
	    assert.equal(flagCrowdsale,true);
	      b=false;
	    investor=Investor;
        await investor.open(crowdsale.url);
        balance=await investor.getBalanceFromPage(crowdsale.url);
        contribution=crowdsale.currency.minCap/2;
        b = await investor.contribute(contribution);
        newBalance=await investor.getBalanceFromPage(crowdsale.url);
        b=b&&((newBalance-balance)==contribution);
        logger.info("After first:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
        assert.equal(b, true, "Test FAILED. Investor can NOT buy less than minCap after first transaction");
        logger.warn("Test PASSED. Investor can buy less than minCap after first transaction" );

    });
    test.it('Owner can not modify end time if allow modify is false', async function() {
	    assert.equal(flagCrowdsale,true);

	    b=true;
	    owner = Owner;//Owner
	    await owner.setMetaMaskAccount();//77   5b2
	    await owner.openManagePage(crowdsale);
	    let newTime=Utils.getTimeNear(1200000,"utc");//"12:30";
	    let newDate=Utils.getDateNear(1200000,"utc");//"21/03/2020";
	    b=await owner.changeEndTime(crowdsale,1,newDate,newTime);
	    s=await owner.getEndTime(1);//# of tier, mngPage should be open
	    b=b&&Utils.compare(s,newDate,newTime);
	    assert.equal(b, false, 'Test FAILED. Owner can  modify start time of tier#1 if allow modify is false');
	    logger.info('Test PASSED. Owner can NOT modify start time if allow modify is false');



    });

    test.it('Owner can NOT distribute before  all tokens are sold', async function() {
	    assert.equal(flagCrowdsale,true);
        b=true;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");
        logger.warn("Owner can NOT distribute before  all tokens are sold " );
    });

    test.it('Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended ', async function() {
	    assert.equal(flagCrowdsale,true);
        b=true;
	    owner=Owner;
        b = await owner.finalize(crowdsale);
        assert.equal(b, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
        logger.warn("Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended" );
    });

    test.it('Whitelisted investor can buy total supply for current tier', async function() {
	    assert.equal(flagCrowdsale,true);
        b=false;
        investor=Investor;
        await investor.setMetaMaskAccount();
        await investor.open(crowdsale.url);
        balance=await investor.getBalanceFromPage(crowdsale.url);
        contribution=crowdsale.currency.tiers[0].supply-balance;
        b = await investor.contribute(contribution);
        newBalance=await investor.getBalanceFromPage(crowdsale.url);
        b=b&&((newBalance-balance)==contribution);
        logger.info("Max:Old balance="+balance+"  New balance="+newBalance+" BBB="+b);
        assert.equal(b, true, "Test FAILED. Investor can NOT contribute maximum.");
        logger.warn("Test PASSED. Investor can contribute maximum.");

    });
    test.it('NOT Owner can NOT distribute (after all tokens were sold)', async function() {
	    assert.equal(flagCrowdsale,true);
    	b=true;
        owner=Investor;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, false, "Test FAILED.NOT Owner can  distribute ");
        logger.warn("Test PASSED. NOT Owner can NOT distribute " );

    });
    test.it('Owner can distribute (after all tokens were sold)', async function() {
	    assert.equal(flagCrowdsale,true);

    	b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
        logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");
	    flagDistribute=true;
    });

    test.it('Reserved addresses receive correct amount of tokens after distribution)', async function() {
	    assert.equal(flagCrowdsale,true);
	    owner=Owner;

	    newBalance=await owner.getTokenBalance(crowdsale);
	    balance=
		    crowdsale.currency.reservedTokens[0].value*crowdsale.currency.tiers[0].supply/100+
		    crowdsale.currency.reservedTokens[1].value;
	    logger.info("Investor should receive  = "+balance);
	    logger.info("Investor has received balance = "+newBalance);
	    assert.equal(balance, newBalance/1e18,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance );
	    logger.error("Test PASSED.'Investor has receive right amount of tokens after finalization ");

    });

    test.it('NOT Owner can NOT finalize (after all tokens were sold)', async function() {
	    assert.equal(flagCrowdsale,true);
    	b=true;
        owner=Investor;
        await owner.setMetaMaskAccount();
        b = await owner.finalize(crowdsale);
        assert.equal(b, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");
        logger.warn("Test PASSED. NOT Owner can NOT finalize (after all tokens were sold) " );

    });

    test.it('Owner can  finalize (after all tokens were sold)', async function() {
	    assert.equal(flagCrowdsale,true);
	    assert.equal(flagDistribute,true);
    	b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.finalize(crowdsale);
        assert.equal(b, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");
        logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

    });


    test.it('Investor receive correct amount of tokens after finalization)', async function() {
	    assert.equal(flagCrowdsale,true);
	    investor=Investor;
	    newBalance=await investor.getTokenBalance(crowdsale);
	    balance=crowdsale.currency.tiers[0].supply;
	    logger.info("Investor should receive  = "+balance);
	    logger.info("Investor has received balance = "+newBalance);
	    assert.equal(balance, newBalance/1e18,"Test FAILED.'Investor has received "+newBalance+" tokens instead "+ balance )
	    logger.warn("Test PASSED.'Investor has receive right amount of tokens after finalization ");


    });




});
