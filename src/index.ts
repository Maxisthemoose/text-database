import fs from "fs";
import "colors";

export default class TextDatabase {

    private _file: string = "";

    constructor(private options: {
        /**
         * The name of the database
         */
        databaseName: string;
        /**
         * The relative path to store the data
         */
        location: string;
    }) {
        this._file = `${require.main?.path!}\\${options.location}\\${options.databaseName}.txt`;
        if (!fs.existsSync(this._file)) {
            try {
                fs.writeFileSync(`${require.main?.path!}\\${options.location}\\${options.databaseName}.txt`, "", { encoding: "utf-8" });
            } catch (err) {
                this.logError("An invalid directory was provided.");
            }
        }
    }


    writeData(key: string, data: Array<string> | string | number | boolean) {
        if (key.includes(":")) return this.logError("Database keys may not include \":\" in them.");
        if (typeof data === "string" && data.includes("-")) return this.logError("Database values may not include \"-\" in them.");
        if (data instanceof Array && data.some((v) => v.includes("-"))) return this.logError("Database values may not include \"-\" in them.");

        const file = fs.readFileSync(this._file);
        const fileData = file.toString();

        const arr = fileData.split("\n");
        const index = arr.findIndex((s) => s.split(":")[0] === key);

        if (index !== -1) {
            const dataType = typeof data === "object" ? "array" : typeof data;
            const oldDataType = arr[index].split(":")[1].split("-")[1];
            if (dataType !== oldDataType) {
                this.logError(`New data type of type "${dataType}" does not match old data type of type "${oldDataType}"`)
                return;
            }

            if (data instanceof Array)
                arr[index] = `${key}:${data.join(",")}-array`;
            else arr[index] = `${key}:${data}-${typeof data}`;
        } else {
            if (data instanceof Array) 
                arr.push(`${key}:${data.join(",")}-array`)
            else arr.push(`${key}:${data.toString()}-${typeof data}`);
        }
        if (arr[0] === "")
            arr.splice(0, 1);
        fs.writeFileSync(this._file, arr.join("\n"));
    }


    getData(key: string): string | number | boolean | { [key: string]: any } | undefined {
        const file = fs.readFileSync(this._file);
        const fileData = file.toString();

        const arr = fileData.split("\n");
        const value = arr.find((v) => v.split(":")[0] === key);

        const allKeys = arr.filter((v) => v.split(":")[0].includes(key)).map((v) => v.includes("\r") ? v.split("\r")[0] : v);

        if (allKeys.length <= 1) { 
            const returnMe = value?.split(":")[1];
            const dataType = value?.split(":")[1].split("-")[1].trim() as "string" | "number" | "boolean" | "array" | undefined;

            if (dataType === "string")
                return returnMe?.split("-string")[0];
            else if (dataType === "array")
                return returnMe?.split(",").map((v) => v.includes("-array") ? v.split("-array")[0] : v);
            else if (dataType === "boolean")
                return returnMe?.toLowerCase() === "false" ? false : returnMe?.toLowerCase() === "true" ? true : undefined;
            else if (dataType === "number")
                return isNaN(parseFloat(returnMe as string)) ? undefined : parseFloat(returnMe as string);
            else if (dataType === undefined) return undefined;
        } else {
            const returnObject: {
                [key: string]: string | number | boolean | Array<string> | undefined;
            } = {};
            for (const keyValue of allKeys) {
                const dataType = keyValue.split(":")[1].split("-")[1].trim() as "string" | "number" | "boolean" | "array" | undefined;
                let key = keyValue.split(":")[0].split(".")[1];
                if (key === undefined) key = "main";
                const value = keyValue.split(":")[1].split("-")[0];

                if (dataType === "string")
                    returnObject[key] = value;
                else if (dataType === "array")
                    returnObject[key] = value.split(",");
                else if (dataType === "boolean")
                    returnObject[key] = value === "false" ? false : value === "true" ? true : undefined;
                else if (dataType === "number")
                    returnObject[key] = isNaN(parseFloat(value)) ? undefined : parseFloat(value);
                else returnObject[key] = undefined;
            }

            return returnObject;
        }
    }

    private logError(data: string) {
        console.log("[Error]".red + ` ${data}`);
    }
}