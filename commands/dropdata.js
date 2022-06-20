const fs = require('fs');

module.exports = (datastore) => async (args) => {
    if (fs.existsSync(datastore.filePath)) {
        fs.rmSync(datastore.filePath);
        return 'Data deleted.';
    } else {
        return 'No data to delete.';
    }
};
