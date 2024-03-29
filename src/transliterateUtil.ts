import { schemaMap } from "./schemeMap";


// https://gist.github.com/cybercase/db7dde901d7070c98c48
function arrayProduct(...arrays: string[][][]) {
    const arrayOfTranslit = arrays[0].reduce((prevAccumulator: string[][], currentArray: string[]) => {
        const newAccumulator: string[][] = [];
        prevAccumulator.forEach(prevAccumulatorArray => {
            currentArray.forEach((currentValue: string) => {
                newAccumulator.push(prevAccumulatorArray.concat(currentValue));
            });
        });
        return newAccumulator;
    }, [[]]);
    return arrayOfTranslit.map(arr => arr.join(''));
}

export const transliterate = (enWord: string) => arrayProduct(_getLetters(enWord));

// export const transliterate = (enWord: string) => {
//     const knLetters = _getLetters(enWord)
//     const joinedWord = knLetters.map(k => k[0]).join('');
//     console.log('transliterate', { enWord, knLetters, joinedWord });
//     return joinedWord;
// };


// TODO rename method
function _getLetters(data: string) {

    const buf: string[][] = [];
    let i = 0;

    let had_consonant = false;
    let found = false;
    const len_data = data.length;

    const vowels = schemaMap.vowels;
    const marks = schemaMap.marks;
    const virama = schemaMap.virama;
    const consonants = schemaMap.consonants;
    const other = schemaMap.other;
    const longest = schemaMap.longest;

    while (i <= len_data) {
        let token = data.slice(i, i + longest);

        while (token) {
            let mark;
            if (had_consonant && token in vowels) {
                mark = token in marks ? marks[token] : [];
                if (mark.length) {
                    buf.push(mark);
                }
                found = true;
            } else if (token in other) {
                if (had_consonant) {
                    buf.push(virama);
                }
                buf.push(other[token]);
                found = true;
            }

            if (found) {
                had_consonant = token in consonants;
                i += token.length
                break;
            }

            token = token.slice(0, -1)
        }

        if (!found) {
            if (had_consonant) {
                buf.push(virama);
            }
            if (i < len_data) {
                buf.push([data[i]]);
                had_consonant = false
            }
            i += 1;
        }

        found = false;
    }

    return buf;
}

