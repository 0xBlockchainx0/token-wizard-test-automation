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
    static getTimeNear(){
        var d=new Date(Date.now()+120000);
        var r="";
        var h=d.getHours();
        if (h>19) {h=h-12;r="pm";}
        var q=h+":"+d.getMinutes();
        return q;
    }
static getDateNear(){
    var d=new Date(Date.now()+120000);
    var q=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
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