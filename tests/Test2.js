const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    firefox = require('selenium-webdriver/firefox'),
    by = require('selenium-webdriver/lib/by');
const By=by.By;

const wizardWelcome=require('../pages/WizardWelcome.js');
const meta=require('../pages/MetaMask.js');
const managePage=require('../pages/ManagePage.js');
const ManagePage=managePage.ManagePage;
const baseTest=require('./BaseTest.js');
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
const Web3 = require('web3');
const fs = require('fs');
const metaMaskWallet=require('../entity/MetaMaskWallet.js');
const MetaMaskWallet=metaMaskWallet.MetaMaskWallet;

const assert = require('assert');




class Test2 extends baseTest.BaseTest {
    constructor(driver,configFile) {
        super(driver);
        this.configFile=configFile;
    }
    async run() {







    }

}
module.exports.Test2=Test2;


