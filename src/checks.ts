import path from "path";
import {existsSync} from "fs";
import {Options} from "./types/Options";
import {TASKS, WHISPER_MODELS} from "./constants";
import shellExec, {formatCommandString} from "./shell";

export const checkFileAndConvertPathToAbsolute = (filePath:string, errorText:string):string => {

    if (!filePath) {
        throw `No file path provided`;
    }

    filePath = path.resolve(filePath);

    // check is file existed
    if (!existsSync(filePath)) {
        throw errorText;
    }

    return filePath;

}

export const checkTask = (options?: Options):Options => {

    if (options?.tasks && !options?.tasks.some((ct) =>
        TASKS.some((t) =>
            ct === t
        )
    )) {
        throw "No correct task provided";
    }

    if (!options?.tasks || options?.tasks.some(t => t === 'recognition')) {
        if (!options?.recognition?.model) {
            throw "No model name or path provided";
        }
        // check if not model from hf repo
        if (!options?.recognition?.hfRepoModel) {
            // check is standard whisper model
            if (!WHISPER_MODELS.some(wm => wm === options.recognition?.model)) {
                 // check is path to model,
                 // throw if no path to model.bin
                options.recognition.model = checkFileAndConvertPathToAbsolute(options.recognition.model,
                 `No original whisper model name provided, and model.bin file not existed in provided path.\n` +
                    `Available standard whisper models is: ${WHISPER_MODELS.join(', ')}.`);
            }
        }
    }

    if (!options?.tasks || options?.tasks.some(t => t === 'diarization')) {
        if (!options?.diarization?.pyannote_auth_token) {
            throw 'No pyannote auth token provided';
        }
    }

    return options;

}
export const checkPythonScripts = async (options: Options) => {

    if (options.consoleTextInfo) {
        console.log('********** Python prerequisites check start **********');
    }

    let text = '';
    const checkPythonVar = await shellExec(`${options.python?.var} --version`, options);

    if (checkPythonVar.code !== 0) {

        throw 'Python is not detected. Try use in python options another var - python, python3, etc., ' +
            'or check your system settings';
    }

    if (!checkPythonVar.data) {
        throw 'Response from getting python version is not provided';
    }

    const pyVersion:RegExpMatchArray | null = checkPythonVar.data.match(/.*(\d+\.\d+\.\d+.*)/);
    if (!pyVersion) {
        throw 'Python version is not detected';
    }

    const pyVersionSplit:number[] = pyVersion[1].split('.').map(d => Number(d));

    if (pyVersionSplit[0] !== 3 || pyVersionSplit[1] < 9) {
        throw 'Minimum required python version is 3.9';
    }

    text += checkPythonVar.data;

    const checkPyannoteScripts = await shellExec(formatCommandString('checks', '', options), options);

    text += checkPyannoteScripts.data;

    if (checkPyannoteScripts.code !== 0) {
        console.log('Python prerequisites check failed, aborted. Try to set venv path (https://docs.python.org/3/library/venv.html), if not done yet.');
        throw text + (checkPyannoteScripts.errors ? '\nShell errors: ' + checkPyannoteScripts.errors : '');
    }

    if (options.consoleTextInfo) {
        console.log('Python prerequisites check done successful');
        console.log(text);
    }

}