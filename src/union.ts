import {DiarizationResult, Segment, Word} from "./types/TaskResult";
import {UnionSegment} from "./types/Union";

export const unionRecognitionAndDiarization = (segments:Segment[], diarization:DiarizationResult[]): UnionSegment[] => {
     diarization = diarization.map((d:any)=> {
        d.start = parseFloat(d.start);
        d.end = parseFloat(d.end);
        return d;
    })

    // split words for more segments for better accuracy
    const segmentsAfterSplit:UnionSegment[] = [];
    let currentResult:UnionSegment = {
        words: [],
        info: {},
    }

    const result:UnionSegment[] = [];

    segments.flatMap((segment: Segment) => {
        if (!segment.words) {
            return [];
        }
        segment.words.map((wordObj: Word)=> {
            currentResult.words.push(wordObj);
            // set time start of segment
            if (!currentResult.info.start) {
                currentResult.info.start = Number(wordObj.start.toFixed(2));
            }
            const lastWordChar = wordObj.word.slice(-1);
            // check last word of  word
            if (['.', '?', '!'].some(l => l === lastWordChar)) {
                currentResult.info.end = Number(wordObj.end.toFixed(2));
                segmentsAfterSplit.push(currentResult);
                currentResult = {
                    words: [],
                    info: {},
                }
            }
        });
    });

    segmentsAfterSplit.map((segment:UnionSegment, segmentIndex:number) => {

        if (!segment.words) {
            return;
        }

        result[segmentIndex] = {
            info: {
                label: true,
                text: '',
                index: segmentIndex,
                start: segment.info?.start,
                end: segment.info?.end,
            },
            words: [],
            speaker: '',
        };

        segment.words.map((wordObj:Word)=> {

            const closestDiarizationSegment:DiarizationResult = findClosest(diarization, wordObj);

            result[segmentIndex].words.push({
                speaker: closestDiarizationSegment.speaker,
                word: wordObj.word,
                start: wordObj.start,
                end: wordObj.end,
            });

        });

        // check how many speakers defined in current segment,
        // ideal when all words associated with 1 speaker
        const checkSpeakers:{[key: string]: number} = result[segmentIndex].words.reduce((a:{[key: string]: number},v:Word) => {
            if (!v.speaker) {
                return a;
            }
            if (!a[v.speaker]) {
                a[v.speaker] = 1;
            } else {
                a[v.speaker] = a[v.speaker] + 1;
            }
            return a;
        }, {});

        // get array of speakers names (00_SPEAKER, 01_SPEAKER etc.) with counts
        const speakers:string[] = Object.keys(checkSpeakers);
        // define final segment speaker
        let speaker:string = '';

        // if more than one speaker in segments words
        // its mean, that speaker was not defined properly
        // we will try to guess by percentage of words speakers
        if (speakers.length > 1) {
            // count all speakers
            const allSpeakers:number = speakers.reduce((a:number,v:string) => a + checkSpeakers[v], 0);
            // get percent of each speaker in segment
            const speakerPercents:number[] = speakers.reduce((a:number[],v:string) => {
                a.push(checkSpeakers[v] * 100 / allSpeakers).toFixed(2);
                return a;
            }, []);
            // if one speaker percent is more than 65,
            // then we consider it is good guess
            const isExistsTrueResultIndex = speakerPercents.findIndex(s => s > 65);

            if (isExistsTrueResultIndex > -1) {
                result[segmentIndex].info.label = true;
                speaker = speakers[isExistsTrueResultIndex];
            } else {
                result[segmentIndex].info.label = false;
                // find max count speaker
                const maxIndex = Math.max(...speakerPercents);
                speaker = speakers[speakerPercents.findIndex(s => s === maxIndex)];
            }
            result[segmentIndex].info.text = speakers.map((s,i) => `${s} ${speakerPercents[i].toFixed()}%`).join(' / ');

        } else {
            // when all segments words is associated with 1 speaker
            if (result[segmentIndex].words[0]) {
                speaker = result[segmentIndex].words[0].speaker || 'NO_SPEAKER';
                result[segmentIndex].info.text = '100%';
            } else {
                result[segmentIndex].info.text = 'NO_WORDS';
            }

        }

        result[segmentIndex].speaker = speaker;
        // create text string from words
        result[segmentIndex].text = (result[segmentIndex].words?.map((w:Word) => w.word).join('') || '').trim();

    });


    return result;

}


// function for find closest diarization segment of word
const findClosest = (data:DiarizationResult[], target:Word) => {
    const minDiff = (curr:DiarizationResult, target:Word) =>
        Math.min(Math.abs(curr.start as number - (target.start as number)),
            Math.abs(curr.end as number - (target.end as number)));

    return data.reduce((prev:DiarizationResult, curr:DiarizationResult) =>
        minDiff(curr, target) - minDiff(prev, target) < 0 ? curr : prev);
}


export default unionRecognitionAndDiarization;