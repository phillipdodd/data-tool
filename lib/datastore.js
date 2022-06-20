const fs = require("fs");
const path = require("path");

const fieldDefinitions = require('./fielddefinitions');

module.exports = class Datastore {
    constructor(filePath) {
        this.filePath = filePath || path.join(__dirname, "../data/datastore.psv");
    }

    /**
     * @description existing records will be overwritten if new records identical values for STB, TITLE and DATE are encountered
     * @param {{headerName: value}[]} items - Array of objects representing items parsed. Headers used as keys
     */
    insert(items) {
        return new Promise((resolve, reject) => {
            validateItems(items);

            let newItems = {};
            items.forEach((item) => {
                let newID = createUniqueItemID(item);
                item.id = newID;
                newItems[newID] = item;
            });

            const writeStream = fs.createWriteStream(`${this.filePath}_updated`, "utf8");
            writeStream.on("error", (error) => reject(error));
            writeStream.on("close", () => {
                if (fs.existsSync(this.filePath)) {
                    fs.rmSync(this.filePath);
                }
                fs.renameSync(`${this.filePath}_updated`, this.filePath);
                resolve();
            });

            const writeNewItems = () => {
                let itemValues = Object.values(newItems);
                if (itemValues && itemValues.length) {
                    let content = itemValues.map((newItem) => JSON.stringify(newItem)).join("\r\n");
                    writeStream.write(content);
                }
                writeStream.end();
            };

            if (!fs.existsSync(this.filePath)) {
                writeNewItems();
            } else {
                const readStream = fs.createReadStream(this.filePath, "utf8");
                readStream.on("error", (error) => reject(error));
    
                // Read over existing items, writing them to a new datastore
                // Items with existing ID values will be overwritten with newly imported records
                readStream.on("data", (chunk) => {
                    let items = chunkToItems(chunk);
    
                    let itemsToWrite = [];
    
                    items.forEach((item) => {
                        if (!item) return;

                        let itemToWrite;
                        if (newItems[item.id]) {
                            itemToWrite = newItems[item.id];
                            delete newItems[item.id];
                        } else {
                            itemToWrite = item;
                        }
    
                        itemsToWrite.push(itemToWrite);
                    });
    
                    let content = itemsToWrite.map((val) => JSON.stringify(val)).join("\r\n");
                    writeStream.write(content + "\r\n");
    
                    // Once read is complete, write remaining new items
                    readStream.on("end", writeNewItems);
                });

            }
        });
    }

    /**
     * @param {String[]} selectArgs 
     * @param {{fieldName: String, direction: String|undefined}[]}} orderArgs 
     * @param {[fieldName, fieldValue]} filterArgs 
     * @returns String[] of queried items
     */
    query(selectArgs, orderArgs, filterArgs) {
        return new Promise((resolve, reject) => {
            const results = [];

            const readStream = fs.createReadStream(this.filePath, "utf8");
            readStream.on("error", (error) => reject(error));

            readStream.on("data", (chunk) => {
                let items = chunkToItems(chunk);

                if (filterArgs && filterArgs.length) {
                    filterArgs.forEach((filterArg) => {
                        items = items.filter((item) => {
                            if (!item) return;
                            let [fieldName, fieldValue] = filterArg;
                            return item[fieldName] === fieldValue;
                        });
                    });
                }

                if (orderArgs && orderArgs.length) {
                    orderArgs.forEach((orderArg) => {
                        if (!fieldDefinitions[orderArg.fieldName]) {
                            throw new Error(`Cannot find field definition for ${orderArg}`);
                        }
                    });

                    if (orderArgs.length > 2) {
                        throw new Error("Cannot order by more than 2 headers");
                    }

                    if (orderArgs.length == 2) {
                        items = twoLayerSort(items, orderArgs);
                    }

                    if (orderArgs.length == 1) {
                        let sortHandler = fieldDefinitions[orderArgs[0].fieldName].dataType.getSortHandler(
                            orderArgs[0].fieldName,
                            orderArgs[0].direction
                        );
                        items = items.sort(sortHandler);
                    }
                }

                items.forEach((item) => {
                    if (!item) return;
                    let result = [];
                    if (selectArgs && selectArgs.length) {
                        selectArgs.forEach((selectArg) => {
                            result.push(item[selectArg]);
                        });
                    } else {
                        result = Object.values(item);
                    }
                    results.push(result.join(","));
                });
            });

            readStream.on("end", () => resolve(results));
        });
    }

    readImportFileContents(fileDir) {
        return new Promise((resolve, reject) => {
            const delimiter = "|";
            
            let chunkCounter = 0;
            
            let headers;
            let items = [];
            
            if (!fs.existsSync(fileDir)) {
                throw new Error(`Cannot locate file at path ${fileDir}`);
            }

            const readStream = fs.createReadStream(fileDir, "utf8");
            readStream.on("error", (error) => reject(error));

            readStream.on("data", (data) => {
                let lines = data
                    .toString()
                    .split("\r\n")
                    .map((value) => value.split(delimiter));

                let isHeaderChunk = chunkCounter === 0;
                if (isHeaderChunk) {
                    headers = lines.splice(0, 1)[0];
                }

                lines.forEach((line) => {
                    let item = {};
                    line.forEach((value, index) => {
                        let headerName = headers[index];
                        item[headerName] = value;
                    });
                    items.push(item);
                });

                chunkCounter++;
            });

            readStream.on("close", () => {
                resolve(items);
            });
        });
    }
};

