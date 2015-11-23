/**
 * Simya: Convert selenium html (selenese) file into python source code from command line
 * Usage: phantom simya.js [PATH_TO_SELENESE] [OUTPUT_FILE]
 */
var system = require('system');
var fs = require('fs');
var args = system.args;


if (!args[1]) {
    console.log('Error: You have to set the selenese file path');
    phantom.exit();
}

if (!args[2]) {
    console.log('Error: You have to set output file name');
    phantom.exit();
}

var page = require('webpage').create();
var fileName = args[1];
var outputFileName = args[2];

try {
    var selenese = fs.read(fileName);
} catch (e) {
    console.log('Error: Cant find selenese file on path:', fileName);
    phantom.exit();
}

var output = []; //message output

try {
    var content = fs.read('template.html');
} catch (e) {
    console.log('Error: Cant find template file. Make sure you are running this script inside src directory');
    phantom.exit();
}



//replace #--selenese--# text in content with given selenese file from arguments[1]
content = content.replace('#--selenese--#', selenese);


page.onConsoleMessage = function(msg) {
    output.push(msg);

    //if msg contains # -*- it means our python code
    if (msg.indexOf("# -*-") > -1) {
        fs.write(outputFileName, msg, 'w');
        console.log("Success: File written to", outputFileName);
        phantom.exit();
    }
};

//evaluate javascript when page load finish
page.onLoadFinished = function(status) {
    page.evaluate(function() {
        parseIt();
        getOutput(function (out) {
            console.log(out);
        });
    });
};

page.setContent(content, 'file://'+fs.workingDirectory+'/');

setTimeout(function () {
    console.log("FATAL: Something went wrong - Timed out");
    console.log(output.join("\n"));
    phantom.exit();
}, 5000);
