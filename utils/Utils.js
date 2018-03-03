const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');
const fs = require('fs');
const Web3 = require('web3');
const configFile='config.json';



class Utils {

	static compare(ss,newDate,newTime){

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



    static getTimeNear(adj,format){

        var d=new Date(Date.now()+adj);
        var r="am";
        var h=d.getHours();
        if (format=='mdy')
            if (h>12) {h=h-12;r="pm";}

        if (format=='utc')  r="";

        h=""+h;
        if (h.length<2) h="0"+h;
        var min=""+(d.getMinutes()+1);
	    if (min.length<2) min="0"+min;
        var q=h+":"+min+r;
        return q;
    }
static getDateNear(adj,format){
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

     openAnotherTab(driver, URL) {
        driver.executeScript('window.open("' + URL + '");');
    }

    focusOn(driver) {
        driver.executeScript('alert("Focus window")');
        driver.switchTo().alert().accept();
    }

    static getStartURL() {
        var obj = JSON.parse(fs.readFileSync(configFile, "utf8"));
        return obj.startURL;

    }

    getInstallMetamask(fileName) {
        var obj = JSON.parse(fs.readFileSync(fileName, "utf8"));
        return obj.installMetaMask;

    }


    print(arr) {
        for (var i = 0; i < arr.length; i++) {
            logger.info(arr[i]);
        }


    }

    getTransactionCount(address) {

        var w = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/"));
        var n = w.eth.getTransactionCount(address.toString());//returns Number
        fs.writeFileSync("tempAddr.txt", n);
        return n;
    }

    static takeScreenshoot(driver) {
        driver.takeScreenshot()
            .then((res) => {

               var buf = new Buffer(res, 'base64');

                fs.writeFileSync(tempOutputPath + "screenshoot" + Utils.getDate() + '.png', buf);
                });

    }



    startBrowser() {
        var options = new chrome.Options();
        //options.addArguments("user-data-dir=/home/d/GoogleProfile");
        //options.addArguments('start-maximized');
        options.addArguments('disable-popup-blocking');
        options.addArguments('test-type');
        return new webdriver.Builder().withCapabilities(options.toCapabilities()).build();

    }



     static   startBrowserWithMetamask() {
        var source = 'MetaMask.crx';
        if (!fs.existsSync(source)) source = './node_modules/create-poa-crowdsale/MetaMask.crx';
        logger.info("Metamask source:"+source);
        var options = new chrome.Options();
        options.addExtensions(source);
        //options.addArguments("user-data-dir=/home/d/GoogleProfile");
        //options.addArguments("user-data-dir=/home/d/.config/google-chrome/");
       //
	     // options.addArguments('headless');
        options.addArguments('start-maximized');
        options.addArguments('disable-popup-blocking');
        //options.addArguments('test-type');
        return  new webdriver.Builder().withCapabilities(options.toCapabilities()).build();

    }



    getScenarioFile(fileName) {
        var obj = JSON.parse(fs.readFileSync(fileName, "utf8"));
        return obj.scenario;

    }
    static async zoom(driver,z){
        await driver.executeScript ("document.body.style.zoom = '"+z+"'");
    }
}
module.exports={
    Utils:Utils
}