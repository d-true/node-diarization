export interface Options {
    python?: PythonOption,
    diarization?: DiarizationOption;
    recognition?: RecognitionOption;
    checks?: ChecksOptions;
    // array of tasks,
    // can be ["recognition"], ["diarization"] or both,
    // if undefined, will set all tasks,
    // default undefined,
    tasks?: Array<Task>;
    shell?: ShellOption;
    // information text in console, default true
    consoleTextInfo?:boolean;
}

export interface PythonOption {
    // venv path i.e. "~/py_envs",
    // https://docs.python.org/3/library/venv.html,
    // default undefined
    venvPath?: string;
    // python shell command, can be "python3", "py", etc.,
    // default "python"
    var?: string;
}

export interface ShellOption {
    // silent shell console output,
    // default true
    silent?: boolean;
}

export interface DiarizationOption {
    // pyannote hf auth token,
    // https://huggingface.co/settings/tokens,
    // required if diarization task is set
    pyannote_auth_token: string;
    // return raw diarization object from py script,
    // default false
    raw?: boolean;
    // number of speakers, when known,
    // default undefined
    num_speakers?: number;
    // minimum number of speakers,
    // has no effect when `num_speakers` is provided,
    // default undefined
    min_speakers?: number;
    // maximum number of speakers,
    // has no effect when `num_speakers` is provided,
    // default undefined
    max_speakers?: number;
}

export interface RecognitionOption {
    // return raw recognition object from py script,
    // default false
    raw?: boolean;
    // original Whisper model name,
    // or path to model.bin, i.e. /path/to/models where model.bin is located,
    // or namespace/repo_name for hf model
    // default "tiny"
    model?: string;
    // pass js check for standard whisper model name or pass to model.bin
    // if repo is not existed, then it will be python error
    // default false
    hfRepoModel?:boolean;
    // default 5
    beam_size?: number;
    // default undefined
    compute_type?: string;
}

export interface ChecksOptions {
    // default checks for python vars availability, also py scripts
    // before run diarization and recognition
    // default false
    proceed?: boolean;
    //if proceed false, tasks ignored
    recognition?: boolean;
    diarization?: boolean;
}

export type Task = "diarization" | "recognition" | "checks";