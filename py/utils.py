import sys
from typing import Literal



def checkArgs(task: Literal['diarization', 'recognition']):
    args = {}
    # args as --file
    for arg in sys.argv[1:]:
        key_value_pair = arg.split('=')
        args[key_value_pair[0][2:]] = key_value_pair[1]

    # define result
    result = {
        'status': 'success',
    }

    if 'file' not in args:
        result['error'] = 'No arguments file: ' + json.dumps(args)

    if task == 'diarization':
        if 'pyannote_auth_token' not in args and 'custom_config_path' not in args:
            result['error'] = 'No pyannote auth token'

#     if task == 'recognition':

    if 'error' in result:
        result['status'] = 'error'
    else:
        result['args'] = args

    return result