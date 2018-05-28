class Tier {
	constructor(name, isWhitelisted, allowModify, rate, supply, startTime, startDate, endTime, endDate, whitelist) {
		this.name = name;
		this.isWhitelisted = isWhitelisted;
		this.allowModify = allowModify;
		this.rate = rate;
		this.supply = supply;
		this.startTime = startTime;
		this.startDate = startDate;
		this.endTime = endTime;
		this.endDate = endDate;
		this.whitelist = whitelist;
		this.minRate = undefined;
		this.maxRate = undefined;


	}
}
module.exports.Tier = Tier;
