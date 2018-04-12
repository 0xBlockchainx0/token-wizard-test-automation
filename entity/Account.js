'use strict';

class Account {

	constructor(address,privateKey){
		this.address=address;
		this.privateKey=privateKey;
        this.balance;
	}
}
module.exports.Account=Account;