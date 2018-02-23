const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const webdriver = require('selenium-webdriver'),
      chrome = require('selenium-webdriver/chrome'),
      firefox = require('selenium-webdriver/firefox'),
      by = require('selenium-webdriver/lib/by');

class BaseTest{

    constructor(driver){
        this.driver=driver;
    }

    run(){
console.log('SuperTestBase')
    };



}
module.exports.BaseTest=BaseTest;