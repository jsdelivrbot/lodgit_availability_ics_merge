var txt =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:lodgit
BEGIN:VEVENT
DTSTART:19700101
DTEND:20170714
END:VEVENT
BEGIN:VEVENT
DTSTART:20170721
DTEND:20170723
END:VEVENT
BEGIN:VEVENT
DTSTART:20170725
DTEND:20170729
END:VEVENT
BEGIN:VEVENT
DTSTART:20170804
DTEND:20170807
END:VEVENT
BEGIN:VEVENT
DTSTART:20171011
DTEND:20171022
END:VEVENT
BEGIN:VEVENT
DTSTART:20171231
DTEND:20180101
END:VEVENT
BEGIN:VEVENT
DTSTART:20190714
DTEND:20220714
END:VEVENT
END:VCALENDAR`;

var reg = /BEGIN:VEVENT\nDTSTART:([0-9]{8})\nDTEND:([0-9]{8})/g;

//var reg = /DTSTART:[0-9]+/g;

console.log(txt.match(reg));

var res = reg.exec(txt);

console.log(res[1]);
console.log(res[2]);

console.log(reg.exec(txt));

/*
var str = `Recipient: test@test.com
Action: failed
Status: 5.0.0 (permanent failure)
Diagnostic: No`;

var regex = /Status: ([0-9\.]+) \(([a-zA-Z ]+)\)/;
var result = str.match(regex);
var statusNumber = result[1];
var statusString = result[2];
console.log(statusNumber);
console.log(statusString);*/