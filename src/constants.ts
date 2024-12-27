import {Options, Task} from "./types/Options";

export const TASKS:Task[] = [
    'diarization',
    'recognition',
]

export const DEFAULT_OPTIONS:Options = {
    python: {
        var: 'python',
    },
    recognition: {
        model: 'tiny',
        beam_size: 5,
    },
    shell: {
        silent: true,
    },
    checks: {
        proceed: false,
        diarization: true,
        recognition: true,
    },
    consoleTextInfo: true,
}

export const WHISPER_MODELS = [
    'tiny.en',
    'tiny',
    'base.en',
    'base',
    'small.en',
    'small',
    'medium.en',
    'medium',
    'large-v1',
    'large-v2',
    'large-v3',
    'large',
    'distil-large-v2',
    'distil-medium.en',
    'distil-small.en',
    'distil-large-v3',
    'large-v3-turbo',
    'turbo',
]

export const RECOGNITION_PYDATA_DELIMITER: string = '|||';