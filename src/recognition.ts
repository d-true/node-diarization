import {Options} from "./types/Options";
import shellExec, {formatCommandString} from "./shell";
import { EventEmitter } from 'node:events'
import {Segment, ShellParsedResult, ShellResult} from "./types/TaskResult";
import {parseShellResult} from "./utils";
import {RECOGNITION_PYDATA_DELIMITER} from "./constants";

const segmentRegex:RegExp = /\{"id":\d+.*?"temperature":\d+\.\d+}/g;

const recognition = async (filePath: string, options?: Options, eventEmitter?:EventEmitter):Promise<ShellParsedResult> => {

    const shellResult:ShellResult = await shellExec(formatCommandString('recognition', filePath, options), options, eventEmitter);

    // python script print segment, so we need to regex it
    // recognition shell result
    const segments = shellResult.data.match(segmentRegex);
    // split segments and main info
    const rSRSplit:string[] = shellResult.data.split(RECOGNITION_PYDATA_DELIMITER);
    // add segments in main info
    if (rSRSplit[0]) {
        shellResult.data = rSRSplit[1].replace(
            /"recognition":\[]/,
            `"recognition":[${segments ? segments.join(',') : ''}]`
        );
    }

    return parseShellResult(shellResult);

}

export const parseSegmentsChunks = (textChunk:string):{textChunk: string, segments: Segment[]} => {

    const segments:Segment[] = [];
    textChunk = textChunk.replace(segmentRegex, (segment) => {
        try {
            segments.push(JSON.parse(segment));
        } catch (e) {

        }
        return '';
    });

    return {
        textChunk,
        segments,
    }

}

export default recognition;