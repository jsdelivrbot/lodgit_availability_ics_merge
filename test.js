/* 
var o = {};

console.log(typeof o);

var moment =  require('moment');

var today = moment().startOf('day');

console.log(today); */

var obj = { a: 1 };
var copy = { z: 1, b : 2};
copy = Object.assign({f: 4}, obj);
console.log(copy); // { a: 1 }