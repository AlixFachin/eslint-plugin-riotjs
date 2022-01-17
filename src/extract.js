'use strict'

const htmlparser = require('htmlparser2');

function extract(code) {

    const _countNewLines = (sourceString, currentIndex) => {
        const allNewLinesArray = sourceString.slice(0, currentIndex).match(/\r\n|\n|\r/g) || [];
        return allNewLinesArray.length + 1; // +1 because line start at 1 (no line zero)
    };

    // Version 1-> Only one code block that we fill with all the expressions as they come
    // To do -> Keep an array of blocks, with each its own indent space and return line

    let InCodeArea = true; 
    let codeBlock= {
        source: '',
        startLine: 0,
        columnOffset: 0,
        deIndentPattern : '',
    }

    const parser = new htmlparser.Parser({
        onopentag: (name) => {
            if (name == 'script') {
                // We will assume that the <script> tag is of proper javascript type.
                // (Otherwise I guess eslint will shout...)

                InCodeArea = true;
                // New block -> Resetting parameters
                codeBlock.source = '';
                codeBlock.deIndentPattern = '';

                // Code begins at next line, so code line = new lines so far + 1
                codeBlock.startLine = _countNewLines(code, parser.endIndex) + 1;

                return;
            } 
            // If we have a tag different than script, it means that we are in the HTML or CSS bit
            InCodeArea = false;
        },
        onclosetag: name => {
            if (name === 'style') {
                // We finish the style portion, we will enter the code area
                InCodeArea = true
                codeBlock.startLine = _countNewLines(code, parser.endIndex) + 1;
            } else if (name === 'script') {
                InCodeArea = false
            }
        },
        ontext: data => {
            if (InCodeArea) {


                if (codeBlock.deIndentPattern === '') {
                    // 'exec' will return an array where [0] is the whole match and [1] is the group matched (the spaces in our case)
                    const firstSpacePattern = /^[\n\r]*(\s*)/.exec(data)[1];
                    codeBlock.columnOffset = firstSpacePattern.length;
                    codeBlock.deIndentPattern = new RegExp('^(?:' + firstSpacePattern + ')?(.*)','gm');
                }
                codeBlock.source += data.replace(codeBlock.deIndentPattern, (_, unIndentedLine) => unIndentedLine );
                const firstLinePattern = /^(\r\n|\n|\r)/g.exec(codeBlock.source)[1];
                codeBlock.source = codeBlock.source.substring(firstLinePattern.length); 

            }
        }
    });

    parser.parseComplete(code);

    return codeBlock;

}

module.exports = extract