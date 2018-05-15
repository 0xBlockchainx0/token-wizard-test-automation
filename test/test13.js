webdriver = require('selenium-webdriver');
let test = require('selenium-webdriver/testing');
let assert = require('assert');


test.describe('Test13', async function () {
	this.timeout(2400000);//40 min
	this.slow(1800000);

	test.it('Test13.1',
		async function () {
		console.log("wefwefwef")
			return await assert.equal(true, true, 'Test FAILED. Crowdsale has not created ');
		});

	test.it('Test13.2',
		async function () {
			console.log("wefwewefwefwef")
			return await assert.equal(true, true, 'Test FAILED. Crowdsale has not created ');
		});
	test.it('Test13.3',
		async function () {
			return await assert.equal(true, false, 'Test FAILED. Crowdsale has not created ');
		});

});



