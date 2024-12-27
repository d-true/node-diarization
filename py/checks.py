import sys

def checkPyannote ():

    result = {
        'status': True,
    }

    try:
        from pyannote.audio import Pipeline
        from pathlib import Path
        import sys
        import torch
        import json
        import os
        import time

        result['text'] = 'Diarization scripts ok'

    except Exception as exception:
        result['status'] = False
        result['text'] = f'{exception}'

    return result

def checkWhisper ():

    result = {
        'status': True,
    }

    try:
        from faster_whisper import WhisperModel
        import torch
        import time
        import json

        result['text'] = 'Recognition scripts ok'

    except Exception as exception:
        result['status'] = False
        result['text'] = f'{exception}'

    return result

def checks ():
    args = {}
    # args as --file
    for arg in sys.argv[1:]:
        key_value_pair = arg.split('=')
        args[key_value_pair[0][2:]] = key_value_pair[1]

    result = []
    code = 0
    text = []

    if 'diarization' in args:
        result.append(checkPyannote())

    if 'recognition' in args:
        result.append(checkWhisper())

    for task in result:
        if task['status'] == False:
            code = 1
        text.append(task['text'])

    return {
        'text': '\n'.join(text),
        'code': code,
    }

check = checks()
print(check['text'])
exit(check['code'])