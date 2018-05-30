'use strict';
const Logger = require('../entity/Logger.js');
const logger = Logger.logger;
const fs = require('fs');

class Crowdsale {

	constructor() {
		this.name;
		this.ticker;
		this.walletAddress;
		this.reservedTokens = [];
		this.gasPrice;
		this.minCap;

		this.tiers = [];
		this.tokenAddress;
		this.contractAddress;
		this.url;
		this.tokenContractAbi;
		this.executionID;
	}

	async parser(fileName) {
		let obj = JSON.parse(fs.readFileSync(fileName, "utf8"));
		this.name = obj.name;
		this.ticker = obj.ticker;
		this.decimals = obj.decimals;
		this.reservedTokens = obj.reservedTokens;
		this.walletAddress = obj.walletAddress;
		this.gasPrice = obj.gasprice;
		this.minCap = obj.mincap;
		this.tiers = obj.tiers;
	}

	print() {
		logger.info("Crowdsale settings");
		logger.info("name :" + this.name);
		logger.info("ticker :" + this.ticker);
		logger.info("decimals:" + this.decimals);
		logger.info("Reserved Tokens:" + this.reservedTokens.length);

		for (let i = 0; i < this.reservedTokens.length; i++) {
			logger.info("Reserved tokens#:" + i);
			logger.info("address:" + this.reservedTokens[i].address);
			logger.info("dimension:" + this.reservedTokens[i].dimension);
			logger.info("value:" + this.reservedTokens[i].value);
		}

		logger.info("walletAddress:" + this.walletAddress);
		logger.info("gasprice:" + this.gasPrice);
		logger.info("mincap:" + this.minCap);
		logger.info("number of tiers:" + this.tiers.length);

		for (let i = 0; i < this.tiers.length; i++) {
			logger.info("Tier #" + i);
			logger.info("name:" + this.tiers[i].name);
			logger.info("isWhitelisted:" + this.tiers[i].isWhitelisted);
			logger.info("allowModify:" + this.tiers[i].allowModify);
			logger.info("startDate:" + this.tiers[i].startDate);
			logger.info("startTime:" + this.tiers[i].startTime);
			logger.info("endDate:" + this.tiers[i].endDate);
			logger.info("endTime:" + this.tiers[i].endTime);
			logger.info("rate:" + this.tiers[i].rate);
			logger.info("supply:" + this.tiers[i].supply);
			logger.info("Whitelist length: " + this.tiers[i].whitelist.length);
			if (this.tiers[i].whitelist.length !== 0) {

				for (let j = 0; j < this.tiers[i].whitelist.length; j++) {
					logger.info("whitelist#:" + j);
					logger.info("Address: " + this.tiers[i].whitelist[j].address);
					logger.info("Min: " + this.tiers[i].whitelist[j].min);
					logger.info("Max: " + this.tiers[i].whitelist[j].max);
				}
			}
		}
	}

}

module.exports.Crowdsale = Crowdsale;