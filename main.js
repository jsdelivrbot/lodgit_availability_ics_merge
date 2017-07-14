var request = require('request');
var moment = require('moment');
//define rooms and pools

var rooms = {
    SU01: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/HL99M-94B2L-8QFYS-2CMX6-4DQBS-D60TD-4X.ics",
        ics_txt : "",
    },
    SU02: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/MWNJ5-175D7-S4CER-XA1T7-WHCTH-E7WK6-5X.ics",
        ics_txt : "",
    },
    SU03: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/JWMYC-PX3AZ-4VGDP-HAG8A-05F1G-6205G-3V.ics",
        ics_txt : "",
    },
    SU11: {
        enabled: true,
        pool: "comfort",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/PU3J6-U785Z-0V8ZY-WEM6C-4JMU4-GGL1H-KD.ics",
        ics_txt : "",
    },
    SU12: {
        enabled: true,
        pool: "comfort",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/F8F3X-2DUUN-AXNGD-JD4EB-RN8BM-BLM32-ZR.ics",
        ics_txt : "",
    },
    SU13: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/Z0K7W-SFV31-7E827-13LGS-AX0PH-Y3GC8-JB.ics",
        ics_txt : "",
    },
    SU14: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/P6619-0SG5L-860WG-G6SM0-GPSTY-WBGS2-G0.ics",
        ics_txt : "",
    },
    SU15: {
        enabled: false,
        pool: "",
        ics_lnk : "no ics link - no online module",
        ics_txt : "",
    },
    SU21: {
        enabled: true,
        pool: "luxus2sz",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/D5GM7-366FW-LFWD3-BTBGT-70Z2Z-NXSH9-C6.ics",
        ics_txt : "",
    },
    SU22: {
        enabled: true,
        pool: "luxus2sz",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/DKA8R-SRHE0-T6U25-U87VN-SFYQU-M2T02-E8.ics",
        ics_txt : "",
    },
    SU23: {
        enabled: true,
        pool: "luxus",
        ics_lnk : "https://www.lodgit.com/ics/N8EPR-39734-1WG3T-E4VVP-77V5L-NKPN4-JC/E8K42-3V44X-DB76T-B5VWA-XFCQ0-3VXMP-03.ics",
        ics_txt : "",
    }
};

var pools = {
    luxus: {
        merged: []
    },
    comfort: {
        merged: []
    },
    luxus2sz: {
        merged: []
    }
}

//define pools

//fetch ical files

// report on not able to fetch all links!!!

var reg = /BEGIN:VEVENT\nDTSTART:([0-9]{8})\nDTEND:([0-9]{8})/g;

var fn = function (key, i, arr){
    return new Promise((resolve,reject) => {
        request(rooms[key].ics_lnk, function (error, response, body) {
            if (error) {
                resolve(false);
                reject(true);
                return false;
            }
            if (rooms[key].enabled){
                //console.log("-------------- " + key + " --------------");

                // console.log('error:', error); // Print the error if one occurred 
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                
                rooms[key].ics_txt = body;

                var res = true;
                rooms[key].evts_txt = new Array();
                rooms[key].evts = new Array();

                while (res){
                    res = reg.exec(rooms[key].ics_txt);
                    if (res==null){break;}

                    //console.log(res);
                    rooms[key].evts.push({begin: moment(res[1], "YYYYMMDD"), end: moment(res[2], "YYYYMMDD")});
                    rooms[key].evts_txt.push({begin: res[1], end: res[2]});
                }
                resolve(true);
            }
        })
    });
}

var promises = Object.keys(rooms).map(fn);

var p_result = Promise.all(promises);

p_result.then(function(){
    //log_rooms();
    mergeAllPools();
});

function log_rooms(){
    console.log(rooms);
    Object.keys(rooms).forEach((r_key)=>{
        if (!rooms[r_key].enabled) return;
        console.log("\n---- " + r_key + " --------------------------------------------------");
        console.log(rooms[r_key].ics_txt);
        rooms[r_key].evts_txt.forEach((e)=>{
            console.log(e);
        });
        rooms[r_key].evts.forEach((e)=>{
            console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
        });
    });
}

function mergeAllPools(){
    //merge("comfort");
    merge("luxus");
    //merge("luxus2z");
}

function merge(poolName){
    var firstDone = false;
    Object.keys(rooms).forEach((r_key,i,arr)=>{
        if (!rooms[r_key].enabled) return;
        if (rooms[r_key].pool!=poolName) return;
        if (firstDone)return;
        firstDone=true;
        console.log("\n---- " + r_key + " --------------------------------------------------");

        rooms[r_key].evts.forEach((e,i,arr)=>{
            console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
            if (i == 0) return;
            if (i == arr.length -1) return;
            var iD = e.begin;
            while(iD.isSameOrBefore(e.end)){
                console.log(iD.format("YYYY.MM.DD"));
                //does this day occur in any other reserved timperiod of other rooms in this pool
                iD.add(1,"d");
            }
        });
    });
}

function reservedInEveryOtherRoom(poolName){
    var firstDone = false;
    Object.keys(rooms).forEach((r_key,i,arr)=>{
        if (!rooms[r_key].enabled) return;
        if (rooms[r_key].pool!=poolName) return;
        if (firstDone)return;
        firstDone=true;
        console.log("\n---- " + r_key + " --------------------------------------------------");

        rooms[r_key].evts.forEach((e,i,arr)=>{
            console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
            if (i == 0) return;
            if (i == arr.length -1) return;
            var iD = e.begin;
            while(iD.isSameOrBefore(e.end)){
                console.log(iD.format("YYYY.MM.DD"));
                //does this day occur in any other reserved timperiod of other rooms in this pool
                iD.add(1,"d");
            }
        });
    });
}



//compare AND and merge in obj

//store merge obj in file