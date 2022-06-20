# Description

This tool can import `.psv` files that have the following fields:

* STB - The set top box id on which the media asset was viewed. (Text, max size 64 char)

* TITLE - The title of the media asset. (Text, max size 64 char)

* PROVIDER - The distributor of the media asset. (Text, max size 64 char)

* DATE - The local date on which the content was leased by through the STB (A date in YYYY-MM-DD format)

* REV - The price incurred by the STB to lease the asset. (Price in US dollars and cents)

* VIEW_TIME - The amount of time the STB played the asset.  (Time in hours:minutes)

For example:

```
STB|TITLE|PROVIDER|DATE|REV|VIEW_TIME
stb1|the matrix|warner bros|2014-04-01|4.00|1:30
stb1|unbreakable|buena vista|2014-04-03|6.00|2:05
stb2|the hobbit|warner bros|2014-04-02|8.00|2:45
stb3|the matrix|warner bros|2014-04-02|4.00|1:05
```

Records are unique according to the `STB`, `TITLE`, and `DATE` fields.

If same logical records are encountered in file imports beyond the first, the newly imported record will overwrite the existing record.

# To Use

Ensure that NodeJS is installed. Navigate to the project directory. In order to run tests, additionally execute `npm install` from the command line to install the Mocha testing library.

Running the app will use this structure.
```
node ./app.js [command] [args]
```

To run tests, use:
```
npm run test
```

## Available Commands

### **dropdata**

Deletes existing data.
```
node ./app.js dropdata
```

### **import**
Imports a new file at the specified path into the existing datastore. If no datastore currently exists, creates a new one. 

Two example files are already in the project to use at `./fileSample.psv` and `./fileSampleOverwrite.psv`
```
node ./app.js import -p ./fileSample.psv
```

### **query**
Returns an array of results based on the specified arguments.
```
node ./app.js query -s title,rev,date -o date:asc,title:desc -f title='the matrix'
```

* `-s` Select can accept a comma-separated list of header names
* `-o` Order can accept **one or two** head names. Furthermore, a colon can be used to choose ascending or descending order. Ascending order is the default and will be used if a direction is not otherwise specified.
* `-f` Filter accepts a single equality check. Quotes are required if the desired value contains whitespace. 