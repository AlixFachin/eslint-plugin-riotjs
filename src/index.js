const extract = require('./extract');
const config = require('./config');

const riotProcessor = () => {

    const _logger = msg => {
        if (config.log_debug) {
            console.log(msg);
        }
    }

    let codeBlockArray;
    let hasAdjustedContent = false;
    let insertedTagLineOffset = 0;

    return {
        preprocess: content => {

            // HACK: We need to add forcefully the <script> tag if it isn't present, 
            // in the case the script contains some strings with HTML tag 
            // (e.g. const message = '<p>whatever</p>')
            let adjustedContent = '';

            if (content.indexOf('<script>') === -1 && content.indexOf('</style>') !== -1) {
                _logger(`We have no SCRIPT tag!`);
                hasAdjustedContent = true;
                // We will chop the content into the following bits:
                //   beforeScriptTag which will contain everything before the script Tag
                //   endContent will contain the last closing tag and everything after
                //   scriptContent will contain everything in between (and we will straddle this with <script> </script>)

                // We will need to remember the line of the tag we insert, so that we can adjust line numbers afterwards

                    // Extracting everything before the closing script tag
                const closeStyleTagIndex = content.indexOf('</style>');
                const beforeCloseStyleContent = content.slice(0, closeStyleTagIndex);
                insertedTagLineOffset = (beforeCloseStyleContent.match(/\r\n|\n|\r/g) || []).length + 1;
                    // Extracting everything at the end
                const finalTagIndex = content.search(/(<\/.*>)(\n|\n\r|\r)*$/g);
                let endContent = ''
                if (finalTagIndex !== -1) {
                    endContent = content.slice(finalTagIndex);
                }
                    // Extracting everything in between
                const middleContent = content.slice(closeStyleTagIndex + '</style>'.length, 
                    finalTagIndex === -1 ? undefined : finalTagIndex );
                
                adjustedContent = beforeCloseStyleContent + '</style>\n<script>' + middleContent + '</script>\n' + endContent; 

            }

            // Objective: We concatenate all the blocks, but store in helper array the beginning line of each block.
            codeBlockArray = extract(hasAdjustedContent ? adjustedContent : content );
            return [codeBlockArray.map(c => c.source).join('')] ;
        },

        postprocess: (messages) => {
            const finalMessageList = [];

            const _findCodeBlock = (lineNumber) => {
                for (let i = 0; i < codeBlockArray.length - 1; i++) {
                    if ((lineNumber < codeBlockArray[i+1].lintStartLine) && (lineNumber >= codeBlockArray[i].lintStartLine)) {
                        return codeBlockArray[i];
                    }
                }
                return codeBlockArray[codeBlockArray.length - 1];
            };

            _logger(`Postprocessing -=-=-=-=-=-=-=-\n${JSON.stringify(codeBlockArray.map(x => x.lintStartLine))}`);

            for (let message of messages[0]) {
                _logger(`Postprocessing ${JSON.stringify(message)} with properties ${Object.keys(message)}`);
                const originalCodeBlock = _findCodeBlock(message.line)
                message.column += originalCodeBlock.columnOffset;
                message.line = message.line - originalCodeBlock.lintStartLine + originalCodeBlock.startLine;
                if (hasAdjustedContent &&  message.line >= insertedTagLineOffset ) {
                    message.line--;
                }
                finalMessageList.push(message);
            }
            
            return finalMessageList;
        }
    }

}

module.exports = {
    processors: {
        '.tag': riotProcessor(),
        '.riot': riotProcessor(),
    }
}