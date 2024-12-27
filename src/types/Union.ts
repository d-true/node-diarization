import {Word} from "./TaskResult";

export interface UnionSegment {
    words: Word[];
    info: {
        // if true, then segment speaker considered
        // that guessed right
        label?: boolean;
        // speaker percentage in segment
        text?: string;
        index?: number;
        start?: number;
        end?: number;
    };
    speaker?: string;
    text?: string;
}