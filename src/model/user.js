const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname_: { 
        type: String,
        default: null},
    lname_: { 
        type: String, 
        default: null},
    email_: { 
        type: String, 
        unique: true },
    passw_: { 
        type: String },
    token: { 
        type: String,
    },

});

module.exports = mongoose.model("user", userSchema);