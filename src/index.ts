import diarization from "./diarization";
import recognition, {parseSegmentsChunks} from "./recognition";
import union, {unionRecognitionAndDiarization} from "./union";
import {WhisperDiarizationFinalResult, WhisperDiarizationDataResult} from "./types/TaskResult";
import {Options, PythonOption} from "./types/Options";
import {checkFileAndConvertPathToAbsolute, checkPythonScripts, checkTask} from "./checks";
import {mergeOptions} from "./utils";
import {DEFAULT_OPTIONS} from "./constants";
import {EventEmitter} from "node:events";

export class WhisperDiarization extends EventEmitter {

    private readonly options: Options;
    private filePath: string;
    private result: WhisperDiarizationDataResult;
    private readonly finalResult: WhisperDiarizationFinalResult;
    private segmentChunk: string;

    constructor(filePath:string, options?:Options) {
        super();
        this.result = {};
        this.finalResult = {
            errors: [],
        };
        this.segmentChunk = '';
        this.options = mergeOptions(DEFAULT_OPTIONS, options || {});
        this.filePath = filePath;
    }

    protected checks () {
        this.filePath = checkFileAndConvertPathToAbsolute(this.filePath, 'No audio file exists');
        checkTask(this.options);
    }

     protected async initDiarization () {
         // do diarization
         if (this.options.consoleTextInfo) {
             console.log('********** Diarization start **********');
         }

         this.result.dSR = await diarization(this.filePath, this.options);

         this.finalResult.errors = this.finalResult.errors.concat(this.result.dSR.errors);

         if (this.options?.diarization?.raw) {
             this.finalResult.rawDiarization = this.result.dSR.data?.diarization;
         }

         if (!this.result.dSR.data) {
             if (this.options.consoleTextInfo) {
                 console.log('Diarization failed, aborted');
             }
             return;
         }

         if (this.options.consoleTextInfo) {
             console.log('Diarization done successful');
         }
    }

    protected async initRecognition () {
        // do recognition
        if (this.options.consoleTextInfo) {
            console.log('********** Recognition start **********');
        }

        this.result.rSR = await recognition(this.filePath, this.options, this);

        this.finalResult.errors = this.finalResult.errors.concat(this.result.rSR.errors);

        if (this.options?.recognition?.raw) {
            this.finalResult.rawRecognition = this.result.rSR.data?.recognition;
        }

        if (!this.result.rSR.data) {
            if (this.options.consoleTextInfo) {
                console.log('Recognition failed, aborted');
            }
            return;
        }

        if (this.options.consoleTextInfo) {
            console.log('Recognition done successful');
        }
    }

    protected initUnion () {
        if (this.result.rSR?.data?.recognition &&
            this.result.dSR?.data?.diarization) {
            this.finalResult.union = union(
                this.result.rSR?.data?.recognition,
                this.result.dSR?.data.diarization)
        }
    }

    protected initEvents () {
        // get the chunks from shell
        // proceed union if diarization data exists
        this.on('shell-stdout', data => {

            if (!this.result.dSR?.data?.diarization) {
                return;
            }

            const parsedSC = parseSegmentsChunks(this.segmentChunk + data);
            this.segmentChunk = parsedSC.textChunk ?? this.segmentChunk + parsedSC.textChunk;

            if (parsedSC.segments.length > 0) {
                this.emit('data', unionRecognitionAndDiarization(parsedSC.segments, this.result.dSR?.data.diarization));
            }

        });

        this.on('shell-close', _ => {
            this.emit('end');
        });

    }

    public async init () {

        this.checks();

        if (this.options.checks?.proceed) {
            await checkPythonScripts(this.options);
        }

        this.initEvents();

        if (!this.options?.tasks || this.options.tasks.some(t => t === 'diarization')) {
            await this.initDiarization();
        }

        if (!this.options?.tasks || this.options.tasks.some(t => t === 'recognition')) {
            await this.initRecognition();
        }

        this.initUnion();

        return this.finalResult;
    }

    public static async check (pythonOptions?: PythonOption): Promise<void> {

        const options:Options = {
            tasks: [],
            checks: {
                proceed: true,
            },
            consoleTextInfo: true,
        }
        if (pythonOptions) {
            options.python = pythonOptions;
        }

        await checkPythonScripts(mergeOptions(DEFAULT_OPTIONS, options));

    }

}




export default WhisperDiarization;