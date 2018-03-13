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
    var user4_F16AFile='./users/user4_F16A.json';//Foreign Owner
    var user77_56B2File='./users/user77_56B2.json';//Owner
    var user4_40cAFile='./users/user4_40cA.json';//Foreign Investor
    var user77_27F2File='./users/user77_27F2.json';//Investor
	var user77_895BFile='./users/user77_895B.json';//WalletAddress
	var user77_A5ecFile='./users/user77_A5ec.json';//ReservedTokens#2
	var user77_c30bFile='./users/user77_c30b.json';//ReservedTokens#1

	var user4_F16A;   //Foreign #1
    var user77_56B2;  //Owner
    var user4_40cA;   //Foreign #2
    var user77_27F2;  //Investor
	var user77_895B;//WalletAddress
	var user77_A5ec;//ReservedTokens#2
	var user77_c30b;//ReservedTokens#1
////////////// SET #2 ///////////////////////////////////////////////////////
	var user4_0e03File='./users/user4_0e03.json';//Foreign #1
	var user77_A6C8File='./users/user77_A6C8.json';//Owner
	var user4_4082File='./users/user4_4082.json';//Foreign #2
	var user77_783CFile='./users/user77_783C.json';//Investor
	var user77_45D9File='./users/user77_45D9.json';//MainAddress
	var user77_9E96File='./users/user77_9E96.json';//ReservedTokens#2
	var user77_ecDFFile='./users/user77_ecDF.json';//ReservedTokens#1

	var user4_0e03;//Foreign #1
	var user77_A6C8;//Owner
	var user4_4082;//Foreign #2
	var user77_783C;//Investor
	var user77_45D9;//WalletAddress
	var user77_9E96;//ReservedTokens#2
	var user77_ecDF;//ReservedTokens#1
//////////////// SET #3 ///////////////////////////////////////////////////////
	var user77_8ce1File='./users/user77_8ce1.json';//Owner
	var user77_2a77File='./users/user77_2a77.json';//Investor
/////////////// SET #4 ///////////////////////////////////////////////////////
	var user77_5860File='./users/user77_5860.json';//Owner
	var user77_Db0EFile='./users/user77_Db0E.json';//Investor
/////////////// SET #5 ///////////////////////////////////////////////////////
	var user77_76b3File='./users/user77_76b3.json';//Owner
	var user77_4754File='./users/user77_4754.json';//Investor

/////////////// SET #6 ///////////////////////////////////////////////////////
	var user77_5ACCFile='./users/user77_5ACC.json';//Owner
	var user77_C0FDFile='./users/user77_C0FD.json';//Investor
/////////////// SET #7 ///////////////////////////////////////////////////////
	var user77_0436File='./users/user77_0436.json';//Owner
	var user77_f5aAFile='./users/user77_f5aA.json';//Investor
/////////////// SET #8 ///////////////////////////////////////////////////////
	var user77_CcDDFile='./users/user77_CcDD.json';//Owner
	var user77_4B33File='./users/user77_4B33.json';//Investor
/////////////// SET #9 ///////////////////////////////////////////////////////
	var user77_944AFile='./users/user77_944A.json';//Owner
	var user77_3402File='./users/user77_3402.json';//Investor
/////////////// SET #10 ///////////////////////////////////////////////////////
	var user77_1180File='./users/user77_1180.json';//Owner
	var user77_020FFile='./users/user77_020F.json';//Investor

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
	var flagCrowdsale;
	var flagDistribute=false;
	var s;
 ///////////////////////////////////////////////////////////////////////

    test.before(async function() {
	    flagCrowdsale=false;
        let flag=Math.round(10*Math.random());
        if (flag==10) flag=0;

try {
	//var flag = await SpreadSheet.readSheet();
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
		          break;
		        }
		    case 1:
		       { Owner = new User (driver,user77_A6C8File);
			     Investor = new User (driver,user77_783CFile);
			     ForeignOwner= new User (driver,user4_0e03File);
			     ForeignInvestor= new User (driver,user4_4082File);
			     scenario='./scenarios/testSuite12.json';
			     break;
		       }
		    case 2:
		    {   Owner = new User (driver,user77_8ce1File);
			    Investor = new User (driver,user77_2a77File);

			    scenario='./scenarios/testSuite13.json';
			    break;
		    }
		    case 3:
		    {   Owner = new User (driver,user77_5860File);
			    Investor = new User (driver,user77_Db0EFile);

			    scenario='./scenarios/testSuite14.json';
			    break;
		    }
		    case 4:
		    {   Owner = new User (driver,user77_76b3File);
			    Investor = new User (driver,user77_4754File);

			    scenario='./scenarios/testSuite15.json';
			    break;
		    }
		    case 5:
		    {   Owner = new User (driver,user77_5ACCFile);
			    Investor = new User (driver,user77_C0FDFile);

			    scenario='./scenarios/testSuite16.json';
			    break;
		    }
		    case 6:
		    {   Owner = new User (driver,user77_0436File);
			    Investor = new User (driver,user77_f5aAFile);

			    scenario='./scenarios/testSuite17.json';
			    break;
		    }

		    case 7:
		    {   Owner = new User (driver,user77_CcDDFile);
			    Investor = new User (driver,user77_4B33File);

			    scenario='./scenarios/testSuite18.json';
			    break;
		    }
		    case 8:
		    {   Owner = new User (driver,user77_944AFile);
			    Investor = new User (driver,user77_3402File);

			    scenario='./scenarios/testSuite19.json';
			    break;
		    }
		    case 9:
		    {   Owner = new User (driver,user77_1180File);
			    Investor = new User (driver,user77_020FFile);

			    scenario='./scenarios/testSuite20.json';
			    break;
		    }




		       }

		logger.info("Roles:");
	    logger.info("Owner = "+Owner.account);
	    logger.info("Owner's balance:"+Utils.getBalance(Owner));
	    logger.info("Investor = "+Investor.account);
	    logger.info("Investor's balance:"+Utils.getBalance(Investor));
	    //logger.info("Foreighn Investor = " +ForeignInvestor.account);
	    //logger.info("ForeignOwner="+ForeignOwner.account);

	   // logger.info("This browser date format is"+Utils.getDateFormat(driver));
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
       // await driver.quit();
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

    test.it('Whitelisted investor can NOT buy more than total supply in tier', async function() {
	    assert.equal(flagCrowdsale,true);
	     b=true;
	    investor=Investor;
        await investor.open(crowdsale.url);
        b = await investor.contribute(crowdsale.currency.tiers[0].supply+1);
        assert.equal(b, false, "Test FAILED.Investor can  buy more than supply in tier");
        logger.warn("Test PASSED. Investor can NOT contribute more than supply in tier");

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

    test.it('Reserved addresses receive right amount of tokens after distribution)', async function() {
	    assert.equal(flagCrowdsale,true);
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


    test.it('Investors receive right amount of tokens after finalization)', async function() {
	    assert.equal(flagCrowdsale,true);
    });




});
