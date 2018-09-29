const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    googleId: String,
    name: String
 
});

var User = module.exports = mongoose.model('users', UserSchema);