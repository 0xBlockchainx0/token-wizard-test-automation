'use strict';
const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const fs = require('fs');
const tier=require('./Tier.js');
const Tier=tier.Tier;
const reservedTokens=require('./ReservedTokens.js');
const ReservedTokens=reservedTokens.ReservedTokens;

class Crowdsale {

  constructor(){
	  this.name;
	  this.ticker;
	  this.walletAddress;
	  this.reservedTokens=[];
	  this.whitelist=[];
	  this.gasPrice;
	  this.minCap;
	  this.whitelisting;
	  this.tiers=[];
      this.tokenAddress;
      this.contractAddress;
      this.url;
      this.tokenContractAbi;
  }

	async parser(fileName) {

		var obj=JSON.parse(fs.readFileSync(fileName,"utf8"));
		this.name=obj.name;
		this.ticker=obj.ticker;
		this.decimals=obj.decimals;
		for (var i=0;i<obj.reservedTokens.length;i++) {
			this.reservedTokens.push (
				new ReservedTokens (
					obj.reservedTokens[i].address,
					obj.reservedTokens[i].dimension,
					obj.reservedTokens[i].value
				)
			)
		}
		this.walletAddress=obj.walletAddress;
		this.gasPrice=obj.gasprice;
		this.minCap=obj.mincap;
		this.whitelisting=obj.whitelisting;
		for (var i=0;i<obj.tiers.length;i++) {
			var isWhitelist;
			if (this.whitelisting) {
				isWhitelist = obj.tiers[i].whitelist;
			}
			else {
				isWhitelist = null;
			}
			this.tiers.push(
				new Tier (
					obj.tiers[i].name,
					obj.tiers[i].allowModify,
					obj.tiers[i].rate,
					obj.tiers[i].supply,
					obj.tiers[i].startTime,
					obj.tiers[i].startDate,
					obj.tiers[i].endTime,
					obj.tiers[i].endDate,
					isWhitelist
				)
			)
		}
	}

	print(){
		logger.info("Crowdsale settings");
		logger.info("name :"+this.name);
		logger.info("ticker :"+this.ticker);
		logger.info("decimals:"+this.decimals);
		logger.info("Reserved Tokens:"+this.reservedTokens.length);

		for (var i=0;i<this.reservedTokens.length;i++) {
			logger.info("Reserved tokens#:"+i);
			logger.info("address:"+this.reservedTokens[i].address);
			logger.info("dimension:"+this.reservedTokens[i].dimension);
			logger.info("value:"+this.reservedTokens[i].value);
		}

		logger.info("whitelisting:"+this.whitelisting);
		logger.info("walletAddress:"+this.walletAddress);
		logger.info("gasprice:"+this.gasPrice);
		logger.info("mincap:"+this.minCap);
		logger.info("number of tiers:"+this.tiers.length);

		for (var i=0;i<this.tiers.length;i++) {
			logger.info("Tier #"+i);
			logger.info("name:"+this.tiers[i].name);
			logger.info("allowModify:"+this.tiers[i].allowModify);
			logger.info("startDate:"+this.tiers[i].startDate);
			logger.info("startTime:"+this.tiers[i].startTime);
			logger.info("endDate:"+this.tiers[i].endDate);
			logger.info("endTime:"+this.tiers[i].endTime);
			logger.info("rate:"+this.tiers[i].rate);
			logger.info("supply:"+this.tiers[i].supply);

			if(this.tiers[i].whitelist!=null) {
				logger.info("Whitelist:" + this.tiers[i].whitelist.length);
				for (var j = 0; j < this.tiers[i].whitelist.length; j++) {
					logger.info("whitelist#:" + j);
					logger.info("Address:" + this.tiers[i].whitelist[j].address);
					logger.info("Min:" + this.tiers[j].whitelist[j].min);
					logger.info("Max:" + this.tiers[j].whitelist[j].max);
				}
			}
		}
	}






}
module.exports.Crowdsale=Crowdsale;