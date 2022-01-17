require('chai').should();
const expect = require('chai').expect;

const extract = require('../src/extract.js');

describe('Basic tests', () => {

    it('Should not crash on calling an empty string', () => {
        const testParam = '';
        const parseResult = extract(testParam);
        
        expect(parseResult.source).to.not.be.undefined;
        expect(parseResult.source).to.equal('');

    })

    it('Should parse a file without script tag, one line of code', () => {
        
        const testParam = ['<myComponent>',
        '<div>Test</div>',
        '<style>',
        'ThisIsSomeCSS',
        '</style>',
        'i=i+1',
        '</myComponent>'].join('\n');
        const parseResult = extract(testParam);
        
        expect(parseResult.source).to.not.be.undefined;
        expect(parseResult.source).to.equal('i=i+1\n');
        expect(parseResult.startLine).to.equal(6);
        expect(parseResult.columnOffset).to.equal(0);
    })

    it('Should parse a typical riot file with the script tag', () => {
        const testParam = ['<myComponent>',
            '<div>Test</div>',
            '<style>',
            'ThisIsSomeCSS',
            '</style>',
            '<script>',
            'i=i+1',
            '</script>',
            '</myComponent>'
        ].join('\n');
        const parseResult = extract(testParam);
        
        expect(parseResult.source).to.not.be.undefined;
        expect(parseResult.source).to.equal('i=i+1\n');
        expect(parseResult.startLine).to.equal(7);
        expect(parseResult.columnOffset).to.equal(0);
    })

    it('Should de-indent the file properly, case of tabs', () => {
        const testParam = ['<myComponent>',
            '\t<div>Test</div>',
            '\t<style>',
            '\t\tThisIsSomeCSS',
            '\t</style>',
            '\t<script>',
            '\t\ti=i+1',
            '\t\tj=j+1',
            '\t</script>',
            '</myComponent>'
        ].join('\n');
        const parseResult = extract(testParam);
        
        expect(parseResult.source).to.not.be.undefined;
        expect(parseResult.source).to.equal('i=i+1\nj=j+1\n\t');
        expect(parseResult.startLine).to.equal(7);
        expect(parseResult.columnOffset).to.equal(2);
    })

    it('Should de-indent the file properly, case of 2 spaces', () => {
        const testParam = ['<myComponent>',
            '  <div>Test</div>',
            '  <style>',
            '    ThisIsSomeCSS',
            '  </style>',
            '  <script>',
            '    i=i+1',
            '      j=j+1',
            '  </script>',
            '</myComponent>'
        ].join('\n');
        const parseResult = extract(testParam);
        
        expect(parseResult.source).to.not.be.undefined;
        expect(parseResult.source).to.equal('i=i+1\n  j=j+1\n  ');
        expect(parseResult.startLine).to.equal(7);
        expect(parseResult.columnOffset).to.equal(4);
    })


})
