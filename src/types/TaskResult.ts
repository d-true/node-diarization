import {UnionSegment} from "./Union";

export interface ShellParsedResult {
    code?: number;
    errors: string[];
    // for main function
    data?: Data | null;
}

export interface WhisperDiarizationFinalResult {
    errors: string[];
    rawDiarization?: DiarizationResult[];
    rawRecognition?: Segment[];
    union?: UnionSegment[];
}

export interface WhisperDiarizationDataResult {
    dSR?: ShellParsedResult;
    rSR?: ShellParsedResult;
    errors?: string[];
}

interface Data {
    diarization?: DiarizationResult[];
    recognition?: Segment[];
    exec_time: string | number;
    hardware: {
        device: 'cpu' | 'cuda';
    }
}


export interface DiarizationResult {
    start: string | number;
    end: string | number;
    speaker: string;
}


export interface Segment {
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    avg_logprobe: number;
    compression_ratio: number;
    no_speech_prob: number;
    words: Word[];
    temperature: number;
}

export interface Word {
    start: number;
    end: number;
    word: string;
    // not used in union
    probability?: number;
    // used in union
    speaker?: string;
}

export interface ShellResult {
    errors: string;
    data: string;
    code: number | null
}