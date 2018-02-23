const Logger= require('../entity/Logger.js');
const logger=Logger.logger;
const tempOutputPath=Logger.tempOutputPath;

const fs = require('fs');
const tier=require('./Tier.js');
const Tier=tier.Tier;
const reservedTokens=require('./ReservedTokens.js');
const ReservedTokens=reservedTokens.ReservedTokens;
const whitelist=require('./Whitelist.js');
const Whitelist=whitelist.Whitelist;
class Currency{

    constructor()
    {
       this.name;
       this.ticker;
       this.walletAddress;
       this.reservedTokens=[];
       this.whitelist=[];
       this.gasPrice;
       this.minCap;
       this.whitelisting=false;
       this.tiers=[];
    }



    static createCurrency(fileName){
        var c=new Currency();
        c.parser(fileName);

        return c;

    }

   parser(fileName){
       logger.info(fileName);
        var obj=JSON.parse(fs.readFileSync(fileName,"utf8"));

        this.name=obj.name;
        this.ticker=obj.ticker;
        this.decimals=obj.decimals;

       for (var i=0;i<obj.reservedTokens.length;i++)
       {
           this.reservedTokens.push(
               new ReservedTokens(
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
        for (var i=0;i<obj.tiers.length;i++)
        {
            var wh;
            if (this.whitelisting) wh=obj.tiers[i].whitelist;
            else wh=null;
            this.tiers.push(
                new Tier(obj.tiers[i].name,
                    obj.tiers[i].allowModify,
                    obj.tiers[i].rate,
                    obj.tiers[i].supply,
                    obj.tiers[i].startTime,
                    obj.tiers[i].startDate,
                    obj.tiers[i].endTime,
                    obj.tiers[i].endDate,
                    wh

                )

                )
        }


    }

print(){
    logger.info("Crowdsale settings");
    logger.log("name :"+this.name);
    logger.log("ticker :"+this.ticker);
    logger.log("decimals:"+this.decimals);
    logger.log("Reserved Tokens:"+this.reservedTokens.length);

    for (var i=0;i<this.reservedTokens.length;i++)
    {
        logger.log("reserved tokens#:"+i);
        logger.log("Address:"+this.reservedTokens[i].address);
        logger.log("Dimension:"+this.reservedTokens[i].dimension);
        logger.log("Value:"+this.reservedTokens[i].value);

    }
    logger.log("Whitelisting:"+this.whitelisting);
    logger.log("WalletAddress:"+this.walletAddress);
    logger.log("gasprice:"+this.gasPrice);
    logger.log("mincap:"+this.minCap);


    logger.log("Number of tiers:"+this.tiers.length);
    for (var i=0;i<this.tiers.length;i++)
    {
        logger.log("Tier #"+i);
        logger.log("name:"+this.tiers[i].name);
        logger.log("allowModify:"+this.tiers[i].allowModify);
        logger.log("startDate:"+this.tiers[i].startDate);
        logger.log("startTime:"+this.tiers[i].startTime);
        logger.log("endDate:"+this.tiers[i].endDate);
        logger.log("endTime:"+this.tiers[i].endTime);
        logger.log("rate:"+this.tiers[i].rate);
        logger.log("supply:"+this.tiers[i].supply);
if(this.tiers[i].whitelist!=null) {
    logger.log("Whitelist:" + this.tiers[i].whitelist.length);
    for (var j = 0; j < this.tiers[i].whitelist.length; j++) {
        logger.log("whitelist#:" + j);
        logger.log("Address:" + this.tiers[i].whitelist[j].address);
        logger.log("Min:" + this.tiers[j].whitelist[j].min);
        logger.log("Max:" + this.tiers[j].whitelist[j].max);

    }
}

    }

}

}

module.exports={
    Currency:Currency
}