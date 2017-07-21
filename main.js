/* 
Written: Jacob Haemmerle
fetched die ics calendar availability files vom jeder suite vom lodgit server und merged die verschiedenen pools/kategorien
zu einem ics file welches airbnb etc. als verfügbarkeits ics datei angeboten werden kann
Zentrales "problem":
im ics includiert jede buchungsperiode den abreisetag |***-|
beim tagweisen vergleichen können zwei (merged) perioden aneinanderkommen und der merge wird dann zu einer
deswegen wird nach dem parsen beim prozessieren dann das konzept 1 Tag repräsentiert sie kommende Nächtigung
angewendet
erst beim erstellen des ics wir dann wieder formatconform 1 tag hinter jede periode gehängt
- beachten, dass die string version der moment.js objecte das datum mit zeitpunkt 00:00:00 in UTC repräsentieren
je nach sommer oder winterzeit der tag davor 22:00 oder 23:00 - das passt so, is einfach nur in UTC
*/

var request = require('request');
var moment = require('moment');
var out = require('./out.js');
var fs = require('fs');
//define rooms and pools

//var p = {};

//var r = {};

var o = {};

var rooms = {};
const rooms_tmpl = {
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

const ics_snippets = {
    start: `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:lodgit\n`,
    event: {
        begin: `BEGIN:VEVENT\nDTSTART:`,
        intermed: `DTEND:`,
        end: `END:VEVENT\n`,
    },
    end: `END:VCALENDAR`
}

var pools = {};
const pools_tmpl = {
    luxus: {
        merged_moment: [],
        merged_str: [],
        periods_moment: [],
        periods_str: []
    },
    comfort: {
        merged_moment: [],
        merged_str: [],
        periods_moment: [],
        periods_str: []
    },
    luxus2sz: {
        merged_moment: [],
        merged_str: [],
        periods_moment: [],
        periods_str: []
    }
}

var log = {};
const log_tmpl = {
    fetched: false,
    pools_merged: false,
    ics_saved: false
}

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

//run script every interv_m minutes
var interv_m = 0.05;

interv_m = interv_m * 1000 * 60;

// doPromise();

var intervalID = setInterval(function(){
    start_script();
}, interv_m);

function start_script(){
    o = new out.Out('./public/index.html');
    //r = new out.Out('./public/rooms.html');
    //p = new out.Out('./public/pools.html');
    /* rooms = null;
    pools = null;
    pools = undefined;
    pools = {};
    log = null; */

    rooms =  JSON.parse(JSON.stringify(rooms_tmpl));
    pools = JSON.parse(JSON.stringify(pools_tmpl));
    log = JSON.parse(JSON.stringify(log_tmpl));

    //r.f(rooms_tmpl,"//rooms_tmpl at start\n");
    //p.f(pools_tmpl,"//pools_tmpl at start\n");

    //o.c(rooms_tmpl);
    //o.c(pools);
    doPromise();
}

function doPromise(){
    //generate array of promises
    var promises = Object.keys(rooms).filter((r_key) => rooms[r_key].enabled).map(fn);

    var p_result = Promise.all(promises);

    p_result.then(function(){
        log.fetched = true;
        logOutRooms();
        mergeAllPools();
        log.pools_merged = true;
        var prom = new Promise(function (resolve, reject){buildICSfiles(resolve,reject);});
        return prom;
    }).then(function(){
        consoleLogResult();
        //r.f(rooms_tmpl,"//rooms_tmpl at finish\n");
        //p.f(pools_tmpl,"//pools_tmpl at finish\n");
    }).catch(function(){
        consoleLogResult();
    });

    p_result.catch(function(){
        console.warn("not every promise fulfilled - not all roomes catched");
    });
}

function consoleLogResult(){
    //while(!log.ics_saved){};
    o.c("(" + (log.fetched ? "*" : "-") + "|" + (log.pools_merged ? "*" : "-") + "|" + (log.ics_saved ? "*" : "-") + ") all fetched|all merged|all files stored", true);
}

function buildICSfiles(resolve, reject){
    var keys = Object.keys(pools);
    let last =  false;
    keys.forEach((p,i,arr) => {
        if (i == arr.length -1) last = true;
        buildFile(pools[p], "./public/" + p + ".ics", last, resolve, reject);
        // console.log(attr + ": " + pools[attr]);
    });

}

function logOutRooms(){
    o.f(rooms,"//The rooms obj after reception and processing\n");
    /*console.log(rooms);
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
    });*/
}

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
    // console.log("_______ luxus _______________________________________________________________________________");
    merge("luxus");
    mergeIntoPeriods("luxus");
    // printPool("luxus");
    // console.log("_______ comfort ______________________________________________________________________________");
    merge("comfort");
    mergeIntoPeriods("comfort");
    // printPool("comfort");
    // console.log("_______ luxus2sz _____________________________________________________________________________");
    merge("luxus2sz");
    mergeIntoPeriods("luxus2sz");

    printPoolsToFile();
}

