from faster_whisper import WhisperModel
import torch
import time
import json
from utils import checkArgs


def Recognition():

    checkArgsResult = checkArgs('recognition')

    if checkArgsResult['status'] == 'error':
        return checkArgsResult['error']

    args = checkArgsResult['args']

    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    # set options
    model_options = {}
    for option_key in ['compute_type']:
        if option_key in args:
            model_options[option_key] = int(args[option_key]) if args[option_key].isdigit() else args[option_key]

    transcribe_options = {}
    for option_key in ['beam_size']:
        if option_key in args:
            transcribe_options[option_key] = int(args[option_key]) if args[option_key].isdigit() else args[option_key]

    startTime = time.time()

    model = WhisperModel(args['model'], device=device, **model_options)

    segments, info = model.transcribe(args['file'], word_timestamps=True, **transcribe_options)

    for i,segment in enumerate(segments):
        # since we can stream recognition in chunks,
        # then we print each segment, and then process it on the js side
        parsed_segment = json.dumps(segment, default=lambda o: o.__dict__, separators=(',', ':'))
        print(parsed_segment, end='')

    result = {
        'recognition': [],
        'exec_time': f'{(time.time() - startTime):.3f}',
        'hardware': {
            'device': device,
        }
    }

    return result

result = Recognition()

if type(result) == dict:
    # convert nested Word class into dict
    result = json.dumps(result, default=lambda o: o.__dict__, separators=(',', ':'))
# delimiter for easy parse
# on
print('|||', end='')
print(result, end='')