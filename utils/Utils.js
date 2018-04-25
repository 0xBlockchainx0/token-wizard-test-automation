var nodemailer = require('nodemailer');
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const fs = require('fs');
const Web3 = require('web3');
const {spawn} = require('child_process');
const configFile='config.json';

const crowdsale=require('../entity/Crowdsale.js');
const Crowdsale=crowdsale.Crowdsale;

var browserHandles=[];


class Utils {

	static runGanache(){
        logger.info("Run ganache-cli");
		return spawn ('ganache-cli');

	}
	static killProcess(process){

		return process.kill();

	}

static async getProviderUrl(id)
{
	    logger.info("getProvider "+id);
        let provider="";
		switch(id) {
			case 8545:{ provider= "http://localhost:8545";break;}
            default:  {provider= "https://sokol.poa.network";break;}

		}

		logger.info("Got provider "+provider);
		return provider;

}

	static async increaseBalance(user, amount)
	{
		try{
            let provider=await Utils.getProviderUrl(user.networkID);
            logger.info("Current provider "+ provider);
		    let w=await new Web3(new Web3.providers.HttpProvider(provider));
			//let account0 = w.eth.accounts[0];
			let account0=await w.eth.getAccounts().then((accounts)=>{return accounts[2];});
			//let account0=await w.eth.accounts[2];

			//logger.info("Ganache balance  "+w.eth.getBalance(account0));
			logger.info("Send " + amount + " Eth from " + account0 + " to " + user.account);
			await w.eth.sendTransaction({
				from: account0,
				to: user.account,
				value: amount*1e18
			}).then(console.log);

		}
		catch(err){
			logger.info("Not able to sent " + amount + " Eth to " + user.account);
			logger.info(err);
		}

	}



	static setNetwork(network){
		let url;
		switch(network)
		{
			case 4:{url="https://rinkeby.infura.io/";break;}
			case 77:{url="https://sokol.poa.network";break;}
			case 8545:{url="http://localhost:8545"; break;}
			default:{url="https://sokol.poa.network";break;}
		}
		return  new Web3(new Web3.providers.HttpProvider(url));
	}
	static  getTransactionCount(network,address) {

		var w = Utils.setNetwork(network);
		var n = w.eth.getTransactionCount(address.toString());//returns Number
		return n;
	}
static async getBalance(user)
{
	var w = Utils.setNetwork(user.networkID);
	var n =await w.eth.getBalance(user.account.toString());
	return n;
}




static async wait(driver,time){
	await driver.sleep(time*1000);

}
	static sendEmail(path){
		var transport = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'testresults39@gmail.com',
				pass: 'javascript'
			}
		});

		var mailOptions = {
			from: 'testresults39@gmail.com',
			to: 'dennistikhomirov@gmail.com',
			subject: 'test results '+Utils.getDateWithAdjust(0,'utc')+"  "+ Utils.getTimeWithAdjust(0,'utc'),
			text: 'test results '+Utils.getDateWithAdjust(0,'utc') + "  " + Utils.getTimeWithAdjust(0,'utc'),
			attachments: [
				{path:""}
			]
		};
		mailOptions.attachments[0].path=path;

		transport.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});



	}





	static  compare(ss,newDate,newTime){

		let arr=ss.split("T");
		let aww=arr[0].split("-");
		let n=newDate.split("/");

		return (arr[1]==newTime)&&(aww[0]==n[2])&&(aww[1]==n[1])&&(aww[2]==n[0]);
	}





    static async getDateFormat(driver){

	    var d=await driver.executeScript("var d=new Date(1999,11,28);return d.toLocaleDateString();");
	    d=(""+d).substring(0,2);
	    if (d=='28') logger.info( "Date format=UTC");
	    else logger.info( "Date format=MDY");
	    if (d=='28') return "utc";
	    else return "mdy";


    }

	static convertDateToMdy(date){
		let s=date.split("/");
		return ""+s[1]+"/"+s[0]+"/"+s[2];
	}

	static convertTimeToMdy(date){
		let s=date.split(":");
		let r="am";
		s[1]=s[1].substring(0,2);

		if (s[0]>12) {s[0]=parseInt(s[0])-12; r="pm";}
		else if ((s[0])=="12") r="pm";
                else if(parseInt(s[0])==0) {s[0]="12";r="am";}
		return ""+s[0]+":"+s[1]+r;

	}
    static convertDateToUtc(date){
        let s=date.split("/");
        return ""+s[1]+"/"+s[0]+"/"+s[2];
  }

	static convertTimeToUtc(date){
		let s=date.split(":");
		let r=s[1].charAt(2);
		if (r=='p') {
			s[0] = parseInt(s[0]) + 12;
			if (s[0] > 23) s[0]=12;
		}
		else if (s[0]=="12") s[0]="00";
return s[0]+":"+s[1].substring(0,2);

    }



    static getTimeWithAdjust(adj, format){

        var d=new Date(Date.now()+adj);
        var r="am";
        var h=d.getHours();
	    var min=d.getMinutes();
        if (format=='mdy')
            if (h>12) {h=h-12;r="pm";}
            if (h==12) {r="pm";}

        if (format=='utc')  r="";

        h=""+h;
        if (h.length<2) h="0"+h;
        var min=""+min;
	    if (min.length<2) min="0"+min;



        var q=h+":"+min+r;
        return q;
    }