function printPoolsToFile(){
    o.f(pools, "//----------------------- POOLS -----------------------------\n");
}

function printPool(poolName){
    //console.log(pools[poolName].merged);
    var pp = "//Individual Data ----------------- " + poolName + " -----------------------------\n";
    o.f(pools[poolName].merged_str, pp);
    /*console.log("merged_moment --------- ");
    pools[poolName].merged_moment.map(function(o,i){
        console.log("[" + i + "] " + o.format("YYYY.MM.DD"));
    });
    console.log("merged_str --------- ");
    pools[poolName].merged_str.map(function(o,i){
        console.log("[" + i + "] " + o);
    });*/
}

function merge(poolName){
    var firstDone = false;
    Object.keys(rooms).forEach((r_key,i,arr)=>{
        if (!rooms[r_key].enabled) return;
        if (rooms[r_key].pool!=poolName) return;
        //if (r_key == "SU11") {return;}
        if (firstDone)return;   //only do first in the pool and then compare all reserved day against the reserved periods in the other rooms 
        firstDone=true;
        // console.log("\n---- " + r_key + " --------------------------------------------------");
        //iterate through all reserved time periods
        rooms[r_key].evts.forEach((e,i,arr)=>{
            // console.log(e.begin.format("YYYY.MM.DD") + " - " + e.end.format("YYYY.MM.DD"));
            if (i == arr.length -1 && arr.length > 1) return;   //last period is always from now to in two years so skip it
            if (i == 0) {   //first period is always from 1970 to today (or next available day in the future)
                //when first period from 1970 will end today it will not even do the while loop => today will not be pushed
                //therefore set iD to today
                var iD = moment(moment().format("YYYY.MM.DD"),"YYYY.MM.DD");
            }else{
                var iD = e.begin;
            }
            while(iD.isBefore(e.end)){    //iterate through all days in the given period - but the last one
                //does this day occur in any other reserved timperiod of other rooms in this pool
                if (!oneOfAllOtherRoomsAvailable(poolName, r_key, iD)){
                    // console.log("   " + iD.format("YYYY.MM.DD") + " - overlap");
                    pools[poolName].merged_moment.push(moment(iD));
                    pools[poolName].merged_str.push(iD.format("YYYY.MM.DD"));
                } else {
                    // console.log("   " + iD.format("YYYY.MM.DD") + "");
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
            //if (i == 0) return;               //first one is always from 1970 to next available dat in the future
            if (i == arr.length -1 && arr.length > 1) return;   //last one is always from now to in two years
            let begin = day.isSameOrAfter(e.begin);
            let end = day.isSameOrBefore(e.end);
            if (day.isSameOrAfter(e.begin) && day.isBefore(e.end)){
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
    //fasst das array mit den merged einzeltagen für jeden pool in zeitperiode mit begin und end
    //var dayBefore = {};
    //var dayBefore = moment(pools[poolName].merged_moment[0]).subtract(7,"days");
    var dayBefore = moment(pools[poolName].merged_moment[0]);
    let firstone = true;
    pools[poolName].merged_moment.map(function(m,i,arr){
        // console.log("diff[" + i + "]: " + m.format("YYYY.MM.DD") + ": " + dayBefore.diff(m,"days"));
        switch (true){
            case (i==0):
                //moment(moment().format("YYYY.MM.DD"),"YYYY.MM.DD");
                //wenn erster tag heute ist, ist die periode von 1970 über heute hinausgegangen, also mindestens
                //bis morgen => periode von 1970 eröffnen und anhängen
                // i = 0 m == heute gibts nicht wegen setzten auf iD = heute und abfrage while(iD.isBefore(e.end)) in merge
                if (m.isSame(moment(),'day')){
                    //"von 1970" eröffnen und dort anhängen
                    // 1970 -->
                    pools[poolName].periods_moment.push({
                        begin: moment(moment("19700101","YYYYMMDD")),
                        end: {}
                    });
                    pools[poolName].periods_str.push({
                        begin: "19700101",
                        end: ""
                    });
                    if (arr.length >= 1){
                        pools[poolName].periods_moment[pools[poolName].periods_moment.length - 1].end = moment(m);
                        pools[poolName].periods_str[pools[poolName].periods_moment.length - 1].end = m.format("YYYYMMDD");
                    }
                //wenn m nach heute ist
                }else if(m.isAfter(moment(),'day')){
                    //insert/add 1970 to today  1970 ---|
                    //
                    pools[poolName].periods_moment.push({
                        begin: moment(moment("19700101","YYYYMMDD")),
                        end: moment(moment().format("YYYY.MM.DD"),"YYYY.MM.DD").subtract(1,"d")
                    });
                    pools[poolName].periods_str.push({
                        begin: "19700101",
                        end: moment().subtract(1,"d").format("YYYY.MM.DD")
                    });
                    //open next period      1970 ---|   |->
                    //at current day
                    pools[poolName].periods_moment.push({
                        begin: moment(m),
                        end: {}
                    });
                    pools[poolName].periods_str.push({
                        begin: m.format("YYYYMMDD"),
                        end: ""
                    });
                }
                
                break;
            case (dayBefore.diff(m,"days") < -1):
                //close old period - begin new
                pools[poolName].periods_moment[pools[poolName].periods_moment.length-1].end = moment(dayBefore);
                pools[poolName].periods_str[pools[poolName].periods_str.length-1].end = dayBefore.format("YYYYMMDD");
                pools[poolName].periods_moment.push({
                    begin: moment(m),
                    end: {}
                });
                pools[poolName].periods_str.push({
                    begin: m.format("YYYYMMDD"),
                    end: ""
                });
                break;
            case (i == arr.length-1):
                //close last period with current day (m)
                pools[poolName].periods_moment[pools[poolName].periods_moment.length-1].end = moment(m);
                pools[poolName].periods_str[pools[poolName].periods_str.length-1].end = m.format("YYYYMMDD");
        }
        dayBefore = moment(m);
    });
}

function buildFile(pool, filePath, last, resolve, reject){

    if (fs.existsSync(filePath)) {
            fs.writeFile(filePath, '', function(err){ 
                if (err) {
                    log.ics_saved = false;
                    throw err;
                }
            });
    }

    var ics = ics_snippets.start;

    pool.periods_moment.map(function(m,i,arr){

        ics = ics + ics_snippets.event.begin + m.begin.format("YYYYMMDD") + '\n';
        ics = ics + ics_snippets.event.intermed + m.end.add(1,"d").format("YYYYMMDD") + '\n';;
        ics = ics + ics_snippets.event.end;

    });

    ics = ics + ics_snippets.end;

    fs.appendFile(filePath, ics, function (err) {
            if (err) {
                log.ics_saved = false;
                reject();
                throw err;
            }
            if (last) {
                log.ics_saved = true;
                resolve();
            }
            //o.c(pool.constructor.name + ' saved to ' + filePath, true);
    });
}