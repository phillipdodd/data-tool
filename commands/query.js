module.exports = datastore => async (args) => {
    let selectArgs;
    if (args["-s"] && args["-s"].length) {
        selectArgs = args["-s"].map((selectArg) => selectArg.toUpperCase());
    }
    
    let orderArgs;
    if (args["-o"] && args["-o"].length) {
        orderArgs = args["-o"].map((orderArg) => {
            orderArg.fieldName = orderArg.fieldName.toUpperCase();
            return orderArg;
        });
    }

    let filterArgs;
    if (args["-f"] && args["-f"].length) {
        filterArgs = args["-f"].map((filterArg) => {
            // Set fieldName to all caps
            filterArg[0] = filterArg[0].toUpperCase();
            return filterArg;
        });
    }

    let results = await datastore.query(selectArgs, orderArgs, filterArgs);
    return results;
}