/**
 * @description returns false if ANY values do not pass validation
 * @param {{headerName: value}[]} items - Array of objects representing items parsed. Headers used as keys
 * @returns {Boolean}
 */
function validateItems(items) {
    if (!items || items.length < 1) return false;

    const fieldIsValid = (field) => {
        let [name, value] = field;
        let isValid = fieldDefinitions[name].dataType.isValid(value);
        if (!isValid) throw new Error(`'${value}' is an invalid value for the '${name}' field.`);
        return isValid;
    };

    const itemIsValid = (item) => {
        let fields = Object.entries(item);
        for (let i = 0; i < fields.length; i++) {
            if (!fieldIsValid(fields[i])) {
                return false;
            }
        }
        return true;
    };

    const itemsAreValid = (items) => {
        if (!items || items.length < 1) return false;

        for (let i = 0; i < items.length; i++) {
            if (!itemIsValid(items[i])) {
                return false;
            }
        }

        return true;
    };

    return itemsAreValid(items);
}

function createUniqueItemID(item) {
    return `${item.STB}${item.TITLE}${item.DATE}`.replace(/([\s|-])/g, "");
}

function chunkToItems(chunk) {
    return chunk
        .split("\r\n")
        .map((item) => {
            if (!item) return;
            return JSON.parse(item);
        });
}

function twoLayerSort(contentArray, propNameArray) {
    let { fieldName: outerFieldName, direction: outerDirection } = propNameArray[0];
    let { fieldName: innerFieldName, direction: innerDirection } = propNameArray[1];
    
    let helperObj = {};
    let results = [];

    // Prep helperObj
    contentArray.forEach((item) => {
        if (!item) return;
        let outerSortValue = item[outerFieldName];
        if (!helperObj[outerSortValue]) {
            helperObj[outerSortValue] = [];
        }
        helperObj[outerSortValue].push(item);
    });

    let outerValueFromStringFn = fieldDefinitions[outerFieldName].dataType.fromString;

    const directedSort = (direction, fromStringFn) =>
        (direction === "asc" || !direction) ?
            (a, b) => fromStringFn(a) - fromStringFn(b) :
            (a, b) => fromStringFn(b) - fromStringFn(a);

    let sortedOuterValues = Object.keys(helperObj).sort(directedSort(outerDirection, outerValueFromStringFn));

    let innerSortHandler = fieldDefinitions[innerFieldName].dataType.getSortHandler(innerFieldName, innerDirection);
    sortedOuterValues.forEach((outerVal) => {
        if (outerVal) {
            let sortedInnerValues = helperObj[outerVal].sort(innerSortHandler);
            results.push(...sortedInnerValues);
        }
    });

    return results;
}


