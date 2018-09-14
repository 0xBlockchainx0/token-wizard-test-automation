const nodemailer = require('nodemailer');
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const Key = require('selenium-webdriver').Key;
const webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');
const Web3 = require('web3');
const { spawn } = require('child_process');
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const DutchAuction = require("../entity/DutchAuction.js").DutchAuction;
const configFile = 'config.json';
const _minted = 'minted';
const _dutch = 'dutch';

const WALLET = require('./constants.js').WALLET;
const METAMASK = WALLET.METAMASK;
const NIFTY = WALLET.NIFTY;
const TIME_FORMAT = require('./constants.js').TIME_FORMAT;

const MetaMask = require('../pages/MetaMask.js').MetaMask;
const Nifty = require('../pages/Nifty.js').Nifty;

class Utils {
    static async delay(ms) {
        try {
            await new Promise(resolve => setTimeout(resolve, ms))
            return true
        }
        catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    static async getWalletInstance(driver) {
        logger.info("Utils: getWallet");
        try {
            switch ( await Utils.getWalletType() ) {
                case METAMASK: {
                    return new MetaMask(driver);
                    break;
                }
                case NIFTY: {
                    return new Nifty(driver);
                    break;
                }
                default: {
                    return new Nifty(driver);
                    break;
                }
            }
        }
        catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    static async startBrowserWithWallet() {
        logger.info("Utils: startBrowserWithWallet");
        try {
            let source;
            switch ( await Utils.getWalletType() ) {
                case METAMASK: {
                    source = './public/MetaMask_4_8_0_0.crx';
                    break;
                }
                case NIFTY: {
                    source = './public/Nifty-Wallet_v4.8.2.crx';
                    break;
                }
                default: {
                    source = './public/Nifty-Wallet_v4.8.2.crx';
                    break;
                }
            }
            let options = new chrome.Options();
            await options.addExtensions(source);
            await options.addArguments('disable-popup-blocking');
            let driver = await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();
            await driver.sleep(5000);
            if ( await Utils.getWalletType() ) await Utils.openNewTab(driver);
            return driver;
        }
        catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    static async openNewTab(driver) {
        logger.info("Utils: openNewTab");
        try {
            driver.executeScript('window.open("newURL");');
            return true;
        }
        catch ( err ) {
            logger.info(err);
            return false;
        }
    }

    static runGanache() {
        logger.info("Utils: Run ganache-cli");
        return spawn('ganache-cli');
    }

    static killProcess(process) {
        return process.kill();
    }

    static async getProviderUrl(id) {
        logger.info("getProvider " + id);
        let provider = "";
        switch ( id ) {
            case 8545: {
                provider = "http://localhost:8545";
                break;
            }
            default: {
                provider = "https://sokol.poa.network";
                break;
            }
        }
        return provider;
    }

    static async receiveEth(user, amount) {
        try {
            let provider = await Utils.getProviderUrl(user.networkID);
            let web3 = await new Web3(new Web3.providers.HttpProvider(provider));
            let account0 = await web3.eth.getAccounts().then((accounts) => {
                return accounts[3];
            });

            logger.info("Send " + amount + " Eth from " + account0 + " to " + user.account);
            await web3.eth.sendTransaction({
                from: account0,
                to: user.account,
                value: amount * 1e18
            }).then(logger.info("Transaction done"));

            return true;
        }
        catch ( err ) {
            logger.info("Error" + err);
            return false;
        }
    }

    static getWeb3Instance(network) {
        logger.info("Utils: getWeb3Instance")
        let url;
        switch ( network ) {
            case 3: {
                url = "https://ropsten.infura.io";
                break;
            }
            case 4: {
                url = "https://rinkeby.infura.io/";
                break;
            }
            case 77: {
                url = "https://sokol.poa.network";
                break;
            }
            case 8545: {
                url = "http://localhost:8545";
                break;
            }
            default: {
                url = "https://sokol.poa.network";
                break;
            }
        }
        return new Web3(new Web3.providers.HttpProvider(url));
    }

    static async getBalance(user) {
        let web3 = Utils.getWeb3Instance(user.networkID);
        return await web3.eth.getBalance(user.account.toString());
    }

    static sendEmail(path) {
        let transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'testresults39@gmail.com',
                pass: 'javascript'
            }
        });

        let mailOptions = {
            from: 'testresults39@gmail.com',
            to: 'monzano2@gmail.com',
            subject: 'test results ' + Utils.getDateWithAdjust(0, 'utc') + "  " + Utils.getTimeWithAdjust(0, 'utc'),
            text: 'test results ' + Utils.getDateWithAdjust(0, 'utc') + "  " + Utils.getTimeWithAdjust(0, 'utc'),
            attachments: [
                { path: "" }
            ]
        };
        mailOptions.attachments[0].path = path;
        transport.sendMail(mailOptions, function (error, info) {
            if ( error ) {
                console.log(error);
                return false;
            } else {
                console.log('Email sent: ' + info.response);
                return true;
            }
        });
    }

