var winston = require('winston');
const fs = require('fs');

if (!fs.existsSync('./temp'))
    fs.mkdirSync('./temp');

    var tempOutputPath='./temp/';
    var logger = new (winston.Logger)({
        transports: [
            //new (winston.transports.Console)(),
            new (winston.transports.File)({filename: './temp/result.log'})
        ]
    });

//logger.log('info', 'Hello distributed log files!');
//logger.info('Hello again distributed logs');

//logger.level = 'debug';
//logger.log('debug', 'Now my debug messages are written to console!');

exports.logger=logger;
exports.tempOutputPath=tempOutputPath;