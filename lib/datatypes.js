/**
 * Intentionally leaving some duplicate code to make
 * them easier to edit individually if needed
 */
module.exports = {
    TEXT64: {
        fromString: (value) => value,
        isValid: (value) => {
            return value && typeof value === "string" && value.length < 63;
        },
        getSortHandler:
            (headerName, order = "asc") =>
            (a, b) => {
                return order === "asc" ? (a[headerName] < b[headerName] ? -1 : 1) : b[headerName] < a[headerName] ? -1 : 1;
            },
    },
    DATE: {
        fromString: (value) => new Date(value),
        isValid: (value) => {
            let regex = /(\d{4}-\d{2}-\d{2})/;
            return value && typeof value === "string" && regex.test(value);
        },
        getSortHandler:
            (headerName, order = "asc") =>
            (a, b) => {
                a = new Date(a[headerName]);
                b = new Date(b[headerName]);
                return order === "asc" ? a - b : b - a;
            },
    },
    TIME: {
        fromString: (value) => Number(value.replace(":", ".")),
        isValid: (value) => {
            let regex = /(\d+:\d{2})/;
            return value && typeof value === "string" && regex.test(value);
        },
        getSortHandler:
            (headerName, order = "asc") =>
            (a, b) => {
                a = Number(a[headerName].replace(":", "."));
                b = Number(b[headerName].replace(":", "."));
                return order === "asc" ? a - b : b - a;
            },
    },
    PRICE: {
        fromString: (value) => Number(value),
        isValid: (value) => {
            let regex = /(\d+\.\d{2})/;
            return value && typeof value === "string" && regex.test(value);
        },
        getSortHandler:
            (headerName, order = "asc") =>
            (a, b) => {
                a = Number(a[headerName]);
                b = Number(b[headerName]);
                return order === "asc" ? a - b : b - a;
            },
    },
};
