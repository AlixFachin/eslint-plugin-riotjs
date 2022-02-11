require('chai').should();

const processor_list = require('../src/index');
const processor = processor_list.processors['.tag'];

describe('Basic preprocessor test', () => {
    
    it('should process basic file with script tag', () => {
        const sourceString = ['<myComponent>',
        '<div>Test</div>',
        '<style>',
        'ThisIsSomeCSS',
        '</style>',
        '<script>',
        'i=i+1',
        '</script>',
        '</myComponent>'].join('\n');
    
        const preProcessResult = processor.preprocess(sourceString);
        preProcessResult.should.be.an('array');
        preProcessResult.length.should.equal(1);
        preProcessResult[0].should.be.a('string');
        preProcessResult[0].should.equal('i=i+1\n');
    });

    it('should be able to process file without script tag', () => {
        const sourceString = ['<myComponent>',
        '<div>Test</div>',
        '<style>',
        'ThisIsSomeCSS',
        '</style>',
        'i=i+1',
        '</myComponent>'].join('\n');
    
        const preProcessResult = processor.preprocess(sourceString);
        preProcessResult.should.be.an('array');
        preProcessResult.length.should.equal(1);
        preProcessResult[0].should.be.a('string');
        preProcessResult[0].should.equal('i=i+1\n');
    });

    it('should add lines at the top', () => {
        const sourceString = [
        'const my_lib = require("my_lib");',
        'const glob_var = 42;',
        '<myComponent>',
        '<div>Test</div>',
        '<style>',
        'ThisIsSomeCSS',
        '</style>',
        'i=i+1',
        '</myComponent>'].join('\n');
    
        const preProcessResult = processor.preprocess(sourceString);
        preProcessResult.should.be.an('array');
        preProcessResult.length.should.equal(1);
        preProcessResult[0].should.be.a('string');
        preProcessResult[0].should.equal(`const my_lib = require("my_lib");\nconst glob_var = 42;\ni=i+1\n`);
    });



})
