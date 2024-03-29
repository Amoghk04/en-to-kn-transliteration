/* eslint-disable @typescript-eslint/no-var-requires */

// https://web.archive.org/web/20220607030126/https://stoi.wordpress.com/2012/12/31/jspell/
// - shine (India)

// npx ts-node

// npx tsc jspell.ts && node

/* 
.load jspell.js
nsc = new NorvigSpellChecker(true)
nsc = new NorvigSpellChecker(false, 'big.txt')

nsc.curriedKnown(['test', 'word'], ['fail', 'sir'], ['arthur'])

curry(nsc.known)(['test', 'word'], ['fail', 'sir'], ['arthur'])

nsc.correct(2, 'spelling', 'splng')
*/

const fs = require('fs');
const computedJson = require('./nwords.json');

type WordFreq = {
    [key: string]: number;
}

type CorrectedWord = {
    [key: string]: Array<string>;
}

// https://stackoverflow.com/a/35117049/6949755
// https://stackoverflow.com/questions/12995153/apply-not-working-as-expected

function isEmpty(object: WordFreq) {
    // iterate over keys in object prototype chain
    // https://stackoverflow.com/questions/13632999/if-key-in-object-or-ifobject-hasownpropertykey
    for (const prop in object) {
        if (object.hasOwnProperty(prop))
            return false;
    }
    return true;
}

// https://stackoverflow.com/a/35117049/6949755
function curry<T, U>(fn: Function): (...a: T[]) => U {
    return function (...fnArguments) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
        return fn.apply(
            null,
            // shallow copy
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
            Array.prototype.slice.call(fnArguments, 0)
        );
    }
}


class NorvigSpellChecker {

    private alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    private NWORDS: WordFreq = {}; // Training Model

    constructor(useComputedJson = false, filePath?: string) {

        if (useComputedJson) {
            this.NWORDS = computedJson as unknown as WordFreq;
        } else {
            const data = fs.readFileSync(filePath, 'utf8');
            this.train(data);
        }
    }

    train = (trainingText: string) => {
        const filter = /([a-z]+)/g;
        const features = trainingText.toLowerCase().match(filter) as string[];
        for (const f in features) {
            const feature = features[f];
            if (this.NWORDS.hasOwnProperty(feature)) {
                this.NWORDS[feature] += 1;
            } else {
                this.NWORDS[feature] = 1;
            }
        }
    };

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
                    this.NWORDS.hasOwnProperty(word)) {
                    knownSet[word] = this.NWORDS[word];
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

    correct = (n: number, ...words: string[]) => {
        const corrections: CorrectedWord = {};
        for (const word of words) {
            const candidates: WordFreq =
                curry<Array<string>, WordFreq>(this.known)(
                    [word],
                    this.edits1([word]),
                    this.edits2([word])
                );
            // set corrected word with max frequencies in corpus
            corrections[word] = isEmpty(candidates) ? [word] : this.maxN(candidates, n);
        }
        return corrections;
    };

}

// const nsc = new NorvigSpellChecker(false, 'big.txt')

// nsc.known(['test', 'word', 'fail', 'sir', 'arthur'])
// curry(nsc.known)(['spllg'], ['spell'], ['spells'])

// curry(nsc.known)(['xabel'], ['abel'], ['label']);
// curry(nsc.known)(['xabel'], ['rabel'], ['label']);
// curry(nsc.known)(['xabel'], ['rabel'], ['abel']);
// curry(nsc.known)(['slxlag'], ['sllag'], ['slag']); // no slag in data

// curry(nsc.known)(['test', 'word'], ['fail', 'sir'], ['arthur'])
