import freq_dist from './word_counts';

type WordFreq = {
    [key: string]: number;
}

type CorrectedWord = {
    [key: string]: Array<string>;
}

function isEmpty(object: WordFreq) {
    for (const prop in object) {
        if (object.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function curry<T, U>(fn: Function): (...a: T[]) => U {
    return function (...fnArguments) {
        return fn.apply(
            null,
            Array.prototype.slice.call(fnArguments, 0)
        );
    }
}


export class NorvigSpellChecker {

    private alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    edits1 = (words: string[]): string[] => {
        const edits1Set: string[] = [];
        for (const word of words) {
            for (let i = 0; i <= word.length; i++) {
                // splits (a & b)
                // console.log(word, words)
                const a = word.slice(0, i);
                const b = word.slice(i);
                const c = b.slice(1);
                const d = b.slice(2);
                if (b !== '') {
                    // deletes
                    edits1Set.push(a + c);
                    // transposes
                    if (b.length > 1) {
                        edits1Set.push(a + b.charAt(1) + b.charAt(0) + d);
                    }
                    // replaces & inserts
                    for (const letter of this.alphabets) {
                        edits1Set.push(a + letter + c); // replaces
                        edits1Set.push(a + letter + b); // inserts
                    }
                } else {
                    //inserts (remaining set for b == '')
                    for (const letter of this.alphabets) {
                        edits1Set.push(a + letter);
                    }
                }
            }
        }
        return edits1Set;
    };

    edits2 = (words: string[]): string[] => {
        return this.edits1(this.edits1(words));
    };

    // nsc.known.apply(null, [['test', 'word'], ['fail', 'sir'], ['arthur']])
    known = (...wordsArrays: string[][]): WordFreq => {
        const knownSet: WordFreq = {};
        for (let i = 0; isEmpty(knownSet) && i < wordsArrays.length; ++i) {
            const words = wordsArrays[i];
            for (const word of words) {
                if (!knownSet.hasOwnProperty(word) &&
                    freq_dist.hasOwnProperty(word)) {
                    knownSet[word] = (freq_dist as unknown as WordFreq)[word];
                }
            }
        }
        return knownSet;
    };

    maxN = (candidateValues: WordFreq, n = 1): string[] => {
        // const maxCandidate = Object.keys(candidateValues)
        //     .reduce((prevCandidate, currCandidate) =>
        //         candidateValues[prevCandidate] > candidateValues[currCandidate] ?
        //             prevCandidate :
        //             currCandidate);

        const maxCandidate = Object.keys(candidateValues)
            .sort((candidate1, candidate2) => {
                return candidateValues[candidate1] - candidateValues[candidate2];
            }).slice(-n);

        return maxCandidate;
    };

    correct = (n: number, _word: string): string[] => {
        const word = _word.toLowerCase();
        const corrections: CorrectedWord = {};
        const candidates: WordFreq =
            curry<Array<string>, WordFreq>(this.known)(
                [word],
                this.edits1([word]),
                this.edits2([word])
            );
        // set corrected word with max frequencies in corpus
        corrections[word] = isEmpty(candidates) ? [word] : this.maxN(candidates, n);
        return corrections[word];
    };

}