static getDateWithAdjust(adj, format){
    var d=new Date(Date.now()+adj);
	var q;


	var day=""+d.getDate();
	if (day.length<2) day="0"+day;
	var month=""+(d.getMonth()+1);
	if (month.length<2) month="0"+month;

    if (format=='mdy') q=month+"/"+day+"/"+d.getFullYear();
      else if (format=='utc') q=(day+"/"+month+"/"+d.getFullYear());

return q;
}
    static getOutputPath() {
        var obj = JSON.parse(fs.readFileSync(configFile, "utf8"));
        return obj.outputPath;

    }

    static getDate() {
        var d = new Date();
        var date = "_" + (d.getMonth() + 1) + "_" + d.getDate() + "_"
            + d.getFullYear() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds();
        return date;
    }



    static getStartURL() {
        var obj = JSON.parse(fs.readFileSync(configFile, "utf8"));
        return obj.startURL;

    }




    static async takeScreenshoot(driver,name) {

	    var res=await driver.takeScreenshot();
	    var buf = new Buffer(res, 'base64');
        console.log("Take screenshot. Path "+tempOutputPath + name+'.png');
	    await fs.writeFileSync(tempOutputPath + name + '.png', buf);


    }

        static async  startBrowserWithMetamask() {
        var source = 'MetaMask.crx';
        if (!fs.existsSync(source)) source = '.node_modules/token-wizard-test-automation/MetaMask.crx';

        logger.info("Metamask source:"+source);
        var options = new chrome.Options();
        options.addExtensions(source);
        //options.addArguments("user-data-dir=/home/d/GoogleProfile");
        //options.addArguments("user-data-dir=/home/d/.config/google-chrome/");
       //
	     // options.addArguments('headless');
        //options.addArguments('--start-maximized');
        options.addArguments('disable-popup-blocking');
        //options.addArguments('test-type');
        var driver=await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();

	     return driver;

    }


    static async zoom(driver,z){
        await driver.executeScript ("document.body.style.zoom = '"+z+"'");
    }

	static async getCrowdsaleInstance(fileName) {
		try {
			let crowdsale = new Crowdsale();
			await crowdsale.parser(fileName);
			return crowdsale;
		}
		  catch(err) {
			logger.info("Can not create crowdsale");
			logger.info(err);
			return null;
		  }

	}

    static async getPathToFileInPWD(fileName)
    {
	    return  process.env.PWD+"/" +fileName;
    }

}
module.exports={
    Utils:Utils

}
exports.browserHandles=browserHandles;
