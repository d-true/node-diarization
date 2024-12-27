import {Options} from "./types/Options";
import {ShellParsedResult, ShellResult} from "./types/TaskResult";

// merge default options with provided
export const mergeOptions = (...options:Options[]) => {
    const isObject = (obj:any) => obj && typeof obj === 'object';

    return options.reduce((prev:any, obj:any) => {
        Object.keys(obj).forEach(key => {

            const pVal = prev[key];
            const oVal = obj[key];

            if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeOptions(pVal, oVal);
            } else {
                prev[key] = oVal;
            }

        });

        return prev;
    }, {});
}

// convert shell results to parsed shell results
export const parseShellResult = (shellResult: ShellResult): ShellParsedResult => {

    const shellParsedResult:ShellParsedResult = {
        errors: [],
    };
    try {
        shellParsedResult.data = JSON.parse(shellResult.data);
    } catch (e) {
        shellResult.errors += `${shellResult.data}\n`;
        shellParsedResult.data = null;
    }

    shellParsedResult.errors = shellResult.errors.split('\n').filter(e=> e);
    return shellParsedResult;
}