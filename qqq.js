var GoogleSpreadsheet = require('google-spreadsheet');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var creds = require('./client_secret.json');
const fs = require('fs');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs');
var fileName="./abracadabra.txt";
var sheet;

async.series([
	function setAuth(step) {
		// see notes below for authentication instructions!


		doc.useServiceAccountAuth(creds, step);
	},
	function getInfoAndWorksheets(step) {
		doc.getInfo(function( info) {

			sheet = info.worksheets[0];

		});
	},
	function workingWithCells(step) {
		sheet.getCells({
			'min-row': 1,
			'max-row': 1,
			'min-col': 1,
			'max-col': 1,
			'return-empty': true
		}, function(err, cells) {
			var cell = cells[0];

			cell.value = '=A1+B2'
			cell.save(); //async



			step();
		});
	}
], function(err){
	if( err ) {
		console.log('Error: '+err);
	}
});