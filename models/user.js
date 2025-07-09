const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
//passportLocalMongoose will automatically create usename and password so no need to mention

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    }
})

userSchema.plugin(passportLocalMongoose);//automatially implement salt hash and provude username and hashed password
module.exports = mongoose.model("User", userSchema);