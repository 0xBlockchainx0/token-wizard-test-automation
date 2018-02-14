const fs = require('fs');
class User {
    constructor(driver,file){
        this.driver=driver;
        var obj=JSON.parse(fs.readFileSync(file,"utf8"));
        this.account=obj.account;
        this.privateKey=obj.privateKey;
        this.networkID=obj.networkID;
    }
}
module.exports.User=User;
