const dataTypes = require("./datatypes");
module.exports = {
    STB: {
        name: "STB",
        description: "The set top box id on which the media asset was viewed.",
        dataType: dataTypes.TEXT64,
    },
    TITLE: {
        name: "TITLE",
        description: "The title of the media asset.",
        dataType: dataTypes.TEXT64,
    },
    PROVIDER: {
        name: "PROVIDER",
        description: "The distributor of the media asset.",
        dataType: dataTypes.TEXT64,
    },
    DATE: {
        name: "DATE",
        description: "The local date on which the content was leased by through the STB.",
        dataType: dataTypes.DATE,
    },
    REV: {
        name: "REV",
        description: "The price incurred by the STB to lease the asset.",
        dataType: dataTypes.PRICE,
    },
    VIEW_TIME: {
        name: "VIEW_TIME",
        description: "The amount of time the STB played the asset.",
        dataType: dataTypes.TIME,
    },
};
