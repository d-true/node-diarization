import {Options} from "./types/Options";
import shellExec, {formatCommandString} from "./shell";
import {ShellParsedResult, ShellResult} from "./types/TaskResult";
import {parseShellResult} from "./utils";

const diarization = async (filePath: string, options?: Options): Promise<ShellParsedResult> => {

    const shellResult:ShellResult = await shellExec(formatCommandString('diarization', filePath, options), options);
    return parseShellResult(shellResult);

}

export default diarization;