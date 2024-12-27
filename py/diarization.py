from pyannote.audio import Pipeline
import sys
import torch
import json
import os
import time
from pathlib import Path
from utils import checkArgs

def load_pipeline_from_pretrained(path_to_config: str | Path) -> Pipeline:
    path_to_config = Path(path_to_config)

    # print(f"Loading pyannote pipeline from {path_to_config}...")
    # the paths in the config are relative to the current working directory
    # so we need to change the working directory to the model path
    # and then change it back

    cwd = Path.cwd().resolve()  # store current working directory

    # first .parent is the folder of the config, second .parent is the folder containing the 'models' folder
    cd_to = path_to_config.parent.parent.resolve()

    # print(f"Changing working directory to {cd_to}")
    os.chdir(cd_to)

    pipeline = Pipeline.from_pretrained(path_to_config)

    # print(f"Changing working directory back to {cwd}")
    os.chdir(cwd)

    return pipeline

# return error string or dictionary
def Diarization () -> str | dict:

    checkArgsResult = checkArgs('diarization')

    if checkArgsResult['status'] == 'error':
        return checkArgsResult['error']

    args = checkArgsResult['args']

    startTime = time.time()

    # local use models
    if 'custom_config_path' in args:
        pipeline = load_pipeline_from_pretrained(args['custom_config_path'])
    else:
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=args['pyannote_auth_token'])

    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    # set options, and convert it to numbers due to pyannote error
    options = {}
    for option_key in ['num_speakers', 'min_speakers', 'max_speakers']:
        if option_key in args:
            options[option_key] = int(args[option_key]) if args[option_key].isdigit() else args[option_key]

    # send pipeline to GPU (when available)
    pipeline.to(torch.device(device))

    # apply pretrained pipeline
    diarization = pipeline(args['file'], **options)

    result = {
        'diarization': [],
        'exec_time': f"{(time.time() - startTime):.3f}",
        "hardware": {
            "device": device,
        }
    }

    for turn, _, speaker in diarization.itertracks(yield_label=True):
        result['diarization'].append({
            "start": f"{turn.start:.3f}",
            "end": f"{turn.end:.3f}",
            "speaker": speaker,
        })

    return result

result = Diarization()


if type(result) == dict:
    result = json.dumps(result, separators=(',', ':'))

print(result, end='')