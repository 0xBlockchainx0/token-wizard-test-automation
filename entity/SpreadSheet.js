var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var creds = require('../client_secret.json');
const fs = require('fs');
// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1oWsbaZspCJgAWxCfTEIUnhVWw0unS_apP6mYaBYWPXs');
var fileName="./abracadabra.txt";




class SpreadSheet {

	 static async readSheet() {

		doc.useServiceAccountAuth(creds, function (err) {

			// Get all of the rows from the spreadsheet.
			doc.getCells(1, {
				'min-row': 1,
				'max-row': 1,
				'min-col': 1,
				'max-col': 1,
				'return-empty': true
			}, function (err, cells) {
				var cell = cells[0];
				//console.log(cell.value);
				fs.writeFileSync(fileName, cell.value);
				if (cell.value != '1') {
					cell.value = "1";
					cell.save();

				}
			});
		});
		//console.log("return");
		var s = await fs.readFileSync(fileName, "utf8");
		return s;

	}

}
module.exports.SpreadSheet=SpreadSheet;

