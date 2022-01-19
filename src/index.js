const extract = require('./extract');

const riotProcessor = () => {

    let codeBlockArray;

    return {
        preprocess: content => {
            codeBlockArray = extract(content);
            return codeBlockArray.map(c => c.source);
        },

        postprocess: (messages) => {
            const finalMessageList = [];
            
            for (let i = 0; i < messages.length; i++) {
                messages[i].forEach((message) => {
                    message.column += codeBlockArray[i].columnOffset;
                    message.line += codeBlockArray[i].startLine - 1;
                    finalMessageList.push(message);
                });
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