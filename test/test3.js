var assert = require('assert');
var test = require('selenium-webdriver/testing');
const utils=require('../utils/Utils.js');
const Utils=utils.Utils;
let endTime="2018-07-01T15:34";

let newDate="01/07/2018";
let newTime="15:34";
let result =  Utils.compare(endTime, newDate, newTime);

console.log(result);