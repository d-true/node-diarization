Diarization and recognition audio module using [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) and [`pyannote`](https://github.com/pyannote/pyannote-audio) modules.

Inspired by [`whisperX`](https://github.com/m-bain/whisperX) and [`whisper-node`](https://github.com/ariym/whisper-node).

Since main part of the library is python, main goal is to make it as friendly as possible for Node.js users.


## Requirements

* Python 3.9 or greater

Unlike openai-whisper, FFmpeg does **not** need to be installed on the system. The audio is decoded with the Python library [PyAV](https://github.com/PyAV-Org/PyAV) which bundles the FFmpeg libraries in its package.

(c) [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper#requirements)

## Installation

1. First of all you need to install [`Python`](https://www.python.org/downloads/).

    a) For macOS and linux users is a best practice to create [`virtual environment`](https://docs.python.org/3/library/venv.html).

    ```text
    python -m venv ~/py_envs
    ```

    Remember this path (**~/py_envs**), and install all packages in there. Exec this command before ```pip``` install.
    ```text
    . ~/py_envs/bin/activate
    ```
   
   b) For Windows users command is slightly different. 

    ```text
   python -m venv C:\py_envs
   ```
    
   ```text
   C:\py_envs\Scripts\activate.bat
   ```
   
   Path is ***C:\py_envs***   


2. Install [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) module.

    ```text
    pip install faster-whisper
    ```  
   
3. Install [`pyannote`](https://github.com/pyannote/pyannote-audio) module.

   a) Install [`pyannote.audio`](https://github.com/pyannote/pyannote-audio) with `pip install pyannote.audio`

   b) Accept [`pyannote/segmentation-3.0`](https://hf.co/pyannote/segmentation-3.0) user conditions

   c) Accept [`pyannote/speaker-diarization-3.1`](https://hf.co/pyannote/speaker-diarization-3.1) user conditions

   d) Create access token at [`hf.co/settings/tokens`](https://hf.co/settings/tokens).

   (c) [`pyannote`](https://github.com/pyannote/pyannote-audio/blob/develop/README.md#tldr)


4. Finally `npm i node-diarization`

Ok, we are done! Good job.


## Usage

### TS

```javascript
import WhisperDiarization from 'node-diarization';

// only one required option is pyannote hf auth token
const options = {
    diarization: {
       pyannote_auth_token: 'YOUR_TOKEN'
    }
};

(async () => {
    // only works with .wav files
    const wd = new WhisperDiarization('PATH/TO/WAV', options);
    wd.init().then(r=> {
       r.union?.map(s => {
          console.log(`${s.speaker} [${s.info.start} - ${s.info.end}]: ${s.text}`);
       });

       // shell .py errors
       console.log(r.errors);
       
    }).catch(err => console.log(err));

    // event listener for stream transcribition
    // works only if both tasks provided (recognition and diarization)
    wd.on('data', segments => {
        segments.map(s => {
            console.log(`${s.speaker} [${s.info.start} - ${s.info.end}]: ${s.text}`)
        });
    });

    wd.on('end', _ => {
        console.log('Done');
    });
    
})();

```

### CommonJS

```javascript
const { WhisperDiarization } = require('node-diarization');
```

### Output

As result, you will get diarizied JSON output or error string.

```json

{
   "errors": "[]",
   "rawDiarization": "[Array]",
   "rawRecognition": "[Array]",
   "result": [
      {
         "info": "[Object]",
         "words": "[Array]",
         "speaker": "SPEAKER_00",
         "text": "..."
      },
      {
         "info": "[Object]",
         "words": "[Array]",
         "speaker": "SPEAKER_01",
         "text": "..."
      }
   ]
}

```
### Tasks

You can create separate tasks, like recognition or diarization, but you need to add raw in options.

```javascript
const options = {
   recognition: {
       raw: true,
   },
   tasks: ['recognition'],
}
```

### Recognition models

For recognition models you have 3 choices:
1. Add standard whisper model (tiny is default), Available standard whisper models is: tiny.en, tiny, base.en, base, small.en, small, medium.en, medium, large-v1, large-v2, large-v3, large, distil-large-v2, distil-medium.en, distil-small.en, distil-large-v3, large-v3-turbo, turbo.
2. Add path to **directory**, where your model.bin file located. This and above step checked by node.js
3. Set option parameter `hfRepoModel` to `true`. This is the path to hf repo model. If repo is not existed, then trace error will be from python.

### Options

```javascript
const options =  {
   python: {
      // venv path i.e. "~/py_envs",
      // https://docs.python.org/3/library/venv.html,
      // default undefined
      venvPath: '~/py_envs',
      // python shell command, can be "python3", "py", etc.,
      // default "python"
      var: 'python',
   },
   diarization: {
      // pyannote hf auth token,
      // https://huggingface.co/settings/tokens,
      // required if diarization task is set
      pyannote_auth_token: 'YOU_TOKEN',
      // return raw diarization object from py script,
      // default false
      raw: false,
      // number of speakers, when known,
      // default undefined
      num_speakers: 1,
      // minimum number of speakers,
      // has no effect when `num_speakers` is provided,
      // default undefined
      min_speakers: 1,
      // maximum number of speakers,
      // has no effect when `num_speakers` is provided,
      // default undefined
      max_speakers: 1,
   },
   recognition: {
      // return raw recognition object from py script,
      // default false
      raw: false,
      // original Whisper model name,
      // or path to model.bin, i.e. /path/to/models where model.bin is located,
      // or namespace/repo_name for hf model
      // default "tiny"
      model: 'tiny',
      // pass js check for standard whisper model name or pass to model.bin
      // if repo is not existed, then it will be python error
      // default false
      hfRepoModel:false,
      // recognition options
      // default 5
      beam_size: 5,
      // recognition options
      // default undefined
      compute_type: 'float32',
   },
   checks: {
      // default checks for python vars availability, also py scripts
      // before run diarization and recognition
      // default false
      proceed: false,
      //if proceed false, tasks ignored
      recognition: true,
      diarization: true,
   },
   // array of tasks,
   // can be ["recognition"], ["diarization"] or both,
   // if undefined, will set all tasks,
   // default undefined,
   tasks: [],
   shell: {
      // silent shell console output,
      // default true
      silent: true,
   },
   // information text in console, default true
   consoleTextInfo: true,
}

```

### Check your environment

Before start, you would like to check all requirements, so we have a static `check` function. Also check options is default `false` in main wd.

```javascript
import WhisperDiarization from 'node-diarization';

// options.python (if different from default ones)
const options = {
   venvPath: '~/py_envs',
   var: 'python',
};

(async () => {
    WhisperDiarization.check(options).catch(err => console.log(err));
})();

```

Also, you can enable `check` in main function options.



