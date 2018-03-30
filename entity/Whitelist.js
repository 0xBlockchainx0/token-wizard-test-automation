const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

class Whitelist  {

    constructor(address, min, max) {

        this.address = address;
        this.min = min;
        this.max = max;

    }
}

module.exports.Whitelist=Whitelist;