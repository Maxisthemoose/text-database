# Installation
```cmd
npm i @maxisthemoose/text-database
```
## Why are you here
No seriously, why? Don't use this as a database, this was made as a joke. It's worse than quick.db.

## If you really want to use this for some reason...
```js
const { TextDatabase } = require("@maxisthemoose/text-database");

const TDB = new TextDatabase({
    databaseName: "main", // The name of the database (file)
    location: "./", // The relative path to where you want to store your database (file)
});

TDB.writeData("key", "value"); // As of now, and probably forever, 
                               // this only supports 4 data types,
                               // string, boolean, number, and Array<string>. 

TDB.getData("key"); // --> "value"
```