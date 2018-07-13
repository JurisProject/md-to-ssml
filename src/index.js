var fs = require('fs');

var md2json = require('md-2-json');
var ssml = require('ssml-builder');

var defaultRules = JSON.parse(fs.readFileSync('./src/defaultRules.json', 'utf8'));
exports.defaultRules = defaultRules;

function applyRules( ssml, text, rules ) {
    for( var x in rules ) {
        switch( typeof rules[x] ) {
            case 'string':
                ssml[rules[x]](text);
                break;
            case 'object':
                var func = Object.keys(rules[x])[0];
                ssml[func](rules[x][func])
                break;
        }
    }

    return ssml;
}
exports.applyRules = applyRules;

function parseSections( ssml, sectionJson ) {
    var speech = ssml;

    for( var x in sectionJson ) {
        if ( x == "raw" ) {
            speech = applyRules(speech, sectionJson[x], defaultRules['paragraph']);
        } else {
            speech = applyRules(speech, x, defaultRules['heading']);

            parseSections( speech, sectionJson[x] );
        }
    }

    return speech;
}
exports.parseSections = parseSections;

exports.md2json = md2json;
exports.ssml = ssml;

exports.md2ssml = function( md ) {
    if( typeof md == 'undefined' ) return false;

    var parsed = md2json.parse(md);

    // Now build ssml
    var speech = new ssml();
    parseSections( speech, parsed );
    

    return speech.ssml(true);
}

