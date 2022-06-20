const assert = require("assert");

const Datastore = require("../lib/datastore");
const datastore = new Datastore();

const importFile = require("../commands/importFile")(datastore);
const query = require('../commands/query')(datastore);

const { parseArgs } = require("../app");

describe('import command', () => {
    it("can import a file", async () => {
        let { args } = parseArgs(["nodeDir", "programDir", "import", "-p", "./fileSample.psv"]);
        assert.ok(await importFile(args))
    });

    it("can append or overwrite existing data", async () => {
        let { args } = parseArgs(["nodeDir", "programDir", "import", "-p", "./fileSampleOverwrite.psv"]);
        await importFile(args);

        let { args: queryArgs } = parseArgs(['', '', '-s', 'title,rev'])
        let queryResults = await query(queryArgs);

        assert.equal(queryResults.length, 5);

        let unbreakableAsset = queryResults.find((element) => element.includes('unbreakable'));
        assert.equal(unbreakableAsset, "stb1,unbreakable,buena vista,2014-04-03,999.00,2:05,stb1unbreakable20140403");
    })
})