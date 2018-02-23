const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;


class ReservedTokens  {

    constructor(address, dimension, value) {

        this.address = address;
        this.dimension = dimension;
        this.value = value;


    }
}



module.exports.ReservedTokens=ReservedTokens;