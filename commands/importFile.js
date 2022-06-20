module.exports = datastore => async args => {
    const filePath = args["-p"][0];
    let items = await datastore.readImportFileContents(filePath);
    await datastore.insert(items);
    return `${filePath} imported successfully.`;
}