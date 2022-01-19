'use strict'

const htmlparser = require('htmlparser2');

function extract(code) {

    const _countNewLines = (sourceString, currentIndex) => {
        const allNewLinesArray = sourceString.slice(0, currentIndex).match(/\r\n|\n|\r/g) || [];
        return allNewLinesArray.length + 1; // +1 because line start at 1 (no line zero)
    };

    const _initCodeBlock = _codeBlock => {
        _codeBlock.source = '';
        _codeBlock.startLine = 0;
        _codeBlock.columnOffset = 0;
        _codeBlock.deIndentPattern = '';
    }

    const _pushBlock = (_codeBlock, _codeBlockArray) => {
        _codeBlockArray.push({
            source: _codeBlock.source,
            startLine: _codeBlock.startLine,
            columnOffset: _codeBlock.columnOffset
        })
    }

    // This processor will store the code blocks into the codeBlock Array.
    // Here are the expected code blocks
    // 1) File top part with global variables and file imports
    // 2) Expressions inside curly braces inside the HTML code (attributes and text values)
    // 3) Main script part, either between the <script> </script> tags, or after the </style> tag

    let codeBlockArray = [];

    let InCodeArea = true; 
    // current code block
    let codeBlock= {
        source: '',
        startLine: 1,
        columnOffset: 0,
        deIndentPattern : '',
    }

    const parser = new htmlparser.Parser({
        onopentag: (name, params) => {
            if (InCodeArea) {
                // This section of code is finished -> push the current code as a new only if it has some information.
                if (codeBlock.source.trim() !== '') {
                    _pushBlock(codeBlock, codeBlockArray);
                    _initCodeBlock(codeBlock);
                }
            }
            
            console.log(`Receiving opening tag ${name} with attributes ${JSON.stringify(params)}`)
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
                _pushBlock(codeBlock, codeBlockArray);
                _initCodeBlock(codeBlock);
            }
        },
        ontext: data => {
            console.log(`Receiving text tag -> ${data}END`);
            if (InCodeArea) {


                if (codeBlock.deIndentPattern === '') {
                    // 'exec' will return an array where [0] is the whole match and [1] is the group matched (the spaces in our case)
                    const firstSpacePattern = /^[\n\r]*(\s*)/.exec(data)[1];
                    codeBlock.columnOffset = firstSpacePattern.length;
                    codeBlock.deIndentPattern = new RegExp('^(?:' + firstSpacePattern + ')?(.*)','gm');
                }
                codeBlock.source += data.replace(codeBlock.deIndentPattern, (_, unIndentedLine) => unIndentedLine );
                const firstLinePattern = /^(\r\n|\n|\r)/g.exec(codeBlock.source);
                if (firstLinePattern) {
                    // If we have a match, then the matched group is in index 1 of the returned array
                    codeBlock.source = codeBlock.source.substring(firstLinePattern[1].length); 
                }

            }
        }
    });

    parser.parseComplete(code);
    if (codeBlockArray.length == 0) {
        codeBlockArray.push(codeBlock);
    }

    return codeBlockArray;

}

module.exports = extract