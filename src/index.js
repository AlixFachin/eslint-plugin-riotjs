const extract = require('./extract');

const riotProcessor = () => {

    let fileParsingInfo;

    return {
        preprocess: content => {
            fileParsingInfo = extract(content);
            return [fileParsingInfo.source];
        },

        postprocess: (messages) => {
            const finalMessageList = [];
            
            messages[0].forEach((message) => {
                message.column += fileParsingInfo.columnOffset;
                message.line += fileParsingInfo.startLine - 1;
                finalMessageList.push(message);
            });
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