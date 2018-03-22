const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

class Crowdsale {

    constructor(currency,tokenAddress,contractAddress,url,abi){
        this.currency=currency;
        this.tokenAddress=tokenAddress;
        this.contractAddress=contractAddress;
        this.url=url;
        this.tokenContractAbi=abi;
    }



}
module.exports.Crowdsale=Crowdsale;