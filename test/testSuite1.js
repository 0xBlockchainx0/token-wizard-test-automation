const spread=require('../entity/SpreadSheet.js');
const SpreadSheet=spread.SpreadSheet;
webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
const fs = require('fs-extra');

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


test.describe('POA token-wizard. Test suite #1', async function() {
    this.timeout(2400000);//400 min

    var driver;

///////////// SET #1 ///////////////////////////////////////////////////////
    var user4_F16AFile='./users11/user4_F16A.json';//Foreign Owner
    var user77_56B2File='./users11/user77_56B2.json';//Owner
    var user4_40cAFile='./users11/user4_40cA.json';//Foreign Investor
    var user77_27F2File='./users11/user77_27F2.json';//Investor
	var user77_895BFile='./users11/user77_895B.json';//WalletAddress
	var user77_A5ecFile='./users11/user77_A5ec.json';//ReservedTokens#2
	var user77_c30bFile='./users11/user77_c30b.json';//ReservedTokens#1

	var user4_F16A;   //Foreign #1
    var user77_56B2;  //Owner
    var user4_40cA;   //Foreign #2
    var user77_27F2;  //Investor
	var user77_895B;//WalletAddress
	var user77_A5ec;//ReservedTokens#2
	var user77_c30b;//ReservedTokens#1
////////////// SET #2 ///////////////////////////////////////////////////////
	var user4_0e03File='./users12/user4_0e03.json';//Foreign #1
	var user77_A6C8File='./users12/user77_A6C8.json';//Owner
	var user4_4082File='./users12/user4_4082.json';//Foreign #2
	var user77_783CFile='./users12/user77_783C.json';//Investor
	var user77_45D9File='./users12/user77_45D9.json';//MainAddress
	var user77_9E96File='./users12/user77_9E96.json';//ReservedTokens#2
	var user77_ecDFFile='./users12/user77_ecDF.json';//ReservedTokens#1

	var user4_0e03;//Foreign #1
	var user77_A6C8;//Owner
	var user4_4082;//Foreign #2
	var user77_783C;//Investor
	var user77_45D9;//WalletAddress
	var user77_9E96;//ReservedTokens#2
	var user77_ecDF;//ReservedTokens#1
///////////////////////////////////////////////////////////////////////////////
	var owner;
    var investor;
    var Owner;
    var Investor;
    var ForeignOwner;
	var ForeignInvestor;
	var ReservedTokens1;
	var ReservedTokens2;
	var MainAddress;

    //var scenario="./scenarios/T1RyWn_0008.json";//'./scenarios/simple.json';
    var scenario;
    var mtMask;
    var crowdsale=new Crowdsale();
    var b=false;
    var balance;
    var newBalance;
    var contribution;

 ///////////////////////////////////////////////////////////////////////

    test.before(async function() {
        var flag=1;

try {
	var flag = await SpreadSheet.readSheet();
}
catch(err){}

    	logger.info("Account suite is "+flag);

        var u=new Utils();
        driver=await u.startBrowserWithMetamask();

	    switch(flag){
		    case 0:
		        { Owner = new User (driver,user77_56B2File);
		          Investor = new User (driver,user77_27F2File);
		          ForeignOwner= new User (driver,user4_0e03File);
		          ForeignInvestor= new User (driver,user4_40cAFile);
		          scenario='./scenarios/testSuite11.json';
		        }
		    case 1:
		       { Owner = new User (driver,user77_A6C8File);
			     Investor = new User (driver,user77_783CFile);
			     ForeignOwner= new User (driver,user4_0e03File);
			     ForeignInvestor= new User (driver,user4_4082File);
			     scenario='./scenarios/testSuite12.json';
		       }

		       }

	    logger.info("This browser date format is"+Utils.getDateFormat(driver));
        mtMask = new MetaMask(driver);
        await mtMask.open();//return activated Metamask and empty page

    });

    test.after(async function() {

	     await Utils.sendEmail(tempOutputFile);
	     //./node_modules/token-wizard-test-automation/temp/result.log"
	     driver.sleep(10000);
        let outputPath=Utils.getOutputPath();
        outputPath=outputPath+"/result"+Utils.getDate();
        await fs.ensureDirSync(outputPath);
        await fs.copySync(tempOutputPath,outputPath);
        //await fs.remove(tempOutputPath);
        await driver.quit();
    });
//////////////////////////////////////////////////////////////////////////////


    test.it('Owner  can create crowdsale,no whitelist,reserved, not modifiable', async function() {
        b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        crowdsale = await owner.createCrowdsale(scenario);
        logger.info("TokenAddress:  " + crowdsale.tokenAddress);
        logger.info("ContractAddress:  " + crowdsale.contractAddress);
        logger.info("url:  " + crowdsale.url);
        b = (crowdsale.tokenAddress != "") & (crowdsale.contractAddress != "") & (crowdsale.url != "");
        assert.equal(b, true, 'Test FAILED. ');
        logger.error("Test PASSED. Owner  can create crowdsale,no whitelist,reserved");
        if (!b) {console.log("Crowdsale didn't created. Can't proceed"); throw("Crowdsale didn't created. Can't proceed");}

    });

    test.it('Warning is displayed if investor try to buy from foreign network', async function() {
	    b=true;
        investor=ForeignInvestor;
        await investor.setMetaMaskAccount();
        await investor.open(crowdsale.url);
        b=await investor.confirmPopup();
        assert.equal(b, true, "Test failed. Warning does not displayed");
        b=true;
        b = await investor.contribute(crowdsale.currency.tiers[0].supply/2);
        assert.equal(b, false, "Test FAILED.  Investor can buy from foreign network");
        logger.error("Test PASSED. Warning present if investor try to buy from foreign network. Investor can not buy from foreign network");

    });


    test.it('Investor can NOT buy less than minCap in first transaction', async function() {
	    b=true;
        investor=Investor;
        await investor.setMetaMaskAccount();
        await investor.open(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.minCap * 0.5);
        assert.equal(b, false, "Test FAILED.Investor can contribute less than minCap in first transaction");
        logger.warn("Test PASSED. Investor can NOT contribute less than minCap in first transaction");

    });

    test.it('Investor can NOT buy more than total supply in tier', async function() {
	    b=true;
	    investor=Investor;
        await investor.open(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
        assert.equal(b, false, "Test FAILED.Investor can  buy more than supply in tier");
        logger.warn("Test PASSED. Investor can NOT contribute more than supply in tier");

    });

    test.it('Investor can buy amount = minCap', async function() {
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

    test.it('Investor can buy less than minCap after first transaction', async function() {
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
    test.it.skip('Owner can not modify crowdsale if allow modify is false', async function() {

    });

    test.it('Owner can NOT distribute before  all tokens are sold', async function() {
        b=true;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, false, "Test FAILED. Owner can  distribute before  all tokens are sold ");
        logger.warn("Owner can NOT distribute before  all tokens are sold " );
    });

    test.it('Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended ', async function() {
        b=true;
	    owner=Owner;
        b = await owner.finalize(crowdsale);
        assert.equal(b, false, "Test FAILED. Owner can  finalize before  all tokens re sold & if crowdsale NOT ended ");
        logger.warn("Owner can NOT finalize before  all tokens are sold & if crowdsale NOT ended" );
    });

    test.it('Investor can buy total supply for current tier', async function() {
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
	    b=true;
        owner=Investor;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, false, "Test FAILED.NOT Owner can  distribute ");
        logger.warn("Test PASSED. NOT Owner can NOT distribute " );

    });
    test.it('Owner can distribute (after all tokens were sold)', async function() {
	    b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.distribute(crowdsale);
        assert.equal(b, true, "Test FAILED. Owner can NOT distribute (after all tokens were sold)");
        logger.warn("Test PASSED.Owner can distribute (after all tokens were sold).");

    });

    test.it('Reserved addresses receive right amount of tokens after distribution)', async function() {

    });

    test.it('NOT Owner can NOT finalize (after all tokens were sold)', async function() {
        b=true;
        owner=Investor;
        await owner.setMetaMaskAccount();
        b = await owner.finalize(crowdsale);
        assert.equal(b, false, "Test FAILED.NOT Owner can  finalize (after all tokens were sold) ");
        logger.warn("Test PASSED. NOT Owner can NOT finalize (after all tokens were sold) " );

    });

    test.it('Owner can  finalize (after all tokens were sold)', async function() {
	    b=false;
        owner=Owner;
        await owner.setMetaMaskAccount();
        b = await owner.finalize(crowdsale);
        assert.equal(b, true, "Test FAILED.'Owner can NOT finalize (after all tokens were sold)");
        logger.warn("Test PASSED.'Owner can  finalize (after all tokens were sold) ");

    });

//New

    test.it('Investors receive right amount of tokens after finalization)', async function() {

    });




});
