var Db = require('mongodb').Db;
var env = process.env.NODE_ENV || 'development';

var myFunc1 = function() {
    console.log('hi'); 
};
exports.myFunc1 = myFunc1;