    static compareDates(stringDate, newDate, newTime) {
        let arr = stringDate.split("T");
        let aww = arr[0].split("-");
        let n = newDate.split("/");
        return (arr[1] === newTime) && (aww[0] === n[2]) && (aww[1] === n[1]) && (aww[2] === n[0]);
    }

    static async getDateFormat(driver) {

        let date = await driver.executeScript("var d=new Date(1999,11,28);return d.toLocaleDateString();");
        date = ("" + date).substring(0, 2);
        if ( date === '28' ) {
            logger.info("Date format=UTC");
            return TIME_FORMAT.UTC;
        }
        else {
            logger.info("Date format=MDY");
            return TIME_FORMAT.MDY;
        }
    }

    static convertDateToMdy(date) {
        let s = date.split("/");
        return "" + s[1] + "/" + s[0] + "/" + s[2];
    }

    static convertTimeToMdy(time) {
        let array = time.split(":");
        let minutes = array[1].substring(0, 2);
        let hours = parseInt(array[0])
        let meridiem = "pm";

        if ( hours > 12 ) hours = hours - 12;
        else if ( hours < 12 ) meridiem = "am";
        else hours = 12;

        hours = "" + hours;
        if ( hours.length < 2 ) hours = "0" + hours;
        if ( minutes.length < 2 ) minutes = "0" + minutes;
        return "" + hours + ":" + minutes + meridiem;
    }

    static convertDateToUtc(date) {
        let s = date.split("/");
        return "" + s[1] + "/" + s[0] + "/" + s[2];
    }

    static getTimeWithAdjust(adj, format) {
        logger.info("Utils: getTimeWithAdjust, format =" + format + " , adj= " + adj)
        let date = new Date(Date.now() + adj);
        let meridiem = "am";
        let hours = date.getHours();
        let minutes = date.getMinutes();

        if ( format === TIME_FORMAT.MDY )
            if ( hours > 12 ) {
                hours = hours - 12;
                meridiem = "pm";
            }
            else if ( hours === 12 ) {
                meridiem = "pm";
            }
        if ( format === TIME_FORMAT.UTC ) meridiem = "";

        hours = "" + hours;
        if ( hours.length < 2 ) hours = "0" + hours;
        minutes = "" + minutes;
        if ( minutes.length < 2 ) minutes = "0" + minutes;
        return hours + ':' + minutes + meridiem
    }

    static getDateWithAdjust(adj, format) {
        logger.info("Utils: getDateWithAdjust, format =" + format + " , adj= " + adj)
        let date = new Date(Date.now() + adj);
        let day = "" + date.getDate();
        if ( day.length < 2 ) day = "0" + day;
        let month = "" + (date.getMonth() + 1);
        if ( month.length < 2 ) month = "0" + month;

        if ( format === TIME_FORMAT.MDY ) return month + "/" + day + "/" + date.getFullYear();
        else return day + "/" + month + "/" + date.getFullYear();
    }

    static getOutputPath() {
        var obj = JSON.parse(fs.readFileSync(configFile, "utf8"));
        return obj.outputPath;
    }

