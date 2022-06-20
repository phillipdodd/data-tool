const assert = require("assert");

const Datastore = require("../lib/datastore");
const datastore = new Datastore();

const importFile = require("../commands/importFile")(datastore);
const query = require('../commands/query')(datastore);
const dropdata = require("../commands/dropdata")(datastore);

const { parseArgs } = require("../app");

beforeEach(async () => {
    let { args: dropdataArgs } = parseArgs(['', '', 'dropdata']);
    dropdata(dropdataArgs);

    let { args: importFileArgs } = parseArgs(['', '', "import", "-p", "./fileSample.psv"]);
    await importFile(importFileArgs);
});

describe('query command', () => {
    describe('select', () => {
        it('can select without args', async () => {
            let { args } = parseArgs(['', '', "query"]);
            let results = await query(args);
            assert.ok(results);
        })
        
        it('can select specific fields', async () => {
            let { args: singleFieldArgs } = parseArgs(["", "", "query", "-s", "title"]);
            let singleFieldResults = await query(singleFieldArgs);
            
            assert.equal(singleFieldResults[0], "the matrix");

            let { args: multipleFieldArgs } = parseArgs(["", "", "query", "-s", "title,date"]);
            let multipleFieldResults = await query(multipleFieldArgs);
            assert.equal(multipleFieldResults[0], "the matrix,2014-04-01");
        })

    })
    
    describe('order', () => {
        it('can order by one field', async () => {
            let { args } = parseArgs(['', '', "query", "-s", "title,date", "-o", "title"])
            let orderedResults = await query(args);
    
            assert.equal(orderedResults[0], "the hobbit,2014-04-02");
            assert.equal(orderedResults[1], "the matrix,2014-04-01");
            assert.equal(orderedResults[2], "the matrix,2014-04-02");
            assert.equal(orderedResults[3], "unbreakable,2014-04-03");
    
        })
    
        it('can order by two fields', async () => {
            let { args } = parseArgs(["", "", "query", "-s", "title,date", "-o", "date,title"]);
            let orderedResults = await query(args);
    
            assert.equal(orderedResults[0], "the matrix,2014-04-01");
            assert.equal(orderedResults[1], "the hobbit,2014-04-02");
            assert.equal(orderedResults[2], "the matrix,2014-04-02");
            assert.equal(orderedResults[3], "unbreakable,2014-04-03");
    
        })

        it('can order sort by direction', async () => {
            let { args } = parseArgs(["", "", "query", "-s", "title,date", "-o", "date:asc,title:desc"]);
            let orderedResults = await query(args);
    
            assert.equal(orderedResults[0], "the matrix,2014-04-01");
            assert.equal(orderedResults[1], "the matrix,2014-04-02");
            assert.equal(orderedResults[2], "the hobbit,2014-04-02");
            assert.equal(orderedResults[3], "unbreakable,2014-04-03");
    
        })
    })

    describe('filter', () => {
        it('can filter by one equality check', async () => {
            let { args: oneWordArg } = parseArgs(['', '', 'query', '-s', 'title', '-f', "title='unbreakable'"])
            let oneWordResults = await query(oneWordArg);

            assert.equal(oneWordResults[0], 'unbreakable');

            let { args: twoWordArg } = parseArgs(["", "", "query", "-s", "title", "-f", "title='the matrix'"]);
            let twoWordResults = await query(twoWordArg);

            assert.equal(twoWordResults[0], 'the matrix');
        })
    })
});