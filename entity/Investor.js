const user=require("./User.js");
const User=user.User;
class Investor extends User
{
    constructor(driver,file){
        super(driver,file);

    }
    print(){
        console.log("account:"+this.account);
        console.log("privateKey:"+this.privateKey);
        console.log("networkID:"+this.networkID);

    }
    contribute(){

    }

    getTokensAmount(){

    }


}