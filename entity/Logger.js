const winston = require('winston');
const fs = require('fs-extra');

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf } = format;

const myFormat = printf(info => {
    return `[${info.timestamp}]  ${info.message} `;
    //return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});


const tempOutputPath='./temp/';
fs.ensureDirSync(tempOutputPath);//create if doesn't exist
tempOutputFile=tempOutputPath+'result.log';
fs.ensureFileSync(tempOutputFile);
//const moment = require('moment');
//function tsFormat (){ return moment().format('YY-MM-DD hh:mm:ss').trim();}
//console.log(tsFormat());
const logger = createLogger({

   format: combine(
        label({ label: '' }),
        timestamp(),
        myFormat
    ),
   transports: [
       // new (winston.transports.Console)(),
        new (winston.transports.File)({filename: tempOutputFile})

    ]
});


exports.logger=logger;
exports.tempOutputPath=tempOutputPath;





