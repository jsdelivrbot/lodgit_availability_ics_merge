var moment = require('moment');

var today = moment("2017.07.16","YYYY.MM.DD");

today.add(1,"d");

console.log(today.format("YYYY-MM-DD"));