const nodemailer = require('nodemailer');
const logger = require('../entity/Logger.js').logger;
const tempOutputPath = require('../entity/Logger.js').tempOutputPath;
const webdriver = require('selenium-webdriver'),
	chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');
const Web3 = require('web3');
const {spawn} = require('child_process');
const Crowdsale = require('../entity/Crowdsale.js').Crowdsale;
const DutchAuction = require("../entity/DutchAuction.js").DutchAuction;
const configFile = 'config.json';
const _minted = 'minted';
const _dutch = 'dutch';

class Utils {

	static async startBrowserWithMetamask() {
		let source = './MetaMask.crx';
		let options = new chrome.Options();
		await options.addExtensions(source);
		await options.addArguments('disable-popup-blocking');
		let driver = await new webdriver.Builder().withCapabilities(options.toCapabilities()).build();
		await driver.sleep(5000);
		return driver;
	}

	static runGanache() {
		logger.info("Run ganache-cli");
		return spawn('ganache-cli');
	}

	static killProcess(process) {
		return process.kill();
	}

	static async getProviderUrl(id) {
		logger.info("getProvider " + id);
		let provider = "";
		switch (id) {
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
				return accounts[2];
			});

			logger.info("Send " + amount + " Eth from " + account0 + " to " + user.account);
			await web3.eth.sendTransaction({
				from: account0,
				to: user.account,
				value: amount * 1e18
			}).then(logger.info("Transaction done"));
			return true;
		}
		catch (err) {
			logger.info("Error" + err);
			return false;
		}
	}

	static getWeb3Instance(network) {
		logger.info("Utils: getWeb3Instance")
		let url;
		switch (network) {
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
				{path: ""}
			]
		};
		mailOptions.attachments[0].path = path;
		transport.sendMail(mailOptions, function (error, info) {
			if (error) {
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

		let d = await driver.executeScript("var d=new Date(1999,11,28);return d.toLocaleDateString();");
		d = ("" + d).substring(0, 2);
		if (d == '28') logger.info("Date format=UTC");
		else logger.info("Date format=MDY");
		if (d == '28') return "utc";
		else return "mdy";

	}

	static convertDateToMdy(date) {
		let s = date.split("/");
		return "" + s[1] + "/" + s[0] + "/" + s[2];
	}

	static convertTimeToMdy(date) {
		let s = date.split(":");
		let r = "am";
		s[1] = s[1].substring(0, 2);

		if (s[0] > 12) {
			s[0] = parseInt(s[0]) - 12;
			r = "pm";
		}
		else if ((s[0]) == "12") r = "pm";
		else if (parseInt(s[0]) == 0) {
			s[0] = "12";
			r = "am";
		}
		return "" + s[0] + ":" + s[1] + r;

	}

	static convertDateToUtc(date) {
		let s = date.split("/");
		return "" + s[1] + "/" + s[0] + "/" + s[2];
	}

	static convertTimeToUtc(date) {
		let s = date.split(":");
		let r = s[1].charAt(2);
		if (r == 'p') {
			s[0] = parseInt(s[0]) + 12;
			if (s[0] > 23) s[0] = 12;
		}
		else if (s[0] == "12") s[0] = "00";
		return s[0] + ":" + s[1].substring(0, 2);

	}

	static getTimeWithAdjust(adj, format) {

		var d = new Date(Date.now() + adj);
		var r = "am";
		var h = d.getHours();
		var min = d.getMinutes();
		if (format == 'mdy')
			if (h > 12) {
				h = h - 12;
				r = "pm";
			}
		if (h == 12) {
			r = "pm";
		}

		if (format == 'utc') r = "";

		h = "" + h;
		if (h.length < 2) h = "0" + h;
		var min = "" + min;
		if (min.length < 2) min = "0" + min;

		var q = h + ":" + min + r;
		return q;
	}

	static getDateWithAdjust(adj, format) {
		var d = new Date(Date.now() + adj);
		var q;

		var day = "" + d.getDate();
		if (day.length < 2) day = "0" + day;
		var month = "" + (d.getMonth() + 1);
		if (month.length < 2) month = "0" + month;

		if (format == 'mdy') q = month + "/" + day + "/" + d.getFullYear();
		else if (format == 'utc') q = (day + "/" + month + "/" + d.getFullYear());

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
		catch (err) {
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
		catch (err) {
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
		catch (err) {
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
		if (delta === undefined) delta = 0.01;
		logger.info("delta= " + delta);
		return (Math.abs(balanceShouldBe - balanceEthOwnerAfter / 1e18) < delta);
	}

	static async getEnvAddressMintedInitCrowdsale() {
		logger.info("Utils:getEnvAddressMintedInitCrowdsale");
		require('dotenv').config();
		return Object.values(JSON.parse(process.env.REACT_APP_MINTED_CAPPED_CROWDSALE_INIT_CROWDSALE_ADDRESS))[0];
	}

	static async getEnvAddressDutchInitCrowdsale() {
		logger.info("Utils:getEnvAddressDutchInitCrowdsale");
		require('dotenv').config();
		return Object.values(JSON.parse(process.env.REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS))[0];
	}

	static async getEnvAddressRegistryStorage() {
		logger.info("Utils:getEnvAddressRegistryStorage");
		require('dotenv').config();
		return Object.values(JSON.parse(process.env.REACT_APP_REGISTRY_STORAGE_ADDRESS))[0];
	}

	static async getEnvNetworkId() {
		logger.info("Utils:getEnvNetworkId");
		require('dotenv').config();
		return Object.keys(JSON.parse(process.env.REACT_APP_REGISTRY_STORAGE_ADDRESS))[0];
	}

	static async getContractAddressInitCrowdsale(crowdsale) {
		logger.info("Utils:getContractAddressInitCrowdsale");
		switch (crowdsale.sort) {
			case 'minted':
				return Utils.getEnvAddressMintedInitCrowdsale();
				break;
			case 'dutch':
				return Utils.getEnvAddressDutchInitCrowdsale();
				break;
			default:
				return Utils.getEnvAddressMintedInitCrowdsale();
		}

	}

	static async getContractABIInitCrowdsale(crowdsale) {
		logger.info("Utils:getContractABIInitCrowdsale");
		let path = './contracts/';
		switch (crowdsale.sort) {
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
		try {
			fs.copySync('../../.env', './.env', {overwrite: true});
			return true;
		}
		catch (err) {
			logger.info("! Can't find .env file in wizard's directory !");
			logger.info(err);
			return false;
		}
	}

	static async sleep (ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}


	static async  takeFunctionRateTime(crowdsale) {
		try {
			const abi = await Utils.getContractABIInitCrowdsale(crowdsale);
			let status;
			await fs.ensureDirSync("./time_rate_logs/");
			let file = "./time_rate_logs/time_rate" + Date.now() + ".json";
			let fileLog = "./time_rate_logs/time_rate" + Date.now() + ".log";
			let duration = parseInt(crowdsale.tiers[0].endTime)-parseInt(crowdsale.tiers[0].startTime);
			await fs.writeFileSync(fileLog, "duration = " +duration/60000 + "min  \n");
			await fs.appendFileSync(fileLog,"execID = " +crowdsale.executionID);
			await fs.appendFileSync(fileLog, "minRate = " + crowdsale.tiers[0].minRate + "\n");
			await fs.appendFileSync(fileLog, "maxRate = " + crowdsale.tiers[0].maxRate + "\n");

			let object = {time: "", rate: ""};
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
				arrayLog.push(object.rate+"\n");
			}
			while ((parseInt(status.time_remaining) !== 0));

			await fs.appendJsonSync(file, array);
			await fs.appendFileSync(fileLog, arrayLog);
			return file;

		}
		catch(err) {
			console.log("Can not takeFunctionRateTime " + err);
			return null;
		}
	}

	static async  getCrowdsaleStatusRopsten(crowdsale,abi) {
		console.log("getCrowdsaleStatusRopsten");
		try {
			let networkIDRopsten = 3;
			const web3 = await Utils.getWeb3Instance(networkIDRopsten);
			let REACT_APP_REGISTRY_STORAGE_ADDRESS = "0xb1d914e7c55f16c2bacac11af6b3e011aee38caf";
			let REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS = "0xbe9c4888a51761f6c5a7d3803106edab7c96196e";
			let myContract = new web3.eth.Contract(abi, REACT_APP_DUTCH_CROWDSALE_INIT_CROWDSALE_ADDRESS);
			let status = await myContract.methods.getCrowdsaleStatus(REACT_APP_REGISTRY_STORAGE_ADDRESS, crowdsale.executionID).call();
			//console.log("status = " + status );
			return status;
		}
		catch (err) {
			console.log("Can not get status. " + err);
			return 0;
		}

	}




}

module.exports = {
	Utils: Utils

}

