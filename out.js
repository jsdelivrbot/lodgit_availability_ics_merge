var fs = require('fs');

exports.Out = function (path){
    this.path=path;
    this.c = function(o){
        console.log(o);
    }
    this.f = function (o, prepend){
        if (typeof o == "object"){
            var obj_str = JSON.stringify(o, undefined, 2);
            o = '<pre><code class="prettyprint linenums">' + prepend + obj_str + '</code></pre>';
        }
        fs.appendFile(path, o, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
    this.fc = function (o, prepend){
        if (typeof o == "object"){
            var obj_str = JSON.stringify(o, undefined, 2);
            //obj_str = syntaxHighlight(obj_str);
            //obj_str = o;
            console.log(obj_str);
            //o = '<pre><code>' + obj_str + '</code></pre>';
            o = '<pre><code class="prettyprint linenums">' + prepend + obj_str + '</code></pre>';
            //o = '<!--?prettify lang=html linenums=true?--><pre><code class="prettyprint linenums">' + test + '</code></pre>';
        }else{
            console.log(o);
        }
        
        fs.appendFile(path, o, function (err) {
            if (err) throw err;
            console.log('appended to file: ' + path);
        });
    }
    this.onnew = function () {
        var scriptTag = '<html><head><script src="https://rawgit.com/google/code-prettify/master/loader/run_prettify.js?autoload=true&amp;lang=css" defer></script></head>';
        scriptTag = scriptTag + `<style>pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
            .string { color: green !important; }
            .number { color: darkorange !important; }
            .boolean { color: blue !important; }
            .null { color: magenta !important; }
            .key { color: red !important; }</style>`;
        if (fs.existsSync(path)) {
            fs.writeFile(path, '', function(){console.log('log file cleared done')})
            fs.appendFile(path, scriptTag, function (err) {
                if (err) throw err;
                
            });
        }
    }
    this.onnew();
}


function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

var test = `{
  luxus: {
        merged_moment: [
        "2017-07-27T22:00:00.000Z",
        "2017-07-28T22:00:00.000Z",
        "2017-07-29T22:00:00.000Z",
        "2017-08-03T22:00:00.000Z",
        "2017-08-04T22:00:00.000Z",
        "2017-08-05T22:00:00.000Z",
        "2017-10-10T22:00:00.000Z",
        "2017-10-11T22:00:00.000Z",
        "2017-10-12T22:00:00.000Z",
        "2017-10-13T22:00:00.000Z",
        "2017-10-14T22:00:00.000Z",
        "2017-10-15T22:00:00.000Z",
        "2017-10-16T22:00:00.000Z",
        "2017-10-17T22:00:00.000Z",
        "2017-10-18T22:00:00.000Z",
        "2017-10-19T22:00:00.000Z",
        "2017-10-20T22:00:00.000Z",
        "2017-10-21T22:00:00.000Z"
        ],
        merged_str: [
        "2017.07.28",
        "2017.07.29",
        "2017.07.30",
        "2017.08.04",
        "2017.08.05",
        "2017.08.06",
        "2017.10.11",
        "2017.10.12",
        "2017.10.13",
        "2017.10.14",
        "2017.10.15",
        "2017.10.16",
        "2017.10.17",
        "2017.10.18",
        "2017.10.19",
        "2017.10.20",
        "2017.10.21",
        "2017.10.22"
        ],
        periods_moment: [
        {
            begin: "2017-07-27T22:00:00.000Z",
            end: "2017-07-29T22:00:00.000Z"
        },
        {
            begin: "2017-08-03T22:00:00.000Z",
            end: "2017-08-05T22:00:00.000Z"
        },
        {
            begin: "2017-10-10T22:00:00.000Z",
            end: "2017-10-21T22:00:00.000Z"
        }
        ],
    }
  }`;