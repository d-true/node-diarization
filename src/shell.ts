import shell from "shelljs";
import path from "path";
import {ShellResult} from "./types/TaskResult";
import {ChecksOptions, DiarizationOption, Options, RecognitionOption, Task} from "./types/Options";
import {EventEmitter} from "node:events";
import os from "os";

export const shellExec = (commandString:string, options?:Options, eventEmitter?:EventEmitter):Promise<ShellResult> => {
    return new Promise((resolve, reject) => {
        try {

            //always run async, despite async option
            const shellProcess = shell.exec(commandString, {
                silent: options?.shell?.silent,
                async: true,
            });

            const shellResult:ShellResult = {
                errors: '',
                data: '',
                code: null,
            };

            // send chunk for parse
            if (shellProcess.stdout) {
                // chunks limited to 8192 bytes
                // so json might be corrupted
                shellProcess.stdout.on('data', (stdoutChunk) => {

                    shellResult.data += stdoutChunk;
                    if (eventEmitter) {
                        eventEmitter.emit('shell-stdout', stdoutChunk);
                    }

                });
            } else {
                shellResult.errors += 'No exec stdout\n';
            }

            if (shellProcess.stderr) {
                shellProcess.stderr.on('data', (stderr) => {
                    shellResult.errors += stderr;
                });
            }

            shellProcess.on('exit', code => {
                if (eventEmitter) {
                    eventEmitter.emit('shell-close');
                }
                shellResult.code = code;
                resolve(shellResult);
            });

        } catch (e) {
            reject(e);
        }
    });
}

export const formatCommandString = (task: Task, filePath: string, options?: Options) => {
    let commandString = '';

    // if venv path existed, (for linux and macOS users, generally)
    if (options?.python?.venvPath) {

        const platform = os.platform();
        // for windows
        if (platform === 'win32') {
            commandString += `${options.python.venvPath}\\Scripts\\activate.bat && `;
        // for linus and mac
        } else if (platform === 'darwin' || platform === 'linux') {
            commandString += `. ${options.python.venvPath}/bin/activate && `;
        } else {
            throw 'Platform is not supported, only Windows, MacOS or Linux is allowed';
        }

    }

    commandString += `${options?.python?.var} ${path.resolve(path.join(__dirname, '..', 'py', task + '.py'))}`;
    commandString += ' --file=' + filePath;

    // excluded options fields from command arguments
    const excludedFields: string[] = ['raw'];

    if (options?.[task]) {
        const currentTask = options[task] as RecognitionOption | DiarizationOption | ChecksOptions;
        Object.keys(currentTask).map((key) => {
            if (excludedFields.some(f => f === key)) {
                return;
            }
            commandString += ` --${key}=${currentTask[key as keyof typeof currentTask]}`;
        });
    }

    return commandString;

}

export default shellExec;