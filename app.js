const fs = require("fs");

const Datastore = require("./lib/datastore");
const datastore = new Datastore();

const importFile = require('./commands/importFile')(datastore);
const query = require('./commands/query')(datastore);
const dropdata = require('./commands/dropdata')(datastore);

const commands = {
    import: importFile,
    query,
    dropdata,
};

const argHandlers = {
    "-s": parseSelectArgs,
    "-o": parseOrderArgs,
    "-f": parseFilterArgs,
    "-p": parsePathArgs
};

function parseSelectArgs(args, i) {
    let selectArgs;
    if (args[i + 1].includes(",")) {
        selectArgs = [...args[i + 1].split(",")];
    } else {
        selectArgs = [args[i + 1]];
    }

    return selectArgs;
}

function parseOrderArgs(args, i) {
    let orderArgs;
    if (args[i + 1].includes(",")) {
        orderArgs = [...args[i + 1].split(",")];
    } else {
        orderArgs = [args[i + 1]];
    }
    return orderArgs.map(orderArg => {
        let fieldName;
        let direction;

        if (orderArg.includes(":")) {
            [fieldName, direction] = orderArg.split(":");
        } else {
            fieldName = orderArg;
        }

        return {fieldName, direction};
    });
}

function parseFilterArgs(args, i) {
    let filters = [];

    let filterArg = args[i + 1];
    let equalIndex = filterArg.indexOf("=");

    let fieldName = filterArg.slice(0, equalIndex);
    let fieldValue = '';

    let valueToTest = filterArg.slice(equalIndex + 1, filterArg.length);
    let firstCharIsQuote = /(['|"]$)/.test(valueToTest);
    let lastCharIsQuote = /(^['|"])/.test(valueToTest);

    let isOneWordTitle = (firstCharIsQuote && lastCharIsQuote) || (!firstCharIsQuote && !lastCharIsQuote); 
    
    if (isOneWordTitle) {
        fieldValue = filterArg.slice(equalIndex, filterArg.length);
        if (firstCharIsQuote && lastCharIsQuote) {
            let valueWithoutQuotes = fieldValue.slice(2, fieldValue.length - 1);
            fieldValue = valueWithoutQuotes;

        }
        // Final check to account for equalIndex being different things when run via test
        if (fieldValue.charAt(0) === "=") {
            fieldValue = fieldValue.replace("=", "");
        }
    }
    
    if (!isOneWordTitle) {
        let firstWord = filterArg.slice(equalIndex + 2, filterArg.length);
        fieldValue += firstWord;
    
        // Look forward to collect remaining words
        for (let j = i + 2; j < args.length; j++) {
            let nextWord = args[j];
            
            // Assume is the last word if it ends with a quote character
            let isLastWord = /(['|"]$)/.test(nextWord);
            if (isLastWord) {
                fieldValue += " " + nextWord.slice(0, nextWord.length - 1);
                break;
            } else {
                fieldValue += " " + nextWord;
            }
        }
    }

    filters.push([fieldName, fieldValue])
    return filters;
}

function parsePathArgs(args, i) {
    let pathArgs;
    if (args[i + 1].includes(",")) {
        pathArgs = [...args[i + 1].split(",")];
    } else {
        pathArgs = [args[i + 1]];
    }
    return pathArgs;
}

async function main() {
    const { command, args } = parseArgs(process.argv);
    console.dir(await commands[command](args));
}

function parseArgs(args) {
    const argData = {
        command: String(args[2]).toLowerCase(),
        args: {}
    };
        
    for (let i = 3; i < args.length; i++) {
        let arg = args[i];
        if (argHandlers[arg]) {
            argData.args[arg] = argHandlers[arg](args, i);
        } 
    }
    return argData;
}

main();

module.exports.parseArgs = parseArgs;

