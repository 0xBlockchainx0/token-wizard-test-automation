const logger= require('../entity/Logger.js').logger;
const fs = require('fs');

class DutchAuction extends Crowdsale {

	constructor(){
		super();

		this.minRate;
		this.maxRate;
		this.totalSupply;
	}

	async parser(fileName) {
		super.parser(fileName);
		let obj=JSON.parse(fs.readFileSync(fileName,"utf8"));
		this.minRate=obj.minRate;
		this.maxRate=obj.maxRate;
		this.totalSupply=obj.totalSupply;
	}

	print() {
		logger.info("DutchAuction parameters ");
		logger.info("totalSupply :"+this.totalSupply);
		logger.info("maxRate :"+this.maxRate);
		super.print();
	}
}