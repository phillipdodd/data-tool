const fs = require('fs');
const assert = require("assert");

const Datastore = require("../lib/datastore");
const datastore = new Datastore();

const importFile = require("../commands/importFile")(datastore);
const dropdata = require("../commands/dropdata")(datastore);

const { parseArgs } = require("../app");

describe('dropdata command', () => {
    it('can delete existing data', async () => {
        let { args: importFileArgs } = parseArgs(["", "", "import", "-p", "./fileSample.psv"]);
        await importFile(importFileArgs);

        assert.equal(fs.existsSync(datastore.filePath), true);

        let { args: dropdataArgs } = parseArgs(['', '', 'dropdata']);
        dropdata(dropdataArgs);
        
        assert.equal(fs.existsSync(datastore.filePath), false);
    });
})