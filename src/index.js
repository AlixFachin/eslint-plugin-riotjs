const extract = require('./extract');
const config = require('./config');

const riotProcessor = () => {

    let codeBlockArray;

    return {
        preprocess: content => {

            // Objective: We concatenate all the blocks, but store in helper array the beginning line of each block.
            codeBlockArray = extract(content);
            return [codeBlockArray.map(c => c.source).join('\n')] ;
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

            if (config.log_debug) {
                console.log(`Postprocessing -=-=-=-=-=-=-=-\n${JSON.stringify(codeBlockArray.map(x => x.lintStartLine))}`);
            }

            for (let message of messages[0]) {
                if (config.log_debug) console.log(`Postprocessing ${JSON.stringify(message)} with properties ${Object.keys(message)}`)
                const originalCodeBlock = _findCodeBlock(message.line)
                message.column += originalCodeBlock.columnOffset;
                message.line = message.line - originalCodeBlock.lintStartLine + originalCodeBlock.startLine;
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