    static getWalletType() {
        var obj = JSON.parse(fs.readFileSync(configFile, "utf8"));
        return obj.wallet;

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

    static async takeScreenshoot(driver, name) {

        var res = await driver.takeScreenshot();
        var buf = new Buffer(res, 'base64');
        console.log("Take screenshot. Path " + tempOutputPath + name + '.png');
        await fs.writeFileSync(tempOutputPath + name + '.png', buf);

    }

    static async zoom(driver, z) {
        await driver.executeScript("document.body.style.zoom = '" + z + "'");
    }

    static async getDutchAuctionCrowdsaleInstance(fileName) {
        try {
            let crowdsale = new DutchAuction();
            await crowdsale.parser(fileName);
            return crowdsale;
        }
        catch ( err ) {
            logger.info("Can not create crowdsale");
            logger.info(err);
            return null;
        }

    }

    static async getMintedCrowdsaleInstance(fileName) {
        try {
            let crowdsale = new Crowdsale();
            await crowdsale.parser(fileName);
            crowdsale.sort = _minted;
            return crowdsale;
        }
        catch ( err ) {
            logger.info("Can not create crowdsale");
            logger.info(err);
            return null;
        }
    }

    static async getDutchCrowdsaleInstance(fileName) {
        try {
            let crowdsale = new DutchAuction();
            await crowdsale.parser(fileName);
            crowdsale.sort = _dutch;
            return crowdsale;
        }
        catch ( err ) {
            logger.info("Can not create crowdsale");
            logger.info(err);
            return null;
        }
    }

    static async getPathToFileInPWD(fileName) {
        return process.env.PWD + "/" + fileName;
    }

    static async compareBalance(balanceEthOwnerBefore, balanceEthOwnerAfter, contribution, rate, delta) {
        let balanceShouldBe = balanceEthOwnerBefore / 1e18 + (contribution / rate);
        logger.info("contribution / rate= " + (contribution / rate));
        logger.info("rate= " + rate);
        logger.info("balanceEthOwnerBefore= " + balanceEthOwnerBefore / 1e18);
        logger.info("contribution= " + contribution);
        logger.info("balanceShouldBe= " + balanceShouldBe);
        logger.info("balanceEthOwnerAfter= " + balanceEthOwnerAfter / 1e18);
        if ( delta === undefined ) delta = 0.01;
        logger.info("delta= " + delta);
        return (Math.abs(balanceShouldBe - balanceEthOwnerAfter / 1e18) < delta);
    }

    static async getFromEnvMintedIDXAddress() {
        logger.info("Utils:getEnvAddressMintedInitCrowdsale");
        require('dotenv').config();
        return Object.values(JSON.parse(process.env.REACT_APP_MINTED_CAPPED_IDX_ADDRESS))[0];
    }

    static async getFromEnvDutchIDXAddress() {
        logger.info("Utils:getEnvAddressDutchInitCrowdsale");
        require('dotenv').config();
        return Object.values(JSON.parse(process.env.REACT_APP_DUTCH_IDX_ADDRESS))[0];
    }

    static async getFromEnvAbstractStorageAddress() {
        logger.info("Utils:getEnvAddressRegistryStorage");
        require('dotenv').config();
        return Object.values(JSON.parse(process.env.REACT_APP_ABSTRACT_STORAGE_ADDRESS))[0];
    }

    static async getFromEnvNetworkId() {
        logger.info("Utils:getEnvNetworkId");
        require('dotenv').config();
        return Object.keys(JSON.parse(process.env.REACT_APP_REGISTRY_STORAGE_ADDRESS))[0];
    }

    static async getContractAddressIdx(crowdsale) {
        logger.info("Utils:getContractAddressIdx");
        switch ( crowdsale.sort ) {
            case 'minted':
                return Utils.getFromEnvMintedIDXAddress();
                break;
            case 'dutch':
                return Utils.getFromEnvDutchIDXAddress();
                break;
            default:
                return Utils.getFromEnvMintedIDXAddress();
        }

    }

    static async getContractSourceCode(crowdsale){
        logger.info("Utils:getContractSourceCode");
        let path = './contracts/';
        switch ( crowdsale.sort ) {
            case 'minted':
                path = path + 'MintedPublishPage.sol';
                break;
            case 'dutch':
                path = path + 'DutchPublishPage.sol';
                break;
            default:
                path = path + 'MintedPublishPage.sol'
        }
    }

    static async getContractABIInitCrowdsale(crowdsale) {
        logger.info("Utils:getContractABIInitCrowdsale");
        let path = './contracts/';
        switch ( crowdsale.sort ) {
            case 'minted':
                path = path + 'MintedInitCrowdsale.abi';
                break;
            case 'dutch':
                path = path + 'DutchInitCrowdsale.abi';
                break;
            default:
                path = path + 'MintedInitCrowdsale.abi'
        }

        return await JSON.parse(fs.readFileSync(path).toString());
    }

    static async copyEnvFromWizard() {
        logger.info("Utils:copyEnvFromWizard")
        try {
            fs.copySync('../../.env', './.env', { overwrite: true });
            return true;
        }
        catch ( err ) {
            logger.info("! Can't find .env file in wizard's directory !");
            logger.info(err);
            return false;
        }
    }

    static async copyEnvToWizard() {
        try {
            fs.copySync('./.env', '../../.env', { overwrite: true });
            return true;
        }
        catch ( err ) {
            logger.info("! Can't find .env file in e2e directory !");
            logger.info(err);
            return false;
        }
    }

    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async takeFunctionRateTime(crowdsale) {
        try {
            const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
            let status;
            await fs.ensureDirSync("./time_rate_logs/");
            let file = "./time_rate_logs/time_rate" + Date.now() + ".json";
            let fileLog = "./time_rate_logs/time_rate" + Date.now() + ".log";

            await fs.writeFileSync(fileLog, "startTime " + crowdsale.tiers[0].startTime + "\n");
            await fs.appendFileSync(fileLog, "endTime " + crowdsale.tiers[0].endTime + "\n");
            await fs.appendFileSync(fileLog, "timestamp = " + Date.now() + "\n");
            await fs.appendFileSync(fileLog, "execID = " + crowdsale.executionID + "\n");
            await fs.appendFileSync(fileLog, "minRate = " + crowdsale.tiers[0].minRate + "\n");
            await fs.appendFileSync(fileLog, "maxRate = " + crowdsale.tiers[0].maxRate + "\n");

            let object = { time: "", rate: "" };
            let array = [];
            let arrayLog = [];
            let counter = 0;

            do {
                status = await Utils.getCrowdsaleStatusRopsten(crowdsale, abi);
                await Utils.sleep(1000);
                object.time = (counter++).toString();
                object.rate = status.current_rate;
                logger.info("time: " + object.time + " ,rate: " + object.rate);
                array.push({
                    time: object.time,
                    rate: object.rate
                });
                arrayLog.push(object.rate + "\n");
            }
            while ( (parseInt(status.time_remaining) !== 0) );

            await fs.writeJsonSync(file, array);
            await fs.appendFileSync(fileLog, arrayLog);
            return file;

        }
        catch ( err ) {
            console.log("Can not takeFunctionRateTime " + err);
            return null;
        }
    }

    static async getDutchCrowdsaleStartTime(crowdsale) {
        logger.info("getDutchCrowdsaleStartTime");
        if ( crowdsale.sort === _minted ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvDutchIDXAddress());
        let result = await myContract.methods.getCrowdsaleStartAndEndTimes(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID).call();
        return result.start_time;
    }

    static async getDutchCrowdsaleEndTime(crowdsale) {
        logger.info("getDutchCrowdsaleEndTime");
        if ( crowdsale.sort === _minted ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvDutchIDXAddress());
        let result = await myContract.methods.getCrowdsaleStartAndEndTimes(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID).call();
        return result.end_time;
    }

    static async getTokensSold(crowdsale) {
        logger.info("getTokenSold");

        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let idx;
        if ( crowdsale.sort === _minted ) idx = await Utils.getFromEnvMintedIDXAddress();
        else idx = await Utils.getFromEnvDutchIDXAddress();
        let myContract = new web3.eth.Contract(abi, idx);
        let result = await myContract.methods.getTokensSold(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID).call();
        return result;
    }

    static async getCrowdsaleStatusRopsten(crowdsale, abi) {
        //console.log("getCrowdsaleStatusRopsten");
        try {
            let networkIDRopsten = 3;
            const web3 = await Utils.getWeb3Instance(networkIDRopsten);
            let REACT_APP_REGISTRY_STORAGE_ADDRESS = "0x9996020c8864964688411b3d90ac27eb5b0937c7";
            let REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS = "0xdcD30b8417062AbDFAd1db173D66bd6e0D31929E";
            let myContract = new web3.eth.Contract(abi, REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS);
            let status = await myContract.methods.getCrowdsaleStatus(REACT_APP_REGISTRY_STORAGE_ADDRESS, crowdsale.executionID).call();
            console.log("status = " + status);
            return status;
        }
        catch ( err ) {
            console.log("Can not get status. " + err);
            return 0;
        }

    }

    static async getMintedCrowdsaleStartTime(crowdsale) {
        logger.info("getMintedCrowdsaleStartTime");
        if ( crowdsale.sort === _dutch ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvMintedIDXAddress());
        let result = await myContract.methods.getCrowdsaleStartAndEndTimes(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID).call();
        return result.start_time;
    }

    static async getTiersEndTimeMintedCrowdsale(crowdsale, tierNumber) {
        logger.info("Utils: getTiersEndTimeMintedCrowdsale");
        if ( crowdsale.sort === _dutch ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvMintedIDXAddress());
        let result = await myContract.methods.getTierStartAndEndDates(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID, tierNumber - 1).call();
        return result.tier_end;
    }

    static async getTierWhitelistMintedCrowdsale(crowdsale, tierNumber) {
        logger.info("Utils: getTierWhitelistMinted");
        if ( crowdsale.sort === _dutch ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvMintedIDXAddress());
        let result = await myContract.methods.getTierWhitelist(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID, tierNumber - 1).call();
        return result.num_whitelisted;
    }

    static async getCrowdsaleWhitelistDutchCrowdsale(crowdsale) {
        logger.info("Utils: getTierWhitelistMinted");
        if ( crowdsale.sort === _minted ) return false;
        let web3 = Utils.getWeb3Instance(crowdsale.networkID);
        const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
        let myContract = new web3.eth.Contract(abi, await Utils.getFromEnvDutchIDXAddress());
        let result = await myContract.methods.getCrowdsaleWhitelist(await Utils.getFromEnvAbstractStorageAddress(), crowdsale.executionID).call();
        return result.num_whitelisted;
    }

    static async deployContract(web3, abi, bin, from, parameters) {
        console.log("Utils: deployContract")
        console.log("from address= " + from)
        const contract = new web3.eth.Contract(abi, { from });
        const gas = 8900000;
        const gasPrice = '10000000000';
        console.log("parametersabstractStorage: " + parameters[0]);
        console.log("parametersmintedIdx: " + parameters[1]);
        console.log("parametersdutchIdx: " + parameters[2]);
        return contract
            .deploy(
                {
                    data: bin,
                    arguments: parameters
                }
            )
            .send({
                from,
                gas,
                gasPrice
            })
    }

    static async deployTWProxiesRegistry(network, registryPath) {
        logger.info("Utils:deployTWProxiesRegistry  ");

        //const web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        const web3 = await Utils.getWeb3Instance(network);
        const registryAbi = await JSON.parse(fs.readFileSync(`${registryPath}.abi`).toString());
        let registryBin = await fs.readFileSync(`${registryPath}.bin`).toString();
        if ( registryBin.slice(0, 2) !== '0x' && registryBin.slice(0, 2) !== '0X' ) {
            registryBin = '0x' + registryBin;
        }

        let abstractStorage = await Utils.getFromEnvAbstractStorageAddress();
        let mintedIdx = await Utils.getFromEnvMintedIDXAddress();
        let dutchIdx = await Utils.getFromEnvDutchIDXAddress();

        let account = await web3.eth.getAccounts().then((accounts) => {
            return accounts[0]
        });
        let contract = await Utils.deployContract(web3, registryAbi, registryBin, account, [abstractStorage, mintedIdx, dutchIdx]);

        const networkID = await web3.eth.net.getId();
        const registryAddress = contract._address;
        let envContent = `REACT_APP_TW_PROXIES_REGISTRY_ADDRESS='{"${networkID}":"${registryAddress}"}'`;
        console.log(envContent);
        console.log("abstractStorage: " + abstractStorage);
        console.log("mintedIdx: " + mintedIdx);
        console.log("dutchIdx: " + dutchIdx);

        if ( await !fs.existsSync("./.env") ) await fs.writeFileSync("./.env");
        await fs.appendFileSync("./.env", envContent);
    }

    static async deployTWProxiesRegistryToRopsten(network, registryPath) {
        logger.info("Utils:deployTWProxiesRegistry  ");

        //const web3 = await new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        const web3 = await Utils.getWeb3Instance(3);
        const registryAbi = await JSON.parse(fs.readFileSync(`${registryPath}.abi`).toString());
        let registryBin = await fs.readFileSync(`${registryPath}.bin`).toString();
        if ( registryBin.slice(0, 2) !== '0x' && registryBin.slice(0, 2) !== '0X' ) {
            registryBin = '0x' + registryBin;
        }

        let abstractStorage = await Utils.getFromEnvAbstractStorageAddress();
        let mintedIdx = await Utils.getFromEnvMintedIDXAddress();
        let dutchIdx = await Utils.getFromEnvDutchIDXAddress();

        let privateKey = "0xba98116a7d4b98f22f113c59448b9cc69f916d75f35d51f088b64b483fd0b8ca";
        let account = web3.eth.accounts.privateKeyToAccount(privateKey);
        console.log(account.address);
        let bal = await web3.eth.getBalance(account.address.toString())
        console.log("bal= " + bal / 1e18);
        console.log("abstractStorage: " + abstractStorage);
        console.log("mintedIdx: " + mintedIdx);
        console.log("dutchIdx: " + dutchIdx);
        const networkID = await web3.eth.net.getId();
        console.log("networkID: " + networkID);
        /*
                let account = await web3.eth.getAccounts().then((accounts) => {
                    return accounts[0]
                });*/
        let contract = await Utils.deployContract(web3, registryAbi, registryBin, account.address, [abstractStorage, mintedIdx, dutchIdx]);

        const registryAddress = contract._address;
        let envContent = `REACT_APP_TW_PROXIES_REGISTRY_ADDRESS='{"${networkID}":"${registryAddress}"}'`;
        console.log(envContent);

        if ( await !fs.existsSync("./.env") ) await fs.writeFileSync("./.env");
        await fs.appendFileSync("./.env", envContent);
    }

//////////// PROXY /////////////////////////////////////

    static async getContractABIProxy(crowdsale) {
        logger.info("Utils:getContractABIProxy");
        let path = './contracts/Proxies.abi';
        return await JSON.parse(fs.readFileSync(path).toString());
    }

    static async getProxyExecID(crowdsale) {
        logger.info("getProxyExecID");
        try {
            let web3 = Utils.getWeb3Instance(crowdsale.networkID);
            const abi = await Utils.getContractABIProxy(crowdsale);
            let myContract = new web3.eth.Contract(abi, crowdsale.proxyAddress.toString());
            let result = await myContract.methods.app_exec_id().call();
            logger.info("app_exec_id " + result);
            return result;
        }
        catch ( err ) {
            logger.info("Can't read contract. Error: " + err);
            return false;
        }
    }

    static async generateCSVReservedAddresses(amountReserved) {
        logger.info("generateCSVReservedAddresses");
        try {
            console.log(amountReserved);
            let path = "./reservedAddressesCSV";
            await fs.ensureDirSync(path);
            let dateNow = Date.now();
            let fileName = path + "/reservedAddresses" + amountReserved + "_" + dateNow;
            let fileCSV = fileName + ".csv";
            let fileJSON = fileName + ".json";
            let array = [];
            let dimension;
            let value;
            let web3 = Utils.getWeb3Instance(8545);
            let account;
            for ( let i = 0; i < amountReserved; i++ ) {
                account = web3.eth.accounts.create();
                dimension = (Math.random() > 0.5) ? "percentage" : "tokens";
                value = Math.random() * 1e10;
                array.push({
                    account: account,
                    dimension: dimension,
                    value: value
                });
                //console.log(i+"    "+account.address + "," + dimension + "," + value + "\n")
                await fs.appendFileSync(fileCSV, "" + account.address + "," + dimension + "," + value + "\n");
            }

            await fs.writeJsonSync(fileJSON, { reservedAddresses: array });
            return fileName;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

    static async generateCSVWhitelistedAddresses(amount) {
        logger.info("generateCSVWhitelistedAddresses");
        try {
            console.log(amount);
            let path = "./whitelistedAddressesCSV";
            await fs.ensureDirSync(path);
            let dateNow = Date.now();
            let fileName = path + "/whitelistedAddresses" + amount + "_" + dateNow;
            let fileCSV = fileName + ".csv";
            let fileJSON = fileName + ".json";
            let array = [];
            let max;
            let min;
            let web3 = Utils.getWeb3Instance(8545);
            let account;
            for ( let i = 0; i < amount; i++ ) {
                account = web3.eth.accounts.create();

                min = Math.round(Math.random() * 1e3);
                max = min + Math.round(Math.random() * 1e3);
                array.push({
                    account: account,
                    min: min,
                    max: max
                });
                //console.log(i+"    "+account.address + "," + dimension + "," + value + "\n")
                await fs.appendFileSync(fileCSV, "" + account.address + "," + min + "," + max + "\n");
            }

            await fs.writeJsonSync(fileJSON, { whitelistedAddresses: array });
            return fileName;
        }
        catch ( err ) {
            logger.info("Error: " + err);
            return false;
        }
    }

}

module.exports = {
    Utils: Utils

}

