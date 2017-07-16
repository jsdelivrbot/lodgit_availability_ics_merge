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
        merged_moment: [],
        merged_str: []
    },
    comfort: {
        merged_moment: [],
        merged_str: []
    },
    luxus2sz: {
        merged_moment: [],
        merged_str: []
    }
}

//define pools

//fetch ical files

// report on not able to fetch all links!!!

var reg = /BEGIN:VEVENT\nDTSTART:([0-9]{8})\nDTEND:([0-9]{8})/g;

var fn = function (key, i, arr){
    return new Promise((resolve,reject) => {
        request(rooms[key].ics_lnk, function (error, response, body) {
            //console.log(key + ": statuscode=" + response.statusCode);
            if (error || response.statusCode != 200) {
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
                    if (res==null) {break;}

                    //console.log(res);
                    rooms[key].evts.push({begin: moment(res[1], "YYYYMMDD"), end: moment(res[2], "YYYYMMDD")});
                    rooms[key].evts_txt.push({begin: res[1], end: res[2]});
                }
                resolve(true);
            }
        })
    });
}

var promises = Object.keys(rooms).filter((r_key) => rooms[r_key].enabled).map(fn);

var p_result = Promise.all(promises);

p_result.then(function(){
    //log_rooms();
    mergeAllPools();
});

p_result.catch(function(){
    console.log("not every promise fulfilled - not all roomes catched");
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
    console.log("_______ luxus _______________________________________________________________________________");
    merge("luxus");
    // printPool("luxus");
    console.log("_______ comfort ______________________________________________________________________________");
    merge("comfort");
    // printPool("comfort");
    console.log("_______ luxus2sz _____________________________________________________________________________");
    merge("luxus2sz");
    // printPool("luxus2sz");
    //merge("luxus2z");
    mergeIntoPeriods("luxus");
    mergeIntoPeriods("comfort");
    mergeIntoPeriods("luxus2sz");
}

function printPool(poolName){
    //console.log(pools[poolName].merged);
    console.log("merged_moment --------- ");
    pools[poolName].merged_moment.map(function(o,i){
        console.log("[" + i + "] " + o.format("YYYY.MM.DD"));
    });
    console.log("merged_str --------- ");
    pools[poolName].merged_str.map(function(o,i){
        console.log("[" + i + "] " + o);
    });
}

function merge(poolName){
    var firstDone = false;
    Object.keys(rooms).forEach((r_key,i,arr)=>{
        if (!rooms[r_key].enabled) return;
        if (rooms[r_key].pool!=poolName) return;
        if (firstDone)return;   //only do first in the pool and then compare all reserved day against the reserved periods in the other rooms 
        firstDone=true;
        console.log("\n---- " + r_key + " --------------------------------------------------");
        //iterate through all reserved time periods
        rooms[r_key].evts.forEach((e,i,arr)=>{
            console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
            if (i == 0) return;               //first one is always from 1970 to now
            if (i == arr.length -1) return;   //last one is always from now to in two years
            var iD = e.begin;
            while(iD.isSameOrBefore(e.end)){    //iterate through all days in the given period
                //does this day occur in any other reserved timperiod of other rooms in this pool
                if (!oneOfAllOtherRoomsAvailable(poolName, r_key, iD)){
                    console.log("   " + iD.format("YYYY.MM.DD") + " - overlap");
                    pools[poolName].merged_moment.push(moment(iD));
                    pools[poolName].merged_str.push(iD.format("YYYY.MM.DD"));
                } else {
                    console.log("   " + iD.format("YYYY.MM.DD") + "");
                }
                iD.add(1,"d");
            }
        });
    });
}

function oneOfAllOtherRoomsAvailable(poolName,exclude_key,day){
    var oneRoomVacant = false;
    //iterate through all rooms
    Object.keys(rooms).forEach((r_key,i,arr)=>{
        if (!rooms[r_key].enabled) return;
        if (rooms[r_key].pool!=poolName) return;    //only process rooms in specified pool
        if (r_key == exclude_key)return;    //do not check the comparison key
        //console.log("\n---- " + r_key + " --------------------------------------------------");
        //iterate through all reserved time periods
        var overlap = false;
        rooms[r_key].evts.forEach((e,i,arr)=>{
            //console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
            if (i == 0) return;               //first one is always from 1970 to now
            if (i == arr.length -1) return;   //last one is always from now to in two years
            let begin = day.isSameOrAfter(e.begin);
            let end = day.isSameOrBefore(e.end);
            if (day.isSameOrAfter(e.begin) && day.isSameOrBefore(e.end)){
                overlap = true;
                return true;
            }
            /*while(iD.isSameOrBefore(e.end)){
                console.log(iD.format("YYYY.MM.DD"));
                //does this day occur in any other reserved timperiod of other rooms in this pool
                iD.add(1,"d");
            }*/
        });
        if (!overlap) {oneRoomVacant=true}
    });
    return oneRoomVacant;
}

function mergeIntoPeriods(poolName){
    // var dayBefore = {};
    var dayBefore = moment(pools[poolName].merged_moment[0]).subtract(7,"days");

    pools[poolName].merged_moment.map(function(m,i){
        console.log("diff[" + i + "]: " + m.format("YYYY.MM.DD") + ": " + dayBefore.diff(m,"days"));
        if(dayBefore.diff(m,"days") == -1) {
            //console.log("diff = -1");
        }
        dayBefore = moment(m);
    });
}

//compare AND and merge in obj

//store merge obj in file